module.exports = function () {
    var ImageStore = require('./imageStore');
    var store = new ImageStore();

    var express = require('express');
    var app = express();

    var Limiter = require('express-rate-limiter-redis/limiter');
    var limitStore;

    if ('production' === app.get('env')) {
        console.log('Configuring worker %s for production.', process.pid);

        var RedisStore = require('express-rate-limiter-redis');
        limitStore = new RedisStore({
            url: process.env.REDISCLOUD_URL || process.env.REDISTOGO_URL,
            no_ready_check: true
        });
    } else {
        console.log('Configuring worker %s for development.', process.pid);

        var LimitStore = require('express-rate-limiter/lib/memoryStore');
        limitStore = new LimitStore();
    }

    var limiter = new Limiter({
        db: limitStore,
        innerTimeLimit: 10000,
        innerLimit: 15
    });


    app.use(function (req, res, next) {
        if (req.url === '/favicon.ico') {
            res.status(404).send();
        } else {
            next();
        }
    });

    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');

    if (process.env.EXPRESS_TRUST_PROXY == 'true') {
        app.enable('trust proxy');
    }

    app.use(express.static(__dirname + '/../public'));

    app.get('/', function (req, res) {
        console.log("GET  - %s - Getting All images. ( %s )", process.pid, req.ip);
        var images = store.getAllImages(req.ip, function (images) {
            res.render('index', {
                images: images
            });
        }, function (err) {
            res.render('index');
        });
    });

    app.get('/view', function (req, res) {
        res.redirect(301, '/');
    });

    app.get('/img/:id', function (req, res) {
        var id = req.params.id;
        console.log("GET  - %s - Getting Image: %s ( %s )", process.pid, id, req.ip);

        store.get(id, function (image) {
            var type = image.type;
            var buffer = image.buffer;

            res.set({
                'Content-Type': 'image/' + type,
                'Content-Length': buffer.length,
                'Expires': new Date(Date.now() + 60000).toUTCString()
            });

            res.send(buffer);
        }, function () {
            res.status(404).send("Could not find ID: " + id);
        });
    });

    app.get('/view/:id', function (req, res) {
        var id = req.params.id;
        console.log("GET  - %s - Viewing Image: %s ( %s )", process.pid, id, req.ip);
        res.render('view', {
            image: '/img/' + id
        });
    });

    app.get('/:id', function (req, res) {
        res.render(req.params.id.toLowerCase(), function (err, html) {
            if (err) {
            	console.log('HTML ERR: ' + err);
                res.status(404).render('404');
            } else {
                res.send(html);
            }
        });
    });


    app.post('/', limiter.middleware(), function (req, res, next) {
        var data = '';

        req.setEncoding('utf8');

        //Data is received in chunks, not in one call.
        //Gather data until done or too large.

        var onReceived = function () {
            req.body = data;
            next();
        };

        req.on('end', onReceived);

        var onReceive = function (chunk) {

            if (data === '') {
                var bIndex = chunk.substring(0, 30).indexOf(';base64,');
                if (bIndex > 0) {
                    chunk = chunk.substring(bIndex + 8);
                }

                var buffer = new Buffer(chunk.substring(0, 13), 'base64');
                var mime = require('./image-type')(buffer);

                if (!mime) { //mime will only return supported types.

                    //Remove listeners so they don't keep triggering.
                    req.removeListener('data', onReceive);
                    req.removeListener('end', onReceived);

                    //Unsupported mime, deny!
                    res.status(415).send('415 - Unsupported Media Type');
                }
            }

            data += chunk;

            //A char takes up 1 byte. Thus length === amount of bytes used.
            if (data.length > 500000) { //0.5MB

                //Remove listeners so they don't keep triggering.
                req.removeListener('data', onReceive);
                req.removeListener('end', onReceived);

                //Too large, deny!
                res.status(413).send('413 - Request Entity Too Large');
            }
        };

        req.on('data', onReceive);
    });

    app.post('/', function (req, res) { //Gets called on next() from the other '/' handler
        var id = store.put(req.ip, req.body);

        console.log("POST - %s - Created Image: %s ( %s )", process.pid, id, req.ip);
        res.send(id);
    });

    var port = process.env.PORT || 3000;
    app.listen(port);

    console.log('Worker %s up and running.', process.pid);
};

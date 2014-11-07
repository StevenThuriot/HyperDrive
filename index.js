var ImageStore = require('./lib/imageStore');
var store = new ImageStore();

var express = require('express');
var app = express();

var Limiter = require('express-rate-limiter');
var LimitStore = require('express-rate-limiter/memoryStore');
var limiter = new Limiter({
    db: new LimitStore()
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

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    //TODO: Get all images for user IP.
    res.render('index');
});

app.get('/:id', function (req, res) {
    var id = req.params.id;
    console.log("GET  - Getting Image: " + id);

    store.get(id, function (image) {
        var buffer = image.buffer;
        var type = image.type;

        res.set({
            'Content-Type': 'image/' + type,
            'Content-Length': buffer.length,
            'Expires': new Date(Date.now() + 60000).toUTCString()
        });

        res.send(buffer);
    }, function () {
        res.send(404, "Could not find ID: " + id);
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

app.post('/', function (req, res) {
    var id = store.put(req.body);
    console.log("POST - Created Image: " + id);
    res.send(id);
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("HyperIcon up and running.");
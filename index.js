var ImageStore = require('./imageStore');
var store = new ImageStore();

var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(3, 'second', true); //true : Fire callback right away

var express = require('express');
var app = express();

app.use (function(req, res, next) {
    if (req.url === '/favicon.ico') {
        res.statusCode = 404;
        res.end();
    } else {
        next();
    }
});

app.use (function(req, res, next) {
	if (req.method == 'POST') {
		var data='';
		req.setEncoding('utf8');
		req.on('data', function(chunk) { 
		   data += chunk;
		});

		req.on('end', function() {
			req.body = data;
			next();
		});
	} else {
		next();
	}
});

app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    //TODO: Get all images for user IP.
	res.render('index');
});

app.get('/:id', function(req, res) {
    var id = req.params.id;
    console.log("GET  - Getting Image: " + id);
    
    store.get(id, function(image) {
    	var buffer = image.buffer;
    	var type = image.type;
    	
        res.set({
          'Content-Type': 'image/' + type,
          'Content-Length': buffer.length,
          'Expires': new Date(Date.now() + 60000).toUTCString()
        });
        
        res.send(buffer);
    }, function() {
        res.send(404, "Could not find ID: " + id);
    });
});


function limit(res, callback) {
    limiter.removeTokens(1, function(err, remainingRequests) {
        if (remainingRequests < 0) {
            res.writeHead(429, {'Content-Type': 'text/plain;charset=UTF-8'});
            res.end('429 Too Many Requests - your IP is being rate limited');
        } else {
            callback();
        }
    });
}

app.post('/', function(req, res) {
    limit(res, function() {
        var id = store.put(req.body);
        console.log("POST - Created Image: " + id);
        res.send(id); 
    });
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("HyperIcon up and running.");

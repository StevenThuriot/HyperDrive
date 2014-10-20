var ImageStore = require('./lib/imageStore');
var store = new ImageStore();

var express = require('express');
var app = express();

var Limiter = require('express-rate-limiter');
var limiter = new Limiter();

app.use (function(req, res, next) {
    if (req.url === '/favicon.ico') {
        res.status(404).send();
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


app.post('/', limiter.middleware(), function(req, res) {    
    var id = store.put(req.body);
    console.log("POST - Created Image: " + id);
    res.send(id); 
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("HyperIcon up and running.");

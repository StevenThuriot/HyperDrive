var ImageStore = require('./imageStore');
var imageType = require('image-type');

var app = require('express')();
var store = new ImageStore();


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

app.get('/', function(req, res) {
    res.redirect(301, 'https://github.com/steventhuriot/HyperIcon');
});

app.get('/:id', function(req, res) {
    var id = req.params.id;
    console.log("GET  - Getting Image: " + id);
    
    store.get(id, function(buffer) {
        var type = imageType(buffer);
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

app.post('/', function(req, res) {  
    var id = store.put(req.body);
	console.log("POST - Created Image: " + id);
	res.send(id);
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("HyperIcon up and running.");

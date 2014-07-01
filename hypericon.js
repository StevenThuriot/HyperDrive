var hat = require('hat');
var cache = require('memory-cache');
var express = require('express');

var app = express();

app.get('/:id', function(req, res){
    var id = req.params.id;
    console.log("GET  - Getting Image: " + id);
    
    var image = cache.get(id);    
    if (image)
    {
        console.log('     - Image found');
        var buffer = new Buffer(image, 'base64');
        res.set({
          'Content-Type': 'image/jpeg',
          'Content-Length': buffer.length,
          'Expires': new Date(Date.now() + 30000).toUTCString()
        });
        
        res.send(buffer);
    } else {             
        console.log("     - Image not found."); 
        res.send(404, "Could not find ID: " + id);
    }
});

app.get('/', function(req, res){
    res.redirect(301, 'https://github.com/steventhuriot/HyperIcon');
});

app.post('/', function(req, res) {    
    var id = hat();
    var data = '';
    
    req.on('data', function(chunk) { 
        data += chunk;
    });
    req.on('end', function() {
        cache.put(id, data, 30000);
    });
    
    console.log("POST - Created Image: " + id);
    res.send(id);
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("HyperIcon up and running.");
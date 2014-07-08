var hat = require('hat');
var mongoskin = require('mongoskin');

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

var ImageStore = module.exports = function(options) {
    this.memoryCache = require('memory-cache');
    
    var configuration = {};
    var defaults = [ ImageStore.defaults, options ];
    
    for (var i = 0; i < defaults.length; i++) {
        var source = defaults[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                configuration[key] = source[key]
            }
        }
    }
    
    this._cacheExpiration = configuration.memoryExpiration;
    
    var db = mongoskin.db(configuration.dbUri);
    this.images = db.collection('images');
    
    var dbExpiration = configuration.dbExpiration / 1000;
    this.images.ensureIndex( { "createdAt": 1 }, { expireAfterSeconds: dbExpiration }, function(err, replies) {
        if (err) throw err;
    });
};

ImageStore.defaults = {
    dbUri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/imageStore',
    memoryExpiration: 6000,
    dbExpiration: 600000
};


ImageStore.prototype.now = function() {
    return Date.now();
};

ImageStore.prototype.put = function(image, errCallback) {
    if (!imageType) {
        throw new ReferenceError('image is not defined');
    }
    
    if (typeof image !== 'string') {        
        var error = new ReferenceError('image is not a base64 string.');
        if (!errCallback) {
            throw error;
        } else {                    
            errCallback(error);
        }        
    }
        
    var id = hat();
    var buffer = new Buffer(image, 'base64');
    
    this.memoryCache.put(id, buffer, this._cacheExpiration);
    this.images.insert({ id: id, image: buffer, createdAt: this.now() }, function(err, result) {        
        if (err) {
            if (!errCallback) {
                throw err;
            } else {                    
                errCallback(err);
            }
        }
    });
    
    console.log('     - Cached image!');
    return id;
};

ImageStore.prototype.get = function(id, foundCallback, notFoundCallback, errCallback) {
    if (!id) {
        throw new ReferenceError('id is not defined');
    }
    if (!foundCallback) {
        throw new ReferenceError('foundCallback is not defined');
    }
    
    var buffer = this.memoryCache.get(id);
    
    if (buffer) {
        console.log('     - Retrieved image from memory!');
        foundCallback(buffer);        
    } else {    
        this.images.findOne({id: id}, function(err, result) {
            if (err) {
                if (!errCallback) {
                    throw err;
                } else {                    
                    errCallback(err);
                }
            }
            
            if (result) {                
                var image = result.image.buffer;
                console.log('     - Retrieved image from Mongo!');
                foundCallback(image);
            } else {
                console.log("     - Image not found."); 
                if (notFoundCallback) notFoundCallback();
            }
        });
    }
}
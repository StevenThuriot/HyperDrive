var hat = require('hat');
var mongoskin = require('mongoskin');
var imageType = require('image-type');
var lwip = require('lwip');

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
    
    this.__cacheExpiration = configuration.memoryExpiration;
    
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
    return new Date();
};

ImageStore.prototype.put = function(image, errCallback) {
    var self = this;
    if (!imageType) {
        throw new ReferenceError('image is not defined');
    }
    
    if (typeof image !== 'string') {        
        var error = new TypeError('image is not a base64 string.');
        if (!errCallback) {
            throw error;
        } else {                    
            errCallback(error);
        }        
    }
    
    //TODO: Store user IP
            
    var bIndex = image.substring(0, 40).indexOf(';base64,');
    if (bIndex > 0) {
        image = image.substring(bIndex + 8);
    }    
    
    var id = hat();
    var buffer = new Buffer(image, 'base64');
    var type = imageType(buffer);
        
    //Memory cache for a short while
    self.memoryCache.put(id, { buffer: buffer, type: type }, self.__cacheExpiration);
        
    lwip.open(buffer, type, function(lwipErr, img) {
        if (lwipErr) {
            if (!errCallback) {
                throw lwipErr;
            } else {                    
                errCallback(lwipErr);
            }
        }
        
        var ratio = 200 / Math.min(img.width(), img.height());
        
        if (ratio < 1) {            
            img.batch()
                .scale(ratio)
                .crop(200, 200)
                .toBuffer('jpg', {quality: 75}, function(thumbErr, bff){             
                    if (thumbErr) {
                        if (!errCallback) {
                            throw thumbErr;
                        } else {                    
                            errCallback(thumbErr);
                        }
                    }
                    self.__putInMongo(id, image, bff.toString('base64'), type);
            });
        } else {
            //We're not going to enlarge it, save as is.
            self.__putInMongo(id, image, image, type);
        }
    });
    
    console.log('     - Cached image!');
    return id;
};
        
ImageStore.prototype.__putInMongo = function(id, image, thumbnail, type) {
    var self = this;
    self.images.insert({ id: id, image: image, thumbnail: thumbnail, type: type, createdAt: this.now() }, function(err, result) {        
        if (err) {
            if (!errCallback) {
                throw err;
            } else {                    
                errCallback(err);
            }
        }
        
        console.log('     - Cached image in MongoDb! (Sizes ~ Img: %s, Thumb: %s)', image.length, thumbnail.length);
    });
}

ImageStore.prototype.get = function(id, foundCallback, notFoundCallback, errCallback) {
    if (!id) {
        throw new ReferenceError('id is not defined');
    }
    if (!foundCallback) {
        throw new ReferenceError('foundCallback is not defined');
    }
    
    var memoryImage = this.memoryCache.get(id);
    
    if (memoryImage) {
        console.log('     - Retrieved image from memory!');
        foundCallback(memoryImage);        
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
                var image = new Buffer(result.image, 'base64');
                var type = result.type;
                
                console.log('     - Retrieved image from Mongo!');
                foundCallback({ buffer: image, type: type });
            } else {
                console.log("     - Image not found."); 
                if (notFoundCallback) notFoundCallback();
            }
        });
    }
}

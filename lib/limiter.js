var Limiter = module.exports = function() {
    this.__memoryCache = require('memory-cache');    
    
    //Is this too fast?
    this.__expiration = 2500;
    this.__retries = 3;
    
    this.__getip = require('ipware')().get_ip; //function, accepts request
};

Limiter.prototype.middleware = function() {    
    var self = this;
    
    var middleware = function (req, res, next) {
        var ip = self.__getip(req).clientIp;        
                
        var limit = self.__memoryCache.get(ip);
        if (limit) { //Existing user            
            //decrease                
            limit.retries--;

            if (limit.retries < 1) {
                res.set('Retry-After', limit.date - Date.now());
                res.status(429).send('Rate limit exceeded');                    
                return;
            }
        } else {
            //New user
            self.__init(ip);
        }
        
        return next();
    };
    
    return middleware;
}

Limiter.prototype.__put = function(ip, limit) {
    this.__memoryCache.put(ip, limit, this.__expiration);
}

Limiter.prototype.__init = function(ip, now) {    
    this.__put(ip, { date: Date.now() + this.__expiration, retries: this.__retries });
}

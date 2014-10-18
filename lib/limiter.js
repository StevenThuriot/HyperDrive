//TODO: Allow specific settings
var Limiter = module.exports = function() {
	this.__outerTimeLimit = 2 * 60 * 1000; // 2 Minutes
	this.__outerLimit = 60;
	
	this.__innerTimeLimit = 1000; // 1 second
	this.__innerLimit = 3;
};

Limiter.prototype.__db = require('memory-cache');

Limiter.prototype.__getip = require('ipware')().get_ip; //function, accepts request

Limiter.prototype.__put = function(ip, limit) {
    this.__db.put(ip, limit, this.__outerTimeLimit);
}

Limiter.prototype.__init = function(ip, now) {    
    this.__put(ip, { date: Date.now(), inner: this.__innerLimit, outer: this.__outerLimit });
}


//TODO: Allow specific settings
Limiter.prototype.middleware = function() {    
    var self = this;
    
    var middleware = function (req, res, next) {
        var ip = self.__getip(req).clientIp;        
                
        var limit = self.__db.get(ip);
        
        if (limit) { //Existing user            
			var now = Date.now();
            var timeLimit = limit.date + self.__innerTimeLimit;
            
			if (now > timeLimit) {
				limit.inner = self.__innerLimit;
			} else {
				limit.inner--;
			}
			
			limit.outer--;
			limit.date = now;

            if (limit.inner < 1 || limit.outer < 1) {
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
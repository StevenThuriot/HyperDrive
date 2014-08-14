![HyperIcon](http://img.dafont.com/preview.php?text=HyperIcon&ttf=squared_display0&ext=1&size=64&psize=m&y=53)
====

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

* "10 Minute Image"
* NodeJS Service that accepts base64 post messages and caches them for 10 minutes.
* Created for serving images in `HyperQube's XBMC Notifier` plugin.
	* A `base64` string is passed to the plugin
	* XBMC's `GUI.ShowNotification` accepts a URI
	
* Usage
    * Send post to the root of the service. Send the base64 as raw data.
    * The server responds with a unique id that can be used for the next 10 minutes.
    	* The first few seconds the image will be served from memory for speed.
    	* Afterwards, the image will be served from MongoDB.
    * GET `http://nodejs/id` to see the image. Content is passed as the correct `image/*` datatype.
    * See the [XBMC Notifier plugin](https://github.com/steventhuriot/HyperQube-Plugins) for sample usage.

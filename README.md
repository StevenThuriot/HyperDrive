HyperIcon
====

* NodeJS Service that accepts base64 post messages and caches them for 30 seconds.
* Created for serving images in HyperQube's XBMC Notifier plugin.
	* A base64 string is passed to the plugin
	* XBMC's GUI.ShowNotification accepts a URI
	
* Usage
    * Send post to the root of the service. Send the base64 as raw data.
    * The server responds with a unique id that can be used for the next 30 seconds.
    * Call http://nodejs:3000/id to see the image. Content is passed as image/jpeg.
    * See the [XBMC Notifier plugin](https://github.com/steventhuriot/HyperQube/) for a sample.

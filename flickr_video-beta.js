// This is suggested by Apple for Safari extensions
if(window.top === window) {
	(function() {
		if(document.domain != "www.flickr.com") {
			alert("Only supported on www.flickr.com");
			return;
		}

		if(window.navigator.userAgent.indexOf("AppleWebKit") == -1 ||
		     window.navigator.vendor.indexOf("Apple") == -1) {
			alert("This is only supported on Safari. If it works, you are lucky!");
		}

		// First we check to even see if we are needed or not
		// If you have Flash, I don't bother
		var flash_notice = document.getElementsByClassName("flash-notice")[0];
		if(!flash_notice) {
			console.log("No flash notice to replace with working <video> on this page!");
			return;
		}

		// There were a lot of approaches to getting these values.
		// I initially started off with the API route, but when I
		// realized all the data was scrappable in the page, why
		// bother?

		var id = null;
		var secret = null;
		var poster = null;
		var flash_notice_dom = null;

		// Scrapping the link tags might not be the best approach
		// but it works and has no external dependencies.
		// I also feel this is stable enough that it won't likely
		// break randomly, but if it does, I'll just update this
		var links = document.getElementsByTagName("link");
		for(var key in links) {
			// there's a handful of links, we only care about the video_src and image_src ones
			if(links[key].rel == "video_src") {
				// There are better ways to break up a URL, but this works good enough
				var query_params = links[2].href.split("?")[1].split("&");
				var data = {};
				for(var key2 in query_params) {
					var parts = query_params[key2].split("=");
					data[parts[0]] = parts[1];
				}

				// now that we have the query params parsed out in data, use them! :)
				id = data.photo_id;
				secret = data.photo_secret;
			} else if(links[key].rel == "image_src") {
				poster = links[key].href;
			}
		}

		// Check and be sure we found the params we needed above, if not, stop
		if(id && secret) {
			// This was a quick dirty way to get the base URL for the video
			// since /photos/username/photo_id was already part of the URL
			// to access the video anyway
			var base = document.location.href;

			// being the paranoid type, I do check to make sure the URL is valid though before using it
			if(base.substr(-1 * id.length - 1, id.length) != id) {
				// if there was extra crap after the photo_id (like a photoset id), this removes it
				var base = document.location.href.split("/").slice(0,6).join("/") + "/";

				// ok, we failed, giving up
				if(base.substr(-1 * id.length - 1, id.length) != id) {
					console.log("Something went wrong determining URL! File a bug please!");
					return;
				}
			} 

			// yeah! we now have the URL to our H.264 video stream!
			var video_src = base + "play/site/" + secret + "/";

			// now that we have the URL, let's make it work!
			var video_wrapper = document.getElementsByClassName("video-wrapper")[0];

			// make sure we were able to grab the video wrapper and we have a video to play
			if(video_wrapper && video_src) {

				// save off the flash notice for later!
				flash_notice_dom = video_wrapper.firstChild;
				
				// get rid of the nasty "You need Flash!" b/s
				while (video_wrapper.hasChildNodes()) {
					video_wrapper.removeChild(video_wrapper.firstChild);
				}

				// Now create a <video> element and set it's properties as needed
				var video = document.createElement("video");

				// why doesn't JS support a -2 for the length? would be handy here, no?
				video.width = video_wrapper.style.width.substr(0, video_wrapper.style.width.length - 2);
				video.height = video_wrapper.style.height.substr(0, video_wrapper.style.height.length - 2);

				video.controls = true;
				video.poster = poster;
				video.src = video_src;
				
				video.addEventListener("error", function(e) {
					switch (e.target.error.code) {
						case e.target.error.MEDIA_ERR_ABORTED:
					       	// ignore
						   	var message = null;
					       	break;
					    case e.target.error.MEDIA_ERR_NETWORK:
						   	var message = 'A network error occurred during playback, try again?';
					       	break;
					    case e.target.error.MEDIA_ERR_DECODE:
						case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
							var message = 'The Flickr video stream is corrupted or unplayable.';
					       	break;
					    default:
					       	var message = 'An unknown error occurred.';
					       	break;
					}
					if(message) {
						if(flash_notice_dom) {
							// yank our stuff back out!
							while (video_wrapper.hasChildNodes()) {
								video_wrapper.removeChild(video_wrapper.firstChild);
							}
							
							video_wrapper.appendChild(flash_notice_dom);
							
							var node = document.createElement("div");
							div.innerHTML = "The H.264 Flickr Video player received an error:<br>" + message + "<br>If this issue persists, please file a bug here:<br><a href='http://github.com/jsjohnst/SafariEnhancements/issues'>http://github.com/jsjohnst/SafariEnhancements/issues</a><br>Providing the URL and this error code: " + e.target.error.code;
							div.style["margin-top"] = "10px";
							
							video_wrapper.appendChild(node);
						} else {
							alert("The H.264 Flickr Video player received an error:\n" + message + "\n\nIf this issue persists, please file a bug here:\nhttp://github.com/jsjohnst/SafariEnhancements/issues\nProviding the URL and this error code: " + e.target.error.code;)
						}
					}
				});

				// now that we are all set, append it and make things be awesome!
				video_wrapper.appendChild(video);
				
				// If your window is big enough, I'm going to put in a little advert for myself... :)
				if(window.outerWidth >= 1240) {
					// Create the div for the plug and position it
					var node = document.createElement("div");
					node.style.width = "100px";
					node.style.position = "fixed";
					node.style.bottom = "5px";
					node.style.left = "5px";
					node.style.border = "1px solid #000";
					node.style.padding = "0.6em";
					node.style.color = "#fff";
					node.style["text-align"] = "center";
					node.style["font-size"] = "0.9em";
					node.style["background-color"] = "#939";
					node.style["border-radius"] = "5px";
					node.style["z-index"] = -33;
					node.innerHTML = "H.264 Flickr Videos<br>Brought to you by<br><a href=\"http://www.jeremyjohnstone.com\" style=\"color: #fff; text-decoration: underline;\">Jeremy Johnstone</a>";

					// now that we made the div, stick it in the page!
					document.body.appendChild(node);
				}			
			}
		}
	})();
}

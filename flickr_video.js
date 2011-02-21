
(function() {

var flash_notice = document.getElementsByClassName("flash-notice")[0];
if(!flash_notice) {
	console.log("No flash notice to replace with working video on this page!");
	return;
}

var id = null;
var secret = null;
var poster = null;

var links = document.getElementsByTagName("link");
for(var key in links) {
	if(links[key].rel == "video_src") {
		var query_params = links[2].href.split("?")[1].split("&");
		var data = {};
		for(var key2 in query_params) {
			var parts = query_params[key2].split("=");
			data[parts[0]] = parts[1];
		}

		id = data.photo_id;
		secret = data.photo_secret;
	} else if(links[key].rel == "image_src") {
		poster = links[key].href;
	}
}

if(id && secret) {
	var base = document.location.href;
	if(base.substr(-1 * id.length - 1, id.length) != id) {
		console.log("Something went wrong determining URL!");
	} else {
		var video_src = base + "play/site/" + secret + "/";
	}
	
	var video_wrapper = document.getElementsByClassName("video-wrapper")[0];
	if(video_wrapper && video_src) {
		video_wrapper.removeChild(video_wrapper.firstChild);

		var video = document.createElement("video");
		video.width = video_wrapper.style.width.substr(0, video_wrapper.style.width.length - 2);;
		video.height = video_wrapper.style.height.substr(0, video_wrapper.style.height.length - 2);;
		video.controls = true;
		video.poster = poster;
		video.src = video_src;

		video_wrapper.appendChild(video);
	}
}


})();

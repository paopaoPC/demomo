define([], function() {



	var imgSrc = function(src) {

		//src 格式如:http://61.186.243.102/cameap/res/image?key=2ca27bf8a728dc8c2805d4fb6d505001&width=139&height=104.25
		//处理格式 
		var imgsrc;
		if (src.indexOf("?") != -1) {
			var paraString = src.substring(src.indexOf("?") + 1, src.length).split("&");

			imgsrc = src.substring(0, src.indexOf("?"));

			var imgwidth = paraString[1];
			var imgw = imgwidth.substring(imgwidth.indexOf("=") + 1, imgwidth.length);
			var w = "width=" + parseInt(imgw) * 1;

			imgsrc = imgsrc + "?" + paraString[0] + "&" + w;

			for (var i = 2; i < paraString.length; i++) {
				imgsrc = imgsrc + "&" + paraString[i];
			}
		} else {
			imgsrc = src;
		}
		return imgsrc;
	};

	String.prototype.imgSrc = function() {

		var imgsrc;
		var src = this;
		if (src.indexOf("?") != -1) {
			var paraString = src.substring(src.indexOf("?") + 1, src.length).split("&");

			imgsrc = src.substring(0, src.indexOf("?"));

			var imgwidth = paraString[1];
			var imgw = imgwidth.substring(imgwidth.indexOf("=") + 1, imgwidth.length);
			var w = "width=" + parseInt(imgw) * 1;

			imgsrc = imgsrc + "?" + paraString[0] + "&" + w;

			for (var i = 2; i < paraString.length; i++) {
				imgsrc = imgsrc + "&" + paraString[i];
			}
		} else {
			imgsrc = src;
		}
		return imgsrc;
	};

	return imgSrc;
});
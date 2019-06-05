define([
		'butterfly/view', 'map/map-client', 'map/index'
	],
	function(View, mapClient, Map) {
		return View.extend({
			id: 'navigationPage',
			events: {
				"click .backbtn": "goBack",
				"click .backbtn": "goBack2"
			},
			render: function() {

			},
			onShow: function() {
				var start = mapClient.request("start");
				var end = mapClient.request("end");
				var opts = mapClient.request("opts");
				var iframe = document.createElement('iframe');
				document.getElementById("iframeContent").appendChild(iframe);
				iframe.src = "http://www.baidu.com";
				// iframe.src = "../map/iframePage.html?start=" + start + "&end=" + end + "&opts=" + opts;
				// $("#myiframe").get(0).contentWindow.location.replace("../map/iframePage.html?start=" + start + "&end=" + end + "&opts=" + opts);
				window.onpopstate = function(event) {
					console.log("location: " + document.location);
					console.log("state: " + JSON.stringify(event.state));
				};
				// $("#iframeContent")[0].src = "../map/iframePage.html?start=" + start + "&end=" + end + "&opts=" + opts;
				// $("#iframeContent")[0].onload = function() {
				// 	$(document.getElementById('iframeContent').contentWindow.document.body).find(".back-btn").bind("click",function(){
				// 		console.info();
				// 		window.history.go(-2);
				// 	});
				// 	window.onpopstate = function(event) {
				// 		alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
				// 	};


				// };
			},
			goBack: function() {
				window.history.go(-2);
			},
			goBack2: function() {
				window.history.go(-1);
			}

		}); //view define

	});
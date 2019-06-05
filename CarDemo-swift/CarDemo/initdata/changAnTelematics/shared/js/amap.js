define([],function () {
	var amapUrl = 'http://webapi.amap.com/maps?v=1.3&key=9041220b42c3a1e91ce51500f5f7eeec&plugin=AMap.Driving,AMap.Geocoder';
	window.localStorage['amapUrl'] = amapUrl;
	PP_require([amapUrl], function (data) {}, function (e) {})
})
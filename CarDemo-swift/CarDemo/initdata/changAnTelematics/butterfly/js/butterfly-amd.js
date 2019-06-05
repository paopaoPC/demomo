// Setup rem auto-layout
(function() 
{
  	var elemRoot = document.documentElement;
    var resizeEvent = "orientationchange" in window ? "orientationchange" : "resize";
    var resetFontSize = function () 
    {
      	var w = elemRoot.clientWidth;
      	if (!w) return;
      	elemRoot.style.fontSize = 100 * (w / 320) + 'px';
    };
 
	if (!document.addEventListener) 
	{
	  	return;
	}
  	window.addEventListener(resizeEvent, resetFontSize, false);
  	document.addEventListener('DOMContentLoaded', resetFontSize, false);

  	resetFontSize();
})();

// bola使用了 require 这个变量
var require = PP_require;

require.config({
	baseUrl: '../',
	packages: [{
		name: 'butterfly',
		location: 'butterfly/js',
		main: 'butterfly',
	}],
	paths: {
		// require.js plugins
		text: 'butterfly/vendor/requirejs-text/text',
		domReady: 'butterfly/vendor/requirejs-domready/domReady',
		i18n: 'butterfly/vendor/requirejs-i18n/i18n',
		css: 'butterfly/vendor/require-css/css',
		view: 'butterfly/js/requirejs-butterfly',
		listview: 'butterfly/js/listview',
		// lib
		jquery: 'butterfly/vendor/jquery/jquery',
		zepto: 'butterfly/vendor/zepto/zepto',
		underscore: 'butterfly/vendor/underscore/underscore',
		backbone: 'butterfly/vendor/backbone/backbone',
		fastclick: 'butterfly/vendor/fastclick/fastclick',
		iscroll: 'butterfly/vendor/iscroll/iscroll-probe',
		moment: 'butterfly/vendor/moment/moment',
		spin: 'butterfly/vendor/spinjs/spin',
		swipe: 'butterfly/vendor/swipe/swipe',
		hammer:'butterfly/vendor/hammerjs/hammer',
		highcharts:'butterfly/vendor/highcharts/js/highcharts-rj',
		// baiduMap:"http://api.map.baidu.com/api?v=1.5&ak=PVYcErlFE1VUgGZcHwRmtybC",
		baiduMap:"shared/js/baidumap-api-1.5",
		lazyload:"shared/js/jquery.lazyload.min",
		// Don't requie these modules, use highcharts instead
		__highcharts:'butterfly/vendor/highcharts/js/highcharts',
		__highcharts_exports:'butterfly/vendor/highcharts/js/modules/exporting',
		imMain:'common/main',
		vue:'shared/js/vue',
	},
	waitSeconds: 5,
	shim: {
		iscroll: {exports: 'IScroll'},
		fastclick: {exports: 'FastClick'},
		highcharts:['__highcharts'],
		__highcharts_exports:['__highcharts'],
		__highcharts:['jquery'],
		imMain:['common/globalConfigLoader'],
	}
});

require(['domReady!', 'butterfly', 'iscroll', 'butterfly/fastclick'],
	function(domReady, Butterfly, IScroll, FastClick){
		//ios7 issue fix
		if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)) {
  		$('html').addClass('ipad ios7');
		}
		//iOS scroll to top
		setTimeout(function() {window.scrollTo(0, 1);}, 0);


		//enable fastclick
		FastClick.attach(document.body);

		//this will stop the page from scrolling without IScroll
		// document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
});

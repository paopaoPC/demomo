define([
		"common/navView",
		'butterfly',
		"shared/js/notification"
	],
	function(View,Butterfly,Notification){
        var Base = View;
		return Base.extend({
			events:{
				"click #submit_carid": "goBack"
			},
			onDeviceBack: function () {
				if(window.localStorage['goMainIndex'] == '2'){
					OSApp.closeView();
				} if(window.localStorage['goMainIndex'] == '1'){
					bfNaviController.popTo("main/index2.html")
				} else {
					bfNaviController.popTo("cars/index.html")
				}
                return true;
            },
			goBack: function(){
				if(window.localStorage['goMainIndex'] == '2'){
					OSApp.closeView();
				} if(window.localStorage['goMainIndex'] == '1'){
					bfNaviController.popTo("main/index2.html")
				} else {
					bfNaviController.popTo("cars/index.html")
				}
			},
			onViewPush:function(pushFrom, pushData){
			},
			posGenHTML: function() {
			},
			onShow:function(){
			}
		}); 
	});
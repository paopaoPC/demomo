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
				bfNaviController.popTo("cars/index.html")
                return true;
            },
			goBack: function(){
				bfNaviController.popTo("cars/index.html")
			},
			onViewPush:function(pushFrom, pushData){
			},
			posGenHTML: function() {
			},
			onShow:function(){
			}
		}); 
	});
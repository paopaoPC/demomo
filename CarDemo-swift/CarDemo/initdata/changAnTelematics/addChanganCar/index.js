define([
		"common/navView",
		'butterfly',
		"shared/js/notification"
	],
	function(View,Butterfly,Notification){
        var Base = View;
		return Base.extend({
			events:{
				"click .addChanganCar": "changanCarAdd",
				"click .other-car": "otherCarAdd"
			},
			onViewPush:function(pushFrom, pushData){
			},
			posGenHTML: function() {
			},
			onShow:function(){
			},
			changanCarAdd: function(){
				bfNaviController.push("addChanganCar/addCarView.html")
			},
			otherCarAdd: function(){
				bfNaviController.push("cars/addCar.html")
			}
		}); 
	});
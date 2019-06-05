define([
		"common/navView",
		'butterfly',
		"shared/js/notification"
	],
	function(View,Butterfly,Notification){
        var Base = View;
		return Base.extend({
			events:{
				"click #submit_carid": "goToDetail"
			},
			onViewPush:function(pushFrom, pushData){
				if (pushData) {
					this._data = pushData
				};
			},
			goToDetail: function(){
				var me = this;
				bfNaviController.push("addChanganCar/carInfo.html", this._data)
			},
			posGenHTML: function() {
			},
			onShow:function(){
				var defaultText = "您提交照片与真实信息不符，请重新提交照片";
				var certificationResultMsg = this._data.certificationResultMsg ? this._data.certificationResultMsg : defaultText;
				this.getElement(".error-reason").text(certificationResultMsg)
			}
		}); 
	});
﻿define([
		'text!cars/rename.html',
		"common/navView",
		'butterfly',
		"common/osUtil",
		"common/ssUtil",
		"shared/js/notification"
	],
	function(template, View,Butterfly,osUtil,ssUtil,Notification){
        var Base = View;
		return Base.extend({
			
			events:{
				"click .submitName":"submit"
			},
			onViewPush:function(pushFrom, pushData){
				this._pushData = pushData.value;
				this._carId = pushData.carId;
			},
			posGenHTML: function() {
				if(this._pushData){
					this.getElement("#rename_name").val(this._pushData);
				}
			},
			onShow:function(){
				this.getElement("#rename_name")[0].focus();
			},
			submit:function(){
				var self = this;
				if(!this._carId){
					Notification.show({
						type:"info",
						message:"未获取到车辆ID"
					});
					return;
				}
				var vinFilter = /^[A-Za-z0-9]+$/;
				var newName = this.getElement("#rename_name").val();
				if (newName.length != 17) {
					Notification.show({
						type:"error",
						message:"车架号错误"	
					});
					return;
				};
				if (!vinFilter.test(newName)) {
					Notification.show({
						type:"error",
						message:"请输入数字和字母"
					});
					return ;
				};
				bfClient.updateCarInfo({
						type : 'post',
						data : {
								'carId':self._carId,
								'vin':newName
						},
						success : function(data){
							if(data.code==0){
								bfAPP.trigger("IM_EVENT_CAR_CHANGED");
								Notification.show({
									"type":"info",
									"message":"更新成功"
								});
								self.onLeft();
							}else{
								Notification.show({
									"type":"error",
									"message":data.msg
								});
							}
						},
						error:function(data){
							Notification.show({
								"type":"error",
								"message":data.msg
							});
						}
					});
			}
		}); 
	});
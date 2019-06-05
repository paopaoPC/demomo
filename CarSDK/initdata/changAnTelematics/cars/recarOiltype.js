define([
		'text!cars/recarOiltype.html',
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
					this.getElement("#reOilType").val(this._pushData);
				}
			},
			onShow:function(){
                var me = this;
                bfClient.getOilTypeList({
                    type : 'post',
                    data : {},
                    success : function(data){
                        if(data.success){
                            me.getElement("#reOilType").html("");
                            for(var i =0;i<data.data.length;i++){
                                me.getElement("#reOilType").append("<option>"+data.data[i]+"</option>");
                            }
                            if(me._pushData){
                                me.getElement("#reOilType").val(me._pushData);
                            }
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
				var reOilType = this.getElement("#reOilType").val();
				bfClient.updateCarInfo({
						type : 'post',
						data : {
								'carId':self._carId,
								'oilType':reOilType
						},
						success : function(data){
							if(data.success){
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
define([
    "common/navView",
    "common/osUtil",
    "shared/js/client",
    'common/countDwonUtil',
    'shared/js/notification'
],
    function (View, osUtil,Client, CountDwon, Notification) {
        var Base = View;
        return Base.extend({
        	id : "otherInsuranceCompany",
        	events: 
            {
              	"focus input": "onFocus",
				"blur input": "onBlur",  
				"click .hint": "OnClickHint",
				"click .submit_ok": "submitData"
            },
            onViewPush: function(pushFrom, pushData)
	        {
	            this._data = pushData;
	        },
            onFocus: function(e) { //输入框聚焦
				var currentTarget = $(e.currentTarget);
				currentTarget.parent().find("label").hide();
			},
			onBlur: function(e) { //失焦
				var currentTarget = $(e.currentTarget);
				var hint = currentTarget.parent().find("label");
				if (currentTarget.val().length > 0) {
					hint.hide();
				} else {
					hint.show();
				}
			},
			OnClickHint: function(e) { //点击提示聚焦
				var currentTarget = $(e.currentTarget);
				currentTarget.parent().find("input").focus();
			},
			submitData: function(){
				var me = this;
				var insuranceName = me.getElement("#insuranceName").val();
				var insuranceTel = me.getElement("#insuranceTelphone").val();
				var telFilter = /^1\d{10}$|^(0\d{2,3}-?|\(0\d{2,3}\))?[1-9]\d{4,7}(-\d{1,8})?$/;
				if (!telFilter.test(insuranceTel)) {
					Notification.show({
						type:"error",
						message:"请输入正确的手机号码"
					});
					return ;
				}
				if (insuranceName != "" && insuranceTel != "") {
					bfClient.updateCarInfo({
						type:"post",
						data:{"carId": me._data.carId, "insuranceCompany": insuranceName, "insurancePhone": insuranceTel},
						success: function(data){
							if (data) {
								if(me._data.from == 'sos'){		                        
			                        bfNaviController.pop(2);
			                    }else if(me._data.from == 'carDetails'){
			                        bfNaviController.pop(2,{insuranceName:insuranceName, insurancePhone:insuranceTel});
			                    }       
							}else{
								Notification.show({
									type:"error",
									message:"添加失败"
								});
							}
						}
					});
					bfDataCenter.setInsuranceCompany(insuranceName,insuranceTel);
				}else{
					Notification.show({
						type:"error",
						message:"请输入相应信息"
					})
				}
			}
			
        });
    });
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
        	id : "resetPassword",
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
			valiPassWord: function(newPassword){
				var judgeIndex = 0;
				var patt1 = new RegExp('[a-z]');
				var patt2 = new RegExp('[A-Z]');
				var patt3 = new RegExp('[0-9]');
				var patt4 = new RegExp('((?=[\x21-\x7e]+)[^A-Za-z0-9])');

				if(newPassword.length <6 || newPassword.length>16){
					Notification.show({
						type: "info",
						message: "请输入6-16位的密码"
					});
					return false;
				} else {
					patt1.test(newPassword) && judgeIndex++;
					patt2.test(newPassword) && judgeIndex++;
					patt3.test(newPassword) && judgeIndex++;
					patt4.test(newPassword) && judgeIndex++;
					if(judgeIndex>=2){
						return true;
					} else {
						Notification.show({
							type: "info",
							message: "密码需大、小写字母、数字、特殊字符中的至少两种"
						});
						return false;
					}
				}
			},
			submitData: function(){
				var me = this;
				var newPassword = me.getElement("#newPassword").val();
				var sureNewPassword = me.getElement("#sureNewPassword").val();
				if (sureNewPassword == newPassword && sureNewPassword != "" && newPassword != "") {
					if(!me.valiPassWord(newPassword)){
						return true;
					}
					if (this._data.phone != null && this._data.email == null) {
						bfClient.findPassword({
							type : 'post',
							data:{'phone': this._data.phone, 'password': newPassword, 'authCode': this._data.authcode},
							success: function(data){
								if (data.success) {
									Notification.show({
										type: "well",
										message: "重置密码成功"
									});
									bfNaviController.pop(2);
								}else{
									Notification.show({
										type:"error",
										message: "重置密码失败"
									});
								}

							}
						});
					}else if (this._data.phone == null && this._data.email != null){
						bfClient.findPassword({
							type : 'post',
							data:{'email': this._data.email, 'password': newPassword, 'authCode': this._data.authcode},
							success: function(data){
								if (data.success) {
									Notification.show({
										type: "well",
										message: "重置密码成功"
									});
									bfNaviController.pop(2);
								}else{
									Notification.show({
										type:"error",
										message: "重置密码失败"
									});
								}

							}
						});
					}
				}else{
					Notification.show({
						type: "error",
						message: "请输入新密码或者确认密码错误"
					});
				}
				
			}
			
        });
    });
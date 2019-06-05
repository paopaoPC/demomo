define([
    "common/navView",
    "common/osUtil",
    "shared/js/client",
    'common/countDwonUtil',
    'shared/js/notification',
	'common/imageCodeInterface'
],
    function (View, osUtil,Client, CountDwon, Notification, codeInterface) {
        var Base = View;
        return Base.extend({
        	id : "findPswValidate",
        	events: 
            {
              	"focus input": "onFocus",
				"blur input": "onBlur",  
				"click .hint": "OnClickHint",
				"click .check_time":"getVerificationCode",
				"click .submit_ok": "submitData",
				"click .image-code": function(){this.getImageCode()}
            },
			posGenHTML:function () {
				// var height = window.outerHeight+200;
				// this.$el.css("overflow","auto");
				// this.getElement(".content").css("height",height+"px");
			},
            onShow: function(){
            	var me = this;
            	this.getImageCode(); 	
            },
            getImageCode: function(){
	            var imageNode = this.getElement("#checkImg");
	            codeInterface.getImageCode(imageNode);
	        },
	        getVerificationCode: function () {
	        	var me = this;
	            this._txt = this.getElement(".check_time");
	            var phoneNumber = this.getElement("#contact").val();
	            var codeNumber = this.getElement(".imageCode").find('input').val();
	            codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "forgetPwd", function(){me.getImageCode()})
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
			checkTime: function(){
				var me = this;				
				var time = 60;				
				var changStatu = this.getElement(".check_time");
				var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/; // 电话
				var mailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				// var type = this.getElement(".input_item select").val();
				var type = "sms";
				var contact = this.getElement("#contact").val();
				if (contact != "") {
					if(type == 'sms'){	
						if (phoneFilter.test(contact)) {
							me.submitValidata(changStatu, time, contact, type);
						}else{
							Notification.show({
								type:"error",
								message: "手机号码输入错误"
							})
						}					
						
					}else{
						if (mailFilter.test(contact)) {
							me.submitValidata(changStatu, time, contact, type);
						}else{
							Notification.show({
								type:"error",
								message: "邮箱输入错误"
							})
						}			
						
					}
				}else{
					Notification.show({
						type:"error",
						message:"请输入手机或邮箱"
					})
				}
				
				
			},
			submitValidata: function(changStatu, time, contact, type){
					bfClient.sendAuthcode({
						type : 'post',
						data:{'contact': contact, 'type':type, 'usage':"forgetPwd" },
						success: function(data){
							if(data.code==0){
								CountDwon.countDwon(changStatu, time);
							}else{
								Notification.show({
									type:"error",
									message:data.msg
								})
							}
						}
					});
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
				this._phone = null;
				this._email = null;
				var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/; // 电话
				var mailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				// var type = me.getElement(".input_item select").val();
				var type = "sms";
				var contact = me.getElement("#contact").val();
				var authcode = me.getElement("#authCode").val();
				var newPassword = me.getElement("#newPassword").val();
				var sureNewPassword = me.getElement("#sureNewPassword").val();
				if (type == 'sms') {
					if (contact != null) {
						if (phoneFilter.test(contact)) {
							this._phone = contact;
							if (authcode == "") {
								Notification.show({
									type: "error",
									message: "请输入验证码"
								});
							}else{
								me.findPassword(this._phone,type, authcode,newPassword,sureNewPassword);
							}
						} else {
							Notification.show({
								type: "error",
								message: "请输入正确的手机号码"
							});
							return;
						}
					}else{
						Notification.show({
							type: "error",
							message: "请输入手机号码"
						});
					}
				}else{
					if (contact != null) {
						if (mailFilter.test(contact)) {
							this._email = contact;
							if (authcode == null) {
								Notification.show({
									type: "error",
									message: "请输入验证码"
								});
							}else{
								authcode = "123456";
								me.checkAuthcode(this._email,type, authcode);
							}
						} else {
							Notification.show({
								type: "error",
								message: "请输入正确的手机号码邮箱"
							});
							return;
						}
					}else{
						Notification.show({
							type: "error",
							message: "请输入您的邮箱"
						});
					}
				}
				
				
			},
			findPassword: function(contact, type, authcode,sureNewPassword,newPassword){
				var me = this;
				if (sureNewPassword == newPassword ) {
					if(sureNewPassword == "" || newPassword == ""){
						Notification.show({
	                        type:"error",
	                        message: "密码不能为空"
	                    });
	                    return;
					}
					if(!me.valiPassWord(newPassword)){
						return;
					}
					me.getElement(".submit_ok")[0].disabled = true;
					bfClient.findPassword({
						type: 'post',
						data: {'phone': contact, 'authCode': authcode, 'password': newPassword},
						success: function (data) {
							if (data.success) {
								Notification.show({
									type: "well",
									message: "重置密码成功"
								});
								bfNaviController.pop(1);
							}else{
								Notification.show({
									type:"error",
									message: data.msg || "重置密码失败"
								});
								me.getElement(".submit_ok")[0].disabled = false;
								if (me._txt) {
                                    CountDwon.stopCountDown(me._txt);
                                }; 
							}
						},error:function(){
							me.getElement(".submit_ok")[0].disabled = false;
							if (me._txt) {
	                            CountDwon.stopCountDown(me._txt);
	                        }; 
						}
					});
				}else{
                    Notification.show({
                        type:"error",
                        message: "两次密码不一致"
                    });
                }
			}
			
        });
    });
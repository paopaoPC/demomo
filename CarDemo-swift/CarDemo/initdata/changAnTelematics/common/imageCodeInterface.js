define(['shared/js/notification', 'common/countDwonUtil'],
	function(Notification, CountDwon){
		return {
			getImageCode: function(imageNode){
	            var me = this;
	            bfClient.getImageCode({
	                type:"post",
	                success: function(data){
	                    if (data.code == 0) {
	                        me.imageId = data.data.id;
	                        imageNode.attr("src", "data:image/png;base64," + data.data.code);
	                    }else{
	                    	imageNode.attr("src", "../shared/img/image_error.png");
	                        Notification.show({
	                            type:"error",
	                            message:'获取验证码失败'
	                        });
	                    }
	                },
	                error:function(data){
	                	imageNode.attr("src", "../shared/img/image_error.png");
                        Notification.show({
                            type:"error",
                            message:'获取验证码失败'
                        });
	                }
	            })
	        },
	        verificationCode: function(txtNode, phoneNumber, codeNumber, usage, updateCode){
	        	var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/; // 电话
	        	if (phoneNumber.length != 11 || !phoneFilter.test(phoneNumber)) {
	                Notification.show({
	                    type: "error",
	                    message: "请输入正确的手机号码"
	                });
	                return;
	            }
	            if (codeNumber.length == 0) {
	                Notification.show({
	                    type: "error",
	                    message: "请输入图片验证码"
	                });
	                return;
	            };
	            //改变按钮颜色并开始倒计时
	            //等获取验证码接口
	            var stepValue = 1;
	            var time = 60;
	            this.sendAuthCode(phoneNumber,codeNumber, usage, function () {
	                CountDwon.countDwon(txtNode, time);
	            },updateCode);
	        },
	        sendAuthCode: function (phone,code, usage, success, updateCode) {
	            var me = this;
	            bfClient.sendAuthcode({
	                type: 'post',
	                data: {'mobile': phone, 'imageCode': code, 'imageId': me.imageId,'usage': usage},
	                success: function (data) {
	                    if (data.code == 0) {
	                        success();
	                    } else {
	                        Notification.show({
	                            type: "error",
	                            message: data.msg
	                        });
	                        updateCode()
	                    }
	                }
	            });
	        },
	        verificationCodeOuth2: function(txtNode, mobile, s) {
				var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/;
				if (11 != mobile.length || !phoneFilter.test(mobile)){
					Notification.show({
						type: "error",
						message: "请输入正确的手机号码"
					});
					return
				}
				var time = 60;
				navigator.packaging.goWxSms(
					{
						mobile: mobile
					}, 
					function(data) {
						if(data.status_code && data.status_code ==0){
							CountDwon.countDwon(txtNode, time)
						} else {
							Notification.show({
								type: "error",
								message: r.message
							})
						}
						s()
					}, function() {
						Notification.show({
							type: "error",
							message: "网络开小差"
						})
						s()
					}
				)
			}
		}
	}	
)
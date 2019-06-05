define([
        "common/navView",
        "shared/js/notification",
        'common/countDwonUtil',
        'common/imageCodeInterface'
	],
	function(View,Notification,CountDwon, codeInterface){
		var Base = View;
        var cls =
                {
                    events: {
                        "click #setPinBtn":"_submitData",
                        "click .verifiation-btn":"getVerificationCode",
                        "input #cationCode": "onInput",
                        "click .image-code": function(){this.getImageCode()}
                    },
                };
        cls.onViewPush = function(pushFrom, pushData){
            this._carVin = pushData.carId;
            this._type = pushData.type;
        };
        cls.posGenHTML = function(){
            if(this._type == "setpin"){
                this.getElement(".pass_word_input").hide();
            }else if(this._type == "changepin"){
                this.getElement(".input_wrap_idCard").hide();
                this.getElement("#pass_word").attr("placeHolder","请输入原控车码");
            }
        };
        cls.onShow = function(){
            this.getImageCode();
        }
        cls.getImageCode = function(){
            var imageNode = this.getElement("#checkImg");
            codeInterface.getImageCode(imageNode);
        },
        cls.getVerificationCode = function () {
            // alert(bfDataCenter.getCarId())
            var me = this;
            this._txt = this.getElement(".verifiation-btn");
            var phoneNumber = bfDataCenter.getUserMobile();
            var codeNumber = this.getElement(".imageCode").find('input').val();
            codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "setpin", function(){me.getImageCode()})
        },
        cls._submitData = function(){
        //    alert('1');
            var self = this;
            var pin = this.getElement('#pin_value').val();
            var pin2 = this.getElement('#pin_value2').val();
            var passWord = this.getElement('#pass_word').val();
            var currentVin = bfDataCenter.getCarId();
            var cationCode=this.getElement("#cationCode").val();
            var idCard = this.getElement("#idCard").val();

            if (!pin||!pin2) {
                Notification.show({type: "error",message: "请输入控车码"});
                return;
            };

            if (pin != pin2) {
                Notification.show({type: "error",message: "两次输入控车号不一致,请重新输入"});
                return;
            };
            var reg = new RegExp("^[0-9]*$");
            if(!reg.test(pin)||!reg.test(pin2)){
                Notification.show({type: "error",message: "控车码必须为数字"});
                return;
            }
            if (pin.length!=6&&pin2.length!=6) {
                Notification.show({type: "error",message: "控车码长度必须为6位"});
                return;
            };
            if (!passWord) {
                if(this._type == "setpin"){
                    if(!idCard){
                        Notification.show({type: "error",message: "请输入身份证号"});
                        return;
                    }
                }else{
                    Notification.show({type: "error",message: "请输入原控车码"});
                    return;
                }
            };

            if (!currentVin) {
                Notification.show({type: "error",message: "获取当前VIN号失败"});
                return;  
            };
            if(!cationCode){
            	Notification.show({type: "error",message: "请输入手机验证码"});
                return; 
            }
            if(cationCode.length != 6){
                Notification.show({type: "error",message: "验证码必须是6位"});
                return; 
            }
            
			if(pin&&pin2&&currentVin&&cationCode){ 
				bfClient.setPINForCar({
                    carId:this._carVin, 
                    pin:pin, 
                    type:this._type,
                    password:passWord,
                    authCode:cationCode,
                    idCard: idCard
                }, function(data){
                    // alert('2');
                    self._onsubmitVinData(data)
            });
			}
        };
        cls._onsubmitVinData = function(data){
            // alert('3');
            // 0成功
            // 1失败
            // 2过期
            // 999特殊
            var me = this;
            if(data.code == 1) {
           
                Notification.show({type: "error",message: data.msg || "密码错误"});
                if (me._txt) {
                    CountDwon.stopCountDown(me._txt);
                }; 
                return ;
                
            }else if (data.code == 0 && data.success){
              
                Notification.show({type: "well",message: "提交成功"});
                bfNaviController.pop(1,{isExist:"exist", from: "pin"});
            }else{
                Notification.show({type: "error",message: data.msg});
                if (me._txt) {
                    CountDwon.stopCountDown(me._txt);
                }; 
                return ;
            }
       };
       
  //      cls.getVerificationCode=function(){
		// 	var txt = this.getElement(".verifiation-btn");
		// 	var phoneNumber = window.localStorage.getItem("username");
		// 	if (phoneNumber.length != 11) {
		// 		Notification.show({
		// 			type: "error",
		// 			message: "请输入正确的手机号码"
		// 		});
		// 		return;
		// 	}

		// 	//改变按钮颜色并开始倒计时
		// 	//等获取验证码接口			
		// 	var stepValue = 1;
		// 	var time = 60;
		// 	this.sendAuthCode(phoneNumber,function(){CountDwon.countDwon(txt, time);});
		// };
		cls.sendAuthCode= function(phone,success){
			var me = this;
			bfClient.sendAuthcode({
				type : 'post',
				data:{'contact': phone, 'usage':"setpin" },
				success: function(data){
                    if(data.code==0){
                        success();
                    }else{
                        Notification.show({
                            type:"error",
                            message:data.msg
                        })
                    }
				}
			});
		};
       
        return Base.extend(cls);
});
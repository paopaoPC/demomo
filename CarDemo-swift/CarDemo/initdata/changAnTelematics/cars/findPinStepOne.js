define([
        "common/navView",
        "shared/js/notification",
        'common/countDwonUtil',
        'common/imageCodeInterface'
	],
	function(View,Notification,CountDwon, codeInterface){
		var Base = View;
		return Base.extend({
			events:{
				"click .verifiation-btn":"getVerificationCode",
				"click .image-code": function(){this.getImageCode()},
				"click #setPinBtnNext": "goToNext"
			},
			onViewPush: function(pushFrom, pushData){
				if (pushData) {
					this._carId = pushData.carId
				};
			},
			onShow: function(){
				this.getImageCode();
			},
			getImageCode : function(){
	            var imageNode = this.getElement("#checkImg");
	            codeInterface.getImageCode(imageNode);
	        },
	        getVerificationCode : function () {
				//11
	            var me = this;
	            this._txt = this.getElement(".verifiation-btn");
	            var phoneNumber = bfDataCenter.getUserMobile();
	            var codeNumber = this.getElement(".imageCode").find('input').val();
	            codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "setpin", function(){me.getImageCode()})
	        },
	        goToNext: function(){
	        	var me =this;
	        	// bfNaviController.push("cars/findPinStepTwo.html",{carId: me._carId})
	        	// return;
	        	var authCode = this.getElement("#cationCode").val();
	        	var certificType = this.getElement("#certificate_select").val();
	        	var certificateVal = this.getElement("#certificateVal").val();
	        	if (!authCode) {
	        		Notification.show({
	        			type:"error",
	        			message:"手机验证码不能为空"
	        		})
	        		return ;
	        	};
	        	if (!certificateVal) {
	        		Notification.show({
	        			message:"请输入您的证件号码"
	        		})
	        		return;
	        	};
	        	var data ={
	        		carId: this._carId,
	        		authCode: authCode,
	        		cerType: certificType,
	        		cerCode: certificateVal
	        	}
				// bfNaviController.push("cars/findPinStepTwo.html",{carId: me._carId})
	        	//11
				bfClient.findPin({
	        		data:data,
	        		success: function(datas){
	        			if (datas.code == 0) {
	        				bfNaviController.push("cars/findPinStepTwo.html",{carId: me._carId})
	        			}else{
	        				Notification.show({
	        					type:"error",
	        					message:datas.msg
	        				})
	        			}
	        		},
	        		error: function(error){
	        			Notification.show({
	        				type:"error",
	        				message:error.msg
	        			})
	        		}
	        	})
	        	
	        }
		})
	})
define([
        "common/navView",
        "shared/js/notification",
        'common/countDwonUtil',
        'common/imageCodeInterface'
    ],
    function (View, Notification, CountDwon, codeInterface) {
        var Base = View;
        var cls =
        {
            events: {
                "click #setPinBtn": "_submitData",
                "click .verifiation-btn": "getVerificationCode",
                "input #cationCode": "onInput",
                "click .image-code": function () {
                    this.getImageCode()
                }
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {
            this._carVin = pushData.carId;
        };
        cls.posGenHTML = function () {

        };
        cls.onShow = function () {
            this.getImageCode();
        };
        cls.getImageCode = function () {
            var imageNode = this.getElement("#checkImg");
            codeInterface.getImageCode(imageNode);
        };
        cls.getVerificationCode = function () {
            var me = this;
            this._txt = this.getElement(".verifiation-btn");
            var phoneNumber = bfDataCenter.getUserMobile();
            var codeNumber = this.getElement(".imageCode").find('input').val();
            codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "setpin", function () {
                me.getImageCode()
            })
        };
        cls._submitData = function () {

            var self = this;
            var pin = this.getElement('#pin_value').val();
            var pin2 = this.getElement('#pin_value2').val();
            //var passWord = this.getElement('#pass_word').val();
            //var currentVin = this._carId;
            var cationCode = this.getElement("#cationCode").val();

            if (!pin || !pin2) {
                Notification.show({type: "error", message: "请输入控车码"});
                return;
            }

            if (pin != pin2) {
                Notification.show({type: "error", message: "两次输入控车号不一致,请重新输入"});
                return;
            }
            var reg = new RegExp("^[0-9]*$");
            if (!reg.test(pin) || !reg.test(pin2)) {
                Notification.show({type: "error", message: "控车码必须为数字"});
                return;
            }
            if (pin.length != 6 && pin2.length != 6) {
                Notification.show({type: "error", message: "控车码长度必须为6位"});
                return;
            }
            //if (!passWord) {
            //    if (this._type == "setpin") {
            //        Notification.show({type: "error", message: "请输入用户密码"});
            //    } else {
            //        Notification.show({type: "error", message: "请输入原控车码"});
            //    }
            //    return;
            //}

            //if (!currentVin) {
            //    Notification.show({type: "error", message: "获取当前VIN号失败"});
            //    return;
            //}
            if (!cationCode) {
                Notification.show({type: "error", message: "请输入手机验证码"});
                return;
            }

            if (cationCode.length != 6) {
                Notification.show({type: "error", message: "验证码必须是6位"});
                return;
            }

            if (pin && pin2 && cationCode) {
                bfClient.forgetPin({
                    data: {
                        carId: this._carVin,
                        pin: pin,
                        authCode: cationCode
                    }, success: function (data) {
                        self._onsubmitVinData(data)
                    },error: function () {
                        Notification.show({type: "error", message: "服务器开小差，请稍后再试"});
                    }
                });
            }
        };
        cls._onsubmitVinData = function (data) {
            // 0成功
            // 1失败
            // 2过期
            // 999特殊
            var me = this;
            if (data.code == 1) {
                Notification.show({type: "error", message: data.msg});
                if (me._txt) {
                    CountDwon.stopCountDown(me._txt);
                }
                return;
            } else if (data.code == 0 && data.success) {
                Notification.show({type: "well", message: "提交成功"});
                bfNaviController.popTo("cars/carDetails.html")
            } else if(data.code == 5){
                Notification.show({type: "error", message: data.msg});
                bfNaviController.pop(1);
                return;
            } else {
                Notification.show({type: "error", message: data.msg});
                if (me._txt) {
                    CountDwon.stopCountDown(me._txt);
                }
                return;
            }
        };

        cls.sendAuthCode = function (phone, success) {
            var me = this;
            bfClient.sendAuthcode({
                type: 'post',
                data: {'contact': phone, 'usage': "setpin"},
                success: function (data) {
                    if (data.code == 0) {
                        success();
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        })
                    }
                }
            });
        };

        return Base.extend(cls);
    });
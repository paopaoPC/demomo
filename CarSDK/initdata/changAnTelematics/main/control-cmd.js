define([
        'shared/js/notification',
        "shared/plugin_dialog/js/dialog",
        'common/ssUtil',
        'main/Plugins',
        'common/countDwonUtil',
        'common/imageCodeInterface'
    ],
    function(Notification, dialog, ssUtil, Plugin, CountDwon, codeInterface) {
        var cls = {};

        cls.initParam = function(param,sessionStr){
            this.initParamData = param;
            this._sessionStr = sessionStr;
        }

        cls.send = function(param) {
                var newObj = {};
                _.extend(newObj , this.initParamData);
                _.extend(newObj , param);
                this.param = newObj;
                this.controlCar();
            }
            //远程控制
        cls.onDeviceBack = function() {
            return false;
        }
        cls.controlCar = function(el) {
            var self = this;
            //wifi设置时会判断设置的车辆和当前活动的车辆是不是同一个车；
            if(self.param.data.carId != undefined && self.param.data.carId != bfDataCenter.getCarId()){
                bfClient.getPinCode({
                    type: 'post',
                    data: {
                        carId: self.param.data.carId,
                    },
                    success: function(data) {
                        if (data.code == 0) {
                            self.sendPinCodeByNavigator("");
                        } else {
                        
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '确定': function() {
                                        bfNaviController.push('/cars/setPINForCar.html', {
                                            carId: self.param.data.carId,
                                            type: "setpin"
                                        });
                                        this.close();
                                    },
                                    '取消': function() {
                                        this.close();
                                    }
                                },
                                content: "此车辆还没设置控车码，请先前往设置"
                            });
                        }
                    }
                });
            }
            //如果没有设置Pin码，跳转到设置Pin码的页面
            else if (!bfDataCenter.getPinCode()) {
                //本地存储没有，对服务器拉取
                bfClient.getPinCode({
                    type: 'post',
                    data: {
                        carId: bfDataCenter.getCarId()
                    },
                    success: function(data) {
                        if (data.code == 0) {
                            bfDataCenter.setPinCode('true');
                            self.sendPinCodeByNavigator("");
                        } else {
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '确定': function() {
                                        bfNaviController.push('/cars/setPINForCar.html', {
                                            carId: bfDataCenter.getCarId(),
                                            type: "setpin"
                                        });
                                        this.close();
                                    },
                                    '取消': function() {
                                        this.close();
                                    }
                                },
                                content: "前往设置控车码"
                            });
                        }
                    }
                });
            } else {
                self.sendPinCodeByNavigator("");
            }
        }
        cls.controlMl = function() {
            var self = this;
            //如果操作正在进行，不做任何操作
            if (window.sessionStorage[self._sessionStr] == null) {
               window.sessionStorage[self._sessionStr] = true
            }
            // var canOperate =window.sessionStorage[self._sessionStr];
            // if (canOperate == 'false') {
            //     Notification.show({
            //         type: 'error',
            //         message: '请等待上一条指令执行结束，再操作'
            //     });
            //     return;
            // }
            //输入PIN码
            this._pin = '';
            this.sendPinCodeByNavigator();
        }
        cls.sendPinCodeByNavigator = function(pin) {
                var self = this;
                if(self.isSendPin){
                    return
                }
                var Postdata = {
                    'carId': self.param.data.carId ? self.param.data.carId:bfDataCenter.getCarId(),
                    'phoneType': 'a',
                    'phoneId': 'b',
                    'pin': pin
                };
                Postdata = _.extend(Postdata,this.param.data);

                window.sessionStorage[self._sessionStr] = false;

                bfClient.controlCar({
                // Plugin.carControl({
                    data: Postdata,
                    beforeSend: function(){
                        self.isSendPin = true; 
                    },
                    success: function(data) {
                        self.isSendPin = false;
                        //返回错误，提示错误信息
                        if (!data.success) {
                            self.controlCode(data);
                            return;
                        }

                        self.param.controlCarSuccess && self.param.controlCarSuccess();
                        var controlData = data.data;
                        if (controlData.handleStatus == "Runing") {
                            self._controlId = controlData.requestId;
                            var requestOperationResult = null;
                            requestOperationResult = function() {
                                bfClient.getControlInfo({
                                // Plugin.getCarControlInfo({
                                    data: {
                                        "id": self._controlId,
                                        "carId": Postdata.carId,
                                    },
                                    success: function(data) {
                                        if (data.success) {
                                            var infoData = data.data;
                                            // window.sessionStorage["controlInfo"] = JSON.stringify(infoData);
                                            if (infoData.handleStatus == "Completed") {
                                                self.param.controlInfoComplete && self.param.controlInfoComplete();
                                                self.param.controlInfoSuccess && self.param.controlInfoSuccess();
                                            } else if (infoData.handleStatus == "Runing") {
                                                self.param.controlInfoRunning && self.param.controlInfoRunning();
                                                setTimeout(requestOperationResult,5000);
                                            } else {
                                                self.param.controlInfoTimeout && self.param.controlInfoTimeout();
                                                //获取登录车辆类型(0:油车 1:电动车)																								
												var fuelType = window.localStorage['fs_FuelType'];
												if(fuelType =='0'){
													content= infoData.handleStatus == "Timeout" ? '网络请求超时，请重试' : data.msg
												}else if(fuelType =='1'){
													content= infoData.handleStatus == "Timeout" ? '网络请求超时，请重试' : data.msg.replace("发动机","电机")
												}
                                                //添加代码
                                                dialog.createDialog({
                                                    autoOpen: true, //默认为true
                                                    closeBtn: false,
                                                    buttons: {
                                                        '我知道了': function() {
                                                            this.close(); //所有逻辑必须放在关闭之前
                                                        }
                                                    },
                                                    content: data.msg
                                                });
                                            }
                                        } else {
                                            self.param.controlInfoFail && self.param.controlInfoFail();
                                            
                                            Notification.show({
                                                type: 'error',
                                                message: data.msg
                                            });
                                        }
                                    },
                                    error: function(error) {
                                        self.param.controlInfoError && self.param.controlInfoError();
                                        var eMsg = '连接服务器失败，请检查网络状况';
                                        if (typeof(error) === 'string') eMsg = error;
                                        if (typeof(error) === 'object') {
                                            if (error.status == 0) eMsg = "连接服务器失败，请检查网络状况";
                                        }
                                        Notification.show({
                                            type: "error",
                                            message: eMsg
                                        });
                                    }
                                });
                            };
                            requestOperationResult();
                        } else {
                            Notification.show({
                                type: 'error',
                                message: data.msg
                            });
                        }
                    },
                    error: function(error) {
                        self.isSendPin = false;
                        var eMsg = '发生未知错误';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "连接服务器失败，请检查网络状况";
                        }
                        Notification.show({
                            type: "error",
                            message: eMsg
                        });
                    }
                });
            }
            cls.showDialog = function () {
                var self = this;
                dialog.createDialog({
                    input: true,
                    closeBtn: false,
                    onShowCallBack: function(_dialog){
                        self.dialogClickListener(_dialog);
                    },
                    buttons: {
                        '取消': function () {
                            self._inputVal = "";
                            this.close();
                            this.destroy();
                        },
                        '确定': function () {
                            self._pin = self._inputVal;
                            self._inputVal = "";
                            if (!self._pin || self._pin.length != 6) {
                                Notification.show({
                                    type: 'error',
                                    message: '请输入6位的控车码'
                                });
                            } else {
                                var now = new Date().getTime();
                                self._updateControl();
                                self._inputVal = "";
                                this.close();
                                this.destroy();
                            }
                        }

                    },
                    content: "<p>请输入6位的控车码</p><div style='width:240px; position:relative; height:40px; margin:10px auto; overflow:hidden; background: url(../home/img/pin.png) no-repeat;'><div id='pin' contenteditabl='true' style='width:240px; height:40px;'></div><input id='input_hidden' type='tel' maxlength='6' style='z-index:-1;width:260px; height:40px;color: transparent;top: 0px;postion: absolute;position: absolute;left: -9999px;border: none;background-color: transparent;'/></div><p style='font-size:12px'>请确保钥匙不在车内，车辆属于锁车状态</p><p style='color:#2296e1;margin-top:10px;' id='forgetPin'>忘记控车码？</p>",
                });

            }
            cls.controlCode = function (data) {
                var self = this;
                if (data.code == 7) {
                    Notification.show({
                        type: 'error',
                        message: data.msg
                    });
                } else if (data.code == 3) {
                    self.showDialog();
                } else if (data.code == 1004) {
                    self.peopleConfirm();
                } else {
                    Notification.show({
                        type: "error",
                        message: data.msg
                    });
                }
            }
            cls.peopleConfirm = function () {
                var self = this;
                var contentString = "<div class='imageCode'>" +
                    "<input type='text' style = 'width:60%;float:left;font-size:14px' class='auth-code' maxlength ='4' placeholder='输入图片验证码'><div class='image-code' style='width:38%;height:40px;float:right'><img id='checkImg'style='width:100%;height:100%' src=''/></div>" +
                    "</div><div><input type='tel' maxlength='6' id='authCode' style='width: 60%;float:left'/>"
                    + "<div style='background-color: #00c3fe;color: white;width: 38%;height: 40px;font-size: 13px;padding-top: 12px;border-radius: 3px;float: right;line-height: 20px;'class='check_time'>发送验证码</div></div>";
                this._confirmDialog = dialog.createDialog({
                    autoOpen: true,
                    closeBtn: false,
                    title: "请输入短信验证码，以验证身份",
                    buttons: {
                        '取消': function () {
                            this.close();
                            this.destroy();
                        },
                        '确定': function () {
                            var authCode = $("#authCode").val();
                            if (authCode.length != 6) {
                                Notification.show({
                                    type: "error",
                                    message: "短信验证码必须为6位"
                                });
                                // OSApp.showStatus("error", "短信验证码必须为6位");
                            } else {
                                bfClient.controlAuth({
                                    data: {
                                        authCode: authCode,
                                        carId: bfDataCenter.getCarId()
                                    },
                                    success: function (req) {
                                        if (req.success) {
                                            self._confirmDialog.close();
                                            self._confirmDialog.destroy();
                                            setTimeout(function () {
                                                self.showDialog();
                                            }, 100);
                                        } else {
                                            Notification.show({
                                                type: "error",
                                                message: req.msg
                                            });
                                            // OSApp.showStatus("error", req.msg);
                                        }
                                    },
                                    error: function (err) {
                                        Notification.show({
                                            type: "error",
                                            message: "服务器开小差"
                                        });
                                        // OSApp.showStatus("error", "服务器开小差");
                                    }
                                });
                            }
                        }
                    },
                    content: contentString
                });
                if (self._confirmDialog) {
                    self.getImageCode(self._confirmDialog);
                }
                ;
                // self.sendCode();  //自动发送验证码
                this.onBindClick();
            }
            cls.getImageCode = function (params) {
                var me = this;
                var imageNode = params.$el.find("#checkImg");

                codeInterface.getImageCode(imageNode);
            }
            cls.getVerificationCode = function (params) {
                var me = this;
                this._txt = params.$el.find(".check_time");
                var phoneNumber = bfDataCenter.getUserMobile();
                var codeNumber = params.$el.find(".imageCode").find('input').val();
                codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "updatePhone", function () {
                    me.getImageCode(me._confirmDialog)
                })
            }
            cls.onBindClick = function () {
                var me = this;
                if (this._confirmDialog) {
                    var imageNode = this._confirmDialog.$el.find("#checkImg");
                    imageNode.on('click', function () {
                        me.getImageCode(me._confirmDialog)
                    });

                    this._confirmDialog.$el.find('.check_time').on("click", function () {
                        me.getVerificationCode(me._confirmDialog);
                    });
                }
                ;

            }
            //发送验证码
            cls.sendCode = function () {
                var self = this;
                var changStatu = $(".ui-dialog-content > .check_time");
                var time = 60;
                bfClient.sendAuthcode({
                    type: 'post',
                    data: {'contact': window.localStorage.username, 'usage': "updatePhone"},
                    success: function (data) {
                        if (data.code == 0) {
                            CountDwon.countDwon(changStatu, time);
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            })
                        }
                    }
                });
            }
            cls.dialogClickListener = function (_dialog) {
                var self = this;
                if (_dialog) {
                    _dialog.$el.find("#input_hidden").focus();
                    _dialog.$el.find('#input_hidden').keyup(function () {
                        var val = $(this).val();
                        self._inputVal = val;
                        var currentLength = val.length;
                        var hisLength = _dialog.$el.find('#pin').find('.inputCircle').length;
                        if (currentLength > hisLength) {
                            _dialog.$el.find('#pin').append($("#inputCircle").html());
                        } else if (currentLength < hisLength) {
                            _dialog.$el.find('#pin').find('.inputCircle').eq(hisLength - 1).remove();
                        }
                    });
                    _dialog.$el.find('#pin').click(function () {
                        _dialog.$el.find("#input_hidden").focus();
                    });
                    _dialog.$el.find('#forgetPin').click(function () {
                        // 正式代码
                        _dialog.close();
                        _dialog.destroy();
                        bfNaviController.push("cars/findPinStepOne.html",{carId:bfDataCenter.getCarId()})
                        // dialog.createDialog({
                        //     autoOpen: true, //默认为true
                        //     closeBtn: false,
                        //     buttons: {
                        //         '我知道了': function () {
                        //             this.close(); //所有逻辑必须放在关闭之前
                        //         }
                        //     },
                        //     content: "请联系4S店重置控车码"
                        // });
    
                    });
                }
            }
            cls._updateControl = function () {
                var self = this;
               
                if (navigator.packaging) {
                    if (window.device) {
                        self._phoneType = window.device.model;
                        self._phoneId = window.device.uuid;
                    }
                }
                self.sendPinCodeByNavigator(this._pin);
            }
            return cls;
    }
);

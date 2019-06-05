define([
        'shared/js/notification',
        "shared/plugin_dialog/js/dialog",
        'shared/plugin_dialogOld/js/dialog',
        'common/ssUtil',
        'common/countDwonUtil',
        'common/imageCodeInterface',
        "control/pin"
    ],
    function(Notification, dialog, dialogOld, ssUtil, CountDwon, codeInterface, Pin) {
        var cls = {};

        cls.initParam = function(param,sessionStr){
            this.initParamData = param;
            this._sessionStr = sessionStr;

        }
        //若控制的车辆和app当前活动车辆不一样，则要在params里传入车辆id
        cls.send = function(param) {
                //以下是对传入的参数进行说明
            var defaultparam = {
                loopInfo:true, //是否执行loopInfo,默认是true
                data:{//直接发送给后台的参数
                    carId:'',//控制车量和当前活动车辆不一致时才设置车辆id
                    cmd:'',
                    temperature:'',//发送空调指令时才有的参数
                },
                controlCarSuccess:function () {
                    //控制指令发送成功，但后台执行状态未知
                },
                controlInfoComplete:function () {
                    //查询到指令执行状态完成
                    Notification.show({
                        type: 'info',
                        message: '控制指令已成功执行',
                    });
                },
                controlCarError:function () {
                    //控制指令发送失败
                },
                controlInfoRunning:function () {
                    //查询到指令为正在执行中
                },
                controlInfoTimeout:function () {
                    //查询到指令执行超时
                },
                controlInfoFail:function () {
                    //查询指令执行状态遇到error
                },
                cancleControl:function () {

                },
            };
            _.extend(defaultparam , this.initParamData);
            _.extend(defaultparam , param);
            this.param = defaultparam;
            this.isCheckPin = false;
            this.controlCar();
        }
        //远程控制
        cls.onDeviceBack = function() {
            if (this._d) {
                this._d.close();
                this._d = null;
                return true;
            }
            if (this._confirmDialog) {
                this._confirmDialog.close();
                this._confirmDialog = null;
                return true
            };
            if (this._checkPin && this._checkPin._isShow) {
                this._checkPin.removeView();
                this._checkPin = null;
                this.isCheckPin = false;
                return true
            };
            return false;
        }
        cls.controlCar = function(el) {
            var self = this;
            //判断设置的车辆和当前活动的车辆是不是同一个车,若不是，则直接从服务器获取；在车辆列表有多辆车时，一些控制功能会用到。
            if(self.param.data.carId != undefined && self.param.data.carId != bfDataCenter.getCarId()){
                bfClient.getPinCode({
                    type: 'post',
                    data: {
                        carId: self.param.data.carId,
                    },
                    success: function(data) {
                        $('#home #chrysanthemumWarp').remove();
                        if (data.code == 0) {
                            self.sendPinCodeByNavigator("");
                        } else {
                            self._d = null;
                            self._d = dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '确定': function() {
                                        bfNaviController.push('/control/setPINForCar.html', {
                                            carId: self.param.carId,
                                            type: "setpin"
                                        });
										self._d =null;
                                        this.close();
                                        self.param.controlView.remove();
                                    },
                                    '取消': function() {
										self._d =null;
                                        this.close();
                                    }
                                },
                                content: "此车辆还没设置控车码，请先前往设置"
                            });
                        }
                    },
                    error: function(){
                        $('#home #chrysanthemumWarp').remove();
                        Notification.show({
                            type: "info",
                            message: '网络开小差'
                        });
                    }
                });
            }
            //如果没有设置Pin码，跳转到设置Pin码的页面
            else if (!bfDataCenter.getPinCode()) {
                self.param.GoToSetPinCode&&self.param.GoToSetPinCode();
                //本地存储没有，对服务器拉取
                bfClient.getPinCode({
                    type: 'post',
                    data: {
                        carId: bfDataCenter.getCarId()
                    },
                    success: function(data) {
                        $('#home #chrysanthemumWarp').remove();
                        if (data.code == 0) {
                            bfDataCenter.setPinCode('true');
                            self.sendPinCodeByNavigator("");
                        } else {
                            self._d = null;
                            self._d = dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '确定': function() {
                                        bfNaviController.push('/control/setPINForCar.html', {
                                            carId: bfDataCenter.getCarId(),
                                            type: "setpin"
                                        });
										self._d = null;
                                        this.close();
                                        self.param.controlView.remove();
                                    },
                                    '取消': function() {
										self._d = null;
                                        this.close();
                                    }
                                },
                                content: "前往设置控车码"
                            });
                        }
                    },
                    error: function(){
                        $('#home #chrysanthemumWarp').remove();
                        Notification.show({
                            type: "info",
                            message: '网络开小差'
                        });
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
        cls.sendPinCodeByNavigator = function(pin, params) {//params为pin码输入错误时的回调函数。
                var self = this;
                if(pin && pin.length != 6){
                    return
                }
                var Postdata = {
                    'carId':bfDataCenter.getCarId(),
                    'phoneType': 'a',
                    'phoneId': 'b',
                    'pin': pin
                };
                Postdata = _.extend(Postdata,this.param.data);

                window.sessionStorage[self._sessionStr] = false;
               bfClient.controlCar({
                    data: Postdata,
                    success: function(data) {
                        $('#home #chrysanthemumWarp').remove();
                        //返回错误，提示错误信息
                        if (!data.success &&data.code!=0) {
                            self.controlCode(data,params, self.param);
                            return;
                        }
                        var controlData = data.data;
                        self.param.controlCarSuccess(controlData);
                        // Notification.show({
                        //     type:'info',
                        //     message:data.msg,
                        // });
                        self.param.checkPinSuccess&&self.param.checkPinSuccess();
                        if(params) {params.checkPinSuccess&&params.checkPinSuccess(data);}
                        self.isCheckPin = false;
                        self.loopInfo(controlData.requestId, Postdata.carId,self.param);
                    },
                    error: function(error) {
                        $('#home #chrysanthemumWarp').remove();

                        var eMsg = '发生未知错误';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "连接服务器失败，请检查网络状况";
                        }
                        self.param.controlCarError();
                        Notification.show({
                            type: "error",
                            message: eMsg
                        });
                    }
                });
            };
        cls.loopInfo=function(controlId,CarId,options) {
            var self=this;
            if(!options.loopInfo){
                return;
            };
            if(CarId && CarId !== bfDataCenter.getCarId()){
                return
            }

            CarId = CarId||bfDataCenter.getCarId();
            bfClient.getControlInfo({
                data: {
                    "id": controlId,
                    "carId":CarId,
                },
                success: function(data) {
                    if (data.success&&data.code==0) {
                        var infoData = data.data;
                        // window.sessionStorage["controlInfo"] = JSON.stringify(infoData);
                        if (infoData.handleStatus == "Completed") {
                             options.controlInfoComplete();
                        } else if (infoData.handleStatus == "Runing") {
                             options.controlInfoRunning();
                             self.timeOut = setTimeout(function(){
                                self.loopInfo(controlId,CarId,options)
                            },5000);
                        } else {
                            options.controlInfoTimeout();
							var fuelType = window.localStorage['fs_FuelType'];
							if(fuelType =='0'){
								content= infoData.handleStatus == "Timeout" ? '网络请求超时，请重试' : data.msg
							}else if(fuelType =='1'){
								content= infoData.handleStatus == "Timeout" ? '网络请求超时，请重试' : data.msg.replace("发动机","电机")
							}
                            //添加代码
                            self._d = null;
                            self._d = dialog.createDialog({
                                autoOpen: true, //默认为true
                                closeBtn: false,
                                buttons: {
                                    '我知道了': function() {
										self._d = null;
                                        this.close(); //所有逻辑必须放在关闭之前
                                    }
                                },
								content: content
                            });
                        }
                    } else {
                        options.controlInfoFail();
                        Notification.show({
                            type: 'error',
                            message: data.msg
                        });
                    }
                },
                error: function(error) {
                    options.controlInfoFail();
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
            cls.showDialog = function () {
                var self = this;
                this._d = null;
                this._d = dialog.createDialog({
                    input: true,
                    closeBtn: false,
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
            cls.controlCode = function (data,params, options) {
                var self = this;
                if (data.code == 7) {
                    if (params) {
                        params.checkPinError && params.checkPinError(data);
                    };
                    Notification.show({
                        type: 'error',
                        message: data.msg
                    });
                    options.controlCarError();
                } else if (data.code == 3) {
                   // self.showDialog();
                    // self.dialogClickListener();
                    // self.param.loopInfo=false;//取消轮循并前往输入pin码页面
                    // bfNaviController.push('control/checkPin.html');
                    self.showPinView(options)

                } else if (data.code == 1004) {
                    if (params) {
                        params.checkPinError && params.checkPinError(data);
                    };
                    self.peopleConfirm();
                } else {
                    if (params) {
                        params.checkPinError && params.checkPinError(data);
                    };
                    Notification.show({
                        type: "error",
                        message: data.msg
                    });
                    options.controlCarError();
                }
            }
            cls.showPinView = function(param){
                var self = this;
                this._checkPin = new Pin({param:param}, 
                    function(v, pinArr, success, error){
                        self.sendPinCodeByNavigator(pinArr,{
                            checkPinSuccess: function(data){
                                if(v._type == "UpCarCondition"){
                                    window.onOldWebviewEvent && window.onOldWebviewEvent()
                                }
                                v.removeView();
                            },
                            checkPinError:function(data){
                                error();
                            }
                        })
                    });
                //isCheckPin用来记录是否进入输入控车码页面;
                self.isCheckPin = true;
            }
            cls.peopleConfirm = function () {
                var self = this;
                var contentString = "<div class='imageCode'>" +
                    "<input type='text' style = 'width:60%;float:left;font-size:14px' class='auth-code' maxlength ='4' placeholder='输入图片验证码'><div class='image-code' style='width:38%;height:40px;float:right'><img id='checkImg'style='width:100%;height:100%' src=''/></div>" +
                    "</div><div><input type='tel' maxlength='6' id='authCode' style='width: 60%;float:left'/>"
                    + "<div style='background-color: #00c3fe;color: white;width: 38%;height: 40px;font-size: 13px;padding-top: 12px;border-radius: 3px;float: right;line-height: 20px;'class='check_time'>发送验证码</div></div>";
                this._confirmDialog = dialogOld.createDialog({
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
                            console.log("文本长度"+authCode.length);
                            if (authCode.length != 6) {
                                Notification.show({
                                    type: "error",
                                    message: "短信验证码必须为6位"
                                });
                            } else {
                                bfClient.controlAuth({
                                    data: {
                                        authCode: authCode,
                                        carId: bfDataCenter.getCarId()
                                    },
                                    success: function (req) {
                                        if (req.success) {
                                            //若不再pin码页面，则进入控车码页面
                                            if(!self.isCheckPin){
                                                self._checkPin = new Pin({param:self.param},
                                                    function(v, pinArr, success, error){
                                                        self.sendPinCodeByNavigator(pinArr,{
                                                            checkPinSuccess: function(data){
                                                                if(v._type == "UpCarCondition"){
                                                                    window.onOldWebviewEvent && window.onOldWebviewEvent()
                                                                  }
                                                                v.removeView();
                                                            },
                                                            checkPinError:function(data){
                                                                error();
                                                            }
                                                        })
                                                    });
                                                self.isCheckPin = true;
                                            }
                                            self._confirmDialog.close();
                                            self._confirmDialog.destroy();
                                            // setTimeout(function () {
                                            //     // self.showDialog();
                                            //     // self.dialogClickListener();
                                            //     // bfNaviController.push('control/checkPin.html',{type:self.param.cmd});
                                            //     // self.showPinView(self.param.cmd)
                                            // }, 100);
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
                                        //  OSApp.showStatus("error", "服务器开小差");
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
                    data: {'contact': window.localStorage.userMobile, 'usage': "updatePhone"},
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
            cls.dialogClickListener = function () {
                var self = this;
                if (this._d) {
                    this._d.$el.find("#input_hidden").focus();
                    this._d.$el.find('#input_hidden').keyup(function () {
                        var val = $(this).val();
                        self._inputVal = val;
                        var currentLength = val.length;
                        var hisLength = self._d.$el.find('#pin').find('.inputCircle').length;
                        if (currentLength > hisLength) {
                            self._d.$el.find('#pin').append($("#inputCircle").html());
                        } else if (currentLength < hisLength) {
                            self._d.$el.find('#pin').find('.inputCircle').eq(hisLength - 1).remove();
                        }
                    });
                    this._d.$el.find('#pin').click(function () {
                        self._d.$el.find("#input_hidden").focus();
                    });
                    this._d.$el.find('#forgetPin').click(function () {
                        // 正式代码
                        self._d.close();
                        self._d.destroy();
                        bfNaviController.push("cars/findPinStepOne.html",{carId:bfDataCenter.getCarId()})
                        // self._d = null;
                        // self._d = dialog.createDialog({
                        //     autoOpen: true, //默认为true
                        //     closeBtn: false,
                        //     buttons: {
                        //         '我知道了': function () {
                        //             this.close(); //所有逻辑必须放在关闭之前
                        //         }
                        //     },
                        //     content: "请联系4S店重置控车码"
                        // });
                        //暂时代码  还是允许修改PIn
                        // self._d.close();
                        // bfNaviController.push('/cars/setPINForCar.html', {
                        //     carId: bfDataCenter.getCarId(),
                        //     type: "setpin"
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
            //车门
            cls.ControlDoor=function (Switch,options) {
                var cmd;
                switch(Switch){
                    case true:cmd='UnLockDoor';
                        break;
                    case false:cmd='LockDoor';
                        break;
                    default: console.info('未知命令');
                        return;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                _.extend(options.data,{'cmd':cmd});
                this.send(options);
            };
            // 跟新车况
            cls.ControlUpdateCarInfo = function(options){
                var cmd = 'UpCarCondition';
                options = options ? options : {};
                options.data=options.data?options.data:{};
                _.extend(options.data,{'cmd':cmd});
                this.send(options);
            }
            // 空气净化
            cls.ControlPurge=function (Switch,options) {
                var cmd;
                var status;
                switch(Switch){
                    case true:
                        cmd='OpenClosePurifier';
                        airPurifier=0
                        break;
                    case false:
                        cmd='OpenClosePurifier';
                        airPurifier=1
                        break;
                    default: console.info('未知命令');
                        return;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                _.extend(options.data,{'cmd':cmd,airPurifier:airPurifier});
                this.send(options);
            };
            //后备箱
            cls.ControlTrunk=function (Switch,options) {
                var cmd;
                switch(Switch){
                    case true:cmd='OpenTrunk';
                        break;
                    case false:cmd='CloseTrunk';
                        break;
                    default: console.info('未知命令');
                        return;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':cmd});
                this.send(options);
            };
            //示宽灯 todo:暂无cmd指令
            cls.ControlLamp=function (Switch,options) {
                var cmd;
                switch(Switch){
                    case true:cmd='UnLockDoor';
                        break;
                    case false:cmd='LockDoor';
                        break;
                    default: console.info('未知命令');
                        return;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':cmd});
                this.send(options);
            };
            //天窗
            cls.ControlDormer=function (Switch,options) {
                var cmd;
                switch(Switch){
                    case true:cmd='OpenDormer';
                        break;
                    case false:cmd='CloseDormer';
                        break;
                    default: console.info('未知命令');
                        return;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':cmd});
                this.send(options);
            };
            //闪灯鸣笛
            cls.ControlWhistle=function (operate,options) {
                var cmd;
                switch(operate){
                    case true:cmd='FlashLight';
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEventWithLabel('0108','闪灯');
                        }
                        break;
                    case false:cmd='RemoteSearchCar';
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEventWithLabel('0108','闪灯鸣笛');
                        }
                        break;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':cmd});
                this.send(options);
            };
            cls.ComtrolCarWindows = function(operate,options){
                var cmd;
                switch(operate){
                    case false:cmd='CloseWindow';
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEventWithLabel('0106','车窗全关');
                        }
                        break;
                    case true:cmd='OpenWindow';
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEventWithLabel('0106','车窗换气');
                        }
                        break;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':cmd});
                this.send(options);
            };
            //空调，若开空调，需在options.data里传入{temperature：‘温度值’}；
            cls.ControlAir=function (Switch,options, callBack) {
                var cmd;
                switch(Switch){
                    case true:cmd='OpenAir';
                        break;
                    case false:cmd='CloseAir';
                        break;
                    default: console.info('未知命令');
                        return;
                };
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':cmd});
                _.extend(options, callBack);
                this.send(options);
            };
            cls.upControlStatus=function (options) {
                options = options ? options : {};
                options.data=options.data?options.data:{};
                options.data=_.extend(options.data,{'cmd':'UpCarCondition'});
                this.send(options);
            };
            return cls;
    }
);

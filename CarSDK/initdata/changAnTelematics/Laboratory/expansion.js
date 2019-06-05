define(
    [
        "text!Laboratory/footstep.html",
        "common/navView",
        'butterfly',
        "shared/plugin_dialog/js/dialog",
        "common/ssUtil",
        "shared/js/notification"
    ],
    function (template, View, Butterfly, dialog, ssUtil, Notification) {
        var Base = View;
        var cls =
        {
            _value: true,
            carData: null,
            events: {
                "click .button": "expansionControl"
            }
        };

        cls.onShow = function () {

        };

        cls.expansionControl = function (e) {
            this._target = $(e.currentTarget);
            this._type = this._target.attr('data-value');
            this.onControlCarLocation();

        };

        cls.onControlCarLocation = function () {
            var me = this;
            //如果没有设置Pin码，跳转到设置Pin码的页面
            if (!bfDataCenter.getPinCode()) {
                //本地存储没有，对服务器拉取
                bfClient.getPinCode({
                    type: 'post',
                    data: {carId: bfDataCenter.getCarId()},
                    success: function (data) {
                        if (data.code == 0) {
                            bfDataCenter.setPinCode('true');
                            me.onConfirmCarLocation("");
                        }
                        else {
                            me._d = null;
                            me._d = dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '确定': function () {
                                        // bfNaviController.push('/cars/setPINForCar.html',bfDataCenter.getCarId());
                                        bfNaviController.push('/cars/setPINForCar.html', {
                                            carId: bfDataCenter.getCarId(),
                                            type: "setpin"
                                        });
                                        this.close();
                                    },
                                    '取消': function () {
                                        this.close();
                                    }
                                },
                                content: "前往设置PIN码",
                            });

                        }
                    }
                });
            }
            else {
                me.onConfirmCarLocation("");
            }
        };

        cls.onConfirmCarLocation = function (pin) {
            var me = this;

            if (pin.length == 0) {
                pin = "";
            }
            var operate = this._type;
            var phoneType = "";
            var phoneId = "";
            if (window.device) {
                phoneType = window.device.model;
                phoneId = window.device.uuid;
            }
            bfClient.controlCar({
                data: {
                    'cmd': operate,
                    'phoneType': phoneType,
                    'phoneId': phoneId,
                    'carId': bfDataCenter.getCarId(),
                    'pin': pin
                },
                options: {loading: false},
                type: 'post',
                success: function (data) {
                    if (data.code == 0) {
                        bfDataCenter.setUserSessionValue('canOperate', 'false');
                        me._target.siblings(".showImfor").html("请等待~~");

                        var id = data.data.requestId;
                        var requestOperationResult = null;
                        requestOperationResult = function () {
                            if (ssUtil.load('operTime') != null) {
                                var time = ssUtil.load('operTime');
                                var now = new Date().getTime();
                                if (now - time > 180000) {
                                    bfDataCenter.setUserSessionValue('canOperate', 'true');
                                    bfDataCenter.setUserSessionValue('canGetNearest', 'true');
                                    ssUtil.save('operTime', now);
                                    Notification.show({
                                        type:"error",
                                        message:"服务器连接超时"
                                    });
                                    return;
                                }
                            } else {
                                var now = new Date().getTime();
                                ssUtil.save('operTime', now);
                            }
                            bfClient.getControlInfo({
                                data: {
                                    "id": id,
                                    "carId": bfDataCenter.getCarId()
                                },
                                success: function (data) {
                                    data = data.data;
                                    //Completed代表成功，Runing代表等待，SendFailure代表失败
                                    if (data.handleStatus == "Completed") {
                                        //让远程控制可操作
                                        me._target.siblings(".showImfor").html("操作成功~~");
                                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                                    } else if (data.handleStatus == "Runing") {
                                        setTimeout(requestOperationResult, 5000);
                                    } else {
                                        //让远程控制可操作
                                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                                        me._target.siblings(".showImfor").html("操作失败~~");
                                    }
                                }
                            });
                        };

                        requestOperationResult();
                    } else if (data.code == 7) {
                        ssUtil.clear("controlTime");
                        Notification.show({
                            type: 'error',
                            message: data.msg
                        });
                    } else if (data.code == 3) {
                        me.showDialog();
                        me.dialogClickListener();
                    } else if (data.code == 999) {
                        Notification.show({
                            type: 'error',
                            message: data.msg
                        })
                    }
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
                    '确定': function () {
                        self._pin = self._inputVal;
                        self._inputVal = "";
                        if (!self._pin || self._pin.length != 6) {
                            Notification.show({
                                type: 'error',
                                message: '请输入6位的PIN码'
                            });
                        } else {
                            //todo
                            window.sessionStorage.setItem("autoP", self._pin);
                            var now = new Date().getTime();
                            self._inputVal = "";
                            ssUtil.save("controlTime", now);
                            self.onConfirmCarLocation(self._pin);
                            this.close();
                        }
                    },
                    '取消': function () {
                        self._inputVal = "";
                        this.close();
                    }
                },
                content: "<p>请输入6位的PIN码</p><div style='width:240px; position:relative; height:40px; margin:10px auto; overflow:hidden; background: url(../home/img/pin.png) no-repeat;'><div id='pin' style='width:240px; height:40px;'></div><input id='input_hidden' type='number' maxlength='6' style='z-index:-1;width:260px; height:40px;color: transparent;top: 0px;postion: absolute;position: absolute;left: -9999px;border: none;background-color: transparent;'/></div><p>请确保钥匙不在车内，车辆属于锁车状态</p><p style='color:#2296e1;margin-top:10px;' id='forgetPin'>忘记PIN码？</p>",
            });

        };
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
                    self._d.close();
                    bfNaviController.push('/cars/setPINForCar.html', {
                        carId: bfDataCenter.getCarId(),
                        type: "setpin"
                    });
                });
            }
        }
        return Base.extend(cls);
    }
);
define([
        "common/navView",
        "common/osUtil",
        "shared/js/client",
        'common/countDwonUtil',
        'shared/js/notification',
        'common/imageCodeInterface',
        "shared/plugin_dialog/js/dialog"
    ],
    function (View, osUtil, Client, CountDwon, Notification, codeInterface,dialog) {
        var Base = View;
        return Base.extend({
            id: "deleteEquipmentBanding",
            events: {
                "focus input": "onFocus",
                "blur input": "onBlur",
                "click .hint": "OnClickHint",
                "click .check_time": "getVerificationCode",
                "click .submit_ok": "submitData",
                "click .image-code": function () {
                    this.getImageCode()
                },
                'change #otherReason':'writeReason',
                'click .choice':'selecteReason',
                'click .choice.selected':'selecteOther'
            },
            onViewPush: function (pushFrom, pushData) {
                this._pushFrom = pushFrom;
                this._data = pushData;
            },
            posGenHTML: function () {
                if (this._pushFrom == "cars/index") {
                    this.setTitle("解除车辆绑定");
                }
            },
            onShow: function () {
                this.getImageCode();
            },
            getImageCode: function () {
                var imageNode = this.getElement("#checkImg");
                codeInterface.getImageCode(imageNode);
            },
            getVerificationCode: function () {
                var me = this;
                this._txt = this.getElement(".check_time");
                var phoneNumber = bfDataCenter.getUserMobile();
                // var phoneNumber = window.localStorage.username;
                var codeNumber = this.getElement(".imageCode").find('input').val();
                if (this._data.from == "index") {
                    codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "unbindcar", function () {
                        me.getImageCode()
                    })
                } else if (this._data.from == "myTbox") {
                    codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "unbindDevice", function () {
                        me.getImageCode()
                    })
                }
            },
            onFocus: function (e) { //输入框聚焦
                var input =e.currentTarget;
                input.placeholder='';
            },
            onBlur: function (e) { //失焦
                var input =e.currentTarget;
                input.placeholder=input.dataset.default;
            },
            selecteReason:function (e) {
                this.$('.choice.selected').removeClass('selected');
                e.currentTarget.classList.add('selected');
                if(e.currentTarget.classList.contains('other')){
                    this.$('#otherReason').show()
                }else{
                    this.$('#otherReason').hide()
                }

            },
            OnClickHint: function (e) { //点击提示聚焦
                var currentTarget = $(e.currentTarget);
                currentTarget.parent().find("input").focus();
            },
            writeReason:function (e) {
                var value=e.currentTarget.value;
                document.querySelector('.choice.other').value=value;
            },
            selecteOther:function (e) {
                this.$('#otherReason').show();
            },
            checkTime: function () {
                var me = this;
                var time = 60;
                me._contact = null;
                var type = me.getElement(".input_item select").val();

                if (type == "sms") {
                    me._contact = bfDataCenter.getUserMobile();
                    if (me._contact == null) {
                    } else {
                        var changStatu = this.getElement(".check_time");
                        if (this._data.from == "index") {
                            me.sendAuthCode(type, "unbindCar", function () {
                                CountDwon.countDwon(changStatu, time);
                            })
                        } else if (this._data.from == "myTbox") {
                            me.sendAuthCode(type, "unbindDevice", function () {
                                CountDwon.countDwon(changStatu, time);
                            })
                        }
                    }
                } else {
                    me._contact = bfDataCenter.getUserEamil();
                    if (me._contact == null) {
                    } else {
                        var changStatu = this.getElement(".check_time");
                        if (this._data.from == "index") {
                            me.sendAuthCode(type, "unbindCar", function () {
                                CountDwon.countDwon(changStatu, time)
                            })
                        } else if (this._data.from == "myTbox") {
                            me.sendAuthCode(type, "unbindDevice", function () {
                                CountDwon.countDwon(changStatu, time)
                            })
                        }
                    }
                }

            },
            sendAuthCode: function (type, usage, success) {
                var me = this;
                bfClient.sendAuthcode({
                    type: 'post',
                    data: {'contact': me._contact, 'type': type, 'usage': usage},
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
            },
            submitData: function () {
                var me = this;
                var authcode = me.getElement("#authcode").val();
                if (authcode != "") {
                    if (this._data.from == "index") {
                        me.deleteCar(authcode);
                    } else if (this._data.from == "myTbox") {
                        me.deleteEquipment(authcode);
                    }
                } else {
                    Notification.show({
                        type: "error",
                        message: "请输入验证码"
                    });
                }

            },
            deleteEquipment: function (authcode) {
                var me = this;
                var carVin = bfDataCenter.getCarId();
                var phone = bfDataCenter.getUserMobile();
                bfClient.deleteEquipment({
                    data: {'tuid': me._data.tuid, 'carId': carVin, 'authCode': authcode, 'phone': phone},
                    success: function (data) {
                        if (data.success) {
                            Notification.show({
                                type: "well",
                                message: data.msg
                            });
                            bfNaviController.pop(1);
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                            if (me._txt) {
                                CountDwon.stopCountDown(me._txt);
                            }
                        }
                    },
                    error: function (error) {
                        var eMsg = '发生未知错误';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "网络开小差";
                        }
                        Notification.show({
                            type: "error",
                            message: eMsg
                        });
                        if (me._txt) {
                            CountDwon.stopCountDown(me._txt);
                        }
                        ;
                    }
                });
            },
            realDeleCar: function(authcode,phone,reason){
                var me = this;
                                bfClient.deleteCar({
                                    data: {'carId': me._data.carId, 'authCode': authcode, 'phone': phone, 'reason': reason},
                                    success: function (data) {
                                        if (data.success) {
                                            Notification.show({
                                                type: "well",
                                                message: "解绑车辆成功"
                                            });
                                            var curCarId = bfDataCenter.getCarId();
                                            if (curCarId == me._data.carId) {
                                                bfDataCenter.setCarDevice(null);
                                                bfDataCenter.setCarId(null);
                                            }
                                            bfAPP.trigger("IM_EVENT_CAR_CHANGED");
                                            if(window.localStorage['goMainIndex'] == '1'){
                                                bfNaviController.popTo('main/index2.html');
                                            } else {
                                                bfNaviController.popTo('cars/index.html');
                                            }
                                        } else if (data.code == 9) {
                                            Notification.show({
                                                type: "error",
                                                message: "验证码错误"
                                            });
                                            if (me._txt) {
                                                CountDwon.stopCountDown(me._txt);
                                            }
                                        } else {
                                            Notification.show({
                                                type: "error",
                                                message: data.msg
                                            });
                                            if (me._txt) {
                                                CountDwon.stopCountDown(me._txt);
                                            }
                                        }
                                    },
                                    error: function (error) {
                                        var eMsg = '发生未知错误';
                                        if (typeof(error) === 'string') eMsg = error;
                                        if (typeof(error) === 'object') {
                                            if (error.status == 0) eMsg = "网络开小差";
                                        }
                                        Notification.show({
                                            type: "error",
                                            message: eMsg
                                        });
                                        if (me._txt) {
                                            CountDwon.stopCountDown(me._txt);
                                        }
                                    }
                                });
            },
            realDeleBluetooth: function(authcode,phone,reason,vin){
                var me = this;
                window.unBind_blueTooth_car_deleteEB_1 = function(data){
                    if(data.code == 200){
                        me.realDeleCar(authcode,phone,reason,vin)
                    } else {
                        Notification.show({
                            type:'info',
                            message:data.msg,
                        })
                    } 
                };
                OSApp.unBind_blueTooth(JSON.stringify({
                   vin: vin,
                }),'unBind_blueTooth_car_deleteEB_1') 
            },
            deleteBluetooth: function(authcode,phone,reason){
                var me = this;
               // var bluetoothMyinfo = bfDataCenter.getUserData().myInfo;
                bfClient.winmu_getCheckCode({
                    data: {
                        phone:  bfDataCenter.getUserMobile(),
                    },
                    success: function(data){
                        if(data.code == 0){
                            var checkCode = data.data;
                            
                            if(OSApp){
                                var carData = _.filter(bfDataCenter.getCarList(),function(item){
                                    return item.carId == me._data.carId
                                })
                                var vin = carData[0].vin;
                                window.loginandgetdata_blueTooth_car_deleteEB_2 = function(data){
                                    if(data.code == 200){
                                        me.realDeleBluetooth(authcode,phone,reason,vin)
                                    } else {
                                        me.realDeleCar(authcode,phone,reason)
                                    } 
                                }
                               OSApp.loginandgetdata_blueTooth(JSON.stringify({
                                   phone: bfDataCenter.getUserMobile(),
                                   vin: vin,
                                   checkCode: checkCode,
                                   token: window.localStorage['token']
                               }), 'loginandgetdata_blueTooth_car_deleteEB_2') 
                            } else {
                                me.realDeleCar(authcode,phone,reason)
                            }
                                   
                        } else {
                            Notification.show({
                                type:'info',
                                message:data.msg,
                            })
                        }
                    },
                    error: function(res){
                        Notification.show({
                            type:'info',
                            message: '网络开小差',
                        })
                    }
                })
                
            },
            deleteCar: function (authcode) {
                var me = this;
                var phone = bfDataCenter.getUserMobile();
                var reason = me.$('.choice.selected').val();
                dialog.createDialog({
                        closeBtn: false,
                        buttons: {
                            '取消解绑': function () {
                                this.close();
                            },
                            '继续': function () {
                                me.deleteBluetooth(authcode,phone,reason)
                                this.close();
                            }
                        },
                        content: "<div style='color:red;text-align: center;padding-bottom:15px '>重要提示</div>" +
                        "解除绑定后，本车辆的实名认证信息将被注销，重新绑定需要到4s店完成！",
                })

            }
        });
    });

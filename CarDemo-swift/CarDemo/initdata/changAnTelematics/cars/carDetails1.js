define([
    'text!cars/carDetails1.html',
    "common/navView",
    'butterfly',
    "common/osUtil",
    "common/ssUtil",
    'shared/timePicker/js/date',
    "shared/js/notification",
    "shared/slideInPlugin/slideInPlugin",
    "shared/plugin_dialogOld/js/dialog",
    'common/countDwonUtil',
    'common/imageCodeInterface'
],
function(template, View, Butterfly, osUtil, ssUtil, DatePicker, Notification, slideIn, dialog, CountDwon, codeInterface) {
    var Base = View;
    return Base.extend({
        events: {
            "click .beCurrent": "toBeCurrent", //设置当前车辆
            "click .carReport": "toCarReport", //跳转到行车报告
            "click #editImfor": "edit", //点击编辑或者完成
            "click #cardetailSetPin": "operPin",
            "click .oper-device": "operDevice",
            /*"click .oper-realname_auth": "realnameAuth",*/
            "click .editDiv": "gotoOperate", //操作车辆属性
            "click .insurance-name": "companyList", //保险公司
            "click .fence-connet-jd": "fenceConnetJD", //关联电子围栏到京东
            "click .checkBox": "checkPinFun",
            "click .car-connet-jd": "carConnetJD", // 绑定车辆到京东
            "click #controlChange": "onControlChange" // 绑定车辆到京东

        },
        onLeft: function() {
            bfNaviController.pop();
        },
        onControlChange: function() {
            var me = this;
            if (this._RemoteControl && this._carId == bfDataCenter.getCarId()) {
                this._RemoteControl.carId = this._carId;
                bfNaviController.push("cars/control-change.html", this._RemoteControl);
                return
            } else {
                var me = this;
                var myCarData = bfDataCenter.getCarList()
                if (myCarData) {
                    var groupMyCarData = _.indexBy(myCarData, function(item) {
                        return item.carId
                    })
                } else {
                    var groupMyCarData = {};
                    bfClient.getCarList({
                        type: "GET",
                        dataType: "json",
                        success: function(data) {
                            if (data.code == 0) {
                                var newArr = data.data.filter(function(item) {
                                    return item.seriesCode !== "testSeries"
                                })
                                if (newArr.length == 0) {
                                    bfDataCenter.setCarList(null);
                                    return
                                }
                                //让loding看不到
                                bfDataCenter.setCarList(newArr); //更新本地缓存的车辆列表 lxc
                                me.onControlChange();
                            }
                        }
                    });
                    return
                }
                var carData = groupMyCarData[this._carId];

                var confCode = carData && carData.confCode;
                var modelCode = carData && carData.modelCode;
                if (confCode && confCode.indexOf('.') > 0) {
                    var codeArr = confCode.split('.');
                    modelCode = codeArr[0];
                    confCode = codeArr[1];
                } else if (!confCode && modelCode == "测试车") {
                    modelCode = "DEMO"
                    confCode = ""
                }
                // if(confCode && confCode.indexOf('.') > 0) {
                //     var codeArr = confCode.split('.');
                // }
                // 测试数据 写死
                // modelCode = 'SC6468BAH5';
                // confCode = 'A4D'

                // modelCode = 'SC6481BBH5';
                // confCode = 'V51A'
                me.uiAddChrysanthemum()
                bfClient.getRemoteControl({
                    data: {
                        confCode: confCode,
                        modelCode: modelCode
                    },
                    success: function(res) {
                        if (res.success) {
                            var data = res.data
                            me._RemoteControl = data;
                            me._RemoteControl.carId = me._carId;
                            bfNaviController.push("cars/control-change.html", me._RemoteControl);
                        } else {
                            Notification.show({
                                type: "error",
                                message: "当前该车型无控制选项"
                            });
                        }
                        me.uiRemoveChrysanthemum()
                    },
                    error: function(data) {
                        Notification.show({
                            type: "error",
                            message: "网络开小差"
                        });
                        me.uiRemoveChrysanthemum()
                    }
                })

            }
        },
        setIsPrivacyDrvingHistory: function(data) {
            if (data.isPrivacyDrvingHistory == 1) {
                window.localStorage['isPrivacyDrvingHistory'] = 1;
            } else {
                window.localStorage['isPrivacyDrvingHistory'] = 0;
            }
        },
        onViewPush: function(pushFrom, pushData) {
            this._RemoteControl = pushData;
        },
        onShow: function() {
            var me = this;
            if (this._carId == null) {
                this._carId = this._currentCarId
            }
            if (this._carId == this._currentCarId) {
                this._isCurrent = true;
            }
            bfClient.getCarInfoById({
                data: { 'carId': this._carId },
                success: function(data) {
                    me._carDetails = data.data;
                    me._carUniqueCode = data.data.carUniqueCode;
                    me._isPrivacyDrvingHistory = data.data.isPrivacyDrvingHistory;
                    me.setIsPrivacyDrvingHistory(data.data);
                    me.viewRender();
                },
                error: function(error) {
                    Notification.show({
                        type: "error",
                        message: "车辆详情获取失败"
                    });
                }
            });
        },
        posGenHTML: function() {
            //通过页面传过来的VIN号，查询出对应的车辆信息
            var me = this;
            var url = window.location.href;
            var index = url.indexOf('carDetails1.html?');
            this._carId = url.substr(index + 17);
            this._isCurrent = false;
            this._currentCarId = bfDataCenter.getCarId();

        },
        companyList: function() {
            bfNaviController.push("sos/companyList.html", { carId: this._carId, from: 'carDetails' })
        },
        fenceConnetJD: function() {
            bfNaviController.push("connetJD/fenceList.html", { carId: this._carId })
        },
        carConnetJD: function() {
            var me = this;
            bfClient.carBindJd({
                data: { carId: me._carId },
                success: function(data) {
                    if (data.code == 0) {
                        Notification.show({
                            type: "error",
                            message: "绑定成功"
                        });
                        me.onShow()
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        })
                        if (data.msg && data.msg == '请先进行京东用户授权') {
                            setTimeout(function() {
                                bfNaviController.push("Laboratory/jingdong-oauth.html")
                            }, 1e3)
                        }
                    }
                },
                error: function() {
                    Notification.show({
                        type: "error",
                        message: "网络开小差"
                    })
                }
            })
        },
        realnameAuth: function() {
            var url = bfDataCenter.getBaseConfig_realname_auth_url();
            if (url) {
                window.open(url, '_system');
            }
        },
        checkPinFun: function(el) {
            var self = this;
            this._pin = "";
            this.swichDriving(el)
            //如果没有设置Pin码，跳转到设置Pin码的页面
            // if (this._carDetails.pin ==="empty") {
            //     //本地存储没有，对服务器拉取
            //     bfClient.getPinCode({
            //         type: 'post',
            //         data: {
            //             carId: self._carId
            //         },
            //         success: function(data) {
            //             if (data.code == 0) {
            //                 bfDataCenter.setPinCode('true');
            //                 self.showDialogCheck(el)
            //             } else {
            //                 dialog.createDialog({
            //                     closeBtn: false,
            //                     buttons: {
            //                         '确定': function() {
            //                             bfNaviController.push('/cars/setPINForCar.html', {
            //                                 carId: self._carId,
            //                                 type: "setpin"
            //                             });
            //                             this.close();
            //                         },
            //                         '取消': function() {
            //                             this.close();
            //                         }
            //                     },
            //                     content: "前往设置控车码"
            //                 });
            //             }
            //         }
            //     });
            // } else {
            //     self.showDialogCheck(el)
            // }
        },
        setPinCode: function() {
            var me = this;
            dialog.createDialog({
                closeBtn: false,
                buttons: {
                    '确定': function() {
                        bfNaviController.push('/cars/setPINForCar.html', {
                            carId: me._carId,
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
        },
        showDialogCheck: function(el) {
            var self = this;
            dialog.createDialog({
                input: true,
                closeBtn: false,
                onShowCallBack: function(_dialog) {
                    self.dialogClickListener(_dialog);
                },
                buttons: {
                    '取消': function() {
                        self._inputVal = "";
                        this.close();
                        this.destroy();
                    },
                    '确定': function() {
                        self._pin = self._inputVal;
                        self._inputVal = "";
                        if (!self._pin || self._pin.length != 6) {
                            Notification.show({
                                type: 'error',
                                message: '请输入6位的控车码'
                            });
                        } else {
                            var now = new Date().getTime();
                            self.swichDriving(el);
                            self._inputVal = "";
                            this.close();
                            this.destroy();
                        }
                    }

                },
                content: "<p>请输入6位的控车码</p><div style='width:240px; position:relative; height:40px; margin:10px auto; overflow:hidden; background: url(../home/img/pin.png) no-repeat;'><div id='pin' contenteditabl='true' style='width:240px; height:40px;'></div><input id='input_hidden' type='tel' maxlength='6' style='z-index:-1;width:260px; height:40px;color: transparent;top: 0px;postion: absolute;position: absolute;left: -9999px;border: none;background-color: transparent;'/></div><p style='font-size:12px'>请确保钥匙不在车内，车辆属于锁车状态</p><p style='color:#2296e1;margin-top:10px;' id='forgetPin'>忘记控车码？</p>",
            });
        },
        dialogClickListener: function(_dialog) {
            var self = this;
            if (_dialog) {
                _dialog.$el.find("#input_hidden").focus();
                _dialog.$el.find('#input_hidden').keyup(function() {
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
                _dialog.$el.find('#pin').click(function() {
                    _dialog.$el.find("#input_hidden").focus();
                });
                _dialog.$el.find('#forgetPin').click(function() {
                    // 正式代码
                    _dialog.close();
                    _dialog.destroy();
                    bfNaviController.push("cars/findPinStepOne.html", { carId: self._carId })
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
        },
        peopleConfirm: function(el) {
            var self = this;
            var target = el;
            var contentString = "<div class='imageCode'>" +
                "<input type='text' style = 'width:60%;float:left;font-size:14px' class='auth-code' maxlength ='4' placeholder='输入图片验证码'><div class='image-code' style='width:38%;height:40px;float:right'><img id='checkImg'style='width:100%;height:100%' src=''/></div>" +
                "</div><div><input type='tel' maxlength='6' id='authCode' style='width: 60%;float:left'/>" +
                "<div style='background-color: #00c3fe;color: white;width: 38%;height: 40px;font-size: 13px;padding-top: 12px;border-radius: 3px;float: right;line-height: 20px;'class='check_time'>发送验证码</div></div>";
            this._confirmDialog = dialog.createDialog({
                autoOpen: true,
                closeBtn: false,
                title: "请输入短信验证码，以验证身份",
                buttons: {
                    '取消': function() {
                        this.close();
                        this.destroy();
                    },
                    '确定': function() {
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
                                    carId: self._carId
                                },
                                success: function(req) {
                                    if (req.success) {
                                        self._confirmDialog.close();
                                        self._confirmDialog.destroy();
                                        setTimeout(function() {
                                            self.showDialogCheck(target);
                                        }, 100);
                                    } else {
                                        Notification.show({
                                            type: "error",
                                            message: req.msg
                                        });
                                        // OSApp.showStatus("error", req.msg);
                                    }
                                },
                                error: function(err) {
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
            };
            // self.sendCode();  //自动发送验证码
            this.onBindClick();
        },
        getImageCode: function(params) {
            var me = this;
            var imageNode = params.$el.find("#checkImg");

            codeInterface.getImageCode(imageNode);
        },
        getVerificationCode: function(params) {
            var me = this;
            this._txt = params.$el.find(".check_time");
            var phoneNumber = bfDataCenter.getUserMobile();
            var codeNumber = params.$el.find(".imageCode").find('input').val();
            codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "updatePhone", function() {
                me.getImageCode(me._confirmDialog)
            })
        },
        onBindClick: function() {
            var me = this;
            if (this._confirmDialog) {
                var imageNode = this._confirmDialog.$el.find("#checkImg");
                imageNode.on('click', function() {
                    me.getImageCode(me._confirmDialog)
                });

                this._confirmDialog.$el.find('.check_time').on("click", function() {
                    me.getVerificationCode(me._confirmDialog);
                });
            };

        },
        swichDriving: function(el) {
            var me = this;
            var target = $(el.currentTarget);
            if (!target.hasClass("active")) {
                bfClient.setDrivingHistroyCloseWithPin({
                    data: {
                        'isPrivacyDrvingHistory': 0,
                        carId: this._carId,
                        pin: me._pin
                    },
                    success: function(data) {
                        /* var selectCode = me.getElement("#oilTypeSelect");
                         var paramData = {oilType: selectCode.val()};
                         me.carInfoupdate(paramData);*/
                        if (data && data.code == 0) {
                            target.addClass("active");
                            target.children(".check-icon").animate({ left: "19px" }, 100)
                            if (me._carId == bfDataCenter.getCarId()) {
                                window.localStorage['isPrivacyDrvingHistory'] = 0;
                            }
                        } else if (data.code == 5) {
                            me.setPinCode(el)
                        } else if (data.code == 3) {
                            me.showDialogCheck(el)
                        } else if (data.code == 1004) {
                            me.peopleConfirm(el)
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            })
                        }
                    },
                    error: function() {
                        Notification.show({
                            type: "error",
                            message: '网络开小差'
                        })
                    }
                })

            } else {
                bfClient.setDrivingHistroyCloseWithPin({
                    data: {
                        'isPrivacyDrvingHistory': 1,
                        carId: this._carId,
                        pin: me._pin
                    },
                    success: function(data) {
                        /*    var selectCode = me.getElement("#oilTypeSelect");
                            var paramData = {oilType: selectCode.val()};
                            me.carInfoupdate(paramData);*/
                        if (data && data.code == 0) {
                            target.removeClass("active");
                            target.children(".check-icon").animate({ left: "0" }, 100)
                            if (me._carId == bfDataCenter.getCarId()) {
                                window.localStorage['isPrivacyDrvingHistory'] = 1;
                            }
                        } else if (data.code == 5) {
                            me.setPinCode(el)
                        } else if (data.code == 3) {
                            me.showDialogCheck(el)
                        } else if (data.code == 1004) {
                            me.peopleConfirm(el)
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            })
                        }
                    },
                    error: function() {
                        Notification.show({
                            type: "error",
                            message: '网络开小差'
                        })
                    }
                })
                // var content = "关闭后，手机将不再接收会员专属通知，<br>您依然可以在消息中心查到会员专属通知。"
                // this.showDialogCeng(target, content)
            }
        },
        // showDialogCeng: function(target,content){
        //     Dialog.createDialog({
        //         closeBtn: false,
        //         buttons: {
        //             '不再接收通知': function () {
        //                 target.removeClass("active");
        //                 target.children(".check-icon").animate({left:"0"},100)
        //                 this.close();
        //             }
        //         },
        //         content: content
        //     });
        // },
        gotoOperate: function(element) {
            var self = this;
            var role = $(element.currentTarget).attr("role");
            var value = $(element.currentTarget).text();
            switch (role) {
                case "name":
                    bfNaviController.push("/cars/rename.html", {
                        carId: this._carId,
                        value: value
                    });
                    break;
                case "carId":
                    bfNaviController.push("/cars/recarid.html", {
                        carId: this._carId,
                        value: value
                    });
                    break;
                case "carVin":
                    bfNaviController.push("/cars/recarvin.html", {
                        carId: this._carId,
                        value: value
                    });
                    break;
                case "engineNum":
                    bfNaviController.push("/cars/reenginenum.html", {
                        carId: this._carId,
                        value: value
                    });
                    break;
                case "seriesCar":
                    var temp = self.elementHTML("#carItem");
                    var template = _.template(temp);
                    var element = element.currentTarget;
                    bfClient.getBrands({
                        data: {},
                        success: function(req) {
                            if (!req.success) {
                                Notification.show({
                                    type: "error",
                                    message: req.msg
                                });
                                return;
                            }
                            slideIn.createSlide({
                                data: req.data,
                                template: template,
                                title: "选择品牌",
                                level: 1,
                                hasTitle: false,
                                ItemClick: function(el) {
                                    var item = el.target;
                                    $(item).css("background-color", "#f1f1f1");
                                    var text = item.innerText;
                                    var id = $(item).attr("data-value");
                                    if (!id) {
                                        var parent = $(item).parent(".carItem");
                                        id = $(parent).attr("data-value");
                                    }
                                    self.brandId = id;
                                    self.getCarSeries(id, text);
                                }
                            });
                        },
                        error: function() {

                        }
                    });
                    break;
                case "carType":
                    bfNaviController.push("/cars/recartype.html", {
                        carId: this._carId,
                        value: value
                    });
                    break;
                case "oilType":
                    bfNaviController.push("/cars/recarOiltype.html", {
                        carId: this._carId,
                        value: value
                    });
                    break;
            }
        },
        // getOilType: function(){
        //     var me = this;
        //     bfClient.getOilTypeList({
        //         type : 'post',
        //         data : {},
        //         success : function(data){
        //             if(data.success){
        //                 var selectCode = me.getElement("#oilTypeSelect");
        //                 selectCode.html("");
        //                 me._len = data.data.length;
        //                 for(var i =0;i<me._len;i++){
        //                     selectCode.append('<option value='+data.data[i]+'>'+data.data[i]+"</option>");
        //                 }
        //                 selectCode.find('option[value='+(me._carDetails.oilType ? me._carDetails.oilType : null)+']').attr("selected",true);
        //             }else{
        //                 Notification.show({
        //                     "type":"error",
        //                     "message":data.msg
        //                 });
        //             }
        //         },
        //         error:function(data){
        //             Notification.show({
        //                 "type":"error",
        //                 "message":data.msg
        //             });
        //         }
        //     });
        // },
        getCarSeries: function(id, Name) {
            var self = this;
            var temp = self.elementHTML("#carItem");
            var template = _.template(temp);
            if (id) {
                bfClient.getCarType({
                    data: {
                        parentId: id
                    },
                    success: function(req) {
                        if (!req.success) {
                            var data = { seriesName: Name, seriesId: id, brandId: self.brandId };
                            self.carInfoupdate(data);
                            return;
                        }
                        slideIn.createSlide({
                            data: req.data,
                            template: template,
                            title: "选择车系",
                            level: 2,
                            hasTitle: false,
                            ItemClick: function(el) {
                                var item = el.target;
                                $(item).css("background-color", "#f1f1f1");
                                var text = item.innerText;
                                var id = $(item).attr("data-value");
                                if (!id) {
                                    item = $(item).parent(".carItem");
                                    id = $(item).attr("data-value");
                                }
                                var data = { seriesName: text, seriesId: id };
                                window.sessionStorage["carSeries"] = JSON.stringify(data);
                                self.getCarType(id);
                            }
                        });
                    },
                    error: function(error) {
                        Notification.show({
                            type: "error",
                            message: "拉取车系数据失败"
                        });
                    }
                });
            }
        },
        getCarType: function(id) {
            var self = this;
            var temp = self.elementHTML("#carItem");
            var template = _.template(temp);
            if (id) {
                bfClient.getCarType({
                    data: {
                        parentId: id
                    },
                    success: function(req) {
                        if (!req.success) {
                            var data = {};
                            self.carInfoupdate(data);
                            return;
                        }
                        slideIn.createSlide({
                            data: req.data,
                            template: template,
                            title: "选择车型",
                            level: 2,
                            hasTitle: false,
                            ItemClick: function(el) {
                                var item = el.target;
                                $(item).css("background-color", "#f1f1f1");
                                var text = item.innerText;
                                var id = $(item).attr("data-value");
                                if (!id) {
                                    item = $(item).parent(".carItem");
                                    id = $(item).attr("data-value");
                                }
                                var data = { modelName: text, modelId: id };
                                self.carInfoupdate(data);
                            }
                        });
                    },
                    error: function(error) {
                        Notification.show({
                            type: "error",
                            message: "拉取车型数据失败"
                        });
                    }
                });
            }
        },
        carInfoupdate: function(data) {
            var self = this;
            var carSeries = window.sessionStorage.carSeries;
            window.sessionStorage.removeItem("carSeries");
            carSeries = eval("(" + carSeries + ")");
            if (carSeries) {
                data.seriesName = carSeries.seriesName;
                data.seriesId = carSeries.seriesId;
                data.brandId = self.brandId;
            }
            data.carId = self._carId;
            bfClient.updateCarInfo({
                type: 'post',
                data: data,
                success: function(data) {
                    if (data.code == 0) {
                        delete self.brandId;
                        Notification.show({
                            "type": "info",
                            "message": "更新成功"
                        });
                        self.onShow();
                    } else {
                        Notification.show({
                            "type": "error",
                            "message": data.msg
                        });
                    }
                },
                error: function(data) {
                    Notification.show({
                        "type": "error",
                        "message": data.msg
                    });
                }
            });
        },
        onViewBack: function(backFrom, backData) {
            var me = this;
            this._data = backData;
            if (this._data) {
                if (this._data.from == 'insurance') {
                    me.getElement(".insurance-name").text(this._data.insuranceName);
                    me.getElement(".insurance-phone").text(this._data.insurancePhone);
                }

                if (this._data.from == 'device') {
                    var number, status;
                    if (this._data.munber == 'noDevice') {
                        number = '暂未绑定设备',
                            status = '绑定'
                    } else {
                        number = '当前共' + this._data.munber + '个设备';
                        status = '设置'
                    }
                    me.getElement(".equipment-number").text(number);
                    me.getElement(".equipment-statu").text(status);
                }
                if (this._data.from == 'pin') {
                    me.getElement(".pin-number").text(this._data.isExist !== 'exist' ? '未设置PIN码' : '已设置PIN码');
                    me.getElement(".pin-statu").text(this._data.isExist !== 'exist' ? '修改' : '设置');
                }
            }
        },
        operDevice: function() {
            bfNaviController.push('/cars/myTboxEquipment.html', { carId: this._carId, carUniqueCode: this._carUniqueCode });
        },
        operPin: function(el) {
            var target = $(el.currentTarget).find(".oper-pin span");
            var type = "";
            if (target.html() == "设置") {
                type = "setpin";
            } else if (target.html() == "修改") {
                type = "changepin";
            }
            bfNaviController.push('/cars/setPINForCar.html', {
                carId: this._carId,
                type: type
            });
        },
        bindDatePicker: function() { //绑定日期控件
            var me = this;
            me.dp = DatePicker($);
            var datePic = this.getElement('#insurance-util-date');
            me.dp.time = datePic.text();
            datePic.date({
                theme: "date"
                // time: me.$el.find(".birthDay").text()
            }, function(data) {
                data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
                datePic.text(data);
                me.dp.time = data;
                bfClient.updateCarInfo({
                    type: 'post',
                    data: {
                        'carId': me._carId,
                        'insuranceEndDate': data,
                    },
                    success: function(data) {
                        if (data.success) {
                            bfAPP.trigger("IM_EVENT_CAR_CHANGED");
                            Notification.show({
                                "type": "well",
                                "message": "更新成功"
                            });
                        } else {
                            Notification.show({
                                "type": "error",
                                "message": data.msg
                            });
                        }
                    },
                    error: function(data) {
                        Notification.show({
                            "type": "error",
                            "message": data.msg
                        });
                    }
                });
            }, function() {
                //取消的回调
            });
            //lxc  设置默认的时间
            this._today = new Date().format("yyyy-MM-dd");
            me.dp.time = this._today;

            var datePic1 = this.getElement('#last-time-check');
            me.dp.time = datePic1.text();
            datePic1.date({
                theme: "date"
            }, function(data) {
                data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');

                if (data > me._today) {
                    Notification.show({
                        type: "error",
                        message: "上次年检时间应该小于当前时间"
                    });
                    return;
                };
                datePic1.text(data);
                me.dp.time = data;
                bfClient.updateCarInfo({
                    type: 'post',
                    data: {
                        'carId': me._carId,
                        'lastCheckTime': data,
                    },
                    success: function(data) {
                        if (data.success) {
                            bfAPP.trigger("IM_EVENT_CAR_CHANGED");
                            Notification.show({
                                "type": "well",
                                "message": "更新成功"
                            });
                        } else {
                            Notification.show({
                                "type": "error",
                                "message": data.msg
                            });
                        }
                    },
                    error: function(data) {
                        Notification.show({
                            "type": "error",
                            "message": data.msg
                        });
                    }
                });
            }, function() {
                //取消的回调
            });
            me.dp.time = this._today;
        },

        //渲染
        viewRender: function() {
            var me = this;
            //加入车辆没有绑定京东
            var template = _.template(this.elementHTML('#carInfo'), {
                "carInfo": this._carDetails,
                "isCurrent": this._isCurrent,
                "isPrivacyDrvingHistory": this._isPrivacyDrvingHistory
            });
            this.elementHTML('#car_details', template);
            this.bindDatePicker();
            // this.getOilType();
            // var selectCode = me.getElement("#oilTypeSelect");
            // selectCode.on("change",function(){
            //     data = {oilType: selectCode.val()};
            //     me.carInfoupdate(data)
            // });
        },
        selectInsurance: function() {
            var me = this;
            bfNaviController.push("sos/companyList.html", {
                carId: this._carId,
                from: 'carDetails',
                isCurrent: this._isCurrent
            })
        },
        refresh: function() {},
        toCarReport: function() {
            butterfly.navigate('/drivingReport/index.html');
        },
        //设置当前车辆
        toBeCurrent: function() {
            // var deviceType = (this._carDetails.currentDeviceType);
            // bfDataCenter.setCarDevice(deviceType);
            // bfDataCenter.setCarId(this._carId);
            // //todo 清楚检测标志位
            // window.hasTest = false;
            // window.hasChangeCar = true;
            // bfDataCenter.setUserValue("resourceTime",null);
            // bfNaviController.popToRef("main/index", 'backToHome');
            var me = this;
            dialog.createDialog({
                closeBtn: false,
                buttons: {
                    '取消': function() {
                        this.close();
                    },
                    '确定': function() {
                        bfNaviController.push('cars/deleteEquipmentBanding.html', { carId: me._carId, from: "index" });
                        this.close();
                    }
                },
                content: "<div style='text-align: center;padding-bottom:15px;font-size:20px'>车辆解绑</div>" +
                    "解除绑定后将无法继续使用车联网服务，是否继续？",
            });
        },
        onDeviceBack: function() {
            var $ment = $(".ui-slide-content");
            if ($ment.length > 0) {
                $ment.remove();
            } else {
                this.goBack();
            }
            return true;
        },
        // 拉数据的时候，添加菊花
        uiAddChrysanthemum: function() {
            var me = this;
            if (me.$('.content').eq(0).find('#chrysanthemumWarp').length === 0) {
                me.$('.content').eq(0).append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%;z-index:100'><div class='bf-chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>加载中...</div></div></div>");
            }
        },
        // 删除菊花
        uiRemoveChrysanthemum: function() {
            this.$('#chrysanthemumWarp').remove();
        }

    });

    });
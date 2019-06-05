/**
 * Created by hp on 2016/10/11.
 */
define(
    [
        "text!Laboratory/newPeripheralimage.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "iscroll",
        "common/disUtil",
        "shared/js/notification",
        "Laboratory/lab-client",
        "shared/plugin_dialog/js/dialog",
        'common/imageCodeInterface'
    ],
    function (template, View, Butterfly, ssUtil,iscroll, disUtil,Notification,LabClient, dialog, codeInterface)
    {
        var Base = View;
        var cls =
        {
            _value : true,
            carData : null,
            events: {
                // "click .bottom-item":"getNewPhoto"
            }
        };
        cls.posGenHTML = function()
        {
            var me = this;
            var node = this.getElement(".bottom-item");
            
            if (bfDataCenter.getUserSessionValue('canGetImage') == 'false') {
                node.addClass("active");
                this.getElement(".content-image").html("<div>正在获取最新图像中~~</div>");
            }else{
                node.on("click", function(){
                    me.getNewPhoto()
                });
            }
        };
        cls.onRight=function () {
            butterfly.navigate("Laboratory/PhotoHis.html");
        };
        cls.getNewPhoto = function(){
            this.onControlCar();
        }
        cls.onControlCar = function()
        {
            var me = this;
            //如果没有设置Pin码，跳转到设置Pin码的页面
            if(!bfDataCenter.getPinCode())
            {
                //本地存储没有，对服务器拉取
                bfClient.getPinCode({
                    type:'post',
                    data:{carId:bfDataCenter.getCarId()},
                    success:function(data)
                    {
                        if(data.code == 0)
                        {
                            bfDataCenter.setPinCode('true');
                            me.onConfirmCarLocation("");
                        }
                        else
                        {
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '确定': function() {
                                        // bfNaviController.push('/cars/setPINForCar.html',bfDataCenter.getCarId());
                                        bfNaviController.push('/cars/setPINForCar.html', {
                                            carId:bfDataCenter.getCarId(),
                                            type:"setpin"
                                        });
                                        this.close();
                                    },
                                    '取消': function() {
                                        this.close();
                                    }
                                },
                                content: "前往设置控车码",
                            });

                        }
                    }
                });
            }
            else
            {
                me.onConfirmCarLocation("");
            }
        };

        cls.onConfirmCarLocation = function(pin)
        {
            var me = this;
            if (pin.length == 0) {
                pin = "";
            }
            //如果操作正在进行，不做任何操作
            if (bfDataCenter.getUserSessionValue('canOperate') == null) {
                bfDataCenter.setUserSessionValue('canOperate', 'true')
            }
            // var canOperate = bfDataCenter.getUserSessionValue('canOperate');
            // if (canOperate == 'false') {
            //     Notification.show({
            //         type: 'error',
            //         message: '请等待上一条指令执行结束，再操作'
            //     });
            //     return;
            // }

            var operate = "PeripheralImage";
            var phoneType = "";
            var phoneId   = "";
            if(window.device)
            {
                phoneType = window.device.model;
                phoneId = window.device.uuid;
            }
            bfClient.controlCar({
                data:{'cmd':operate,
                    'phoneType':phoneType,
                    'phoneId':phoneId,
                    'carId':bfDataCenter.getCarId(),
                    'pin':pin,
                    'notifyTuType':1
                },
                options:{loading:false},
                type:'post',
                success:function(data)
                {
                    if(data.code == 0 && data.success)
                    {
                        var taskId = data.data.taskId;
                        var imageNode = $("#Peripheralimage .bottom-item");
                        imageNode.addClass("active");
                        imageNode.unbind("click");
                        bfDataCenter.setUserSessionValue('canOperate','false');
                        $("#Peripheralimage .content-image").html("<div>正在获取最新图像中~~</div>");

                        var id = data.data.requestId;
                        var requestOperationResult = null;
                        requestOperationResult = function(){
                            bfClient.getControlInfoByTaskId({
                                data:{"id":id,
                                    "taskId":taskId
                                },
                                success:function(data){
                                    data = data.data;
                                    //Completed代表成功，Runing代表等待，SendFailure代表失败
                                    if(data.handleStatus == "Completed"){
                                        //让远程控制可操作
                                        me.controlComplete(taskId);
                                    }else if(data.handleStatus == "Runing"||data.handleStatus == "Initialized"){                                       
										setTimeout(requestOperationResult,5000);
                                        bfDataCenter.setUserSessionValue('canOperate','false');
                                        bfDataCenter.setUserSessionValue('canGetImage','false');
                                    }else{
                                        //让远程控制可操作
                                        me.controlError();
                                    }
                                },
                                error: function(error){
                                    me.controlError();
                                }
                            });
                        };

                        requestOperationResult();
                    }else if (data.code == 7) {
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetImage', 'true');
                        Notification.show({
                            type:'error',
                            message:data.msg
                        });
                    }else if (data.code == 3) {
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetImage', 'true');
                        me.showDialog();
                    }else if(data.code == 999){
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetImage', 'true');
                        Notification.show({
                            type:'error',
                            message:data.msg
                        })
                    }else if (data.code == 1004) {
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetImage', 'true');
                        me.peopleConfirm();
                    }else if (data.code == -1) {
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetImage', 'true');
                        Notification.show({
                            type:"error",
                            message: data.msg
                        })
                    }else{
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetImage', 'true');
                        Notification.show({
                            type:"error",
                            message: data.msg
                        })
                    }
                }
            });
        };
        cls.controlComplete = function(taskId){
            var me = this;
            var imageNode = $("#Peripheralimage .bottom-item");
            $("#Peripheralimage .content-image").html("<div>获取成功~~</div>");
            me.getImage(taskId);
            bfDataCenter.setUserSessionValue('canOperate','true');
            bfDataCenter.setUserSessionValue('canGetImage','true');
            imageNode.removeClass("active");
            imageNode.on("click", function(){
                me.getNewPhoto()
            });
        }
        cls.controlError = function(){
            var me = this;
            var imageNode = $("#Peripheralimage .bottom-item");
            bfDataCenter.setUserSessionValue('canOperate','true');
            bfDataCenter.setUserSessionValue('canGetImage','true');
            $("#Peripheralimage .content-image").html("<div>获取失败~~</div>");
            imageNode.removeClass("active");
            imageNode.on("click", function(){
                me.getNewPhoto()
            });
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
            if (this._confirmDialog) {
                self.getImageCode(this._confirmDialog);
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
        cls.getImage = function(taskId){
            var me = this;
            bfClient.getImage({
                data:{taskId: taskId},
                success: function(data){
                    if (data.code == 0) {
                        var imageNode = $("#Peripheralimage .content-image");
                        imageNode.empty();
                        // imageNode.css("padding-top","0px");
                        var url = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data.data[0].dsshandle;
                        var imgNode = "<img src='"+url+"' />"
                        imageNode.append(imgNode);
                    };
                },
                error: function(error){
                    notification.show({
                        type:"error",
                        message:"获取图像失败"
                    })
                }
            })
        }
        cls.showDialog = function(){
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
                                self.onConfirmCarLocation(self._pin);
                                self._inputVal = "";
                                this.close();
                                this.destroy();
                            }
                        }

                    },
                    content: "<p>请输入6位的控车码</p><div style='width:240px; position:relative; height:40px; margin:10px auto; overflow:hidden; background: url(../home/img/pin.png) no-repeat;'><div id='pin' contenteditabl='true' style='width:240px; height:40px;'></div><input id='input_hidden' type='tel' maxlength='6' style='z-index:-1;width:260px; height:40px;color: transparent;top: 0px;postion: absolute;position: absolute;left: -9999px;border: none;background-color: transparent;'/></div><p style='font-size:12px'>请确保钥匙不在车内，车辆属于锁车状态</p><p style='color:#2296e1;margin-top:10px;' id='forgetPin'>忘记控车码？</p>",
                });

            };
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
        return Base.extend(cls);
    }
);
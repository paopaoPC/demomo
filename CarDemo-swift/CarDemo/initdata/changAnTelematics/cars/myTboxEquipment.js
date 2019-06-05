define([
        "text!cars/myTboxEquipment.html",
        "common/navView",
        'butterfly',
        "shared/js/notification",
        "shared/plugin_dialog/js/dialog",
        "underscore",
        "hammer"
    ],
    function (template, View, Butterfly, Notification, Alert, _, Hammer) {

        var Base = View;
        var cls =
        {
            events: {
                "click #add_equipment": "addEquipment",
                "click .equiment-right": "equimentActiveDialog",
                "click .downLoadTbox": "TboxUpBottom",
                "click #comfirmInstall": "comfirmUpdate",
                "click .setWifi":"setWifiPage"
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {
            this._carId = pushData.carId;
            this._carUniqueCode = pushData.carUniqueCode;
        };
        cls.onShow = function () {
            var self = this;
            //请求设备列表
            bfClient.getCatDevice({
                carId: this._carId
            }, function (data) {
                if (data.data && data.data.listDevice) {
                    self._dataSource = data.data.listDevice;
                    self._tServiceStatus = data.data.tServiceStatus;
                    //添加div到html
                    var container = self.elementFragment('#equiment-list');
                    container.empty();

                    var deviceTemplateObd = self.elementHTML('#my-equipment-obd-template');
                    var templateObd = _.template(deviceTemplateObd);

                    var deviceTemplateTbox = self.elementHTML('#my-equipment-tbox-template');
                    var templateTbox = _.template(deviceTemplateTbox);

                    for (var i = 0; i < self._dataSource.length; ++i) {
                        if (self._dataSource[i].deviceType == "tbox") {
                            var  carUniqueCode = self._carUniqueCode;
                            if (carUniqueCode && carUniqueCode.toLowerCase()=="s401"){
                                carUniqueCode = true;
                            }else{
                                carUniqueCode = false;
                            }
                            container.append(templateTbox({
                                "rows": self._dataSource[i],
                                "index": i,
                                "tServiceStatus": self._tServiceStatus,
                                "carUniqueCode" : carUniqueCode
                            }));
                            self.CurrentTuid = self._dataSource[i].tuid;
                            bfClient.getTboxUpdate({
                                data: {
                                    tuid: self._dataSource[i].tuid
                                },
                                success: function (data) {
                                    if (data.code == 0 && data.success == true && data.data.forceUpdate == false) {
                                        $("[data-type='tbox']").next(".Tbox-box").css("display", "block");
                                        if (data.data.upgradeStatus == "UPGRADING" && data.data.downloadCompleted == false) {
                                            var tempHtml = self.getElement("#tbox-updateing-template").html();
                                            tempHtml = _.template(tempHtml);
                                            var html = tempHtml(data.data);
                                            self.getElement(".Tbox-box").html(html);
                                            if(window.sessionStorage.ClearTimeout){
                                                window.sessionStorage.removeItem("ClearTimeout");
                                            }
                                            self.getUpdateProgress(self.CurrentTuid);
                                        } else if (data.data.upgradeStatus == "NOT_START") {
                                            var tempHtml = self.getElement("#tbox-update-template").html();
                                            tempHtml = _.template(tempHtml);
                                            var html = tempHtml(data.data);
                                            self.getElement(".Tbox-box").html(html);
                                        } else if (data.data.upgradeStatus == "UPGRADING" &&  data.data.downloadprogress==100) {
                                            /*
                                             * 下载完成之后的样式
                                             * */
                                            var tempHtml = self.getElement("#tbox-complate-template").html();
                                            tempHtml = _.template(tempHtml);
                                            var html = tempHtml(data.data);
                                            self.getElement(".Tbox-box").html(html);
                                        }
                                    } else {
                                        if (!data.msg) {
                                            return;
                                        }
                                        console.log("检查设备更新状态:" + data.msg);
                                    }
                                },
                                error: function (err) {
                                    console.log("设备检查更新失败");
                                }
                            });
                        }
                        else if (self._dataSource[i].deviceType == "obd") {
                            container.append(templateObd({"rows": self._dataSource[i], "index": i}));
                        }

                    }
                    container.setup();
                    self.deleteEquipmentBanding();
                } else {
                    self.getElement("#equiment-list").empty();
                    self._dataSource = [];
                }
            });

        };
        cls.setWifiPage=function () {
            if (window.lunxunJG) {
                window.sessionStorage.setItem("ClearTimeout","true");
            }
            bfNaviController.push("Laboratory/setWifi.html",{carId:this._carId})
        };
        cls.TboxUpBottom = function (el) {
            var me = this;
            var $ment = $(el.target);
            var taskId = $ment.attr("data-taskId");
            if (!taskId)  return;
            if ($ment.hasClass("downLoading")) {
                return;
            }
            bfClient.tboxUpdatePackageDownload({
                data: {
                    taskId: taskId
                },
                success: function (data) {
                    if (data.code == 0 && data.success == true) {
                        var tempHtml = me.getElement("#tbox-updateing-template").html();
                        tempHtml = _.template(tempHtml);
                        var html = tempHtml(data.data);
                        me.getElement(".Tbox-box").html(html);
                        me.getUpdateProgress(me.CurrentTuid);
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        });
                    }
                }, error: function (err) {
                    console.log("设备下载更新包接口失败");
                }
            });
        };
        cls.getUpdateProgress = function (tuid) {
            var me = this;
            window.lunxunJG = function () {
                bfClient.getTboxUpdate({
                    data: {
                        tuid: tuid
                    },
                    success: function (data) {
                        if (data.code == 0 && data.success == true) {
                            if (data.data.downloadprogress == 100) {/* && data.data.downloadCompleted == true*/
                                /*
                                 * 下载完成之后的样式
                                 * */
                                var tempHtml = me.getElement("#tbox-complate-template").html();
                                tempHtml = _.template(tempHtml);
                                var html = tempHtml(data.data);
                                me.getElement(".Tbox-box").html(html);
                                return;
                            }
                            me.getElement(".crrentJindu").css("width", data.data.downloadprogress + "%");
                            me.getElement("#jinduNum").html(data.data.downloadprogress + "%");
                            if (!window.sessionStorage.ClearTimeout) {
                                setTimeout(function () {
                                    window.lunxunJG();
                                }, 5000);
                            }
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }
                    }, error: function (err) {
                        console.log("获取固件下载状态失败");
                    }
                });
            };
            window.lunxunJG();
        };
        cls.comfirmUpdate = function (el) {
            var me = this;
            var $ment = $(el.target);
            if ($ment.hasClass("confirmEd")) {
                return;
            }
            var taskId = $ment.attr("data-taskId");
            bfClient.tboxUpdatePackageInstall({
                data: {
                    taskId: taskId
                },
                success: function (data) {
                    if (data.code == 0 && data.success == true) {
                        me.getElement("#comfirmInstall").addClass("confirmEd");
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        });
                    }
                }, error: function (err) {
                    console.log("确认安装更新失败");
                }
            });
        };
        cls.equimentActiveDialog = function () {
            var me = this;
            Alert.createDialog({
                closeBtn: false,
                buttons: {
                    '我知道了': function () {
                        this.close();
                    }
                },
                content: "请去4S店开通T业务"
            });
        };
        cls.checkTboxlevel = function () {
            var data = {tuid: ""};
            bfClient.getTboxUpdate({
                data: data,
                success: function () {

                },
                error: function () {

                }
            });
        };
        cls.comfirmDownload = function () {
            var data = {taskId: ""};
            bfClient.tboxUpdatePackageDownload({
                data: data,
                success: function () {

                },
                error: function () {

                }
            });
        };
        cls.comfirmInstall = function () {
            var data = {taskId: ""};
            bfClient.tboxUpdatePackageInstall({
                data: data,
                success: function () {

                },
                error: function () {

                }
            });
        };
        cls.deleteEquipmentBanding = function () {
            var self = this;
            var dialog = null;
            var longPressNode = self.getElement(".my-equipment");
            for (var inode = 0; inode < longPressNode.length; inode++) {
                (function (node) {
                    var hammer = new Hammer(node);
                    hammer.on('press', function (e) {
                        var target = $(e.currentTarget);
                        var tuid = $(node).attr("data-tuid");
                        var deviceType = $(node).attr("data-type");
                        if (deviceType == "tbox") {
                            Notification.show({
                                type: "info",
                                message: "该设备为tbox,不能解绑"
                            });
                        } else {
                            $(node).css("background-color", "#EAE8E8");
                            dialog = Alert.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '取消': function () {
                                        this.close()
                                    },
                                    '确定': function () {
                                        bfNaviController.push('cars/deleteEquipmentBanding.html', {
                                            tuid: tuid,
                                            from: "myTbox"
                                        });
                                        this.close();
                                    }
                                },
                                content: "是否取消设备绑定"
                            });
                        }

                    });
                })(longPressNode[inode]);
            }
        };
        cls.addEquipment = function () {
            var obj = {
                carId: this._carId,
                routeFrom: 'fromTbox'
            };
            bfNaviController.push('cars/equipmentBinding.html', obj);
        };
        cls.changeEquipmentState = function (event) {

            var self = this;
            var d = null;
            this._currentIndex = $(event.currentTarget).parent().attr("data-index");
            this._currentItem = $(event.currentTarget);
            d = Alert.createDialog({
                closeBtn: false,
                buttons: {
                    '取消': function () {
                        this.close();
                    },
                    '确定': function () {
                        self.passWord = d.$el.find('#ui-dialog-input').val();
                        self.confirm_to_change();
                        this.close(); //有逻辑最好放在关闭之前
                    }
                },
                content: '请输入密码' + '<div>< type="password" class="ui-dialog-input" id="ui-dialog-input" style="width:240px; position:relative; height:40px; margin:10px auto; overflow:hidden; border:1px solid #dadada;) no-repeat;"/></div>',
                title: "提示"
            });
        };
        cls.confirm_to_change = function () {
            var self = this;
            var k = this.passWord;
            if (k != bfDataCenter.getUserPass()) {

                Notification.show({type: "error", message: "密码错误"});
                return;
            }
            bfClient.updateDeviceState({
                carId: this._carId,
                id: self._dataSource[self._currentIndex].tuid,
                active: self._dataSource[self._currentIndex].status == "active" ? 0 : 1,
                password: k
            }, function (data) {

                if (self._dataSource[self._currentIndex].status == "active") {

                    self._currentItem.children().animate({'margin-left': '21px'}, 200);
                    self._currentItem.css("background-color", "#c3c3c3");
                    self._dataSource[self._currentIndex].status = "inactive";
                } else {

                    self._currentItem.children().animate({'margin-left': '4px'}, 200);
                    self._currentItem.css("background-color", "#06d894");
                    self._dataSource[self._currentIndex].status = "active";
                }
                Notification.show({type: "well", message: "更新设备状态成功"});
            });
        }
        cls.onLeft = function () {
            if (window.lunxunJG) {
                window.sessionStorage.setItem("ClearTimeout","true");
            }
            if (this._dataSource) {
                bfNaviController.pop(1, {
                    munber: this._dataSource.length == 0 ? 'noDevice' : this._dataSource.length,
                    from: "device"
                });
            } else {
                bfNaviController.pop(1);
            }
        }
        return Base.extend(cls);
    }
);

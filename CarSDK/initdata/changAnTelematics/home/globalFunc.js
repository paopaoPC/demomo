define(
    [
        'zepto',
        "shared/plugin_dialog/js/dialog",
        'common/osUtil',
        'common/ssUtil',
        'common/imageSet',
        "shared/js/notification",
        "map/map-client",
        'main/Plugins',
        "common/disUtil"
    ],
    function (zepto, dialog, osUtil, ssUtil, ImageSet, Notification, MapClient, Plugins, disUtil) {

        /**
         * 原生交互全局方法
         *
         * */
        RenderCarControl = function (data) {
            var mainView = bfNaviController._getView(0).view;
            var homeView = mainView.homeTab;
            // homeView.model.set({
            //     door:{
            //         LF:parseInt(data.leftFrontDoor),
            //         LB:parseInt(data.leftRearDoor),
            //         RF:parseInt(data.rightFrontDoor),
            //         RB:parseInt(data.rightRearDoor),
            //     },
            //     control:{
            //         air:parseInt(data.air.status),
            //         door:parseInt(data.leftFrontDoorLock)
            //             ||parseInt(data.leftRearDoorLock)
            //             ||parseInt(data.rightFrontDoorLock)
            //             ||parseInt(data.rightRearDoorLock)
            //             ||parseInt(data.trunk),
            //         whistle:0,
            //         dormer:parseInt(data.sunroof),
            //     },
            // })
            var carId = bfDataCenter.getCarId();
            homeView.updateControlstatus(carId);
        }
        SendLogInfo = function (errorData) {
            var data = {
                url: errorData.url,
                lineNum: errorData.lineNum,
                errorStatck: errorData.errorStatck,
                phoneType: errorData.phoneType
            };
            data.token = window.localStorage.token;
            if (typeof (device) != "undefined") {
                navigator.appInfo.getVersion(function (data) {
                    window.localStorage.setItem("currentVersion", data);
                });
                if (!data.osSystem) {
                    data.osSystem = device.platform;
                    data.osVersion = device.version;
                }
                data.appVersion = window.localStorage.currentVersion;
            }
            console.log("LogInfo:");
            console.log(data);
            window.localStorage.setItem("crashInfo", JSON.stringify(data));
            $.ajax({
                data: data,
                url: bfConfig.server + "/appserver/api/free/log",
                type: "POST",
                timeout: 15000,
                dataType: "json",
                success: function (req) {
                    window.localStorage.removeItem("crashInfo");
                    console.log("日志上传成功");
                },
                error: function (error) {
                    console.log(error);
                }
            });
        };
        /**
         * 原生调用的远程控制指令
         * cmd
         * pin
         * **/
        RemoteControlFunc = function (Postdata) {
            //  OSApp.showStatus("success",'调用了几次'); 
            if (!Postdata) {
                return;
            }
            // alert(Postdata)
            // Postdata=JSON.stringify(Postdata) 
            // OSApp.showStatus("success",Postdata); 
            // Postdata=JSON.parse(Postdata)
            var controlFunc = function () {
                //1
                //  OSApp.showStatus("success",'1'); 
                //如果操作正在进行，不做任何操作
                if (bfDataCenter.getUserSessionValue('canOperate') == null) {
                    bfDataCenter.setUserSessionValue('canOperate', 'true');
                }
                // var canOperate = bfDataCenter.getUserSessionValue('canOperate');
                // if (canOperate == 'false') {
                //     navigator.appInfo.showStatus("请等待上一条指令执行结束，再操作");
                //     return;
                // }
                Postdata.phoneType = "";
                Postdata.phoneId = "";
                if (!Postdata.pin) {
                    Postdata.pin = "";
                }
                Postdata.carId = bfDataCenter.getCarId();
                if (window.device) {
                    Postdata.phoneType = window.device.model;
                    Postdata.phoneId = window.device.uuid;
                }
                //1         Postdata.phoneId = "";
                if (!Postdata.pin) {
                    Postdata.pin = "";
                }
                Postdata.carId = bfDataCenter.getCarId();
                if (window.device) {
                    Postdata.phoneType = window.device.model;
                    Postdata.phoneId = window.device.uuid;
                }
                //1
              
                //  OSApp.showStatus("success",JSON.stringify(Postdata)); 
                 //1
                // Plugins.callFunc({
                    bfClient.controlCar({
                    // Func: "carControl",
                    data: Postdata,
                    success: function (data) {
                        //---
                         //1
                            // OSApp.showStatus("success",'3');
                    	// require("deviceone").print(data.success);
                        if (data.code == 0 && data.success == true) {

                            bfDataCenter.setUserSessionValue('canOperate', 'false');  //让指令不可再执行
                            // navigator.appInfo.showStatus("发送成功，请耐心等待~~");
                            OSApp.showStatus("success","发送成功，请耐心等待~~");
                            var id = data.data.requestId;
                            var taskId = data.data.taskId;
                            var requestOperationResult = null;
                            if(Postdata.cmd == "SendToCar"){
                                return;
                            }
                            requestOperationResult = function () {
                                //1
                                bfClient.getControlInfoByTaskId({
                                // Plugins.callFunc({
                                    data: {
                                        "id": id,
                                        "taskId": taskId
                                    },
                                    // Func: "getControlInfoByTaskId",
                                    success: function (data) {
                                        var reqdata = data.data;
                                        //Completed代表成功，Runing代表等待，SendFailure代表失败
                                        if (reqdata.handleStatus == "Completed") {
                                            //让远程控制可操作
                                            // navigator.appInfo.showStatus("操作成功~~");
                                            OSApp.showStatus("success","操作成功~~");
                                            bfDataCenter.setUserSessionValue('canOperate', 'true');
                                        } else if (reqdata.handleStatus == "Runing" || reqdata.handleStatus == "Initialized") {
                                            setTimeout(requestOperationResult, 5000);
                                        } else {
                                            //让远程控制可操作
                                            bfDataCenter.setUserSessionValue('canOperate', 'true');
                                            if (reqdata.resultDesc) {
                                                // navigator.appInfo.showStatus("error", reqdata.resultDesc);
                                                OSApp.showStatus("error", reqdata.resultDesc);
                                                return;
                                            }
                                            // navigator.appInfo.showStatus("error", "操作失败~~");
                                            OSApp.showStatus("error", "操作失败~~");
                                        }
                                    }, error: function (err) {
                                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                                        // navigator.appInfo.showStatus("error", "操作失败~~");
                                        OSApp.showStatus("error", "操作失败~~");

                                    }
                                });
                            };
                            requestOperationResult();
                        }
                        else if (data.code == 7) {
                            // navigator.appInfo.showStatus("error", data.msg);
                            OSApp.showStatus("error", data.msg);
                            bfDataCenter.setUserSessionValue('canOperate', 'true');
                        }
                        else if (data.code == 3) {
                            //self._canUpCarCondition = true;
                            ssUtil.clear("controlTime");
                            // navigator.packaging.showPinInput({"function": "RemoteControlFunc"});  //TODO 弹出 PIN码输入框
                            OSApp.showPinInput("RemoteControlFunc")
                        }
                        else if (data.code == 1004) {
                            bfDataCenter.setUserSessionValue('canOperate', 'true');
                            bfDataCenter.setUserSessionValue('canGetNearest', 'true');
                            // navigator.packaging.showAuthCodeInput({"function": "controlAuthMethod"});  //TODO 弹出 短信验证码框
                            OSApp.showAuthCodeView("controlAuthMethod")
                            window.sessionStorage.setItem("SendToCarFlag", "true");
                        } else {
                            // navigator.appInfo.showStatus("error", data.msg);
                            OSApp.showStatus("error", data.msg);
                            bfDataCenter.setUserSessionValue('canOperate', 'true');
                        }
                    }, error: function (error) {
                        // navigator.appInfo.showStatus("指令发送失败");
                        OSApp.showStatus("error","指令发送失败");
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                    }
                });
            }
            if (!bfDataCenter.getPinCode()) {
                //本地存储没有，对服务器拉取
                //1
                //  OSApp.showStatus("success",'4'); 
                bfClient.getPinCode({
                    type: 'post',
                    data: {carId: bfDataCenter.getCarId()},
                    success: function (data) {
                        if (data.code == 0) {
                            //1
                            // OSApp.showStatus("success",'2'); 
                            bfDataCenter.setPinCode('true');
                            controlFunc();
                        }
                        else {
                            // navigator.appInfo.showStatus("error", "控车码还没有设置，请先设置控车码");
                            OSApp.showStatus("error", "控车码还没有设置，请先设置控车码");
                        }
                    },
                    error: function (error) {
                        // navigator.appInfo.showStatus("error", "操作失败");
                        OSApp.showStatus("error", "操作失败");
                    }
                });
            }
            else {
                //1
                //  OSApp.showStatus("success",'5'); 
                controlFunc();
            }
        };

        TransitOn = function () {
            var htmlDom = "<div id='TransitDom' style='background-image: url(../whatsnew/loading.jpg);position: absolute;z-index: 10000;width: 100%;top: 0;bottom: 0;background-size: 100% 100%;background-repeat: no-repeat;'></div>";
            $("body").append(htmlDom);
        };
        TransitOff = function () {
            if($("#TransitDom").length){
                $("#TransitDom").remove();
            }
        };

        getConfigUrl = function () {
            var url = window.localStorage['BaseUrl'];
            var isNev = window.localStorage['isNev'];
            if (navigator.packaging) {
                navigator.packaging.setBaseUrl({
                    baseUrl: url,
                    isNev: isNev
                }, function () {
                }, function () {
                });
            }
        }
        openPage = function (page) {
            var jsonObj = page;
            var pageName = jsonObj.page;
            var value = jsonObj.value;
            if (pageName == "carlocation") {
                var data = {};
                data.showControl = bfDataCenter.getCarDevice() != null && bfDataCenter.getCarDevice() == 'obd' ? "false" : "true";
                // navigator.appInfo.openCarLocationView(data);
                // OSApp.openCarLocationView(data);
                // alert(JSON.stringify(data));
                data=JSON.stringify(data);
                OSApp.openCarLocationView(data);
                setTimeout(refreshCarLocation(),500);
//                osUtil.delayCall(function () {
//                    refreshCarLocation();
//                });
            } else if (pageName == "message") {
                TransitOn();
                navigator.appInfo.popToRootView();
                butterfly.navigate("toolkit/test.html");
            } else if (pageName == "control") {
                TransitOn();
                navigator.appInfo.popToRootView();
                butterfly.navigate("control/controlHistory.html");
            } else if (pageName == 'logonout') {
                /**
                 * 同一帐号多个手机同时登录，则之前的会被挤掉
                 **/
                loginOut();
            } else if (pageName.indexOf("myTboxEquipment") != -1) {
                //var pos = pageName.indexOf('carId=');
                //var carId =  pageName.substring(pos+6,page.length);
                var carId = value;
                TransitOn();
                navigator.appInfo.popToRootView();
                console.log("page:" + pageName);
                console.log("carId:" + carId);
                bfNaviController.push(pageName, {"carId":carId,"carUniqueCode":bfDataCenter.getUserValue("carUniqueCode")});
            } else {
                TransitOn();
                navigator.appInfo.popToRootView();
                bfNaviController.push(pageName, value);
            }
            osUtil.delayCall(function () {
                //if (typeof cordova != "undefined") {
                //    navigator.appInfo.goToMain();
                //}
                TransitOff();
            }, 1000);
        }
        deviceId = function () {
            bfClient.compareDeviceId({
                success:function () {
                    if(data.OK){
                        if(!data.data){
                            loginOut();
                        }
                    }
                }
            })
        };
        loginOut = function () {
            var netLoadingHUD = $('#netLoadingHUD');
            var uiAddChrysanthemum = function () {
                if (netLoadingHUD.find('.chrysanthemum').length === 0) {
                    netLoadingHUD.append("<div id='chrysanthemumWarp'  style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active'><div></div><div style='font-size: 14px;color: white;margin-top: 50px;text-align: center;'>加载中...</div></div></div>");
                }
            }
            var uiRemoveChrysanthemum = function () {
                netLoadingHUD.find('#chrysanthemumWarp').remove();
            }
            if(!window.localStorage['isLogin']){
                return;
            }
            if(navigator.packaging){
                uiAddChrysanthemum();
                navigator.packaging.logout(
                    {token: window.localStorage.token},
                    function (data) {
                        if (data.code == 0) {
                            navigator.appInfo.popToRootView();
                            window.localStorage.removeItem("token");
                            window.localStorage.removeItem("password");
                            window.localStorage.removeItem("isLogin");
                            window.hasChangeCar = true;
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }
                        uiRemoveChrysanthemum();
                        dialog.createDialog({
                            closeBtn: false,
                            buttons: {
                                '确定': function () {
                                    bfAPP.gotoLogin();
                                    this.close();
                                },
                            },
                            content: "此账户已在其他设备登录"
                        });
                    },
                    function (error) {
                        var eMsg = '发生未知错误';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "网络开小差";
                        }
                        uiRemoveChrysanthemum();
                        Notification.show({
                            type: "error",
                            message: eMsg
                        });
                    });
                return;
            };
            bfClient.userLogout(function (data) {
                if (data.OK) {
                    window.localStorage.removeItem("token");
                    window.localStorage.removeItem("password");
                    window.localStorage.removeItem("isLogin");
                    window.hasChangeCar = true;
                    dialog.createDialog({
                        closeBtn: false,
                        buttons: {
                            '确定': function () {
                                bfAPP.gotoLogin();
                                this.close();
                            },
                        },
                        content: "此账户已在其他设备登录"
                    });
                    // navigator.appInfo.LogoutIM();
                } else {
                    Notification.show({
                        type: "error",
                        message: data.msg
                    });
                }
            });
        }
        keepLink = function (groupId) {
            bfClient.keepLink({
                data: {groupId: groupId},
                success: function (data) {

                },
                error: function (error) {

                }
            })
        }

        createTeam = function (groupName) {
            bfClient.createTeam({
                data: {carId: bfDataCenter.getCarId(), name: groupName},
                success: function (data) {
                    navigator.appInfo.createTeamSuccess(data);
                },
                error: function (error) {
                    // navigator.appInfo.showStatus("error", "创建队伍失败");
                    OSApp.showStatus("error", "创建队伍失败");

                }
            });
        }
        memberAddTeam = function (groupId, extUserId) {
            var carId = bfDataCenter.getCarId();
            if (!carId) {
                // navigator.appInfo.showStatus("error", "当前用户暂无车辆");
                OSApp.showStatus("error", "当前用户暂无车辆");
                return ;
            };
            bfClient.memberAddTeam({
                data: {carId: carId, groupId: groupId, extUserId: extUserId},
                success: function (data) {
                    navigator.appInfo.joinTeam(data);
                },
                error: function (error) {
                    // navigator.appInfo.showStatus("error", "加入失败");
                    OSApp.showStatus("error", "加入失败");
                }
            });
        }
        memberOutTeam = function (groupId, carId, extUserId) {
            bfClient.memberOutTeam({
                data: {carId: carId, groupId: groupId, extUserId: extUserId},
                success: function (data) {
                    navigator.appInfo.quitTeam(data);
                },
                error: function (error) {
                    // navigator.appInfo.showStatus("error", "退群失败");
                    OSApp.showStatus("error", "退群失败");

                }
            });
        }
        //解散群
        removeTeam = function (groupId, adminUserId) {
            bfClient.removeTeam({
                data: {groupId: groupId, adminUserId: adminUserId},
                success: function (data) {
                    navigator.appInfo.removeTeam(data);
                },
                error: function (error) {
                    // navigator.appInfo.showStatus("error", "解散群失败");
                    OSApp.showStatus("error", "解散群失败");
                }
            })
        }
        //更新群的目的地坐标或群公告
        updateTeam = function (extGroupId, notice, destinationWgs) {
            if (notice == '') {
                notice = null;
            }
            if (destinationWgs == '') {
                destinationWgs = null;
            }
            bfClient.updateTeam({
                data: {extGroupId: extGroupId, notice: notice, destinationWgs: destinationWgs},
                success: function (data) {
                    navigator.appInfo.updateTeam(data)
                },
                error: function (error) {
                    // navigator.appInfo.showStatus("error", "更新失败");
                    OSApp.showStatus("error", "更新失败");
                }
            })
        }
        acceptMsg = function (groupId) {
            bfClient.acceptMsg({
                data: {carId: bfDataCenter.getCarId(), groupId: groupId},
                success: function (data) {
                },
                error: function (error) {
                }
            });
        }
        frobiddenMsg = function (groupId) {
            bfClient.frobiddenMsg({
                data: {carId: bfDataCenter.getCarId(), groupId: groupId},
                success: function (data) {
                },
                error: function (error) {
                }
            });
        }
        getAllTeamMember = function (groupId) {
            bfClient.getAllTeamMember({
                data: {groupId: groupId},
                success: function (data) {
                    if (data.code == 0) {
                        for (var i = 0, len = (data.data.teamMember && data.data.teamMember.length || 0); i < len; i++) {
                            if (data.data.teamMember[i].faceimg) {
                                data.data.teamMember[i].faceimg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + data.data.teamMember[i].faceimg;
                            }
                        }
                        navigator.appInfo.getAllTeamMember(data);
                    } else if (data.code == 3) {
                        // navigator.appInfo.showStatus("error", "没有数据");
                        OSApp.showStatus("error", "没有数据");
                    }
                },
                error: function (error) {
                }
            })
        }
        LoginIM = function () {
            var data = {};
            var imPassword = window.localStorage.getItem("imPassWord");
            var imUserId = window.localStorage.getItem("imUserId");
            if (imUserId && imPassword) {
                data.imPassword = imPassword;
                data.imUserId = imUserId;
                navigator.appInfo.LoginIM(data);
            }
        }
        refreshCarLocation = function (what) {

            if (!what || what === "car")
            // Car position
            {
                // alert('传入数据'+bfDataCenter.getCarId());
                bfClient.getCarLocation({
                    data: {carId: bfDataCenter.getCarId()},
                    success: function (data) {
                        if (data.code == 0) {
                            // navigator.appInfo.refreshCarLocationView({
                            //     carLocation: {
                            //         lat: data.data.lat + "",
                            //         lng: data.data.lng + "",
                            //         addr: data.data.addrDesc,
                            //         gpsTime: data.data.gpsTime ? data.data.gpsTime : "",
                            //         heading: data.data.heading == null ? 0.00 : data.data.heading,
                            //         centered: what === "car"
                            //     },
                            //     carState: data.data.status == 1 ? "on" : "off"
                            // });
                            // alert(JSON.stringify(data));
                            var locationCar={
                                carLocation: {
                                    lat: data.data.lat + "",
                                    lng: data.data.lng + "",
                                    addr: data.data.addrDesc,
                                    gpsTime: data.data.gpsTime ? data.data.gpsTime : "",
                                    heading: data.data.heading == null ? 0.00 : data.data.heading,
                                    centered: what === "car"
                                },
                                carState: data.data.status == 1 ? "on" : "off"
                            }
                            OSApp.refreshLocation(JSON.stringify(locationCar));
                             
                        }
                        else {
                            // navigator.appInfo.showStatus("error", "刷新位置失败");
                            // navigator.appInfo.getCarError({data: "error"})
                            OSApp.getCarError()
                        }
                    },
                    error: function (error) {
                        // alert('错误')
                        // alert(JSON.stringify(data));
                        // navigator.appInfo.getCarError({data: "error"})
                        OSApp.getCarError()
                    }
                });
            }
        };
        setElectFenceDatasTemp = function (fenceName,fenceId) {
          bfClient.setFenceTemp(fenceName,fenceId,bfDataCenter.getCarId(),
                function (data) {
                    if (data.code == 0) {
                    } else {}
                    

                }, function (error) {
                   
                }
            )
      };
        setElectFenceDatas = function (fenceName,fenceId,diastance, lng, lat, notifyPhone, notifyType, status) {
            if (!notifyPhone) {
                notifyPhone = bfDataCenter.getUserMobile();
            };
            bfClient.setFence(fenceName,fenceId,bfDataCenter.getCarId(), diastance, lat, lng, notifyPhone, notifyType, status,
                function (data) {
                    if (data.code == 0) {
                    //    alert(typeof(data.data.fenceId))
                        // navigator.appInfo.fenceIdSuccess(data.data.fenceId);
                        OSApp.fenceFirstSaved(data.data.fenceId);
                        setElectFenceDatasTemp(fenceName,data.data.fenceId)
                        // navigator.appInfo.showStatus("success", "设置围栏成功");
                        OSApp.showStatus("success", "设置围栏成功");

                    } else {
                        // navigator.appInfo.showStatus("error", data.msg);
                        OSApp.showStatus("error", data.msg);

                    }

                }, function (error) {
                    // navigator.appInfo.showStatus("error", "设置围栏失败");
                    OSApp.showStatus("error", "设置围栏失败");
                }
            );
        };
        getFencelist = function(){
//        	 OSApp.showStatus("error", "11");
            bfClient.getFencelist(bfDataCenter.getCarId(),
            function(data){
//            	  OSApp.showStatus("error", "123213212131");
                if (data.code == 0 || data.code == 3) {
//                	OSApp.showStatus("success", JSON.stringify(data.data)); 
                    // navigator.appInfo.fenceList(data.data) 
                    var paramFenceList;
                    if(data.data==null){
                     paramFenceList=null;   
                    }else{
                     paramFenceList=JSON.stringify(data.data);   
                    }               		
                    OSApp.getEfenceList(paramFenceList)
                }else{
                    // navigator.appInfo.showStatus("error", data.msg);
                    OSApp.showStatus("error", data.msg);
                }
            },
            function(error){
           	  OSApp.showStatus("error", "error");
            })
        }
        getElectFenceDatas = function () {
            var fradius = 0, flng = 0, flat = 0, notifyType = "", status = "ACTIVE", notifyPhone = bfDataCenter.getUserName();
            bfClient.getFence(bfDataCenter.getCarId(), function (data) {
                    if (data.code == 0) {
                        var lng = data.data.point.split(",")[0];
                        var lat = data.data.point.split(",")[1];
                        notifyPhone = data.data.notifyPhone;
                        notifyType = data.data.notifyType;
                        status = data.data.status;
                        flat = lat;
                        flng = lng;
                        fradius = data.data.distance;
                        var fenceCahce = {
                            "fradius": fradius,
                            "flat": flat,
                            "flng": flng,
                            "notifyPhone": notifyPhone,
                            "notifyType": notifyType,
                            "status": status
          }
                    }
                    // navigator.appInfo.getFenceDatas({
                    //     fradius: fradius,
                    //     flat: flat,
                    //     flng: flng,
                    //     notifyType: notifyType,
                    //     notifyPhone: notifyPhone,
                    //     status: status
                    // });
                    var getEfenceDataParams={
                        fradius: fradius,
                        flat: flat,
                        flng: flng,
                        notifyType: notifyType,
                        notifyPhone: notifyPhone,
                        status: status
                    }
                    OSApp.getEfenceDataModel(JSON.stringify(getEfenceDataParams));
                }, function (error) {
                    // navigator.appInfo.showStatus("error", "围栏获取失败");
                    OSApp.showStatus("error", "围栏获取失败");
                }
            );

            if (flat != 0)
                // navigator.appInfo.getFenceDatas({
                //     fradius: fradius,
                //     flat: flat,
                //     flng: flng,
                //     notifyType: notifyType,
                //     notifyPhone: notifyPhone,
                //     status: status
                // });
                var getEfenceDataParams2={
                    fradius: fradius,
                    flat: flat,
                    flng: flng,
                    notifyType: notifyType,
                    notifyPhone: notifyPhone,
                    status: status
                }
                OSApp.getEfenceDataModel(JSON.stringify(getEfenceDataParams2));
        };
        cancelFence = function (fenceId) {

            bfClient.cancelFence(fenceId,bfDataCenter.getCarId(), function (data) {
                    if (data.code == 0) {
                        // navigator.appInfo.showStatus("success", "删除成功");
                        OSApp.showStatus("success", "删除成功");
                    } else {
                        // navigator.appInfo.showStatus("error", "删除失败");
                        OSApp.showStatus("error", "删除失败");
                    }

                }, function (error) {
                    // navigator.appInfo.showStatus("error", "删除失败");
                    OSApp.showStatus("error", "删除失败");
                }
            );

        };
        controlMl = function () {

            if (ssUtil.load('operTime') != null) {
                var time = ssUtil.load('operTime');
                var now = new Date().getTime();
                if (now - time > 180000) {
                    bfDataCenter.setUserSessionValue('canOperate', 'true');
                    bfDataCenter.setUserSessionValue('canGetNearest', 'true');
                    ssUtil.save('operTime', now);
                }
            }
            else {
                var now = new Date().getTime();
                ssUtil.save('operTime', now);
            }
            //如果操作正在进行，不做任何操作
            if (bfDataCenter.getUserSessionValue('canOperate') == null) {
                bfDataCenter.setUserSessionValue('canOperate', 'true');
            }

            // var canOperate = bfDataCenter.getUserSessionValue('canOperate');
            // if (canOperate == 'false') {
            //     navigator.appInfo.showStatus("正在发送指令，请等待~");
            //     return;
            // }

            // navigator.appInfo.startCarLocationViewPassword();
        };
        var updatingCarStateTimer = null;

        startUpdatingCarState = function () {
            if (updatingCarStateTimer !== null) {
                return;
            }
            updatingCarStateTimer = setInterval(function () {
                    refreshCarLocation();
                },
                30000);
        };

        stopUpdatingCarState = function () {
            if (updatingCarStateTimer !== null) {
                clearInterval(updatingCarStateTimer);
                updatingCarStateTimer = null;
            }
        };

        onControlCarLocation = function (cmd) {
            //如果没有设置Pin码，跳转到设置Pin码的页面
            if (!bfDataCenter.getPinCode()) {
                //本地存储没有，对服务器拉取
                bfClient.getPinCode({
                    type: 'post',
                    data: {carId: bfDataCenter.getCarId()},
                    success: function (data) {
                        if (data.code == 0) {
                            bfDataCenter.setPinCode('true');
                            onConfirmCarLocation("", cmd);
                        }
                        else {
                            // navigator.appInfo.showStatus("error", "控车码还没有设置，请先设置控车码");
                            OSApp.showStatus("error", "控车码还没有设置，请先设置控车码");

                        }
                    },
                    error: function (error) {
                        // navigator.appInfo.showStatus("error", "操作失败");
                        OSApp.showStatus("error", "操作失败");
                    }
                });
            }
            else {
                onConfirmCarLocation("", cmd);
            }
        };

        onConfirmCarLocation = function (pin, cmd) {
            if (pin.length == 0) {
                pin = "";
            }
            //如果操作正在进行，不做任何操作
            if (bfDataCenter.getUserSessionValue('canOperate') == null) {
                bfDataCenter.setUserSessionValue('canOperate', 'true');
            }
            // var canOperate = bfDataCenter.getUserSessionValue('canOperate');
            // if (canOperate == 'false') {
            //     navigator.appInfo.showStatus("请等待上一条指令执行结束，再操作");
            //     return;
            // }
            // var operate = "RemoteSearchCar";
            var phoneType = "";
            var phoneId = "";
            if (window.device) {
                phoneType = window.device.model;
                phoneId = window.device.uuid;
            }
            //11
            // Plugins.callFunc({
                bfClient.controlCar({
                // Func: "carControl",
                data: {
                    'cmd': cmd,
                    'phoneType': phoneType,
                    'phoneId': phoneId,
                    'carId': bfDataCenter.getCarId(),
                    'pin': pin
                },
                success: function (data) {
                    if (data.code == 0) {
                        // navigator.appInfo.showCarLocationViewLoading();
                        OSApp.showCarLocationViewLoading()
                        bfDataCenter.setUserSessionValue('canOperate', 'false');
                        // navigator.appInfo.showStatus("发送成功，请耐心等待~~");
                        OSApp.showStatus("success","发送成功，请耐心等待~~");
                        var id = data.data.requestId;
                        var requestOperationResult = null;
                        requestOperationResult = function () {
                     // Plugins.callFunc({
                                bfClient.getControlInfo({
                                // Func: "getCarControlInfo",
                                data: {
                                    "id": id,
                                    "carId": bfDataCenter.getCarId()
                                },
                                success: function (Rdata) {
                                    data = Rdata.data;
                                    //Completed代表成功，Runing代表等待，SendFailure代表失败
                                    if (data.handleStatus == "Completed") {
                                        //让远程控制可操作
                                        // navigator.appInfo.showStatus("指令执行成功~~");
                                        OSApp.showStatus("success","指令执行成功~~");

                                        // navigator.appInfo.stopCarLocationViewLoading();
                                        OSApp.stopCarLocationViewLoading();
                                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                                    } else if (data.handleStatus == "Runing") {
                                        setTimeout(requestOperationResult, 5000);
                                    } else {
                                        //让远程控制可操作
                                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                                        // navigator.appInfo.showStatus("error", Rdata.msg);
                                        OSApp.showStatus("error", Rdata.msg);
                                        // navigator.appInfo.stopCarLocationViewLoading();
                                       OSApp.stopCarLocationViewLoading();
                                    }
                                }, error: function () {
                                    bfDataCenter.setUserSessionValue('canOperate', 'true');
                                    // navigator.appInfo.showStatus("error", "获取指令执行结果失败");
                                    OSApp.showStatus("error", "获取指令执行结果失败");
                                    // navigator.appInfo.stopCarLocationViewLoading();
                                    OSApp.stopCarLocationViewLoading();
                                }
                            });
                        };
                        requestOperationResult();
                    }
                    else if (data.code == 7) {
                        // navigator.appInfo.showStatus("error", data.msg);
                        OSApp.showStatus("error", data.msg);
                        // navigator.appInfo.stopCarLocationViewLoading();
                        OSApp.stopCarLocationViewLoading();
                    }
                    else if (data.code == 3) {
                        //self._canUpCarCondition = true;
                        ssUtil.clear("controlTime");
                        navigator.appInfo.showPinDialog();
                    }
                    else if (data.code == 1004) {
                        // navigator.appInfo.stopCarLocationViewLoading();
                        OSApp.stopCarLocationViewLoading();
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetNearest', 'true');
                        navigator.appInfo.showConfirmDilaog();
                    }
                }, error: function () {
                    // navigator.appInfo.stopCarLocationViewLoading();
                    // navigator.appInfo.showStatus("error", "服务器开小差");
                    OSApp.showStatus("error", "服务器开小差");
                }
            });
        };
        controlAuthMethod = function (authCode) {
            bfClient.controlAuth({
                data: {
                    authCode: authCode,
                    carId: bfDataCenter.getCarId()
                },
                success: function (req) {
                    if (req.success) {
                        bfDataCenter.setUserSessionValue('canOperate', 'true');
                        bfDataCenter.setUserSessionValue('canGetNearest', 'true');
                        if (window.sessionStorage.SendToCarFlag) {
                            window.sessionStorage.removeItem("SendToCarFlag");
                            // navigator.packaging.showPinInput({"function": "RemoteControlFunc"});  //TODO 弹出 PIN码输入框
                            OSApp.showPinInput("RemoteControlFunc")
                            return;
                        }
                        // navigator.appInfo.confirmDialogClose();
                        setTimeout(function () {
                            navigator.appInfo.showPinDialog();
                        }, 100);
                    } else {
                        window.sessionStorage.removeItem("SendToCarFlag");
                        // navigator.appInfo.showStatus("error", req.msg);
                        OSApp.showStatus("error", req.msg);
                    }
                },
                error: function (err) {
                    window.sessionStorage.removeItem("SendToCarFlag");
                    // navigator.appInfo.showStatus("error", "服务器开小差");
                    OSApp.showStatus("error", "服务器开小差");
                }
            });
        };
        //发送验证码
        sentCode = function (code, imageId) {

            bfClient.sendAuthcode({
                type: 'post',
                data: {
                    'mobile': window.localStorage.userMobile,
                    'imageCode': code,
                    'imageId': imageId,
                    'usage': "updatePhone"
                },
                success: function (data) {
                    if (data.code == 0) {
                        OSApp.startCuntDown();
                    } else {
//                   OSApp.startCuntDown();
                        OSApp.showStatus("error", data.msg);
                    }
                }
            });
        };
        //获取图片验证码
        getImageCode = function () {
            var imageData = {};
            bfClient.getImageCode({
                type: "post",
                success: function (data) {
                    if (data.code == 0) {
                        imageData.imageCode = data.data.code;
                        imageData.imageId = data.data.id;
                    } else {
                        // navigator.appInfo.showStatus("error", "获取图片验证码失败");
                        OSApp.showStatus("error", "获取图片验证码失败");
                    }
                    // navigator.appInfo.updateImageCode(imageData, function () {
                    // }, function () {
                    // });
                    imageData=JSON.stringify(imageData);
                    OSApp.updateImageCode(imageData)
                },
                error: function (data) {
                    // navigator.appInfo.updateImageCode(imageData, function () {
                    // }, function () {
                    // });
                    imageData=JSON.stringify(imageData);
                    OSApp.updateImageCode(imageData)
                    // navigator.appInfo.showStatus("error", "获取图片验证码失败");
                    OSApp.showStatus("error", "获取图片验证码失败");

                }
            });
        };
        GlobalgetBaseUrl = function () {
            var GYfunc = function (server) {
                bfConfig.server = server;
                var isNev = window.localStorage['isNev'];
                if (typeof cordova != "undefined") {
                    navigator.packaging.setBaseUrl({
                        baseUrl: bfConfig.server,
                        isNev: isNev
                    }, function () {
                        console.log("设置主机成功");
                    }, function () {
                        console.log("设置主机失败");
                    });
                } else {
                    console.log("原生壳未加载");
                }
            };
            $.ajax({
                url: bfConfig.server + "/app/api/1.0/server/host?loginName=" + window.localStorage.userMobile,
                type: 'get',
                data: {},
                timeout:5000,
                success: function (data) {
                    if (data.code == "0" && data.success == true && data.data.serverHost != window.localStorage.BaseUrl) {
                        window.localStorage.setItem("BaseUrl", data.data.serverHost);
                        GYfunc(data.data.serverHost);
                    }
                },
                error: function () {
                    console.log("请求服务器连接失败");
                }
            });
        }

        openExtraUrl=function(URL,titleText,options){
          if (typeof cordova == "undefined") {
              return;
          }
          if(!options){
            var options = {}
          }
          var obj = {
              statusbar: {
                  color: '#00000000'
              },
              toolbar: {
                  height: 44,
                  color: '#ffffff'
              },
              title: {
                  color: '#000000',
                  showPageTitle: true,
                  staticText: titleText
              },
              closeButton: {
                  image: 'close',
                  imagePressed: 'close_pressed',
                  align: 'left',
                  event: 'closePressed'
              },
              backButtonCanClose: true
          };
          if (options.shared) {
              obj.customButtons = [{
                  image: 'shared',
                  // imagePressed: 'jiantou_on',
                  align: 'right',
                  event: 'sharePressed'
              }]
          }

          cordova.ThemeableBrowser.open(URL, '_blank', obj)
          .addEventListener('backPressed', function(e) {
              console.log('back pressed');
          }).addEventListener('helloPressed', function(e) {
              console.log('hello pressed');
          }).addEventListener('sharePressed', function(e) {
              options.clickShared && options.clickShared();
          }).addEventListener(cordova.ThemeableBrowser.EVT_ERR, function(e) {
              console.error(e.message);
          }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, function(e) {
              console.log(e.message);
          });
        }
    }
);

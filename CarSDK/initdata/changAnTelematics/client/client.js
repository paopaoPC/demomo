define(['shared/js/client', "butterfly/extend", "shared/js/notification", "client/control-client", "main/Plugins"], function (BaseClient, extend, Notification, control, Plugin) {

    var Client = function () {
    };
    Client.extend = extend;
    var cls = Client.prototype;
    cls.MAINTAIN_HISTORY_URL = "/appserver/api/maintenance/getMyCarMaintenance";
    cls.path_getDealerInfoByParams = bfConfig.server + "/appserver/api/dealer/browse";
    cls.GET_CONTROL_LIST = bfConfig.server + "/appserver/api/car/getControlActionHistory";

    cls.CARDATA_HISTORYTRACKBYPAGGER_URL = bfConfig.server + "/api/cardata/historyTrackByPagger";
    cls.USER_MSG_URL = bfConfig.server + "/ecm/getContentList";
    /**
     *获取车辆列表
     *
     */
    cls.getBaseConfigData = function (params) {
        params.api = "/appserver/api/config/getBaseConfig";
        params.success = function (data) {
            if (data && data.code === 0 && data.data) {
                var newData = data.data;
                window.sessionStorage.dssDownLoad = newData.dssDownLoad.replace("http://incall.","https://incallapi.");
                window.sessionStorage.dssUploadUrl = newData.dssUploadUrl.replace("http://incall.","https://incallapi.");
                window.sessionStorage.totalUserNum = newData.totalUserNum || '';
                window.localStorage.setItem('_realname_auth_url', newData.realname_auth_url);
                if (typeof newData.iosDowanLoadUrl == "undefined") {
                    newData.iosDowanLoadUrl = "";
                }
                window.localStorage.setItem("iosDowanLoadUrl", newData.iosDowanLoadUrl);
                if (params.callBacksuccess) {
                    params.callBacksuccess(newData.iosDowanLoadUrl);
                }
            } else {
                Notification.show({
                    type: "error",
                    message: '获取配置地址失败'
                });
            }
        };
        params.error = function () {
            if(window.__currentIs4G()){
                Notification.show({
                    type: "error",
                    message: '获取配置地址失败'
                });
            }
           
        };
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    // 影藏轨迹
    cls.closeHistoryById =function(params){
        params.api ="/appserver/api/carDriveInfoCount/closeHistoryById";
        return bfNet.doAPI(params)
    }
    cls.setDrivingHistroyCloseWithPin =function(params){
        params.api ="/appserver/api/carDriveInfoCount/setDrivingHistroyCloseWithPin";
        bfNet.doAPI(params)
    }
    // 设置赢藏轨迹 (1代表关闭  0代表开启）
     cls.setDrivingHistroyClose =function(params){
           params.api ="/appserver/api/carDriveInfoCount/setDrivingHistroyClose";
          return bfNet.doAPI(params)
     }

    cls.getCarList = function (params) {
        if(window.__currentIs4G()){
            params.api = "/appserver/api/car/getMyCars";
            params.options = {loading: false};
            return bfNet.doAPI(params);
        } else {
            var dataObj = JSON.parse(window.localStorage[window.__currentPhone+'getMyCarsByBfApplication'])
            if(dataObj){
                params.success && params.success(dataObj)
            } else {
                params.error && params.error()
            }
        }
       
    };
    cls.getCarListCarPage = function (params) {
        if(window.__currentIs4G()){
            params.api = "/appserver/api/car/getMyCars";
            return bfNet.doAPI(params);
        } else {
            var dataObj = JSON.parse(window.localStorage[window.__currentPhone+'getMyCarsByBfApplication'])
            if(dataObj){
                params.success && params.success(dataObj)
            } else {
                params.error && params.error()
            }
        }
    };
    cls.getMyDemoCar = function (params) {
        params.api = "/appserver/api/car/getMyDemoCar";
        return bfNet.doAPI(params);
    };

    cls.getMainDatas = function (success, error,timeout) {
        if(window.__currentIs4G()){
            if(timeout){
                return bfNet.doAPI({api: "/appserver/api/car/getMyCars", success: success, error: error,timeout:timeout, options: {loading: false}});
            } else {
                return bfNet.doAPI({api: "/appserver/api/car/getMyCars", success: success, error: error, options: {loading: false}});
            }
        } else {
            var dataObj = JSON.parse(window.localStorage[window.__currentPhone+'getMyCarsByBfApplication'])
            if(dataObj){
                success && success(dataObj)
            } else {
                error && error()
            }
        }
        
    };
    //根据当前VIN获取我的车辆信息
    cls.getCarInfoById = function (params) {
        params.api = "/appserver/api/car/getCarByCarId";
        return bfNet.doAPI(params);
    };
    //获取图片验证码
    cls.getImageCode = function (params) {
        params.api = "/appserver/api/sms/getImageCode";
        return bfNet.doAPI(params);
    };
    //发送验证码
    cls.sendAuthcode = function (params) {
        params.api = "/appserver/api/sms/sendVerifyCodeWithImage";
        return bfNet.doAPI(params);
    };

    /**
     *更新车辆信息
     */
    cls.updateCarInfo = function (params) {
        params.api = "/appserver/api/car/update";
        return bfNet.doAPI(params);
    };
    //更新或添加保险公司信息
    cls.updateCompany = function (params) {
        params.api = "/appserver/api/car/update";
        return bfNet.doAPI(params);
    };
    //添加虚拟车辆
    cls.addDemoCar = function (params) {
        //添加上下文
        params.api = "/appserver/api/car/addDemoCar";
        return bfNet.doAPI(params);
    };
    //获取设备列表
    cls.getCatDevice = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/device/getDeviceListByCarId", type: "GET", data: data, success: success});
    }
    //更新设备状态
    cls.updateDeviceState = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/device/active", type: "POST", data: data, success: success});
    };
    //获取设备类别列表
    cls.getDeviceTypeList = function (params) {
        params.api = "/appserver/api/device/getDeviceTypeList";
        return bfNet.doAPI(params);
    };
    //获得城市简称信息
    cls.getLocationImfor = function (params) {
        params.api = "/api/getLocationImfor";
        return bfNet.doAPI(params);
    };
    //获取油价类型列表
    cls.getOilTypeList = function (params) {
        params.api = "/appserver/api/car/getOilTypeList";
        return bfNet.doAPI(params);
    };
    // 获取品牌
    cls.getBrands = function (params) {
        params.api = "/appserver/api/carSeries/getRootCarSeries";
        return bfNet.doAPI(params);
    };
    //拉取车型车系
    cls.getCarType = function (params) {
        params.api = "/appserver/api/carSeries/getCarSeriesByParentsId";
        return bfNet.doAPI(params);
    };
    //车辆体检
    cls.getCarTestData = function (params) {
        params.api = "/appserver/api/carcheck/getCheckResult";
        params.options = {loading: true};
        return bfNet.doAPI(params);
    };
    cls.getTestItems = function (params) {
        params.api = "/appserver/api/carcheck/getAllCheckItem";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    cls.getCarTestInfo = function (params) {
        params.api = "/appserver/api/carcheck/getCheckDetail";
        return bfNet.doAPI(params);
    };
    cls.getCarTestHistory = function (success) {
        return bfNet.doAPI({
            api: "/appserver/api/carcheck/getCheckList",
            data: {carId: bfDataCenter.getCarId()},
            success: success
        });
    }

    //获取车辆控制所有可控制的状态
    cls.getControlStatus = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "getControlStatus";
            Plugin.callFunc(params);
        } else {
            control.getControlStatus(params);
        }
    };
    //根据不同的指令操作车的行为
    cls.controlCar = function (params) {
        if (typeof cordova != "undefined") {
            //  OSApp.showStatus("error","进入1方法了");
            params.Func = "carControl";
            Plugin.callFunc(params);
        } else {
            //  OSApp.showStatus("error","进入2方法了");
            control.controlCar(params);
        }
    };
    //拉取远程控制是否成功的操作
    cls.getControlInfo = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "getCarControlInfo";
            Plugin.callFunc(params);
        } else {
            control.getControlInfo(params);
        }
    };
    //拉取远程控制是否成功的操作2
    cls.getControlInfoByTaskId = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "getControlInfoByTaskId";
            Plugin.callFunc(params);
        } else {
            control.getControlInfoByTaskId(params);
        }
    };
    cls.getTerminalWifiSetting = function (params) {
        params.api = "/appserver/api/device/getTerminalWifiSetting";
        return bfNet.doAPI(params)
    };
    //拉取周边影像图片
    cls.getImage = function (params) {
        params.api = "/appserver/api/car/getImage";
        return bfNet.doAPI(params);
    };
    //拉取是否有PIN码的接口
    cls.getPinCode = function (params) {
        params.api = "/appserver/api/car/checkPin";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    cls.controlAuth = function (params) {
        params.api = "/appserver/api/car/controlAuth";
        return bfNet.doAPI(params);
    };
    cls.getDrivingBehaviorToday = function (params) {
        params.api = "/appserver/api/getDrivingBehaviorToday";
        return bfNet.doAPI(params);
    };
    cls.getDrivingBehaviorYes = function (params) {
        params.api = "/appserver/api/getDrivingBehaviorYes";
        return bfNet.doAPI(params);
    };
    cls.getRankingList = function (params) {
        params.api = '/appserver/api/free/getTopUser';
        return bfNet.doAPI(params);
    };
    cls.getDrivingReport = function (params) {
        params.api = "/appserver/api/getDrivingReport";
        return bfNet.doAPI(params);
    };
    cls.getDrivingRoute = function (params) {
        var currentCarId = bfDataCenter.getCarId();
        params.data = {carId: currentCarId};
        params.api = "/appserver/api/cardata/historyTrack";
        return bfNet.doAPI(params);
    };
    cls.historyTrackByDate = function (params) {
        var currentCarId = bfDataCenter.getCarId();
        params.data.carId = currentCarId;
        params.api = "/appserver/api/cardata/historyTrackByDate";
        return bfNet.doAPI(params);
    };
    cls.historyTrackByPagger = function (params) {
        var currentCarId = bfDataCenter.getCarId();
        params.data.carId = currentCarId;
        params.api = "/api/cardata/historyTrackByPagger";
        return bfNet.doAPI(params);
    };
    cls.historyTrackFromDayTableByDate = function (params) {
        var currentCarId = bfDataCenter.getCarId();
        params.data.carId = currentCarId;
        params.api = "/appserver/api/cardata/historyTrackFromDayTableByDate";
        return bfNet.doAPI(params);
    };
    //根据路径ID拉取路径的坐标点
    cls.getDetailPoints = function (params) {
        params.api = "/appserver/api/cardata/historyTrackDetail";
        return bfNet.doAPI(params);
    };
    cls.getDrivingTrajectory = function (params) {
        params.api = "/appserver/api/getDrivingTrajectory";
        return bfNet.doAPI(params);
    };
    cls.getDrivingChart = function (type, success) {
        return bfNet.doAPI({api: "/appserver/api/drivingChartByType", data: {type: type}, success: success});
    }
    cls.historyTracktTotal = function (params) {
        params.api = "/appserver/api/cardata/historyTracktTotal"
    }

    cls.getDrivingData = function (params) {
        params.api = "/appserver/api/carDriveInfoCount/geCarDriveInfoByUser";
        return bfNet.doAPI(params);
    };
    //获取当前车位置
    cls.getCarLocation = function (params) {
        params.api = "/appserver/api/cardata/getCarLocation";
        params.data.mapType = window.localStorage.mapType;
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    //创建组队
    cls.createTeam = function (params) {
        params.api = "/appserver/api/im/createTeam";
        return bfNet.doAPI(params)
    };
    //加入组队
    cls.memberAddTeam = function (params) {
        params.api = "/appserver/api/im/memberAddTeam";
        return bfNet.doAPI(params)
    };
    //退群
    cls.memberOutTeam = function (params) {
        params.api = "/appserver/api/im/memberOutTeam";
        return bfNet.doAPI(params)
    };
    //解散群
    cls.removeTeam = function (params) {
        params.api = "/appserver/api/im/removeTeam";
        return bfNet.doAPI(params)
    };
    //更新群的目的地坐标或群公告
    cls.updateTeam = function (params) {
        params.api = "/appserver/api/im/updateTeam";
        return bfNet.doAPI(params)
    };
    //群员接受群消息
    cls.acceptMsg = function (params) {
        params.api = "/appserver/api/im/acceptMsg";
        return bfNet.doAPI(params)
    };
    //群员不接受群消息
    cls.frobiddenMsg = function (params) {
        params.api = "/appserver/api/im/frobiddenMsg";
        return bfNet.doAPI(params)
    };
    //获得所以组队列表
    cls.getAllTeamMember = function (params) {
        params.api = "/appserver/api/im/getTeamInfo";
        return bfNet.doAPI(params);
    };
    cls.keepLink = function (params) {
        params.api = "/appserver/api/im/keepLink";
        return bfNet.doAPI(params)
    };
    cls.getCarState = function (carId, success, error) {
        return bfNet.doAPI({
            api: "/appserver/api/index/getCarData",
            data: {carId: carId},
            success: function (reqData) {
                if (reqData.code == 0 && reqData.success == true) {
                    bfDataCenter.setUserValue("carUniqueCode", reqData.data.carUniqueCode);
                }
                success(reqData);
            },
            error: error,
            options: {loading: false}
        });
    };
    cls.setFence = function (fenceName, fenceId, carId, diastance, lat, lng, notifyPhone, notifyType, status, success, error) {
        var point = "";
        if (lng == null || lng == "" || lat == "" | lat == null) {
            point = null;
        } else {
            point = lng + "," + lat;
        }
        return bfNet.doAPI({
            api: "/appserver/api/fence/setFenceNew",
            data: {
                carId: carId,
                fenceName: fenceName,
                fenceId: fenceId,
                distance: diastance,
                point: point,
                notifyPhone: notifyPhone,
                notifyType: notifyType,
                status: status
            },
            success: success,
            error: error
        });
    };
    cls.setFenceTemp = function (fenceName,fenceId,carId, success, error) {
        return bfNet.doAPI({api: "/appserver/api/fence/setFenceNew", data: {
                carId: carId,
                fenceName: fenceName,
                fenceId: fenceId
            }, success: success, error: error
        });
    };
    cls.getFence = function (carId, success, error) {

        return bfNet.doAPI({api: "/appserver/api/fence/getFenceNew", data: {carId: carId}, success: success, error: error});
    };
    cls.getFenceByFenceId = function (carId, fenceId, success, error) {
        return bfNet.doAPI({
            api: "/appserver/api/fence/getFenceNew",
            data: {carId: carId, fenceId: fenceId},
            success: success,
            error: error
        });
    };
    cls.getEelectFenceInfo = function (stubId, success, error) {
        return bfNet.doAPI({
            api: "/appserver/api/information/getEelectFenceInfo",
            data: {stubId: stubId},
            success: success,
            error: error
        });
    };
    cls.getFencelist = function (carId, success, error) {
        return bfNet.doAPI({api: "/appserver/api/fence/getFencelist", data: {carId: carId}, success: success, error: error});
    }
    cls.cancelFence = function (fenceId, carId, success, error) {
        return bfNet.doAPI({
            api: "/appserver/api/fence/cancelFenceNew",
            data: {carId: carId, fenceId: fenceId},
            success: success,
            error: error
        });
    };
    cls.setMaintainMileage = function (params) {
        params.api = "/appserver/api/index/setMaintainMileageRemaind";
        return bfNet.doAPI(params);
    };
    cls.getUserData = function (success, error) {
        return bfNet.doAPI({
            api: "/appserver/api/user/getUserInfoByToken",
            type: "POST",
            success: success,
            error: error,
            options: {loading: false}
        });
    };
    cls.loadUserInfo = function (params) {
        BaseClient.ajax(_.extend(params, {
            data: {},
            url: bfConfig.server + "/appserver/api/user/getUserInfoByToken",
            error: function () {
                window.sessionStorage['loadMyInfoError'] = "true";
            }
        }));
    };
    cls.getAccountInfoByToken = function (params) {
        return bfNet.doAPI({
            api: "/appserver/api/user/getAccountInfoByToken",
            type: "POST",
            success: params.success,
            error: params.error,
            options: {loading: false}
        });
    };
    cls.saveMyinfo = function (params) {
        return bfNet.doAPI({
            api: "/appserver/api/user/update",
            type: "POST",
            data: {
                userFullname: params.userFullname,
                gender: params.gender,
                birthday: params.birthDay,
                faceImg: params.imgPath,
                contactsMobile:params.contactsMobile
            },
            success: params.success,
            error: params.error
        });
    };
    cls.checkAuthcode = function (params) {
        params.api = "/appserver/api/sms/checkAuthcode";
        return bfNet.doAPI(params);
    };
    //重置密码
    cls.findPassword = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "findPassword";
            Plugin.callFunc(params);
        } else {
            control.findPassword(params);
        }
    }
    //用户信息数据服务接口
    cls.postFeedback = function (params) {
        BaseClient.ajax({
            url: bfConfig.server + "/api/user/tucao",
            data: params.data,
            type: "post",
            success: params.success,
            error: params.error,
            complete: params.complete,
            beforeSend: params.beforeSend
        });
    };
    //获取行程说明书的树形菜单
    cls.getToolsList = function (params) {
        params.api = "/appserver/api/ecm/getCatalogListByParent";
        return bfNet.doAPI(params);
    };
    //获取父目录
    cls.getIntroductionList = function (params) {
        params.api = "/appserver/ecm/getCatalogListByParent";
        return bfNet.doAPI(params);
    };
    //根据ID获取子节点
    cls.getChildList = function (params) {
        params.api = "/appserver/api/ecm/getContentList";
        return bfNet.doAPI(params);
    };
    //获取文章列表
    cls.getContentList = function (params) {
        BaseClient.ajax({
            url: bfConfig.server + "/appserver/ecm/getContentList",
            data: params.data,
            type: "post",
            success: params.success,
            error: params.error,
            complete: params.complete,
            beforeSend: params.beforeSend
        });
    };
    //根据ID获取子节点
    cls.getChildList = function (params) {
        cls.getContentList(params);
    };
    //保险公司列表信息
    cls.getInsuranceCompanies = function (params) {
        params.api = "/appserver/api/insurance/getList";
        return bfNet.doAPI(params);
    };
    //当前车的保险公司信息
    cls.myInsuranceCompany = function (params) {
        params.api = "/appserver/api/myInsuranceCompany";
        return bfNet.doAPI(params);
    };
    //添加当前车的保险信息
    cls.addInsuranceImfor = function (params) {
        params.api = "/appserver/api/insurance/addCarInsurance";
        return bfNet.doAPI(params);
    };
    //获取长安客户电话
    cls.getIncallPhone = function (params) {
        params.api = "/appserver/api/insurance/getIncallPhone";
        return bfNet.doAPI(params);
    };
    //cls.getNewMessage = function (params) {
    //    BaseClient.ajax(_.extend(params, {
    //        data: {},
    //        url: bfConfig.server + "/api/message/getMessByPage",
    //        error: function () {
    //            console.log("获取未读消息失败");
    //        }
    //    }));
    //};
    //cls.getSearchResult = function (params) {
    //    params.api = "/api/sale/carparts/searchSaleCarParts";
    //    return bfNet.doAPI(params);
    //};
    //根据ID获取说明详情
    cls.getIntroductionInfoById = function (params) {
        params.api = "/appserver/api/ecm/getContent";
        return bfNet.doAPI(params);
    };
    //查看详情接口
    cls.getItemDetail = function (params) {
        params.api = "/appserver/ecm/getContent";
        return bfNet.doAPI(params);
    };
    cls.loadNotifyDetail = function (params) {
        BaseClient.ajax({
            url: bfConfig.server + "/appserver/api/ecm/getContent",
            data: {
                catalogId: params.catalogId,
                id: params.id
            },
            success: params.success,
            error: params.error,
            complete: params.complete,
            beforeSend: params.beforeSend
        });
    };
    //搜索结果接口
    cls.searchIntroduction = function (params) {
        params.api = "/appserver/api/manual/search";
        return bfNet.doAPI(params);
    };
    cls.getCarStyle = function (params) {
        params.api = "/appserver/api/sale/carparts/getCarTypeList";
        return bfNet.doAPI(params);
    };
    cls.getCarBookStyle = function (params) {
        params.api = "/appserver/ecm/getCarTypeList";
        return bfNet.doAPI(params);
    };
    cls.getNewsTabList = function (params) {
        params.api = "/appserver/api/canews/getNewsTabList";
        return bfNet.doAPI(params);
    };
    cls.getAllManual = function (params) {
        params.api = "/appserver/api/manual/getAllManualNew";
        // params.url = "/toolkit/data/drivingBook.json",
        // params.type = "GET",
        bfNet.doAPI(params);
    };

    cls.getMyManual = function (params) {
        params.api = "/appserver/api/manual/getMyManualNew";
        bfNet.doAPI(params);
    };
    //提交违章查询信息
    cls.getCarWarn = function (params) {
        params.api = "/appserver/api/violation/getCarWarn";
        return bfNet.doAPI(params);
    };
    //获取违章查询支持城市列表
    cls.getCityList = function (params) {
        params.api = "/appserver/api/violation/getCityList";
        return bfNet.doAPI(params);
    };
    cls.getCarWarnByAuth = function (params) {
        params.api = "/appserver/api/violation/getCarWarnByAuth";
        return bfNet.doAPI(params);
    };
    cls.addDestination = function (params) {
        params.api = "/appserver/api/destination/create";
        return bfNet.doAPI(params);
    };
    cls.activeDestination = function (params) {
        params.api = "/appserver/ctapi/activeDestination";
        return bfNet.doAPI(params);
    };
    cls.getDestinations = function (params) {
        params.api = "/appserver/api/destination/browse";
        return bfNet.doAPI(params);
    };
    cls.delDestination = function (params) {
        params.api = "/appserver/api/destination/delete";
        return bfNet.doAPI(params);
    };
    cls.shareDestinations = function (params) {
        params.api = "/appserver/ctapi/shareDestinations";
        return bfNet.doAPI(params);
    };
    cls.addCarInfo = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "carCreate";
            Plugin.callFunc(params);
        } else {
            control.addCarInfo(params);
        }
    };

    cls.deleteCar = function (params) {
        // if (typeof cordova != "undefined") {
        //     params.Func = "unbindCar";
        //     params.data.authcode = params.data.authCode;
        //     Plugin.callFunc(params);
        // } else {
            control.deleteCar(params);
        // }
    };

    cls.addDevice = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "addDevice";
            Plugin.callFunc(params);
        } else {
            control.addDevice(params);
        }
    };
    cls.updateMaintain = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/maintenance/update", type: "post", data: data, success: success});
    };
    cls.addCurrentMaintainRecordRequest = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/maintenance/create", type: "post", data: data, success: success});
    };
    cls.userLogout = function (success) {
        return bfNet.doAPI({api: "/appserver/api/user/logout", type: "post", success: success});
    };
    cls.getNewMes = function (params) {
        BaseClient.ajax(_.extend(params, {
                data: {}, url: bfConfig.server + "/appserver/api/message/unread",
                error: function () {
                    console.log("获取未读消息失败");
                }
            })
        );
    };
    cls.loadMsgInfo = function (params) {
        BaseClient.ajax(_.extend(params, {
            data: {
                catalogId: "CVMessage",
                orderType: "PublishDate",
                orderBy: "Desc",
                pageIndex: 0,
                pageSize: BaseClient.pageSize
            }, url: bfConfig.server + "/appserver/ecm/getContentList",
            error: function () {
                window.sessionStorage['loadMyInfoError'] = "true";
            }
        }));
    };
    cls.getNextMaintenanceMile = function (params) {
        return bfNet.doAPI({
            api: "/appserver/api/maintenance/getNextMaintenanceMile",
            type: "post",
            data: params.data,
            success: params.success,
            options:{loading: false},
        });
    };
    cls.changeUserPhone = function (data, success,error) {
        if (typeof cordova != "undefined") {
            Plugin.callFunc({
                data: data, success: success, error: error, Func: "updatePhone"
            });
        } else {
            control.changeUserPhone(data, success,error);
        }
    };

    cls.deleteMaintain = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/maintenance/delete", type: "post", data: data, success: success});
    };
    cls.setMaintainMileageRemaind = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/index/setMaintainMileageRemaind", type: "post", data: data, success: success});
    };
    cls.getRootIdByType = function (params) {
        params.api = "/appserver/ecm/getRootIdByType";
        return bfNet.doAPI(params);
    };
    cls.deleteEquipment = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "unbind";
            params.data.authcode = params.data.authCode;
            Plugin.callFunc(params);
        } else {
            control.deleteEquipment(params);
        }
    }
    cls.setPINForCar = function (data, success) {
        if (typeof cordova != "undefined") {
            Plugin.callFunc({
                data: data, success: success, error: function () {
                }, Func: "setPin"
            });
        } else {
            control.setPINForCar(data, success);
        }
    };
    cls.updatePassword = function (newpassword, password, success) {
        var data = {newPassword: newpassword, password: password};
        if (typeof cordova != "undefined") {
            Plugin.callFunc({
                data: data, success: success, error: function () {
                }, Func: "updatePassword"
            });
        } else {
            control.updatePassword(newpassword, password, success);
        }
    };
    cls.getDealerInfoByAdd = function (params) {
        BaseClient.ajax({
            url: bfConfig.server + "/appserver/api/dealer/browse",
            data: params.data,
            success: params.success,
            error: params.error,
            complete: params.complete,
            beforeSend: params.beforeSend
        });
    };
    cls.getDistinationFromFriends = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/destination/weChatShared", type: "GET", data: data, success: success});
    };
    cls.sendToCarRequest = function (data, success) {
        return bfNet.doAPI({api: "/appserver/api/destination/create", type: "post", data: data, success: success});
    };
    cls.addUserName = function (params) {
        params.api = "/appserver/api/user/updateUserName";
        return bfNet.doAPI(params);
    };
    cls.getContentListByRootId = function (params) {
        params.api = "/appserver/ecm/getContentListByRootId";
        return bfNet.doAPI(params);
    };
    //拉取 IM用户
    cls.getImUser = function (params) {
        params.api = "/appserver/api/im/userAdd";
        return bfNet.doAPI(params);
    };
    //获取车辆当天里程排名
    cls.getRankPercentByMileage = function (params) {
        params.api = "/appserver/api/cardata/getRankPercentByMileage";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    //分享里程接口
    cls.createShare = function (params) {
        params.api = "/appserver/api/share/createShare";
        params.options = {loading: false};
        return bfNet.doAPI(params)
    };
    //获取经验值排行策略
    cls.getRankList = function (params) {
        params.api = "/appserver/api/rank/getRankList";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    //获取设备更新状态//轮询 下载情况
    cls.getTboxUpdate = function (params) {
        params.api = "/api/device/getTboxUpdatePackage";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    //下载设备升级包
    cls.tboxUpdatePackageDownload = function (params) {
        params.api = "/api/device/tboxUpdatePackageDownload";
        return bfNet.doAPI(params);
    };
    //确认升级
    cls.tboxUpdatePackageInstall = function (params) {
        params.api = "/api/device/tboxUpdatePackageInstall";
        return bfNet.doAPI(params);
    };
    //获取吐槽接口分类
    cls.getTucaoContentType = function (params) {
        params.api = "/api/hu/1.0/user/getTucaoContentType";
        return bfNet.doAPI(params);
    };
    //获取资源包版本
    cls.getResorceBuild = function (params) {
        params.api = "/appserver/api/carSeries/getFileSource";
        params.type = "POST";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    // 长安币
    cls.getCredit = function (params) {
        params.api = "/api/account/credit";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    }
    // 会员个人信息
    cls.getMemberinfo = function (params) {
        params.api = "/api/personalinfo/memberinfo";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    }

    cls.updateIInformationStatus = function (params) {
        params.api = "/appserver/api/information/updateInformationStatus";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    }
    cls.getUnReadInfoNumber = function (params) {
        params.api = '/appserver/api/information/getUnReadInfoNumber';
        params.options = {loading: false};
        return bfNet.doAPI(params);
    };
    cls.setSercretQuestion = function (params) {
        params.api = "/appserver/api/user/setSercretQuestion";
        params.type = "POST";
        return bfNet.doAPI(params);
    }
    cls.getSercretQuestion = function (params) {
        params.api = "/appserver/api/user/getSercretQuestion";
        params.type = "POST";
        return bfNet.doAPI(params);
    }
    cls.checkSercretQuestion = function (params) {
        params.api = "/appserver/api/user/checkSercretQuestion";
        params.type = "POST";
        return bfNet.doAPI(params);
    }
    cls.forgetPin = function (params) {
        params.api = "/appserver/api/user/forgetPin";
        params.type = "POST";
        return bfNet.doAPI(params);
    };
    // 获取电子卷
    cls.vouchersumquery = function (params) {
        params.api = "/api/account/vouchersumquery";
        params.options = {loading: false};
        return bfNet.doAPI(params);
    }
    // 关注数量及粉丝数接口
    cls.getCount = function (params) {
        var url = bfConfig.server + "/osapp/common/getCount";
        $.ajax(url, {
            type: "GET",
            data: params.data,
            success: params.success,
            error: params.error
        });
    }
    cls.getFenceByLogId = function (params) {
        params.api = "/appserver/api/messagecenter/getFenceByLogId";
        return bfNet.doAPI(params);
    }
    cls.getCarEventByLogId = function (params) {
        params.api = "/appserver/api/messagecenter/getCarEventByLogId";
        return bfNet.doAPI(params);
    }
    cls.login = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "login";
            if (typeof params.data == "undefined") {
                params.data = {
                    phone: params.username,
                    password: params.password,
                    refreshToken: params.refreshToken
                }
            }
            Plugin.callFunc(params);
        } else {
            control.login(params);
        }
    }
    cls.registe = function (params) {
        if (typeof cordova != "undefined") {
            params.Func = "regist";
            Plugin.callFunc(params);
        } else {
            control.registe(params);
        }
    }
    //获取未认证的长安车辆列表
    cls.getNoAuditeCars = function(params){
        params.api = "/appserver/api/user/getBindCarList";
        params.options = {loading: false};
        return bfNet.doAPI(params)
    }
    //添加长安车辆
    cls.getChanganCar = function(params){
        params.api= "/appserver/api/user/checkCar";
        return bfNet.doAPI(params)
    }
    //添加长安车辆认证信息
    cls.addChanganCarInfo = function(params){
        params.api = "/appserver/api/user/bindCar";
        params.options = {loading: false};
        return bfNet.doAPI(params)
    }

    cls.caidtomemberid = function (params) {
        var url = "https://app.changan001.cn/api.ashx?m=caidtomemberid";
        $.ajax(url, {
            type: "POST",
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        });
    }
    cls.getmembertotalNew = function (params) {
        var url = "https://app.changan001.cn/api.ashx?m=getmembertotal";
        $.ajax(url, {
            type: "POST",
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        });
    }
    cls.getmymedal = function (params) {
        var url = "https://app.changan001.cn/api.ashx?m=getmymedal";
        $.ajax(url, {
            type: "POST",
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        });
    }
    cls.getmemberbl = function (params) {
        var url = "https://app.changan001.cn/api.ashx?m=getmember";
        $.ajax(url, {
            type: "POST",
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        });
    }

    
    cls.updateAllInformationStatus = function(params){
        params.api = "/appserver/api/information/batchUpdateInformationStatus";
        params.options = {loading: false};
        bfNet.doAPI(params)
    }
    //找回控车码
    cls.findPin = function(params){
        params.api = "/appserver/api/car/findPin";
        bfNet.doAPI(params)
    }
    cls.serviceDetail = function (params) {
        params.api = '/appserver/api/huservice/balanceInfo';
        params.options = {loading: false};
        return bfNet.doAPI(params);
    }
    //PM2.5拉取数据接口
    cls.getCarPm25ByCarId = function(params){
        params.api = '/appserver/api/car/pm/getCarPm25ByCarId';
        bfNet.doAPI(params)
    }
    //pm2.5分享接口
    cls.createPmShare = function(params){
        params.api = '/appserver/api/share/createPmShare';
        bfNet.doAPI(params)
    }
    cls.activeDevice = function (params) {
        params.api= '/appserver/api/car/sendActiveSMS';
        return bfNet.doAPI(params);
    }
    cls.deleteAuth = function (params) {   //删除 失败的审核
        params.api = '/appserver/api/user/deleteBindCarList';
        bfNet.doAPI(params);
    };
    // 这里 根据 环境来 生成ostsp接口的域名
    cls.getNewDomain_ostsp = function(){
        // 占时把正式改成ostspdev，网络运营商有点问题
        if(bfConfig._config.runtime == "RELEASE"){
            var domain = 'http://ostsp.changan.com.cn';
        } else if(bfConfig._config.runtime == "DEBUG_NO_NET_DEBUG"){
            var domain = 'http://ostspprep.changan.com.cn:443';
        } else if(bfConfig._config.runtime == "DEBUG"){
            var domain = 'http://ostspdev.changan.com.cn:9000';
        } 
        return domain
    }
    // 这里 根据 环境来 生成ostsp接口的域名
    cls.getUpUserDataDomain_ostsp = function(){
        // 占时把正式改成ostspdev，网络运营商有点问题
        if(bfConfig._config.runtime == "RELEASE"){
            var domain = 'http://ostsp.changan.com.cn';
        } else if(bfConfig._config.runtime == "DEBUG_NO_NET_DEBUG"){
            var domain = 'http://ostspprep.changan.com.cn:443';
        } else if(bfConfig._config.runtime == "DEBUG"){
            var domain = 'http://ostspdev.changan.com.cn:9000';
        }
        return domain
    }

    cls.winmu_getCheckCode = function(params){
        var url = this.getNewDomain_ostsp() + '/winmu/getCheckCode';
        // var url = 'http://ostspdev.changan.com.cn:9000' + '/winmu/getCheckCode';
        $.ajax(url, {
            type: "GET",
            timeout : 15000,
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        })
    }
    cls.winmu_syncUser = function(params){
        var url = this.getNewDomain_ostsp() + '/winmu/syncUser';
        // var url = 'http://ostspdev.changan.com.cn:9000' + '/winmu/syncUser';
        $.ajax(url, {
            type: "GET",
            timeout : 15000,
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        })
    }
    cls.winmu_bindCar = function(params){
        var url = this.getNewDomain_ostsp() + '/winmu/bindCar';
        // var url = 'http://ostspdev.changan.com.cn:9000' + '/winmu/bindCar';
        $.ajax(url, {
            type: "GET",
            timeout : 15000,
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        })
    }
    cls.winmu_getSN = function(params){
        var url = this.getNewDomain_ostsp() + '/winmu/getSN';
        // var url = 'http://ostspdev.changan.com.cn:9000' + '/winmu/getSN';
        $.ajax(url, {
            type: "GET",
            timeout : 15000,
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        })
    }
    cls.getRemoteControl = function(params){
        var url = this.getNewDomain_ostsp() + '/carconfig/carRemoteControl/getRemoteControl';
        $.ajax(url, {
            type: "GET",
            timeout : 8000,
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        })
    }

    cls.carconfig_getCondition = function(params){
         var url = this.getNewDomain_ostsp() + '/carconfig/carCondition/getCondition';
         $.ajax(url, {
             type: "GET",
             timeout : 8000,
             dataType: "json",
             data: params.data,
             success: params.success,
             error: params.error
         })
     }
    
    cls.carconfig_carConf_getConf = function(params){
       var url = this.getNewDomain_ostsp() + '/carconfig/carConf/getConf';
       $.ajax(url, {
           type: "GET",
           timeout : 20000,
             dataType: "json",
             data: params.data,
             success: params.success,
             error: params.error
         })
     }

    
    cls.carConfGetConf = function(params){
        var url = this.getNewDomain_ostsp() + '/carconfig/carConf/getConf';
        $.ajax(url, {
            type: "GET",
            timeout : 8000,
            dataType: "json",
            data: params.data,
            success: params.success,
            error: params.error
        })
    } 
    cls.addQuick = function(params){
        var url = this.getNewDomain_ostsp() + '/carconfig/addQuick';
        $.ajax({
            url: url,
            type: 'POST',
            datType: "JSON",
            contentType: "application/json",
            data: params.dataStr,
            success: params.success,
            error: params.error
        })
    } 
    cls.getQuick = function(params){
        var url = this.getNewDomain_ostsp() + '/carconfig/getQuick';
        $.ajax({
            url: url,
            type: 'GET',
            data: params.data,
            success: params.success,
            error: params.error
        })
    }
    cls.carBindJd = function(params){
        params.api="/appserver/api/jd/activeAndBindDevice",
        bfNet.doAPI(params)
    } 
    cls.notifyFence=function(params){
        params.api="/appserver/api/fence/setFenceNew",
        bfNet.doAPI(params)
    }
    cls.checkPhone = function(data, success, error) {
        error || (error = function() {
            Notification.show({
                type: "error",
                message: "网络开小差"
            })
        }), bfNet.doAPI({
            api: "/appserver/api/user/checkPhone",
            type: "POST",
            data: data,
            success: success,
            error: error
        })
    }
    cls.confirmFindPin = function(params){
        // alert('进入confirm')
        params.api="/appserver/api/car/confirmFindPin",
        // params.type = "POST";
        bfNet.doAPI(params)
    }
    return Client;
});

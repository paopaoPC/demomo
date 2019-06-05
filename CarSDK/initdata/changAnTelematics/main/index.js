define(['common/imView',
        'butterfly',
        'home/newIndex',
        'drivingReport/index',
        'myinfo/index',
        'toolkit/index',
        //'CarFriend/remoteControl1',
        "underscore",
        "common/osUtil",
        'shared/js/notification',
        "modulesManager/ModuleManager",
        "myinfo/index",
        "common/imageSet",
        'css!main/index.css'
    ],
    function (View, Butterfly, Home, DrivingReport, MyInfo, Toolkit, _, osUtil, Notification, ModuleManager, MyInfoOld,ImageSet) {
        // OSApp.showStatus("error", '进入index')

        Date.prototype.format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        };
        return View.extend({
            events: {
            },
            initialize: function (options) {
                View.prototype.initialize.call(this, options);
                this._mdDirty = true;
                var self = this;
                this._onMessageWarning = function (messageWarning) {
                    if (messageWarning) {
                        self._addMessageWarning();
                    }
                    else {
                        self._remMessageWarning();
                    }
                }
                this._changNavi = function () {

                }
                this._onAddCar = function () {
                    self._mdDirty = true;
                }
                this._onTokenUpdate = function () {
                    console.log("token update");
                    self.updateMainDatas();
                }
                bfDataCenter.on("MESSAGE_WARNING_CHANGED", this._onMessageWarning);
                bfDataCenter.on("CURRENT_CARVIN_CHANGED", this._changNavi);
                bfAPP.on("IM_EVENT_CAR_CHANGED", this._onAddCar);
                bfAPP.on("IM_EVENT_TOKEN_UPDATE", this._onTokenUpdate);
                this._tabIndex = 0;
                if(window.localStorage['firstGotoCarLife++pp'] == 'true'){
                    this._tabIndex = 1;
                }
                this._activeTab = null;
            },
            viewClose: function(pageName){
            },
            onViewBack: function (backFrom, backData) {
                if (backData == "backToHome") {
                    if (backFrom == "cars/index") {
                        this.homeTab.onViewBack(backFrom, 'changeCar')
                    }
                    if (this._tabIndex != 0) {
                        this.uiShowTabItem(0);
                    }
                }
                // 日历选择后，这里手动将 参数传给'drivingReport/selectMouth'的实例对象，让小车跑到对应日期下
                if (backFrom === 'drivingReport/selectMouth' && backData) {
                    this.drivingReport.onViewBack(backFrom, backData);
                    $(this.el).css("display", "block");
                    this._hide = false;
                }
                if (backFrom === 'myinfo/reviseMyinfo' && backData) {
                    this.myinfoTab.onViewBack(backFrom, backData);
                }
                if (backFrom === 'carLife/publicNumber/vipActivity/activityDetail') {
                    this.homeTab.onViewBack(backFrom, backData);
                }
                if (backFrom === 'carLife/information/index') {
                    this.homeTab.onViewBack(backFrom, backData);
                }
                if (backFrom === 'carLife/information/detail') {
                    this.homeTab.onViewBack(backFrom, backData);
                }
                if (backFrom === 'help/helpDetail') {
                    this.homeTab.onViewBack(backFrom, backData);
                }
                if (backFrom === 'help/seeCarFriend') {
                    this.homeTab.onViewBack(backFrom, backData);
                }
                if (backFrom === 'carLife/AllService/allService' && backData) {
                    this.messagesTab.onViewBack(backFrom, backData);
                }
            },
            onHide: function () {
                this._hide = true;
            },
            posGenHTML: function () {  //提前渲染导航栏
               
                

            },
            onShow: function () {
                var me = this;
                var contacts = bfDataCenter.getUserSessionValue('contactsMobile');
                if(!contacts ||contacts == null || contacts == 'null' || contacts == 'undefined'){
                    this.getElement('#tips').css("visibility",'visible');
                }else{
                    this.getElement('#tips').css("visibility",'hidden');
                }
                document.removeEventListener('resume', me.checkUpdates, false);
                document.addEventListener("resume", me.checkUpdates, false);
                this._updateNav = function () {
                    me.renderHtmlFromHttp(me.$el);
                    if(bfNaviController.current().view._activeTab){
                        bfNaviController.current().view._activeTab.renderHtmlFromHttp(bfNaviController.current().view._activeTab.$el);
                    }else{
                        console.log("____________ERROR______________");
                    }
                };
                bfDataCenter.on("UPDATE_MAIN",this._updateNav);
                if (this._hide) {
                    this._hide = false;
                    this._isShow = false;
                    return;
                }
                if (bfDataCenter.messageWarning()) {
                    me._addMessageWarning();
                }
                if (navigator.iChanganCommon && navigator.iChanganCommon.getLocationPermission) {
                    navigator.iChanganCommon.getLocationPermission(function () {}, function () {});
                }
                var viewRender = function () {
                    me.uiShowTabItem(me._tabIndex);
                    me.checkUpdates(); // check update
                    if (me._mdDirty) {
                        me.updateMainDatas();
                    }
                    // 获取车等级列表
                    me.getRankList();
                    //判断是否有来自好友分享数据的标识
                    if (window.dataFromFriend) {
                        window.getDataFromFriend(window.dataFromFriend);
                    }
                    if(window.dataFromBoLa){
                        window.dataFromBoLaFUnc(window.dataFromBoLa);
                        window.dataFromBoLa = null;
                    }
                };
                me.getBaseUrl(viewRender); //todo  设置原生连接
            },
            bolaFunc:function(){
                var sycId,phone,faceImg;
                if (!bfDataCenter.getUserSessionValue("faceImg")) {
                    faceImg = "";
                } else {
                    faceImg = bfDataCenter.getUserSessionValue("faceImg");
                }
                if(localStorage.user_info_cache_data){
                    sycId = JSON.parse(localStorage.user_info_cache_data).sycid;
                    phone =JSON.parse(localStorage.user_info_cache_data).phone
                }else{
                    sycId = "";
                    phone = "";
                }
                var userId = window.localStorage.userId;
                var localData = {
                        "ca_id": sycId.length != 0 ? sycId : "",
                        "userid": userId,
                        "nickname": bfDataCenter.getUserSessionValue("userFullname") ? bfDataCenter.getUserSessionValue("userFullname") : "尚粉",
                        "mobile": phone,
                        "headimg": faceImg,
                        'openid': bfDataCenter.getUserSessionValue("openId"),
                        'uid': userId
                    };
                    //同步后台数据库用户数据

                // bfClient.getMemberlogin({}, "", localData, function (data) {
                //     var data = JSON.parse(data);
                //     if (data.errmsg == "ok") {
                //         bfDataCenter.setUserValue("myInfo", data.returndata);
                //     }
                // });
            },
            getRankList: function () {
                bfClient.getRankList({
                    success: function (data) {
                        if (data.code == 0 && data.data) {
                            window.localStorage['getRankListLocalStorage'] = JSON.stringify(data.data);
                        }
                    },
                    error: function (error) {
                        console.log("获取等级数据失败");
                    }
                })
            },
            getBaseUrl: function (callback) {
                var GYfunc = function (server) {
                    bfConfig.server = server;
                    if (typeof navigator.packaging != "undefined") {
                        navigator.packaging.setBaseUrl({
                            baseUrl: bfConfig.server,
                            isNev: window.localStorage['isNev']
                        }, function () {
                            callback();
                        }, function () {
                            callback();
                        });
                    } else {
                        callback();
                    }
                };
                $.ajax({
                    url: bfConfig.server + "/app/api/1.0/server/host?loginName=" + window.localStorage.userMobile,
                    type: 'get',
                    data: {},
                    timeout: 5000,
                    success: function (data) {
                        if (data.code == "0" && data.success == true) {
                            if (data.data.serverHost == window.localStorage.BaseUrl) {
                                GYfunc(bfConfig.server);
                                return;
                            }
                            window.localStorage.setItem("BaseUrl", data.data.serverHost);
                            GYfunc(data.data.serverHost);
                        } else {
                            console.log(data.msg);
                            GYfunc(bfConfig.server);
                        }
                    },
                    error: function (error) {
                        console.log("请求服务器连接失败");
                        GYfunc(bfConfig.server);
                    }
                });
            },
            onRemove: function () {
                bfAPP.off("IM_EVENT_CAR_CHANGED", this._onAddCar);
                bfDataCenter.off("MESSAGE_WARNING_CHANGED", this._onMessageWarning);
                bfDataCenter.off("CURRENT_CARVIN_CHANGED", this._changNavi);
                bfAPP.off("IM_EVENT_TOKEN_UPDATE", this._onTokenUpdate);
                bfDataCenter.off("UPDATE_MAIN",this._updateNav);
                if (this.homeTab) {
                    this.homeTab.remove();
                    this.homeTab = null;
                }
                if (this.carTestTab) {
                    this.carTestTab.remove();
                    this.carTestTab = null;
                }
                if (this.toolkitTab) {
                    this.toolkitTab.remove();
                    this.toolkitTab = null;
                }
                if (this.drivingReport) {
                    this.drivingReport.remove();
                    this.drivingReport = null;
                }
                if (this.drivingFReport) {
                    this.drivingFReport.remove();
                    this.drivingFReport = null;
                }
                if (this.naviTab) {
                    this.naviTab.remove();
                    this.naviTab = null;
                }
                if (this.messagesTab) {
                    this.messagesTab.remove();
                    this.messagesTab = null;
                }
                if (this.myinfoTab) {
                    this.myinfoTab.remove();
                    this.myinfoTab = null;
                }
                this._tabIndex = 0;
                this._activeTab = null;
                this._mdDirty = true;
                bfDataCenter.onLogout();
            },
            clearParam: function () {
                window.sessionStorage["consult_isCarsDetailReturn"] = "";
            },
            onDeviceBack: function () {
                if (this._activeTab && this._activeTab.onDeviceBack) {
                    return this._activeTab.onDeviceBack();
                }
                return false;
            },
            uiShowTabItem: function (tabIndex, fromTab) {
                var me = this;
                if (!me.homeTab) {
                    me.homeTab = new Home();
                    this.insertViewBefore("#main-footer", me.homeTab);
                } else {
                    me.homeTab.onShow();
                }
                me._activeTab = me.homeTab;
                if(bfDataCenter.getCarData() && bfDataCenter.getCarData().confCode){
                    var code = bfDataCenter.getCarData().confCode && bfDataCenter.getCarData().confCode.substring(0,6);
                    switch (code){
                        case 'SC6481':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEventWithLabel('0501','V301');
                            }
                            break;
                        case 'SC6468':
                            if(typeof MobclickAgent != "undefined"){
                               MobclickAgent.onEventWithLabel('0501','R111');
                            }
                            break;
                        case 'SC6482':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEventWithLabel('0501','V302');
                            }
                            break;
                    }
                }else{
                    if(typeof MobclickAgent != "undefined"){
                        MobclickAgent.onEventWithLabel('0501','DEMO');
                    }
                }
                // if (this._activeTab) {
                //     this._activeTab.show();
                // }
                if (me._activeTab.reloadData) {
                    me._activeTab.reloadData();
                }
            },
            checkUpdates: function () {
                var NowTime = new Date().getTime(); //记录检查更新的时间
                if (window.localStorage.updatePromptTime && (NowTime - window.localStorage.updatePromptTime) > 300000) {
                    window.localStorage.updatePromptTime = new Date().getTime(); //记录检查更新的时间
                    new ModuleManager().checkUpdates(false, function () {
                            console.log("检测更新成功");
                        }, function () {
                            console.log("检查更新失败");
                        }
                    )
                } else {
                    window.localStorage.setItem("updatePromptTime", new Date().getTime()); //记录检查更新的时间
                    new ModuleManager().checkUpdates(false, function () {
                            console.log("检测更新成功");
                        }, function () {
                            console.log("检查更新失败");
                        }
                    )
                }
            },
            getMyDemoCar: function () {
                var me = this;
                bfClient.getMyDemoCar({
                    type: "post",
                    dataType: "json",
                    success: function (data) {
                        if (data.OK) {
                            var newArr = data.data.filter(function(item){
                                return item.seriesCode !== "testSeries"
                            })
                            var netData = newArr;
                            var carsInfos = [];
                            carsInfos.push(netData);
                            bfDataCenter.setCarList(carsInfos);
                            if (carsInfos.length === 0) {

                                me.getMyDemoCar();
                                bfDataCenter.setCarDevice(null);
                                bfDataCenter.setCarId(null);
                                bfDataCenter.trigger("NEW_CAR_LIST");
                            }
                            else if (!bfDataCenter.getCarId())  // No vin, but has car
                            {
                                var deviceType = (carsInfos[0].currentDeviceType);
                                bfDataCenter.setCarDevice(deviceType);
                                bfDataCenter.setCarId(carsInfos[0].carId);
                                bfDataCenter.trigger("NEW_CAR_LIST");
                            } else {
                                var hasCurCar = 0;
                                for (var i = 0; i < carsInfos.length; i++) {
                                    if (carsInfos[i].carId == bfDataCenter.getCarId()) {
                                        hasCurCar = 1;
                                    }
                                }
                                if (hasCurCar == 0) {
                                    var deviceType = (carsInfos[0].currentDeviceType);
                                    bfDataCenter.setCarDevice(deviceType);
                                    bfDataCenter.setCarId(carsInfos[0].carId);
                                }
                                bfDataCenter.trigger("NEW_CAR_LIST");
                            }
                        } else {
                            bfDataCenter.trigger("NEW_CAR_LIST");
                        }
                    },
                    error: function () {
                        me._mdDirty = true;
                        window.localStorage.getMainDatas = false;
                        bfDataCenter.trigger("NEW_CAR_LIST");
                    }

                });
            },
            updateMainDatas: function () {
                this._mdDirty = false;
                var self = this;

                bfClient.getMainDatas(function (data) {
                    window.localStorage.getMainDatas = true;
                    self._onUpdateMainDatas(data)
                }, function () {
                    self._mdDirty = true;
                    window.localStorage.getMainDatas = false;
                    bfDataCenter.trigger("NEW_CAR_LIST");
                });
                bfClient.getUserData(function (data) {
                    self._onUpdateUserData(data);
                }, function () {
                    self._mdDirty = true;
                });
            },
            _onUpdateMainDatas: function (data) {
                var me =this;
                if (data.OK) {
                    var newArr = data.data.filter(function(item){
                        return item.seriesCode !== "testSeries"
                    })
                    var carsInfos = newArr;
                    bfDataCenter.setCarList(carsInfos);
                    if (carsInfos.length === 0) {
                        bfDataCenter.setCarDevice(null);
                        bfDataCenter.setCarId(null);
                        bfDataCenter.trigger("NEW_CAR_LIST");
                    }
                    else if (!bfDataCenter.getCarId())	// No vin, but has car
                    {
                        var selectIndex = 0;
                        var length = carsInfos.length;
                        for(var i=0;i<length;i++){
                            if(carsInfos[i].seriesCode == 'testSeries'){
                                selectIndex ++
                            } else {
                                break
                            }
                            
                        }
                        if(selectIndex>=length){
                            selectIndex =0;
                        }
                        var deviceType = (carsInfos[selectIndex].currentDeviceType);
                        bfDataCenter.setCarDevice(deviceType);
                        bfDataCenter.setCarId(carsInfos[selectIndex].carId);
                        bfDataCenter.trigger("NEW_CAR_LIST");
                    } else if (data.code == 3) {
                        bfDataCenter.setCarDevice(null);
                        bfDataCenter.setCarId(null);
                        bfDataCenter.trigger("NEW_CAR_LIST");
                    } else {
                        var hasCurCar = 0;
                        for (var i = 0; i < carsInfos.length; i++) {
                            if (carsInfos[i].carId == bfDataCenter.getCarId()) {
                                hasCurCar = 1;
                            }
                        }
                        if (hasCurCar == 0) {
                            var deviceType = (carsInfos[0].currentDeviceType);
                            bfDataCenter.setCarDevice(deviceType);
                            bfDataCenter.setCarId(carsInfos[0].carId);
                        }
                        bfDataCenter.trigger("NEW_CAR_LIST");
                    }
                    me.renderHtmlFromHttp(me.$el);
                } else {
                    bfDataCenter.trigger("NEW_CAR_LIST");
                }
            },
            _onUpdateUserData: function (data) {
                if (data.OK) {
                    var netData = data.data;
                    bfDataCenter.setUserSessionData(netData);
                    var contacts = bfDataCenter.getUserSessionValue('contactsMobile');
                    if(!contacts ||contacts == null || contacts == 'null' || contacts == 'undefined'){
                        this.getElement('#tips').css("visibility",'visible');
                    }else{
                        this.getElement('#tips').css("visibility",'hidden');
                    }

                    this.bolaFunc();
                }
            },
            _addMessageWarning: function () {
                if (this._activeTab === this.messageTab) {
                    return;
                }
                else {
                    this.getElement(".icon-message").addClass("footerWarning");
                }
            },
            _remMessageWarning: function () {
                this.getElement(".icon-message").removeClass("footerWarning");
            }
        });
    });

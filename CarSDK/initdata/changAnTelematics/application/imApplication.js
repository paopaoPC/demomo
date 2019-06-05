var bfDataCenter = null;//本地数据中心
var bfAPP = null;
var bfNet = null;//网络接口
var bfNaviController = null;
var bfDebugManager = null;
var bfClient = null;

define(
    ["common/application", "common/lsUtil", "application/application-client", "common/dataCenter", "common/osUtil", "shared/js/loadforks", "backbone","application/AppConfig","client/bolaClient","home/globalFunc"],
    function (Application, lsUtil, Client, DataCenter, osUtil, loadforks, Backbone,AppConfig,BolaClient) {
        var Base = Application;
        var IMApplication = {};

        IMApplication.init = function () {
            Base.prototype.init.call(this);

            this._dataCenter = new DataCenter();
            this._dataCenter.init();

            bfAPP = this;
            bfDataCenter = this._dataCenter;
            bfNet = this._net;
            bfClient = this._client;
            //bfClient = BolaClient.extend(bfClient);
            $.extend(bfClient,BolaClient);
            bfNaviController = this._naviController;
            bfDebugManager = this._debugManager;

            this.setPushNotificationListening(true);
            var self = this;
            Backbone.on('PushNotificationArrived', function () {
                self._onPushNotificationReceived.apply(self, arguments);
            });

			if (navigator.webViewAutoScroll) {
				navigator.webViewAutoScroll.invalidate()
			};
            document.addEventListener("resume", function () {
                self.onResume()
            }, false);
        }

        IMApplication.onResume = function () {

            if (window.dataFromFriend) {
                window.getDataFromFriend(window.dataFromFriend);
            }
            if(window.dataFromBoLa){
                window.dataFromBoLaFUnc(window.dataFromBoLa);
                window.dataFromBoLa = null;
            }
        }

        IMApplication.gotoMain = function () {
            // OSApp.showStatus("error", '进入了')
            bfNaviController.startWith("/main/index.html");
        };

        IMApplication.gotoLogin = function () {
            var GuideSettingDrivingHistory =window.localStorage.GuideSettingDrivingHistory;
            var GuideDeleteDriving = window.localStorage.GuideDeleteDriving;
            var loadingPageVersion = window.localStorage.loadingPageVersion;
            var isSeenImg = window.localStorage.HadSeePage;
            if (bfDataCenter.getUserData()) {
                var userData = bfDataCenter.getUserData();
                var username = window.localStorage.userMobile;
                var upUserDataStaus = window.localStorage['upUserDataStaus'];
                var upUserDataTime = window.localStorage['upUserDataTime'];
                var Dstatus = window.localStorage['3Dstatus'];
                var im = "__im_user_data";
                userData = JSON.stringify(userData);
                window.localStorage.clear();
                window.sessionStorage.clear();
                window.localStorage.setItem(username + im, userData);
                window.localStorage.setItem("userMobile",username);
                window.localStorage.setItem("upUserDataStaus"+username,upUserDataStaus);
                window.localStorage.setItem("upUserDataTime"+username,upUserDataTime);
                window.localStorage.setItem("3Dstatus",Dstatus);
            } else {
                window.localStorage.clear();
                window.sessionStorage.clear();
            }
            if(isSeenImg){
                window.localStorage.setItem('HadSeePage',true);
            }
            if(GuideSettingDrivingHistory){
                window.localStorage.setItem("GuideSettingDrivingHistory",GuideSettingDrivingHistory);
            }
            if(GuideDeleteDriving){
                window.localStorage.setItem("GuideDeleteDriving",GuideDeleteDriving);
            }
            if(loadingPageVersion){
                window.localStorage.setItem("loadingPageVersion",loadingPageVersion);
            }
            //todo 清楚检测标志位
            window.hasTest = false;
            window.localStorage['mapType'] = 'GCJ02';
            window.localStorage.setItem("isNev", "2");
            bfDataCenter.setUserValue("resourceTime",null);
            var length = bfNaviController._views.length;
            if(length && bfNaviController._views[length - 1].key && bfNaviController._views[length - 1].key.indexOf && bfNaviController._views[length - 1].key.indexOf('login/index.html') >=0 ){
                return
            }
            // bfNaviController.startWith("/login/index.html");
            // require("wy")
            // sm("do_Page").pop_pageCount();
            // OSApp.closeView();
            window.__closeCurentView()
        }

        IMApplication.gotoLogout = function () {
            this.gotoLogin();
        }

        IMApplication.onTokenUpdate = function () {
            var tokenUpdateTime = new Date().getTime();
            if (!window.localStorage.tokenUpdateTime) {
                window.localStorage.setItem("tokenUpdateTime", tokenUpdateTime);
                this.trigger("IM_EVENT_TOKEN_UPDATE");
                return;
            }
            if ((tokenUpdateTime - window.localStorage.tokenUpdateTime) < 10000) {
                return;
            }
            window.localStorage.tokenUpdateTime = tokenUpdateTime;
            this.trigger("IM_EVENT_TOKEN_UPDATE");
        }
        //arguments区分
        IMApplication._onPushNotificationReceived = function () {
            //arguments 2个属性  0{false代表后台。true代表前台} 1{需要用的值，是个对象}

            //当1中的type值为map的时候，就是分享目的地
            if (arguments['0']['1'].method === 'map') {
                // active: 1
                // addrName: "建新东路-公交车站" aaaaaaaaaaaaaaaaaaaaa
                // addrTime: "2015-06-12 08:13:25.0"
                // addrWGS: "106.543697,29.579746"
                // id: "e9cc2b4a3a4144a9a3d330aca8a7461d"
                // lat: "29.579746"
                // lng: "106.543697"
                // name: "建新东路-公交车站"
                // type: 0
                // userID: "123456789"

                var data = [];
                data.push(arguments['0']['1']);
                osUtil.delayCall(function () {
                    if (window.localStorage['isLogin']) {
                        navigator.iChanganCommon.openAutoNaviRouteView(
                            {
                                cur: 0,
                                addressLists: data,
                                token: window.localStorage['token']
                            },
                            function () {
                            },
                            function () {
                            });
                    }
                });
            }
        }

        IMApplication.setPushNotificationListening = function (enabled) {
            if (!window.forksLoader) {
                return;
            }

            if (window.forksLoader.getEnableForkPushNotification() == enabled) {
                return;
            }
            window.forksLoader.setEnableForkPushNotification(enabled, enabled);
        }

        IMApplication.run = function () {
            // if(navigator.iChanganCommon)
            // {
            // 	osUtil.delayCall(function()
            // 	{
            // 		navigator.splashscreen.hide();
            // 	}, 2000);
            // }
        }

        window.dataFromBoLaFUnc = function (data) {
            data  = eval("("+data+")");
            if (!window.localStorage['token']) {
                return;
            }
            if(openPage){
                openPage(data);
            }
        }


        window.getDataFromFriend = function (data) {
            if (!window.localStorage['token']) {
                return;
            }
            window.dataFromFriend = null;
            //分隔并取出参数
            var strArray = new Array();
            strArray = data.split("?");
            var stringTemp = strArray[2];

            var strArray2 = new Array();
            strArray2 = stringTemp.split("&");
            var dataTeam2;
            var dataTeam1;
            for (var flag = 0; flag < strArray2.length; flag++) {
                if (strArray2[flag].indexOf("destId") != -1) {
                    dataTeam2 = strArray2[1];
                }
                if (strArray2[flag].indexOf("myId") != -1) {
                    dataTeam1 = strArray2[0];
                }
            }

            var data1 = new Array();
            data1 = dataTeam1.split("=");

            var data2 = new Array();
            data2 = dataTeam2.split("=");

            var shareDestinationId = data1[1];
            var shareFriendId = data2[1];

            osUtil.delayCall(function () {
                var cur = bfNaviController.current();
                if (cur.name === "autoNavigation/getNovigationFromLink/getNovigationFromLink") {
                    cur.view._updateLocationData(shareFriendId, shareDestinationId);
                } else {
                    bfNaviController.push('/autoNavigation/getNovigationFromLink/getNovigationFromLink.html', {
                        shareDestinationId: shareDestinationId,
                        shareFriendId: shareFriendId
                    });
                }
            }, 500);
        }

        return Base.extend(IMApplication);
    });

define([
        'common/navView',
        'butterfly',
        'shared/js/notification',
        "underscore",
         'shared/js/amap'
    ],
    function (View, Butterfly, Notification, _) {
        var Base = View;
        return Base.extend({
            events: {
                "click .share_buttom": "gotoRoutePage",
                "click #shareRoute": "isShareRoute",
                "click .checkBox": "routeToggle",
            },
            posGenHTML: function () {
                this._routerPermittion = 1;
                this.getElement("#shareRoute").attr("checked", true);
                this._carDevice = bfDataCenter.getCarDevice();
                var costNode = this.getElement(".cost-item");
                var oilNode = this.getElement(".oil-item");
                var timeNode = this.getElement(".time-item");
                // if (this._carDevice == "tbox") {
                //     costNode.addClass("active");
                //     oilNode.addClass("active");
                //     timeNode.addClass("centerActive")
                // }
            },
            goBack:function(){
                bfNaviController.pop(1);
                window.sessionStorage.setItem("onViewBack",true);
            },
            onShow: function () {
                this.initUserInfo();
                this.initDatas();
                this.getMileRank();
                this.viewDrivingRoutes()
            },
            onViewPush: function (pushFrom, pushData) {
                if (pushData) {
                    this._pushData = pushData;
                    this._routeData = pushData.routeData;
                };
            },
            routeToggle: function (el) {
                var me = this;
                var conNode = $(el.currentTarget);
                var checkNode = this.getElement(".checkBox");
                var node = this.getElement(".driving-item");
                if (!checkNode.hasClass('active')) {
                    this._routerPermittion = 1;
                    node.show(200);
                    conNode.addClass("active");
                    conNode.children(".check-icon").animate({left:"19px"},50, function(){
                        me.$('.content').css("webkit-overflow-scrolling",'touch')
                    })
                    // checkNode.addClass('active')
                } else {
                    this._routerPermittion = 0;
                    var containerNode = this.getElement(".content");
                    containerNode.css("webkit-overflow-scrolling",'auto');
                    containerNode.animate({"scrollTop":"0px"},200, function(){
                        node.hide();
                        $(this).css("webkit-overflow-scrolling",'auto')
                    })
                    conNode.removeClass("active");
                    conNode.children(".check-icon").animate({left:"0"},50)
                    // checkNode.removeClass('active')
                }
            },
            viewDrivingRoutes: function(){
                var container = this.getElement(".driving-item");
                var template = this.elementHTML("#rout-datas");
                for (var i = 0, len = this._routeData.length; i < len; i++) {
                    var tem = _.template(template, this._routeData[i]);
                    container.append(tem)
                };
            },
            gotoRoutePage: function () {
                if (this._routeData.length) {
                    var routeId = [];
                    for (var i = 0, len = this._routeData.length; i < len; i++) {
                        routeId.push(this._routeData[i].drivingHistoryId)
                    }
                    bfNaviController.push("drivingReport/shareRoutes.html", {routeId: routeId});
                } else {
                    Notification.show({
                        type: "error",
                        message: "您当天还没有行驶路径"
                    })
                }

            },
            initDatas: function () {
                var me = this;
                if (this._pushData) {
                    var currentTime = this._pushData.currentDate;
                    currentTime = moment(currentTime).format('YYYY.MM.DD');
                    this._currentData = this._pushData.currentData
                    me.getElement(".current-time").text(currentTime ? currentTime : 'xxxx.xx.xx');
                    me.getElement(".mile").text(this._currentData.wholeRoute ? this._currentData.wholeRoute.toFixed(1) : '0.0');
                    me.getElement(".cost").text(this._currentData.wholeCost ? this._currentData.wholeCost.toFixed(1) : '0.0');
                    me.getElement(".oil").text(this._currentData.wholeOil ? this._currentData.wholeOil.toFixed(1) : '0.0');
                    me.getElement(".cost-time").text(this._currentData.wholeTime ? this._currentData.wholeTime.toFixed(1) : '0.0');
                }
                ;
            },
            onRight: function () {
                var me = this;
                if (this._pushData.currentData.arrayForDay.length == 0) {
                    Notification.show({
                        type: "error",
                        message: "您当天没有行驶行驶数据"
                    });
                    return;
                }
                //获取当前车辆的id
                var currentCarId = bfDataCenter.getCarId();
                // var  routerPermittion = 1;
                bfClient.createShare({
                    data: {
                        carId: currentCarId,
                        histroyDate: me._pushData.currentDate,
                        routerPermittion: me._routerPermittion
                    },
                    success: function (data) {
                        if (data.code == 0) {
                            // var url = bfConfig.server + "/appserver/static/sharerounter/shareMileSy.html?shareId=" + data.data.shareId + "&device=" + me._carDevice;
                            var url = bfConfig.server + "/appserver/static/sharerounter/shareMileSy-style.html?shareId=" + data.data.shareId + "&device=tbox";
                            var mile = data.data.mileage.toFixed(1);
                            var content = "今天我行驶了"+ mile +"公里,加入欧尚汽车,及时掌握形行程报告";
                            var title = '欧尚汽车';
                            var img = "https://bac.oushangstyle.com/static/img/share.jpg";

                            var data = {
                                liknId:0,
                                shareActType:'',
                               shareUrl: url,
                               results:'',
                               isShareCallback:false,
                               shareDesc: content, 
                               shareTitle: title, 
                               shareImg: img, 
                               shareType:3   // 3好友或朋友圈
                            }

                            OSApp.shareTo(JSON.stringify(data), 'wxCallBack');
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg || '分享失败'
                            })
                        }
                    },
                    error: function (error) {
                        Notification.show({
                            type: "error",
                            message: error.msg || '分享失败'
                        })
                    }
                })

            },
            getMileRank: function () {
                var me = this;
                var rankPercentNode = me.getElement(".result-num");
                if (this._pushData) {
                    bfClient.getRankPercentByMileage({
                        data: {mileage: me._currentData.wholeRoute, histroyDate: this._pushData.currentDate},
                        success: function (data) {
                            if (data.code == 0) {
                                rankPercentNode.text(data.data);
                            } else {
                                Notification.show({
                                    type: "error",
                                    message: error.msg || '拉取排名失败'
                                })
                            }

                        },
                        error: function (error) {
                            Notification.show({
                                type: "error",
                                message: error.msg || '拉取排名失败'
                            })
                        }
                    })
                } else {
                    rankPercentNode.text(0);
                }

            },
            initUserInfo: function () {
                var container = this.getElement(".head_name");
                var user_info_data = bfDataCenter.getUserSessionData();
                if (user_info_data.faceImg != '') {
                    user_info_data.headImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + user_info_data.faceImg
                } else {
                    user_info_data.headImg = "../myinfo/image/head.png";
                }
                if (user_info_data) {
                    container.empty();
                    var temp = _.template(this.getElement("#userInfo-template").html())({user: user_info_data});
                    container.append(temp);
                }
                ;
            }
        });
    });
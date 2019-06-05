define([
        'hammer',
        "common/navView",
        "common/ssUtil",
        "text!autoNavigation/index.html",
        'butterfly',
        'shared/js/client',
        'shared/js/notification',
        "text!autoNavigation/destination.html",
        "common/osUtil",
        'common/navigationController',
        'css!common/css/im.css',
        "shared/plugin_dialog/js/dialog"
    ],
    function (Hammer, View, ssUtil, template, Butterfly, Client, Notification, destinationTemplate, osUtil, NavigationController, imCss, Alert) {
        var Base = View;
        refreshAuto = function () {
            var v = bfNaviController.current();
            if (v) {
                v.view.onShow();
            }
        };
        return Base.extend({
            id: 'autoNavigation',
            html: template,
            events: {
                "click #setHome": "setHome",
                "click #setCompany": "setCompany",
                "click #newRoute": "newRoute",
                "click #home": function () {
                    this.goAddress("home")
                },
                "click #company": function () {
                    this.goAddress("company")
                }
            },
            onDeviceBack: function () {
                if (this._dialog) {
                    this._dialog.close();
                    return true;
                }
                return false;
            },
            posGenHTML: function () {
                var from = Client.request("type");
                if (from == "message") {
                    this.setLeftVisible(true);
                }
            },
            onShow: function () {
                var self = this;
                this._countDeletNum = 0;
                //获取目的地历史
                bfClient.getDestinations({
                    type: "get",
                    success: function (data) {
                        if (data) {
                            self.destinations = data.data;
                            if (self.destinations == null) {
                                Notification.show({
                                    type: "info",
                                    message: "您还没有目的地，去添加一个吧!"
                                });
                                self.destinations = [];
                                return;
                            }

                            self.historyRoutes = [];
                            self.localHistory = [];
                            self.INDEX = 0;
                            self.SEARCH_COUNTER = Object.keys(self.destinations).length;
                            var template = _.template(destinationTemplate);
                            for (var iDest = 0; iDest < Object.keys(self.destinations).length; iDest++) {

                                var destination = self.destinations[iDest];
                                var destLng = destination.addrWgs.split(",")[0];
                                var destLat = destination.addrWgs.split(",")[1];
                                var destName = destination.addrName;
                                var orderedDay = destination.orderedDay;
                                var orderedId = destination.orderedId;
                                var orderedTime = destination.orderedTime;
                                var orderedType = destination.orderedType;
                                var userId = destination.userId;
                                self.destinations[iDest].name = destName;
                                self.destinations[iDest].lng = destLng;
                                self.destinations[iDest].lat = destLat;
                                self.destinations[iDest].orderedId = self.destinations[iDest].orderedId == null ? "" : self.destinations[iDest].orderedId;

                                var destID = destination.addrId;
                                if (destination.type == 1) {
                                    self.getElement("#home").attr("data-lng", destLng)
                                        .attr("data-lat", destLat)
                                        .attr("data-name", destName)
                                        .attr("data-orderedday", orderedDay == null ? "" : orderedDay)
                                        .attr("data-orderedid", orderedId == null ? "" : orderedId)
                                        .attr("data-orderedtime", orderedTime == null ? "" : orderedTime)
                                        .attr("data-orderedtype", orderedType == null ? "" : orderedType)
                                        .attr("data-id", destID);
                                    self.getElement("#homeInfo").html(destName);
                                } else if (destination.type == 2) {
                                    self.getElement("#company").attr("data-lng", destLng)
                                        .attr("data-lat", destLat)
                                        .attr("data-name", destName)
                                        .attr("data-orderedday", orderedDay == null ? "" : orderedDay)
                                        .attr("data-orderedid", orderedId == null ? "" : orderedId)
                                        .attr("data-orderedtime", orderedTime == null ? "" : orderedTime)
                                        .attr("data-orderedtype", orderedType == null ? "" : orderedType)
                                        .attr("data-id", destID);
                                    self.getElement("#companyInfo").html(destName);
                                } else {
                                    //添加数据到页面
                                    self.historyRoutes.push(
                                        template({
                                            lng: destLng,
                                            lat: destLat,
                                            name: destName,
                                            addrName:destName,
                                            time: "",
                                            id: destID,
                                            distance: "",
                                            orderedDay: orderedDay == null ? " " : orderedDay,
                                            orderedId: orderedId == null ? " " : orderedId,
                                            orderedTime: orderedTime == null ? " " : orderedTime,
                                            orderedType: orderedType == null ? " " : orderedType
                                        })
                                    );
                                }
                            }
                            self.getElement("#routelist").html(self.historyRoutes);

                            //本地存储路劲信息，避免重复添加
                            ssUtil.save("destinations", self.destinations);
                            // //点击进入显示百度地图
                            for (var k = 0; k < self.getElement('.routeDetail').length; k++) {
                                (function (el) {
                                    var mapHammer = new Hammer(el);
                                    mapHammer.on('tap', function () {
                                        $(el).addClass("active");
                                        var parentEl = el.parentElement.attributes;
                                        self.getElement(".deleteAction").remove();
                                        var dataId = $(el).attr("data-id");
                                        var addressLists = ssUtil.load("destinations");

                                        var currentId = 0;
                                        for (var i = 0; i < Object.keys(addressLists).length; i++) {
                                            if (dataId == addressLists[i].addrId) {
                                                currentId = i;
                                            }
                                            ;
                                        }
                                        ssUtil.save("addressLists", addressLists);
                                        var token = window.localStorage['token'];
                                        navigator.iChanganCommon.openAutoNaviRouteView({
                                            cur: currentId,
                                            carId: bfDataCenter.getCarId(),
                                            addressLists: addressLists,
                                            token: token
                                        }, function () {
                                        }, function () {
                                        });
                                    });
                                })(self.getElement(".routeDetail")[k]);

                            }

                            //发送到车按钮事件
                            self.getElement(".tocar").on("click", function (el) {
                                $(el.currentTarget).addClass("active");
                                self.getElement(".deleteAction").remove();

                                var addressLng = $(this).parents("li").attr("data-lng");
                                var addressLat = $(this).parents("li").attr("data-lat");
                                var addressName = $(this).parents("li").attr("data-name");
                                var addressLists = ssUtil.load("destinations");

                                //显示百度地图
                                var dataId = $(this).attr("data-id");
                                var currentId = 0;
                                for (var i = 0; i < Object.keys(addressLists).length; i++) {
                                    if (dataId == addressLists[i].addrId) {
                                        currentId = i;
                                    }
                                }
                                ssUtil.save("addressLists", addressLists);
                                var token = window.localStorage['token'];
                                navigator.iChanganCommon.openAutoNaviRouteView({
                                    cur: currentId,
                                    carId: bfDataCenter.getCarId(),
                                    addressLists: addressLists,
                                    token: token
                                }, function () {
                                }, function () {
                                });

                            });

                            //分享按钮事件
                            self.getElement(".share").on("click", function (el) {
                                $(el.currentTarget).addClass("active");
                                self.getElement(".deleteAction").remove();

                                var addrId = $(this).parents("li").attr("data-id");
                                ssUtil.save("sharedAddressID", addrId);
//                             
//                             token:用户令牌
//                             friendId:分享好友ID
//                             destId:分享目的地的ID

                                var token = window.localStorage['token'];
                                var destId = addrId;
                                var myId = bfDataCenter.getUserName();//获取当前手机号
                                navigator.appInfo.share({destId: destId, myId: myId}, function () {
                                }, function () {
                                });
                            });

                            //删除按钮
                            this._dialog = null;
                            var routes = self.getElement(".routeItem");
                            for (var iRoute = 0; iRoute < routes.length; iRoute++) {
                                route = routes[iRoute].children[0];
                                (function (el) {
                                    var hammer = new Hammer(el);
                                    hammer.on('press', function (e) {
                                        self._dialog = Alert.createDialog({
                                            closeBtn: false,
                                            buttons: {
                                                '确定': function () {
                                                    self._countDeletNum++;
                                                    var addressId = el.dataset.id;
                                                    self.delDestination(addressId);
                                                    this.close(); //有逻辑最好放在关闭之前
                                                },
                                                '取消': function () {
                                                    this.close();
                                                }
                                            },
                                            content: "确认要删除吗"
                                        });
                                    })
                                })(route);
                            }
                        }
                    }
                })
            },
            getDistanceDuration: function (myLng, myLat) {
                var self = this;
                var destinations = self.getElement("#routelist").find(".routeItem");
                var historyRoutes = [];
                for (var iDest = 0; iDest < destinations.length; iDest++) {
                    var destination = destinations[iDest];
                    var destLng = destination.dataset.lng;
                    var destLat = destination.dataset.lat;
                    var destId = destination.dataset.id;
                    var destName = destination.children[0].children[0].innerText;
                    var destinationsLatLng = destLat + "," + destLng;
                    var orderedDay = destination.dataset.orderedday;
                    var orderedId = destination.dataset.orderedid;
                    var orderedTime = destination.dataset.orderedtime;
                    var orderedType = destination.dataset.orderedtype;
                    $.ajax({
                        type: "get",
                        async: false,
                        data: "origins=" + myLat + ',' + myLng + "&destinations=" + destinationsLatLng + "&mode=driving&output=json&ak=SWvGwGN4nCnTooBxiZV7aFOX",
                        url: 'http://api.map.baidu.com/direction/v1/routematrix',
                        error: function (data) {
                            var result = eval("(" + data.responseText + ")");
                            if (result.status == 0) { //成功
                                var element = result.result.elements[0];
                                var duration = element.duration.text;
                                var distance = element.distance.text;
                                self.getElement("#info" + destId).html("距离您：" + distance + "&nbsp;&nbsp;&nbsp;" + duration);
                            }
                            historyRoutes.push({
                                id: destId,
                                orderedDay: orderedDay,
                                orderedId: orderedId,
                                orderedTime: orderedTime,
                                orderedType: orderedType,
                                lng: destLng,
                                lat: destLat,
                                name: destName,
                                duration: duration,
                                distance: distance
                            });
                        }
                    });
                    ssUtil.save("destinations", historyRoutes);
                }
            },
            delDestination: function (destinationID) {
                var self = this;
                bfClient.delDestination({
                    type: "post",
                    data: {'id': destinationID},
                    success: function (data) {
                        if (data && data.code == '0') {
                            Notification.show({
                                type: "well",
                                message: "删除成功!"
                            });
                            //移除本地缓存
                            var destinations = ssUtil.load("destinations");
                            for (var iDest = 0; iDest < Object.keys(destinations).length; iDest++) {

                                if (destinationID == destinations[iDest].id) {
                                    break;
                                }
                            }

                            destinations.splice(iDest, 1);
                            ssUtil.save("destinations", destinations);

                            self.getElement("#routeItem" + destinationID).remove();
                        } else {
                            Notification.show({
                                type: "error",
                                message: "删除失败，请重试!"
                            });
                        }
                    }
                });
            },
            setHome: function () {
                ssUtil.save("searchLocationType", "setHome");
                butterfly.navigate("/autoNavigation/search.html");
            },
            setCompany: function () {
                ssUtil.save("searchLocationType", "setCompany");
                butterfly.navigate("/autoNavigation/search.html");
            },
            onRight: function () {
                var me = this;
                if (me.destinations.length <= 20 || (me.destinations.length - me._countDeletNum) <= 20) {
                    ssUtil.save("searchLocationType", "newRoute");
                    butterfly.navigate("/autoNavigation/search.html");
                } else {
                    Notification.show({
                        type: "info",
                        message: "目的地数量已达上限，删除一些吧"
                    });
                }

            },
            goAddress: function (type) {
                var self = this;
                var _address_lat = self.getElement("#" + type).attr("data-lat");
                var _address_lng = self.getElement("#" + type).attr("data-lng");
                var _address_name = self.getElement("#" + type).attr("data-name");
                var _address_id = self.getElement("#" + type).attr("data-id");
                var _ordered_id = self.getElement("#" + type).attr("data-orderedid");
                var _ordered_day = self.getElement("#" + type).attr("data-orderedday");
                var _ordered_time = self.getElement("#" + type).attr("data-orderedtime");
                var _ordered_type = self.getElement("#" + type).attr("data-orderedtype");
                if (_address_lat == null) {
                    Notification.show({
                        type: "error",
                        message: "您还没有设置地址！"
                    });
                    if (type == "home") {
                        self.setHome();
                    } else {
                        self.setCompany();
                    }

                    return;
                }

                //如果回家或公司，重新更新本地addressLists数据
                var addressLists = [{
                    addrId: _address_id,
                    lng: _address_lng,
                    lat: _address_lat,
                    name: _address_name,
                    addrName: _address_name,
                    duration: "",
                    distance: "",
                    orderedId: _ordered_id,
                    orderedTime: _ordered_time,
                    orderedDay: _ordered_day,
                    orderedType: _ordered_type
                }];
                var token = window.localStorage['token'];
                //显示百度地图
                navigator.iChanganCommon.openAutoNaviRouteView({
                    cur: 0,
                    carId: bfDataCenter.getCarId(),
                    addressLists: addressLists,
                    token: token
                }, function () {
                }, function () {
                });
            },
            activeDestination: function (id) {
                bfClient.activeDestination({
                    type: "post",
                    data: {destId: id},
                    success: function (data) {
                        if (data) {
                            Notification.show({
                                type: "well",
                                message: "发送位置成功!"
                            });
                        } else {
                            Notification.show({
                                type: "error",
                                message: "发送位置失败，请重试!"
                            });
                        }
                    }
                });
            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                $('.chrysanthemum').remove();
            },
        });
    });
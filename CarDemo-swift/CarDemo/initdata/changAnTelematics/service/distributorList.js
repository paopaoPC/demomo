define([
        "common/navView",
        'butterfly',
        'shared/js/client',
        'service/service-client',
        'shared/js/notification',
        'map/index',
        'map/map-client'
    ],
    function (View, Butterfly, Client, ServiceClient, Notification, Map, MapClient) {
        return View.extend({
            id: 'distributorList',
            events: {
                "click .goBack": "goBack",
                "click .tapIcon": "getTapDetail",
                "click .distributorItem": "goLocation",
                "click .selectCity": "goSelectArea",
                "click #no-tel": "onNoTel"
            },
            render: function () {
                View.prototype.render.call(this);
                return this;
            },
            goBack: function () {
                delete window.sessionStorage["selectedCity"];
                delete window.sessionStorage["selectedProvince"];
                window.history.go(-1);
            },
            onShow: function () {
                this.listenToEvents();
                this.requestLng = Client.request("lng");
                this.requestLat = Client.request("lat");
                if (!this.requestLng && !this.requestLat) {
                    this.goLocation();
                }
            },
            onNoTel: function(){
                Notification.show({
                    type: "error",
                    message: "没有电话"
                });
            },
            listenToEvents: function () {
                var selectedProvince = window.sessionStorage["selectedProvince"];
                if (selectedProvince) {
                    this.refresh();
                } else {
                    this.uiSetConvenientDistributor();
                }
            },
            initMap: function (lng, lat) { //初始化地图
                var me =this;
                this.map = new Map({
                    el: me.$("#map"),
                    lat: lat,
                    lng: lng
                });
                this.map.render();
                this.map.onShow();
            },
            getCurrentLocation: function () { //获取当前的位置
                var me = this;
                MapClient.getCurrentLatLng(function (lng, lat) {
                    me.requestLng = lng;
                    me.requestLat = lat;
                    me.initMap(lng, lat);
                }, function (err) {
                    Notification.show({
                        type: "error",
                        message: "定位失败"
                    });
                });
            },
            cleanList: function () { //清除列表
                this.$el.find(".distributorList").find("ul").children().remove();
            },
            uiSetConvenientDistributor: function (data) { //设置附近的经销商列表
                var me = this;
                if (data) {
                    me.getListByCity(data);
                    return;
                }
                MapClient.getCurrentLatLng(function (lng, lat) {
                    data =
                    {
                        lng: lng,
                        lat: lat,
                        token: window.localStorage['token'],
                        scope: "30000"
                    };
                    me.getDealList(data);
                }, function () {
                    Notification.show({
                        type: "error",
                        message: "定位失败"
                    });
                });
            },
            getListByCity: function (data) {
                var me = this;
                ServiceClient.getDealerInfoByCity({
                    data: data,
                    beforeSend: function () {
                        me.uiAddChrysanthemum();
                    },
                    success: function (json) {
                        if (json.code == "0") {
                            if (data.userWgs) {
                                var initLng = data.userWgs.split(",")[0];
                                var initLat = data.userWgs.split(",")[1];
                                if (!me.map) {
                                    me.initMap(initLng, initLat);
                                }
                            } else {
                                if (!me.map) {
                                    me.initMap();
                                }
                            }
                            me.cleanList();
                            var distributorTemplate = $("#distributor-template").html();

                            if (json.data.length == 0) {
                                Notification.show({
                                    type: "info",
                                    message: "该地区暂无经销商"
                                });
                                return;
                            }

                            _.each(json.data, function (distributorItem) {
                                var tem = _.template(distributorTemplate, distributorItem);
                                me.$el.find(".distributorList").find("ul").append(tem);
                            });
                        } else {
                            Notification.show({
                                type: "error",
                                message: json.msg
                            });
                        }
                    },
                    error: function (err) {
                        Notification.show({
                            type: "error",
                            message: "获取数据失败"
                        });
                    },
                    complete: function () {
                        me.uiRemoveChrysanthemum();
                    }
                });
            },
            getDealList: function (data) { //获得经销商列表
                var me = this;
                bfClient.getDealerInfoByAdd({
                    data: data,
                    beforeSend: function () {
                        me.uiAddChrysanthemum();
                    },
                    success: function (json) {
                        if (json.code == "0") {
                            if (data.lng && data.lat) {
                                var initLng = data.lng;
                                var initLat = data.lat;
                                if (!me.map) {
                                    me.initMap(initLng, initLat);
                                }
                            } else {
                                if (!me.map) {
                                    me.initMap();
                                }
                            }
                            me.cleanList();
                            var distributorTemplate = $("#distributor-template").html();

                            if (json.data.length == 0) {
                                Notification.show({
                                    type: "info",
                                    message: "该地区暂无经销商"
                                });
                                return;
                            }

                            _.each(json.data, function (distributorItem) {
                                var tem = _.template(distributorTemplate, distributorItem);
                                me.$el.find(".distributorList").find("ul").append(tem);
                            });
                        } else {
                            Notification.show({
                                type: "error",
                                message: json.msg
                            });
                        }
                    },
                    error: function (err) {
                        Notification.show({
                            type: "error",
                            message: "获取数据失败"
                        });
                    },
                    complete: function () {
                        me.uiRemoveChrysanthemum();
                    }
                });
            },
            getTapDetail: function (e) {
                var me = this;
                var currentTarget = $(e.currentTarget);
                this.$el.find(".tapIcon").removeClass("active");
                currentTarget.addClass("active");
                switch (currentTarget.attr("data-value")) {
                    default:
                    case 'distributorList':
                        me.$el.find(".distributorList").show();
                        me.$el.find(".mapArea").css("visibility", "hidden");
                        break;
                    case 'map':
                        var selectedCity = window.sessionStorage["selectedCity"];
                        me.$el.find(".distributorList").hide();
                        this.$el.find(".mapArea").css("visibility", "visible");
                        me.$el.find(".chrysanthemum_map").removeClass("active");
                        setTimeout(function () {
                            me.$el.find(".chrysanthemum_map").addClass("active");
                        }, 100);
                        if (selectedCity && me.lastSelectedCity != selectedCity) {
                            me.goLocationByCity(selectedCity);
                            me.lastSelectedCity = selectedCity;
                        } else {
                            if (!this.map) {
                                me.getCurrentLocation();
                            }
                        }
                        break;
                }
            },
            goLocation: function (e) { //定位
                var lng, lat;
                if (e) {
                    var target = $(e.target);
                    if (target.hasClass("makecall") || target.hasClass("call-light-icon")) { //打电话
                        e.stopPropagation();
                        return;
                    } else {
                        var currentTarget = $(e.currentTarget);
                        lng = currentTarget.attr("data-lng"); //经度
                        lat = currentTarget.attr("data-lat"); //纬度
                    }
                } else {
                    lng = this.requestLng;
                    lat = this.requestLat;
                }
                this.$el.find(".tapIcon").removeClass("active");
                this.$el.find(".map-icon").addClass("active");
                this.$el.find(".distributorList").hide();
                this.$el.find(".mapArea").css("visibility", "visible");

                if (!this.map) {
                    this.initMap();
                }
                this.map.locateByPoint(lng, lat);
            },
            goLocationByCity: function (city) {
                if (!this.map) {
                    this.initMap();
                }
                this.map.locateByAddress(city);
            },
            goSelectArea: function (e) {
                butterfly.navigate('/service/selectArea.html');
            },
            refresh: function () {
                var me = this;
                this.requestLng = Client.request("lng");
                this.requestLat = Client.request("lat");
                if(!this.requestLat||!this.requestLng){
                    me.getCurrentLocation();
                }
                var selectedCity = window.sessionStorage["selectedCity"];
                me.uiSetConvenientDistributor({
                    addrCode: selectedCity,
                    userWgs: me.requestLng + "," + me.requestLat
                });
                me.goLocationByCity(selectedCity);
            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.find('.distributorList').append("<div class='chrysanthemum active' style='text-align: center;'><div></div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                me.$el.find('.chrysanthemum').remove();
            }
        });

    });
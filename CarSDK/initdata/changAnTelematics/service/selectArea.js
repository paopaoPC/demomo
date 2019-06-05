define([
        "common/navView",
        'butterfly',
        'text!service/selectArea.html',
        'shared/js/client',
        'iscroll',
        'listview/ListView',
        'listview/DataSource',
        'shared/js/notification',
        'map/index',
        'map/map-client',
        'applyService/distributor-client'
    ],
    function (View, Butterfly, viewTemplate, Client, iscroller, ListView, DataSource, Notification, Map, MapClient, distributorClient) {
        var myCityDataSource = DataSource.extend({
            ajaxLoadData: function (options) {
                var cityList = [];
                _.each(window.cityShowData, function (cityItem) {
                    var city = {};
                    city.cityName = cityItem.addrName;
                    city.provinceName = cityItem.provinceName;
                    city.pid = cityItem.pid;
                    city.addrId = cityItem.addrId;
                    cityList.push(city);
                });
                var obj = {};
                obj.data = cityList;
                options.success(obj);
            }
        });

        return View.extend({
            id: 'selectArea',
            events: {
                "click .goBack": "goBack",
                "click .provinceItem": "goShowCityList",
                "input #searchInput": "onInput",
                "click .search-icon": "goSeach"
            },
            render: function () {
                View.prototype.render.call(this);
                return this;
            },
            onHide: function () {
                delete window.cityShowData;
            },
            onShow: function () {
                this.checkNewData();
                this.initIScroller();
                this.uiSetProvinces();

            },
            goBack: function () {
                window.history.go(-1);
            },
            uiSetWhere: function () { //定位当前位置
                var me = this;
                me.map = new Map();
                MapClient.getCurrentLatLng(function (lng, lat) {
                    me.map.getAddressByPoint(lng, lat, function (result) {
                        me.$el.find(".where-text").text(result.addressComponents.city);
                        me.$el.find(".where-text").attr("data-value", result.addressComponents.city);
                    }, function (error) {

                    });
                }, function (err) {
                    Notification.show({
                        type: "error",
                        message: "定位失败"
                    });
                });
            },
            checkNewData: function () {		//检查数据更新（一星期更新一次）
                var selectAreaDataTime = window.localStorage['selectAreaDataTime'];
                if (selectAreaDataTime) {
                    var newDate = new Date();
                    selectAreaDataTime = moment(selectAreaDataTime)._d;
                    if ((newDate - selectAreaDataTime) / (24 * 60 * 60 * 1000) > 7) {
                        window.localStorage.removeItem('selectAreaData');
                    }
                }
            },

            initIScroller: function () {
                this.provinceScroller = new IScroll('#provinceList', {
                    probeType: 1,
                    mouseWheel: true,
                    scrollY: true
                });
            },
            initListView: function () {
                var me = this;
                //数据源
                this.datasource = new myCityDataSource({
                    identifier: 'city-datasource',
                    storage: "none",
                    pageParam: 'pageIndex',

                });
                var listEl = this.el.querySelector("#cityList"); //存放列表的父容器
                var template = _.template($("#city-template").html());
                //初始化垂直列表
                this.listview = new ListView({
                    el: listEl,
                    itemTemplate: template,
                    dataSource: this.datasource,
                    id: "city-listview"
                });
                me.listenTo(me.listview, 'itemSelect', me.selectCity);
            },
            uiSetProvincesAndInitCity: function (data) {	//设置省份和城市

                var me = this;
                var provinceTitleTemplate = $("#provinceTitle-template").html();
                var provinceItemTemplate = $("#province-template").html();
                var provinceList = me.$el.find("#provinceList").find("ul");
                _.each(data, function (dataItem) {  //lxc
                    var liItem = $('<li class="proviceClass"></li>');
                    var provinceTitleTemp = _.template(provinceTitleTemplate);
                    var provinceItemTemp = _.template(provinceItemTemplate);
                    var obj = {};
                    obj.provinceTitle = dataItem.pinYin;
                    if (me.$el.find("#" + dataItem.pinYin).length == 0) {
                        liItem.append(provinceTitleTemp(obj)); //省份标题
                    }
                    var provinceObj = {};
                    provinceObj.provinceName = dataItem.addrName;
                    liItem.append(provinceItemTemp(provinceObj));
                    if (me.$el.find("#" + dataItem.pinYin).length == 0) {
                        var pz = me.$el.find(".provinceTitle");
                        var flag = 0;
                        for (var i = 0; i < pz.length; i++) {
                            if (dataItem.pinYin.charCodeAt() < pz[i].id.charCodeAt()) {
                                $(pz[i].parentElement).before(liItem);
                                flag = 1;
                                return true;
                            }
                        }
                        if (flag == 0) {
                            provinceList.append(liItem);
                        }
                    } else {
                        $(me.$el.find("#" + dataItem.pinYin)[0].parentElement).after(liItem);
                    }
                });

                me.DealerTreeInfo = data;
                var allCityList = [];
                _.each(me.DealerTreeInfo, function (provinceItem) {
                    _.each(provinceItem.children, function (cityItem) {
                        cityItem.provinceName = provinceItem.addrName;
                    });
                    allCityList = allCityList.concat(provinceItem.children);
                });
                window.cityShowData = allCityList;
                me.initListView();
                setTimeout(function () {
                    me.provinceScroller.refresh();
                }, 0);
            },
            uiSetProvinces: function () {
                var me = this;
                var provinceTitleTemplate = $("#provinceTitle-template").html();
                var provinceItemTemplate = $("#province-template").html();
                var postdata = {
                    token: window.localStorage.getItem("token")
                };
                distributorClient.getTreeinfoNet({
                    data: postdata,
                    success: function (data) {
                        me.uiSetProvincesAndInitCity(data.children[0].children);
                        window.localStorage['selectAreaDataTime'] = moment().format('YYYY-MM-DD');
                    }, error: function (error) {
                        Notification.show({
                            type: "error",
                            message: "获取数据失败"
                        });
                    }
                });

            },


            goShowCityList: function (e) {
                var me = this;
                this.$el.find(".provinceItem").removeClass('activeProvince');

                var currentTarget = $(e.currentTarget);

                currentTarget.addClass("activeProvince");
                var province = currentTarget.attr("data-value");
                var currentLocationCityData = _.find(this.DealerTreeInfo, function (provinceItem) {
                    return provinceItem.addrName == province;
                });
                if (currentLocationCityData) {
                    window.cityShowData = currentLocationCityData.children;
                    this.listview.reloadData();
                } else {
                    Notification.show({
                        type: 'error',
                        message: '未知错误'
                    })
                }

            },
            selectCity: function (listview, item, index, event) {
                var selectedCity = item.$el.find(".cityItem").attr("data-value"); //选择的城市或者区 todo 测试数据，到时恢复
                var selectedProvince = item.$el.find(".cityItem").attr("data-province");	//省份
                this.$el.find(".cityItem").removeClass("activeCity");
                item.$el.find(".cityItem").addClass("activeCity");
                window.sessionStorage["selectedCity"] = selectedCity;
                window.sessionStorage["selectedProvince"] = selectedProvince;
                this.goBack();
            },
            onInput: function () { //输入
                var me = this;
                me.$(".placeholder").hide();
                clearTimeout(me.req);
                clearTimeout(me.req2);
                var valueNotTrime = $(me.el).find("#searchInput").val();
                me.req2 = setTimeout(function () {
                    me.$el.find(".provinceItem").removeClass('activeProvince');
                    me.$el.find(".cityItem").removeClass("activeCity");
                    if (valueNotTrime === "") {
                        delete window.cityShowData;
                        me.listview.reloadData();
                    } else {
                        var lastHandlerValue = $(me.el).find("#searchInput").val().trim();
                        me.req = setTimeout(function () {

                            var allCityList = [];
                            _.each(me.DealerTreeInfo, function (provinceItem) {
                                allCityList = allCityList.concat(provinceItem.children);
                            });
                            window.cityShowData = _.filter(allCityList, function (cityItem) { //定位搜索信息
                                return cityItem.addrName.indexOf(lastHandlerValue) != -1;
                            });
                            me.listview.reloadData();
                        }, 1000);
                    }
                }, 10); //ios输入法按确定的时候触发了两次，改变了lastHandlerValue，导致输入拼音点汉字时不搜索
            },
            goSeach: function () {
                var me = this;
                var lastHandlerValue = $(me.el).find("#searchInput").val().trim();
                var allCityList = [];
                _.each(me.DealerTreeInfo, function (provinceItem) {
                    allCityList = allCityList.concat(provinceItem.children);
                });
                window.cityShowData = _.filter(allCityList, function (cityItem) { //定位搜索信息
                    return cityItem.addrName.indexOf(lastHandlerValue) != -1;
                });
                me.listview.reloadData();
            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div></div>");
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                me.$el.find('.chrysanthemum').remove();
            }

        }); //view define

    });
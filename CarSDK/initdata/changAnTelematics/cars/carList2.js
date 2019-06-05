define([
        "text!cars/carList2.html",
        "common/navView",
        'butterfly',
        'shared/js/notification',
        "underscore",
       "shared/js/scroll-pull-down"
    ],
    function (template, View, Butterfly, Notification, _, ScrollPullDown) {

        var Base = View;
        var PULLDOWN_Y = 60;
        var cls = {
            events: {
                "click #other_car": "chooseOtherCar"
            }
        };
        cls.onShow = function(){
            // this.getElement(".my-car").removeClass("active")
            this.initScroll();
        }
        cls.posGenHTML = function () {
            var self = this;
            //获取车辆管理列表
            bfClient.getCarList({
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.code == 0) {
                        var token = window.localStorage.getItem("token");
                        self._dataList = data.data;//把车辆列表存入dataList
                        //生成列表
                        var container = self.elementFragment('#car-list');
                        container.empty();

                        var carTemplate = self.elementHTML('#my-car-template');
                        var template = _.template(carTemplate);
                        
                        for (var i = 0; i < self._dataList.length; ++i) {
                            container.append(template({"rows": self._dataList[i], "index": i, "token":token}));
                        }
                        container.setup();
                        self.getElement(".my-car").on("click", function (event) {
                            self.chooseMyCar(event);
                        });
                        self.getElement(".my-car").on("touchstart", function(){
                            $(this).addClass("active")
                        })
                        self.getElement(".my-car").on("touchend", function(){
                            $(this).removeClass("active")
                        })
                        self.initScroll();
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        });
                    }
                    self.getElement("#other_car").css("display","block");
                },
                complete: function(){
                    //让loding看不到
                    self.scrollPullDown && self.scrollPullDown.resizePulldown();
                }
            });
        }
        //下拉刷新
            cls.initScroll = function() {

                var me = this;
                if (!me.scrollPullDown) {
                    me.$pullDown = me.$('.pulldown');
                    me.scrollPullDown = new ScrollPullDown({
                        el: me.$el,
                        onScrollCallback: function () {
                            me.posGenHTML();   
                        },
                        onScrollEnd: function () {
                            if (me.$pullDown.hasClass('flip')) {
                                me.$pullDown.addClass('loading');
                                me.$('.pulldown .label').html('正在刷新...');
                                me.scrollPullDown.scrollCallback();
                            }
                            me.scrollPullDown.setUILoadingPer(0);
                        }
                    })
                } else {
                    me.scrollPullDown.myscroll.refresh();
                }

            }

            cls.chooseMyCar = function (event) {

                var self = this;
                var target = $(event.currentTarget);
                // target.addClass("active");
                var str = target.find(".right-bottom-item").text();
                this._cityName = str.charAt(4);
                var currentIndex = $(event.currentTarget).attr("data-index");
                var currentData = this._dataList[currentIndex];
                //车牌号的正则表达式
                var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领a-zA-Z]{1}[a-zA-Z]{1}[警京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{0,1}[a-zA-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
                //读取城市的简称信息
                bfClient.getLocationImfor({
                    type: "POST",
                    dataType: "json",
                    success: function (json) {
                        self._datas = json.data.data;
                        self.checkImfor();
                        var plateNumber = currentData.plateNumber;
                        var vin = currentData.vin;
                        var engineNo = currentData.engineNo;
                        if (express.test(plateNumber) && vin && engineNo) {
                            bfNaviController.push("/violation/violationResults/violationResults.html",{data: currentData})
                        }else{
                            bfNaviController.push('violation/index.html', {
                                data: currentData,
                                city: self._shortCity
                            });
                        }
                        
                    }
                })
            }

            cls.chooseOtherCar = function () {

                butterfly.navigate("violation/index.html");
            }

        cls.checkImfor = function () {
            var me = this;
            this._shortCity = "";
            for (var i = 0; i < me._datas.length; i++) {
                if (this._cityName == me._datas[i].name) {
                    var id = me._datas[i].id;
                    if (this._cityName.charCodeAt() >= 90 && this._cityName.charCodeAt() <= 122) {
                        this._shortCity = {
                            name: '渝',
                            id: 'cq'
                        }
                    } else {
                        this._shortCity = {
                            name: this._cityName,
                            id: id
                        }
                    }
                    break;
                }
            }
        }
        return Base.extend(cls);
    }
);
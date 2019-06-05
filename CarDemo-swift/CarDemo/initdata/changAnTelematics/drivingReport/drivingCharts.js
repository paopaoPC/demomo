// 这里根据tbox控制一下流量和费用的显隐(优先 根据设备控制类型是否渲染，或者在模板中写条件语句。如果是html中的内容那么才在onshow或posGenHTML中写hide)
define(
    [
        "common/navView",
        "highcharts",
        "swipe",
        "underscore",
        "common/osUtil",
        "drivingReport/cfg/chartConfig",
        "shared/js/notification",
        'shared/timePicker/js/date'
    ],
    function (Base, highcharts, swipe, _, osUtil, chartConfig, Notification, DatePicker) {
        var DrivingCharts_Swipe;
        var DrivingCharts =
        {
            id: 'DrivingCharts',
            events: {
                "click .next_week": "nextWeek",
                "click .prev_week": "prevWeek",
                "click #item0": "slideOne",
                "click #item1": "slideTwo",
                "click #navLeft": "Back"
            }
        };
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
        DrivingCharts.goBack = function () {
            bfNaviController.pop(1);
            // window.sessionStorage.setItem("onViewBack", true);
        };
        DrivingCharts.nextWeek = function () {
            var date = new Date(this._date);
            date.setMonth(date.getMonth() + 1);
            var d = new Date();
            if (date - d > 0) {
                return;
            }
            this._date = date.format("yyyy-MM-dd");
            this.getSeDate();
        };
        DrivingCharts.prevWeek = function () {
            var date = new Date(this._date);
            date.setMonth(date.getMonth() - 1);
            var d = new Date();
            this._date = date.format("yyyy-MM-dd");
            this.getSeDate();
        };
        DrivingCharts.slideOne = function () {
            if(typeof DrivingCharts_Swipe == "undefined"){
                return;
            }
            DrivingCharts_Swipe.prev();
        };
        DrivingCharts.slideTwo = function () {
            if(typeof DrivingCharts_Swipe == "undefined"){
                return;
            }
            DrivingCharts_Swipe.next();
        };
        DrivingCharts.doGetData = function () {
            var me = this;
            bfClient.historyTrackByDate({
                data: {
                    "startDate": me._startDate,
                    "endDate": me._endDate
                },
                type: "post",
                dataType: "json",
                success: function (data) {
                    if(data.code == 3){
                        data.code = 0;
                        data.data = [];
                    }
                    if (data.code == 0) {
                        var datexianshi = new Date(me._startDate);
                        me.elementHTML(".driving_date_words", datexianshi.format("yyyy年MM月"));
                        me._drivingRoute = data.data;
                        //配置数组为以天为单位的数组
                        var configedArray = [];
                        var dateArray = [];
                        var date = null;
                        var configedItem = null;
                        for (var i = 0; i < me._drivingRoute.length; i++) {
                            var item = me._drivingRoute[i];
                            date = item.startTime.substring(0, 10);
                            configedItem = configedArray[date];
                            if (!configedItem) {
                                var dataToBeConfiged = {
                                    "wholeRoute": parseFloat(item.mileage),
                                    "wholeCost": parseFloat(item.fee),
                                    "wholeTime": parseFloat(item.spendTime),
                                    "wholeOil": parseFloat(item.oil),
                                    "arrayForDay": [item],
                                    "wholeSpeedUp": item.speedUp,
                                    "wholeSpeedDown": item.speedDown,
                                    "wholeSharpTurn": item.sharpTurn,
                                    "wholeScore": item.score
                                };
                                configedArray[date] = dataToBeConfiged;
                                dateArray.push(date);
                            } else {
                                configedArray[date].arrayForDay.push(item);
                                configedArray[date].wholeRoute += parseFloat(item.mileage);
                                configedArray[date].wholeCost += parseFloat(item.fee);
                                configedArray[date].wholeTime += parseFloat(item.spendTime);
                                configedArray[date].wholeOil += parseFloat(item.oil);
                                configedArray[date].wholeSpeedUp += item.speedUp;
                                configedArray[date].wholeSpeedDown += item.speedDown;
                                configedArray[date].wholeSharpTurn += item.sharpTurn;
                                configedArray[date].wholeScore += parseFloat(item.score);
                            }
                        }
                        me._currentDate = dateArray[0];
                        me._configedArray = configedArray;
                        //时间倒序排列
                        var newDateArray = [];
                        for (var i = 0; i < dateArray.length; i++) {
                            newDateArray[i] = dateArray[dateArray.length - i - 1];
                        }
                        me._dateArray = newDateArray;
                        me._currentPosition = newDateArray.length;
                        //根据选择的时间组装数据
                        me._weekDatas = [];
                        //获得系统当前时间
                        var currentDate = new Date(me._endDate);
                        var forLength = ( new Date(me._endDate) - new Date(me._startDate) ) / 86400000 + 1;
                        //获取当前时间前7天时间
                        for (var i = 0; i < forLength; i++) {
                            temp = currentDate.format("yyyy-MM-dd");
                            // timeDate.push(temp);
                            me._weekDatas.push(me._configedArray[temp]);
                            currentDate.setDate(currentDate.getDate() - 1);
                        }
                        me._initTabContent();//刷新页面
                    }
                    else {
                        var datexianshi = new Date(me._startDate);
                        me.elementHTML(".driving_date_words", datexianshi.format("yyyy年MM月"));
                        var container = me.getElement("#driving_charts");
                        container.find('div').empty();
                        var template = _.template(me.elementHTML("#chart-template"));
                        var genChart = function (container, type, name, series, config, length) {
                            var disSeries = series;
                            var disTotal = 0;
                            var disConfig = config;
                            var categories = chartConfig.getCategories(type, length);
                            var curtime = new Date(type);
                            var month = curtime.getMonth() + 1;
                            var year = curtime.getFullYear();
                            var pointStart = Date.UTC(year, month, 1);
                            _.each(disSeries, function (v) {
                                disTotal = (disTotal + v);
                            });
                            if (name == "maxVelo") {
                                if(disTotal !== 0){
                                    disTotal = disTotal / 7;
                                }
                            }
                            disTotal = disTotal.toFixed(1);
                            var html = template({
                                chartId: "chart-" + type + "-" + name,
                                chartStyle: disConfig.chartStyle,
                                titleLineStyle: disConfig.titleLineStyle,
                                title: disConfig.title,
                                unit: disConfig.unit,
                                total: disTotal,
                                totalStyle: disConfig.totalStyle,
                                otherTip: categories.tip
                            });
                            container.append($(html));
                            var options = osUtil.clone(chartConfig.chartDefaultOptions, true);

                            var chartElement = me.getElement("#chart-content", "#chart-" + type + "-" + name);
                            options.colors = [disConfig.plotLineColor];
                            options.series = [{
                                data: disSeries
                            }];
                            if (name == 'distance') {
                                options.yAxis.tickInterval = 50;
                            } else if (name == 'petrol') {
                                options.yAxis.tickInterval = 5;
                            } else if (name == 'maxVelo') {
                                options.yAxis.tickInterval = 20;
                            }
                            options.xAxis.lineColor = disConfig.hLineColor;
                            options.yAxis.gridLineColor = "rgba(9, 170, 236, 0.25)";
                            options.yAxis.gridLineDashStyle = 'longdash';
                            options.xAxis.categories = categories.cats;
                            options.xAxis.tickPositioner = function () {
                                var buffer = [];
                                var data = this.categories;
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i] % 4 == 0) {
                                        buffer[i] = data[i];
                                    } else {
                                        buffer[i] = "";
                                    }
                                }
                                return buffer;
                            };
                            options.yAxis.floor = 0;
                            options.tooltip = {
                                formatter: function () {
                                    return this.x + '号<br/>' +
                                        '当前值：<b>' + this.y.toFixed(2) + '</b>';
                                }
                            };
                            osUtil.delayCall(function () {
                                chartElement.highcharts(options);
                            });
                        };
                        var length = ( new Date(me._endDate) - new Date(me._startDate) ) / 86400000 + 1;
                        var distance = [];
                        for (var i = 0; i < length; i++) {
                            distance.push(0);
                        }
                        var petrol = distance;
                        var maxVelo = distance;
                        genChart(container.find(".driving_charts_distance"), me._endDate, "distance", distance, chartConfig.distance, length);
                        // if (bfDataCenter.getCarDevice() !== 'tbox') {
                            genChart(container.find(".driving_charts_petrol"), me._endDate, "petrol", petrol, chartConfig.petrol, length);
                        // }
                        genChart(container.find(".driving_charts_maxVelo"), me._endDate, "maxVelo", maxVelo, chartConfig.maxVelo, length);
                    }
                    if (DrivingCharts_Swipe) {
                        DrivingCharts_Swipe = null;
                    }
                    DrivingCharts_Swipe = new Swipe(me.getElement("#slider")[0], {
                        continuous: false,
                        callback: function (index) {
                            switch (index) {
                                case 0:
                                    me.getElement("#item0").addClass("active-bar");
                                    me.getElement("#item1").removeClass("active-bar");
                                    break;
                                case 1:
                                    me.getElement("#item0").removeClass("active-bar");
                                    me.getElement("#item1").addClass("active-bar");
                                    break;
                            }
                        }
                    });
                }
            });
        };

        DrivingCharts.constructor = function (options) {
            Base.prototype.constructor.call(this, options);
        };
        DrivingCharts.onShow = function () {
            var me = this;
            //拉取总的驾驶数据
            var html = "<div id='slideChange'><div id='item0' class='second-title active-bar' style='position: relative;'>月</div>"
                + "<div id='item1' class='second-title'>累计</div></div>";
            me.getElement(".im-default-nav-bar").after(html);
            this.getTtotleData();
            //设置拉取时间
            var date = new Date();
            this._date = date.format("yyyy-MM-dd");
        };
        DrivingCharts.getSeDate = function () {
            var currentDate = new Date(this._date);
            var currentDay = currentDate.getDay();
            this._startDate = new Date(this._date);
            this._endDate = new Date(this._date);
            this._startDate.setDate(1);
            var length = chartConfig.DayNumOfMonth(this._startDate.getFullYear(), this._startDate.getMonth() + 1);
            this._endDate.setDate(length);
            var d = new Date();
            this._startDate = this._startDate.format('yyyy-MM-dd');
            this._endDate = this._endDate.format('yyyy-MM-dd');
            this.doGetData();
        };
        DrivingCharts._initTabContent = function () {
            var self = this;
            var datas = {
                distance: [],
                petrol: [],
                maxVelo: [],
                time:[]
            };
            self._pushData = self._weekDatas;
            for (var i = self._pushData.length; i > 0; i--) {
                if (self._pushData[i - 1]) {
                    datas.distance.push(self._pushData[i - 1].wholeRoute);
                    datas.petrol.push(self._pushData[i - 1].wholeOil);
                    datas.time.push(self._pushData[i - 1].wholeTime);
                    var avergSpeed = 0;
                    if (self._pushData[i - 1].wholeRoute != 0 && self._pushData[i - 1].wholeTime != 0) {
                        avergSpeed = self._pushData[i - 1].wholeRoute / (self._pushData[i - 1].wholeTime / 60);
                    }
                    datas.maxVelo.push(parseFloat(avergSpeed));
                } else {
                    datas.distance.push(0);
                    datas.petrol.push(0);
                    datas.maxVelo.push(0);
                }

            }
            self._onUpdateTabContent(datas);
        };
        DrivingCharts._onUpdateTabContent = function (data) {
            var self = this;
            var genChart = function (container, type, name, series, config, length) {
                var disSeries = series;
                var disTotal = 0;
                var disConfig = config;
                var categories = chartConfig.getCategories(type, length);
                var curtime = new Date(type);
                var month = curtime.getMonth() + 1;
                var year = curtime.getFullYear();
                var pointStart = Date.UTC(year, month, 1);
                var Timecount = 0;
                _.each(disSeries, function (v) {
                    disTotal = (disTotal + v);
                });
                if (name == "maxVelo") {
                    if(disTotal !== 0){
                        for(var i=0;i<data.time.length;i++){
                            Timecount = Timecount + data.time[i];
                        }
                        for(var i=0;i<data.distance.length;i++){
                          disTotal = disTotal + data.distance[i];
                        }
                        disTotal = (disTotal / parseFloat(Timecount))*60;
                    }

                }
                disTotal = disTotal.toFixed(1);
                var html = template({
                    chartId: "chart-" + type + "-" + name,
                    chartStyle: disConfig.chartStyle,
                    titleLineStyle: disConfig.titleLineStyle,
                    title: disConfig.title,
                    unit: disConfig.unit,
                    total: disTotal,
                    totalStyle: disConfig.totalStyle,
                    otherTip: categories.tip
                });
                container.append($(html));
                var options = osUtil.clone(chartConfig.chartDefaultOptions, true);
                var chartElement = self.getElement("#chart-content", "#chart-" + type + "-" + name);
                options.colors = [disConfig.plotLineColor];
                if (disSeries.length === 1) {
                    if (name == "petrol") {
                        disSeries[0] = parseFloat(disSeries[0].toFixed(2));
                    } else {
                        disSeries[0] = Math.round(disSeries[0]);
                    }
                }
                if(disSeries){  //屏蔽还没发生轨迹的日期
                    var currentMonth =  new Date(self._endDate).getMonth();
                    var todayMonth = new Date().getMonth()
                    var beginIndex;
                    if(currentMonth == todayMonth){
                      beginIndex = new Date().getDate();
                    }else{
                      beginIndex = new Date(self._endDate).getDate();
                    }

                    for(var i = beginIndex;i <disSeries.length;i++){
                      if(!disSeries[i]){
                          disSeries[i] = null;
                      }
                    }
                }
                options.series = [{
                    data: disSeries
                }];

                options.xAxis.lineColor = disConfig.hLineColor;
                options.xAxis.categories = categories.cats;
                options.xAxis.tickPositioner = function () {
                    var buffer = [];
                    var data = this.categories;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] % 4 == 0) {
                            buffer[i] = data[i];
                        } else {
                            buffer[i] = "";
                        }
                    }
                    return buffer;
                };
                if (name == 'distance') {
                    options.yAxis.tickInterval = 50;
                } else if (name == 'petrol') {
                    options.yAxis.tickInterval = 5;
                } else if (name == 'maxVelo') {
                    options.yAxis.tickInterval = 20;
                }
                options.yAxis.gridLineColor = "rgba(9, 170, 236, 0.25)";
                options.yAxis.gridLineDashStyle = 'longdash';
                options.yAxis.floor = 0;
                options.tooltip = {
                    formatter: function () {
                        return this.x + '号<br/>' +
                            '当前值：<b>' + this.y.toFixed(2) + '</b>';
                    }
                };
                osUtil.delayCall(function () {
                    chartElement.highcharts(options);
                });
            };
            var container = this.getElement("#driving_charts");
            container.empty();
            var template = _.template(this.elementHTML("#chart-template"));
            var length = ( new Date(this._endDate) - new Date(this._startDate) ) / 86400000 + 1;
            genChart(container, this._endDate, "distance", data.distance, chartConfig.distance, length);
            // if (bfDataCenter.getCarDevice() !== 'tbox') {
                // genChart(container, this._endDate, "petrol", data.petrol, chartConfig.petrol, length);
            // }
            genChart(container, this._endDate, "maxVelo", data.maxVelo, chartConfig.maxVelo, length);
        };
        //总的驾驶数据
        DrivingCharts.getTtotleData = function () {
            var self = this;
            var currentCarId = bfDataCenter.getCarId();
            bfClient.getDrivingData({
                data: {carId: currentCarId},
                success: function (data) {
                    if (data.code == 0) {
                        self._datas = {
                            distance: data.data.carTotalMileage,
                            petrol: data.data.carTotalFuelConsumption,
                            totalFee: data.data.carTotalCost,
                            maxVelo: (data.data.carTotalDrivingTime / 60).toFixed(2),
                            averVelo: (data.data.carTotalMileage / (data.data.carTotalDrivingTime / 60)).toFixed(2),
                            petrol100: (data.data.carTotalFuelConsumption / data.data.carTotalMileage * 100).toFixed(2)
                        };
                        if (self._datas.petrol100 == "NaN") {
                            self._datas.petrol100 = 0;
                        }
                        self.appendTotleData();
                        self.getSeDate();
                    } else {
                        Notification.show({
                            type: "info",
                            message: data.msg
                        });
                        self._datas = {
                            distance: "--",
                            petrol: "--",
                            totalFee: "--",
                            maxVelo: "--",
                            averVelo: "--",
                            petrol100: "--"
                        };
                        self.appendTotleData();
                    }
                },
                error: function (data) {
                    Notification.show({
                        type: "info",
                        message: data.msg
                    });
                    self._datas = {
                        distance: "--",
                        petrol: "--",
                        totalFee: "--",
                        maxVelo: "--",
                        averVelo: "--",
                        petrol100: "--"
                    };
                    self.appendTotleData();
                }
            });
        };
        //根据总的驾驶数据显示页面
        DrivingCharts.appendTotleData = function () {
            // var template = _.template(this.elementHTML("#data-template"));
            // var html = template(this._datas);
            this.$('#chartsViewDistance .value').html(this._datas.distance)
            this.$('#chartsViewPetrol .value').html(this._datas.petrol)
            this.$('#chartsViewTotalFee .value').html(this._datas.totalFee)
            this.$('#chartsViewMaxVelo .value').html(this._datas.maxVelo)
            this.$('#chartsViewAverVelo .value').html(this._datas.averVelo)
            this.$('#chartsViewPetrol100 .value').html(this._datas.petrol100)
            // this.elementHTML("#driving_totledata", html);
        };

        return Base.extend(DrivingCharts);
    }
);
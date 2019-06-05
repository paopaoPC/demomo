define([
        'common/navView',
        'text!drivingReport/index.html',
        'butterfly',
        'shared/js/notification',
        'moment',
        "hammer",
        "common/disUtil",
        'shared/plugin_dialog/js/dialog',
        "shared/js/scroll-pull-down",
        'shared/js/swiper_two', //这里引入swiper,因为swipe没有touchstart的回调
        'css!shared/css/swiper.min.css'
    ],
    function (View, viewTemplate, Butterfly, Notification, moment, Hammer, disUtil, Dialog, ScrollPullDown, SwiperBeforeVersion) {
        var Base = View;
        getOneTrajectoryData = function (index, routeId) {   //打开原生轨迹页面
        // alert('111111111111')
            var carDevice = bfDataCenter.getCarDevice();
            bfClient.getDetailPoints({
                type: 'get',
                data: {'drivingHistoryId': routeId, 'carId': bfDataCenter.getCarId()},
                success: function (data) {
                    if (data.success) {
                        var routeData = data.data;
                        routeData.fee = routeData.fee.toFixed(1);
                        routeData.avrgSpeed = routeData.avrgSpeed.toFixed(1);
                        routeData.spendTime = routeData.spendTime.toFixed(0);
                        routeData.oil = routeData.oil.toFixed(1);
                        routeData.score = 100 - routeData.speedUp * 2 - routeData.sharpTurn * 2 - routeData.overSpeed * 2 - routeData.speedDown * 2;
                        if (routeData.score < 0) {
                            routeData.score = 0;
                        }

                        routeData.score = routeData.score.toFixed(0);
                        routeData.scoreColor = "green";
                        routeData.scoreLevel = "优秀";
                        if (routeData.score < 60) {
                            routeData.scoreColor = "red";
                            routeData.scoreLevel = "差";
                        } else if (routeData.score <= 80) {
                            routeData.scoreColor = "yellow";
                            routeData.scoreLevel = "良好";
                        }
                        // alert('回退3')
                        // alert(carDevice)
                        OSApp.oneTrajectoryData(JSON.stringify({
                            data: routeData,
                            index: index,
                            carDevice: carDevice
                        }));
                    } else {
                        // navigator.appInfo.showStatus("error", data.msg);
                        OSApp.showStatus("error", data.msg);

                    }
                },
                error: function () {
                    // navigator.appInfo.showStatus("error", "网络开小差");
                    OSApp.showStatus("error", "网络开小差");
                }
            });
        };
        return Base.extend({
            id: "drivingReport",
            html: viewTemplate,
            events: {
                'click .datetime-swipe-item': 'selectDatetimeItem',
                'tap .deleteDriving-warp': "deleteDriving",

                "click .guide-shadow": "hideShadow",
                "click .guide-setting-driving-history": "goToCarDetails",

                "click #navTitle": "goSelectCalendar",//选择月份
                "click .driving-option4": "onClickOption2",

                'touchstart .datetime-swipe': 'onTouchStart',
                'touchend .datetime-swipe': 'onTouchEnd',
                'touchmove .datetime-swipe': 'onTouchMove',

                'touchstart #scroller': 'onTouchStartContent',
                'touchmove #scroller': 'onTouchContent',
            },
            onTouchStartContent: function (events) {
                this.touchNum = 0;
                this.lastX = events.originalEvent.touches[0].clientX;
                this.lastY = events.originalEvent.touches[0].clientY;
                this.endX = 0;
            },
            onTouchContent: function (events) {

                if (this.touchNum !== 15) {
                    this.touchNum = this.touchNum + 1;
                    if (this.touchNum < 3) {
                        return
                    }
                    this.clientX = events.originalEvent.touches[0].clientX;
                    this.clientY = events.originalEvent.touches[0].clientY;

                    var changeX = Math.abs(this.clientX - this.lastX);
                    var changeY = Math.abs(this.clientY - this.lastY);
                    if (changeX > 20 || changeY > 20) {
                        this.$('.list-content').removeClass('deleteDriving');
                    }
                }

            },
            showGuideSettingDrivingHistory: function () {
                if(window.localStorage['isPrivacyDrvingHistory'] != 1){
                    return
                }
                if (window.localStorage['GuideSettingDrivingHistory'] !== 'true') {
                    // var positionTop = this.$('.driving-option3').position().top - 20;
                    // 改成固定
                    if (this.$('#drivingIndexView-oil').css('display') == 'none') {
                        var positionTop = disUtil.remToPx('1.3653275079139808') + 45;
                    } else {
                        var positionTop = disUtil.remToPx('2.116257637213981') + 45;
                    }


                    if (positionTop) {
                        this.$('.guide-setting-driving-history').css('margin-top', positionTop + 'px');
                        this.$('.guide-shadow').show().find('.guide-setting-driving-history').show();

                        window.localStorage['GuideSettingDrivingHistory'] = true;
                    }

                }
            },
            showGuideDeleteDriving: function () {
                if (window.localStorage['GuideDeleteDriving'] !== 'true') {
                    // var positionTop = this.$('.driving-route').position().top;
                    // 改成固定
                    if (this.$('#drivingIndexView-oil').css('display') == 'none') {
                        var positionTop = disUtil.remToPx('1.5018605079139808') + 121;
                    } else {
                        var positionTop = disUtil.remToPx('2.252790637213981') + 121;
                    }

                    if (positionTop) {
                        this.$('.shadow-list-right').html(this.$('.list-right:first').html());

                        this.$('.guide-delete-driving').css('margin-top', positionTop + "px")

                        this.$('.guide-shadow').show().find('.guide-delete-driving').show();
                        this.$('.list-right:first').css('visibility', 'hidden')

                        window.localStorage['GuideDeleteDriving'] = true;
                    }

                }
            },
            hideShadow: function () {
                this.$('.list-right:first').css('visibility', 'visible')
                this.$('.guide-shadow').hide().find('.guide-shadow-warp').hide();
            },
            initialize: function () {
                bfDataCenter.on("CURRENT_CARVIN_CHANGED", this.setReloadData.bind(this));
            },
            deleteDriving: function (e) {
                e.stopPropagation();
                var target = $(e.currentTarget);
                var content = "删除后，将无法查看和恢复此轨迹记录<br>但您的驾驶统计数据依然保留。"
                this.$('.list-content').removeClass('deleteDriving');
                this.showDialogCeng(target, content)
            },
            showDialogCeng: function (target, content) {
                var me = this;
                Dialog.createDialog({
                    closeBtn: false,
                    buttons: {
                        '取消': function () {
                            this.close();
                        },
                        '删除轨迹': function () {
                            var thisDialog = this;
                            var drivingHistoryId = target.parents('.list-content').attr('data-id');
                            bfClient.closeHistoryById({
                                data: {
                                    drivingHistoryId: drivingHistoryId
                                },
                                success: function (data) {
                                    if (data && data.code == 0) {
                                        me.initDrivingRoute(true)
                                        me.gethistoryTrackByDate()
                                        thisDialog.close();
                                    } else {
                                        Notification.show({
                                            type: "error",
                                            message: data.msg
                                        })
                                        thisDialog.close();
                                    }
                                },
                                error: function () {
                                    Notification.show({
                                        type: "error",
                                        message: '网络开小差'
                                    })
                                    thisDialog.close();
                                }
                            })

                        }
                    },
                    content: content
                });
            },
            goToCarDetails: function (e) {
                e.stopPropagation();
                butterfly.navigate('/cars/carDetails.html?' + bfDataCenter.getCarId());
                this.hideShadow();
            },
            onViewPush: function (pushfrom, pushdata) {
                // this._pushFrom = pushfrom;
            },
            onViewBack: function (backFrom, backData) {
                var me = this;
                me._selectdata = {};
                // alert('回退1')
                //-1
                // me.uiRemoveChrysanthemum();
                // 因为不知道谁在selectMouth里面加的onLeft
                if (backData && backData !== 'onLeft') {
                    this._backData = backData;
                }
            },
            viewBackCallback: function () {
                // alert('回退2')
                if (this._backData) {
                    var backData = this._backData
                    var backDataMoment = moment(backData.substr(1), 'YYYYMMDD')
                    // this.$('#datetime-swipe-' + this._currentDatetime).removeClass('active')
                    this._currentDatetime = backDataMoment.format('YYYY-MM-DD')
                    var currentMonth = backDataMoment.format('YYYY-MM')
                    var currentMonthOfDays = backDataMoment.daysInMonth()

                    var startTime = moment(currentMonth, 'YYYY-MM').format('YYYY-MM-DD')
                    var todayMoment = moment()
                    if (backDataMoment.format('YYYY-MM') == todayMoment.format('YYYY-MM')) {
                        var endTime = todayMoment.format('YYYY-MM-DD')
                    } else {
                        var endTime = moment(currentMonth, 'YYYY-MM').add(currentMonthOfDays - 1, 'd').format('YYYY-MM-DD')
                    }
                    this._selectdata.startDate = startTime
                    this._selectdata.endDate = endTime

                    this.initDatetimeHtml(startTime, endTime)

                    this.firstOnShow = false

                    this.destoryDatetimeSwiper()

                }

            },
            // destory this.datetimeSwiper
            destoryDatetimeSwiper: function () {
                this.datetimeSwiper.destroy()
                this.datetimeSwiper = undefined
            },
            posGenHTML: function () {

                var me = this
                this.$datetimeTitle = this.$('.datetime-title')

                me._navTitle.html(moment().format("M月DD日"));

                this._currentDatetime = moment().format("YYYY-MM-DD")
                this._speed = 600;

                this.$circle = this.$('#circle');

                this.initDatetimeHtml()
            },
            onShow: function () {
                var me = this
                this.fixedSwipeBug();
                this.viewBackCallback()
                this.initDatetimeSwiper(this._backData)
                if (!me.firstOnShow) {
                    // alert('bushidiyici')
                    me.initDrivingRoute();
                    me.firstOnShow = true
                    me.$('.content').addClass('loading')
                    //--1
                    me.uiAddChrysanthemum();
                   
                    this._backData = false
                }
                this.initScroll()
            },
            goSelectCalendar: function () {
                if (this._currentDatetime) {
                    var idStr = 'item' + moment(this._currentDatetime, 'YYYY-MM-DD').format('YYYYMM')
                    bfNaviController.push('/drivingReport/selectMouth.html', idStr, {
                        effect: 'Down'
                    });
                }
            },
            onClickOption2: function (el) {
                var me = this;
                var score = this._score;
                bfNaviController.push("/drivingBehavior/myDrivingBehavior.html", {
                    allDatas: this._drivingRoute,
                    currentData: this._newData,
                    Score: score,
                    currentDate: this._currentDatetime,
                    selectdata: me._selectdata
                });
            },
            // onLeft: function () {
                // var me = this;
                // var weekDatas = [];
                // var timeDate = [];
                // var temp;
                // if (!me._configedArray && window._configedArray) {
                //     me._configedArray = window._configedArray;
                // }
                // if (me._configedArray == undefined) {
                //     me._configedArray = new Array();
                // }
                // //获得系统当前时间
                // var currentDate = new Date();
                // //获取当前时间前7天时间
                // for (var i = 0; i < 7; i++) {
                //     temp = currentDate.format("yyyy-MM-dd");
                //     weekDatas.push(me._configedArray[temp]);
                //     currentDate.setDate(currentDate.getDate() - 1);
                // }
                // bfNaviController.push("/drivingReport/drivingCharts.html", weekDatas);
            // },
            // 分享晒一晒
            onRight: function () {
                if (this._drivingRoute && this._drivingData && this._newData && this._currentDatetime) {
                    bfNaviController.push("/drivingReport/shareMile.html", {
                        allDatas: this._drivingRoute,
                        routeData: this._drivingData.arrayForDay,
                        currentData: this._newData,
                        currentDate: this._currentDatetime
                    }, {effect: 'Up'});
                }

            },
            setReloadData: function () {
                if (this.firstOnShow) {
                    this.firstOnShow = false
                }
            },
            // 选择日期
            selectDatetimeItem: function (e) {
                var me = this
                var dataValue = $(e.currentTarget).children().attr('data-value')
                var disable = $(e.currentTarget).children().hasClass('disable')
                if (this._currentDatetime !== dataValue && disable !== true) {
                    me.uiAddChrysanthemum();
                    me.$('.content').addClass('loading')

                    var activeNum = this.$('.item-circle.active').attr('data-week')
                    this.$('.datetime-title span').eq(activeNum).removeClass('active')
                    me.$('#datetime-swipe-' + me._currentDatetime).removeClass('active');
                    me._currentDatetime = dataValue
                    me.$('#datetime-swipe-' + me._currentDatetime).addClass('active');
                    var activeNum = this.$('.item-circle.active').attr('data-week')
                    this.$('.datetime-title span').eq(activeNum).addClass('active')

                    setTimeout(function () {
                        // me.setCircleSwiperBound()
                        me.TempviewRenderBefore()
                    }, me._speed)
                }
            },
            // 运行动画
            runAnimation: function () {
                var me = this
                // me.clearAnimation()
                setTimeout(function () {
                    me.uiRemoveChrysanthemum()
                    me.$('.content').removeClass('loading')
                    me.$('.content').removeClass('error')
                    me.initScroll()
                }, 0)
            },
            // 关闭动画--错误的动画
            errorAnimation: function () {
                var me = this
                me.UIError()

                setTimeout(function () {
                    me.uiRemoveChrysanthemum()
                    me.$('.content').removeClass('loading')
                    me.$('.content').addClass('error')
                    me.initScroll()
                }, 0)
            },
            // 怕连续多次调用 才这么写
            goToDatetimeSwiper: function () {
                var me = this
                var diffDatetime = this._datetimeDataArr[0][0].datetime
                var diff = moment(this._currentDatetime, 'YYYY-MM-DD').diff(diffDatetime, 'd')
                var diffIndex = parseInt(diff / 7)
                var pos = this.datetimeSwiper.activeIndex
                if (pos !== diffIndex) {
                    if (!me.datetimeTitleTemp) {
                        me.datetimeTitleTemp = me.$('#datetime-title-template').html()
                    }
                    var activeNum = this.$('.item-circle.active').attr('data-week')
                    datetimeItemHtml = _.template(me.datetimeTitleTemp, {
                        datetimeDataItem: me._datetimeDataArr[diffIndex],
                        activeNum: activeNum
                    });
                    me.$datetimeTitle.html(datetimeItemHtml);
                    this.datetimeSwiper && this.datetimeSwiper.swipeTo(diffIndex, 300, false);
                }
            },

            drivingOnSlideChangeEnd: function () {
                // this.setCircleSwiperBound()
                this.TempviewRenderBefore()
            },
            // 错误的ui
            UIError: function () {
                this.elementHTML(".route-block .little-number", '--');
                this.elementHTML(".oil-block .little-number", '--');
                this.elementHTML(".fee-block .little-number", '--');
                this.elementHTML(".time-block .little-number", '--');
                this.elementHTML("#driving-number", '--');
                this.elementHTML(".option4-score", '--');
            },
            // 获取当天的行车数据
            gethistoryTrackByDate: function (noData) {
                

                var me = this;
                    // alert('开始获取当天的数据')
                if (!me._currentDatetime) {
                   
                    me.uiRemoveChrysanthemum();
                    me.$('#circle-swipe-wrap .swiper-slide').removeClass('loading')
                    me.$('.content').removeClass('loading')
                    return
                }
                me._navTitle.html(moment(me._currentDatetime).format("M月DD日"));
                if(me.datetimeSwiper){
                    me._activeIndex = me.datetimeSwiper.activeIndex;
                }
                var data = {
                    startDate: me._currentDatetime,
                    endDate: me._currentDatetime
                };
                bfClient.historyTrackByDate({
                    data: data,
                    type: "get",
                    dataType: "json",
                    options: {
                        loading: false
                    },
                    // beforeSend: function () {
                    //     me.clearAnimation()
                    //     // me.uiAddChrysanthemum();
                    // },
                    success: function (data) {
                        
                        if (data.msg == '没有符合条件的数据') {
                            // alert('错误')
                            data.code = 0;
                            data.data = [];
                            me.showGuideSettingDrivingHistory();

                        }
                        if (data.code == 0 && data.data) {
                            // alert('成功')
                            // 以前的逻辑
                            var newData = {};
                            newData.arrayForDay = [];
                            newData.wholeRoute = 0;
                            newData.wholeCost = 0;
                            newData.wholeTime = 0;
                            newData.wholeOil = 0;
                            newData.wholeSpeedUp = 0;
                            newData.wholeSpeedDown = 0;
                            newData.wholeSharpTurn = 0;
                            newData.wholeScore = 0;
                            var length = data.data.length;
                            for (var i = 0; i < length; i++) {
                                newData.arrayForDay.push(data.data[i]);
                                newData.wholeRoute += parseFloat(data.data[i].mileage);
                                newData.wholeCost += parseFloat(data.data[i].fee);
                                newData.wholeTime += parseFloat(data.data[i].spendTime);
                                newData.wholeOil += parseFloat(data.data[i].oil);
                                newData.wholeSpeedUp += data.data[i].speedUp;
                                newData.wholeSpeedDown += data.data[i].speedDown;
                                newData.wholeSharpTurn += data.data[i].sharpTurn;
                                newData.wholeScore += data.data[i].score;
                            }
                            //  alert(JSON.stringify(newData))
                            me._newData = newData
                            me.TempviewRender()
                            if (noData) {
                                // alert('true---------------')
                                me.getRankPercentByMileage(true)
                            }
                            if (data.data.length > 0) {
                                // alert('true-222222222222---')
                                me.showGuideDeleteDriving()
                            }

                        } else {
                            // alert('成功else')
                            me._drivingData = null;
                            me.errorAnimation()
                            // me.runAnimation()
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }

                    },
                    error: function () {
                        // alert('开小差')
                        // me.runAnimation()
                        me._drivingData = null;
                        me.errorAnimation()
                        Notification.show({
                            type: "error",
                            message: "网络开小差"
                        });
                    }
                })
            },
            // 渲染
            TempviewRender: function () {
                var me = this;
                // me.setTitleHtml(me._currentDate);
                me._drivingData = me._newData;
                //me._drivingData 为undefine时，将页面展现的数据制0
                this.elementHTML(".route-block .little-number", (me._drivingData && me._drivingData.wholeRoute && me._drivingData.wholeRoute.toFixed(1)) || '0.0');
                this.elementHTML(".oil-block .little-number", (me._drivingData && me._drivingData.wholeOil && me._drivingData.wholeOil.toFixed(1)) || '0.0');
                this.elementHTML(".fee-block .little-number", (me._drivingData && me._drivingData.wholeCost && me._drivingData.wholeCost.toFixed(1)) || '0.0');
                this.elementHTML(".time-block .little-number", (me._drivingData && me._drivingData.wholeTime && me._drivingData.wholeTime.toFixed(1)) || '0.0');
                //为0时设置字符串
                var score; //计算的今日得分
                //me._drivingData 为undefine时，将页面展现的数据制0
                if (me._drivingData && me._drivingData.wholeScore) {
                    score = me._drivingData.wholeScore;
                } else {
                    score = 0;
                }
                this.$('.option4-score').html(score)
                this._score = score
                var ranking = window.sessionStorage.getItem("ranking");//积分排名
                if (ranking || ranking == 0) {
                    this.$('.option4-rank').html(ranking)
                } else {
                    this.$('.option4-rank').html("--")
                }
                // me.getElement("#driving-score").html(score);
                this.$('#driving-number').html(me._drivingData && me._drivingData.arrayForDay && me._drivingData.arrayForDay.length || 0);
                this.tempRouteRender();
                me.initScroll();

                me.runAnimation()
            },
            // 渲染前的动作
            TempviewRenderBefore: function () {
                var me = this
                if (!this._currentDatetime) {
                    // alert('删除')
                    me.uiRemoveChrysanthemum();
                    me.$('#circle-swipe-wrap .swiper-slide').removeClass('loading')
                    me.$('.content').removeClass('loading')
                    return
                }
                // this.initDrivingRoute(true);
                //---加-----
                 me.uiRemoveChrysanthemum();
                me.$('.overIncallValue').html('--')
                if (me._drivingRoute) {
                    this.gethistoryTrackByDate();
                    this.getRankPercentByMileage()
                } else {
                    this.gethistoryTrackByDate(true);
                }
            },
            getRankPercentByMileage: function (noData) {
                var me = this;
                if (noData) {
                    var dataObject = {
                        mileage: 0
                    }
                } else {
                    var dataObject = _.find(me._drivingRoute, function (item) {
                            return item.createTime === me._currentDatetime
                        }) || {}
                }
                bfClient.getRankPercentByMileage({
                    data: {mileage: dataObject.mileage || 0, histroyDate: me._currentDatetime},
                    success: function (data) {
                        if (data.code == 0) {
                            me.$('.overIncallValue').html(data.data + '%')
                        } else {
                            // Notification.show({
                            //     type: "error",
                            //     message: error.msg || '拉取排名失败'
                            // })
                        }

                    },
                    error: function (error) {
                        // Notification.show({
                        //     type: "error",
                        //     message: error.msg || '拉取排名失败'
                        // })
                    }
                })
            },
            // 行车的html渲染
            tempRouteRender: function () {
                var me = this;
                var container = me.getElement(".driving-route");
                container.empty();
                var tem = me.elementHTML("#rout-datas");
                if (me._drivingData) {
                    var forDayData = me._drivingData.arrayForDay || [];
                    for (var i = 0; i < forDayData.length; i++) {
                        var data = forDayData[i];
                        data.i = i;
                        data.startTimeStr = data.startTime.substring(11, 16);
                        data.endTimeStr = data.endTime.substring(11, 16);
                        var template = _.template(tem, data);
                        container.append(template);
                    }
                }
                this.pressEventDriving();

            },

            pressEventDriving: function () {
            	
                var me = this;
                var node = this.$('.driving-route .list-right-content');
                var nodeLength = node.length;
                // require("deviceone").print(nodeLength);
                for (var i = 0; i < nodeLength; i++) {
                 	// require("deviceone").print(i);
                    var myElement = node[i];
                    
                    
                    var lastTime = Date.now();
                    
                    (function (item) {
                    	    var timer = 0;
                    	    var isMove = false;
	                    	$(item).on("touchstart",function () { 
	                    		 isMove = false
	                    		 lastTime = Date.now()
	                    		 // require("deviceone").print("touchstart");
	                    		 var e = this;
	                    		 e.target = this;
	                    		 timer = setTimeout(function () {
	                    			// require("deviceone").priint("press");
		                    	   	me.$('.list-content').removeClass('deleteDriving');
	                            $(e.target).parents('.list-content').addClass('deleteDriving');
	                    		 }, 1000);
	                    })
		                    
		                $(item).on("touchmove", function () {
		                	      isMove = true
	                    	      lastTime = Date.now()
	                    	      clearTimeout(timer)
	                    	      // require("deviceone").print("touchmove");
	                    })
	                    
	                    $(item).on("touchend", function() {              	
	                       clearTimeout(timer)
	                    	   var el = this;
	                       var deltaTime = Date.now() - lastTime
	                       
	                       // require("deviceone").print(deltaTime);
	                       	                       
	                       // tap
	                       if(deltaTime > 10 && deltaTime < 800 && !isMove){
	                           // require("deviceone").print("tap");
	   	               	    	   el.target = this;
	                  		   me.gotoRouteDetail(el);
	                       }
	                       
	                       lastTime = Date.now();
	                    })
	                    
                    })(myElement)
                   
//                    (function (item){
//                    	 setTimeout(function () {
//                    		 var hammertime = new Hammer(item);
//                             
//                             hammertime.on('press', function (e) {
//                                 me.$('.list-content').removeClass('deleteDriving');
//                                 $(e.target).parents('.list-content').addClass('deleteDriving');
//                             });
//                             hammertime.on('tap', function (e) {
//                            	 require("deviceone").print("tap");
//                                 me.gotoRouteDetail(e);
//                             });
//     					}, 1000);
//                    	
//                    })(myElement)
                   
                }
            },
            // 存在 flag  则只更新当前日期
            initDrivingRoute: function (flag) {
                var me = this;
                var today = moment().format("YYYY-MM-DD");
                var data = {
                    startDate: (me._selectdata && me._selectdata.startDate) || moment().subtract(1, 'months').add(1, 'd').format('YYYY-MM-DD'),
                    endDate: (me._selectdata && me._selectdata.endDate) || moment().format('YYYY-MM-DD')
                };
                if (flag) {
                    data = {
                        startDate: today,
                        endDate: today
                    }
                }
                bfClient.historyTrackFromDayTableByDate({
                    data: data,
                    type: "get",
                    dataType: "json",
                    options: {
                        loading: false
                    },
                    success: function (data) {
                        if (data.msg == '没有符合条件的数据') {
                            data.code = 0;
                            data.data = [];
                        }
                        if (data.code == 0 && data.data) {
                            // if (flag) {
                            //     return
                            // }
                            me._drivingRoute = data.data;
                            //me.initHead();
                            me.UISetdatetime(data.data);
                        } else {
                            // me.clearViewRender();
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }

                    },
                    error: function () {
                        // me.clearViewRender();
                        // me.clearParams();
                        Notification.show({
                            type: "error",
                            message: "网络开小差"
                        });
                    }
                });
            },
            UISetToday: function () {

            },
            // 设置datetime内容
            UISetdatetime: function (data) {
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    if (data[i] && data[i].mileage) {
                        if (parseFloat(data[i].mileage) && parseFloat(data[i].mileage).toFixed) {
                            this.$('#datetime-bottom-' + data[i].createTime).html(parseFloat(data[i].mileage).toFixed(1)+'km');
                        }
                    }
                }
            },
            // 初始化Datetime的swipe
            initDatetimeSwiper: function (time) {
                var me = this;
                if (!me.datetimeSwiper) {
                    me.datetimeSwiper = new SwiperBeforeVersion(this.$('#datetime-slider')[0], {
                        continuous: false,
                        speed: me._speed,
                        initialSlide: me._datetimeDataTotalWeek - 1,
                        onSlideChangeStart: function (swiper) {
                            me._datetimeOnSlideChangeEnd = true;
                            me.judegeSelectDatetimeBefore();
                        },
                        onSlideChangeEnd: function (swiper) {
                            me._datetimeOnSlideChangeEnd = false;
                            me.datetimeOnSlideChangeEnd();
                        }
                    });
                    if (time) {
                        var diffDatetime = this._datetimeDataArr[0][0].datetime
                        var diff = moment(this._currentDatetime, 'YYYY-MM-DD').diff(diffDatetime, 'd')
                        var diffIndex = parseInt(diff / 7)
                        me.datetimeSwiper.swipeTo(diffIndex, 0, false)
                    }
                    me.reloadDatetimeData(time)
                } else {
                    me.datetimeSwiper.destroy();
                    me.datetimeSwiper = null;
                    me.datetimeSwiper = new SwiperBeforeVersion(this.$('#datetime-slider')[0], {
                        continuous: false,
                        speed: me._speed,
                        initialSlide: me._activeIndex ? me._activeIndex : (me._datetimeDataTotalWeek - 1),
                        onSlideChangeStart: function (swiper) {
                            me._datetimeOnSlideChangeEnd = true;
                            me.judegeSelectDatetimeBefore()
                        },
                        onSlideChangeEnd: function (swiper) {
                            me._datetimeOnSlideChangeEnd = false;
                            me.datetimeOnSlideChangeEnd();
                        }
                    });
                    me.datetimeSwiper.swipeTo(me._activeIndex ? me._activeIndex : (me._datetimeDataTotalWeek - 1), 0, false);
                    // me._activeIndex = null;
                    //me.reloadDatetimeData()
                }
            },
            onHide: function () {
                if(this.datetimeSwiper){
                    this._activeIndex = this.datetimeSwiper.activeIndex;
                }
            },
            fixedSwipeBug: function () {
                if (this._datetimeOnSlideChangeEnd) {
                    this.datetimeOnSlideChangeEnd()
                    this._datetimeOnSlideChangeEnd = false;
                }
                // if(this._drivingOnSlideChangeEnd){
                //     this.drivingOnSlideChangeEnd()
                //     this._drivingOnSlideChangeEnd = false;
                // }

            },
            datetimeOnSlideChangeEnd: function () {
                var me = this;
                if (!me.datetimeTitleTemp) {
                    me.datetimeTitleTemp = me.$('#datetime-title-template').html()
                }
                var activeNum = this.$('.item-circle.active').attr('data-week')

                var datetimeItemHtml = _.template(me.datetimeTitleTemp, {
                    datetimeDataItem: me._datetimeDataArr[me.datetimeSwiper.activeIndex],
                    activeNum: activeNum
                });
                me.$datetimeTitle.html(datetimeItemHtml);

                // 第一次和需要加载的时候才执行
                // if(!me.firstSlideChangeStart){
                //     me.firstSlideChangeStart = true
                //     me.setCircleSwiperBound(true)
                //     setTimeout(function(){
                //         me.TempviewRenderBefore()
                //     },500)
                // }

                me.judegeSelectDatetime()
            },
            // 重新加载Datetime的数据
            reloadDatetimeData: function (time) {
                var me = this;
                me.$('#circle-swipe-wrap .swiper-slide').addClass('loading')
                me.$('.content').addClass('loading')
                me.uiAddChrysanthemum();
                // alert('2');
                // me.uiRemoveChrysanthemum();

                var activeNum = this.$('.item-circle.active').attr('data-week')
                this.$('.datetime-title span').eq(activeNum).removeClass('active')
                this.$('#datetime-swipe-' + this._currentDatetime).removeClass('active')
                this._currentDatetime = moment(time || this._endTime, 'YYYY-MM-DD').format('YYYY-MM-DD')
                this.$('#datetime-swipe-' + this._currentDatetime).addClass('active')
                var activeNum = this.$('.item-circle.active').attr('data-week')
                this.$('.datetime-title span').eq(activeNum).addClass('active')

                if (!me.datetimeTitleTemp) {
                    me.datetimeTitleTemp = me.$('#datetime-title-template').html()
                }
                var activeNum = this.$('.item-circle.active').attr('data-week')
                var diffDatetime = this._datetimeDataArr[0][0].datetime
                var diff = moment(this._currentDatetime, 'YYYY-MM-DD').diff(diffDatetime, 'd')
                var diffIndex = parseInt(diff / 7)
                var datetimeItemHtml = _.template(me.datetimeTitleTemp, {
                    datetimeDataItem: me._datetimeDataArr[diffIndex],
                    activeNum: activeNum
                });
                me.$datetimeTitle.html(datetimeItemHtml);
                // me.setCircleSwiperBound(true)
                setTimeout(function () {
                    me.TempviewRenderBefore()
                }, 500)

            },
            // judegeSelectDatetime的前置功能
            judegeSelectDatetimeBefore: function () {
                var me = this;
                me._judegeSelectDatetimeBefore = false
                if (me.datetimeSwiper) {
                    var diffDatetime = this._datetimeDataArr[0][0].datetime
                    var diff = moment(this._currentDatetime, 'YYYY-MM-DD').diff(diffDatetime, 'd')
                    var diffIndex = parseInt(diff / 7)
                    var pos = this.datetimeSwiper.activeIndex
                    if (pos !== diffIndex) {
                        me.uiAddChrysanthemum();
                        me.$('#circle-swipe-wrap .swiper-slide').addClass('loading')
                        me.$('.content').addClass('loading')
                        // me.xxx(true)
                        var datetimeItemIndex = pos * 7 + diff % 7
                        var newDatetime = moment(diffDatetime, 'YYYY-MM-DD').add(datetimeItemIndex, 'd').format('YYYY-MM-DD')
                        me._newDatetime_judegeSelect = newDatetime
                        // 当时间超过可选时间范围 则不执行
                        if (moment(newDatetime, 'YYYY-MM-DD').diff(this._startTime) < 0 || moment(newDatetime, 'YYYY-MM-DD').diff(this._endTime) > 0) {
                            me.uiRemoveChrysanthemum()
                            me.$('#circle-swipe-wrap .swiper-slide').removeClass('loading')
                            me.$('.content').removeClass('loading')
                            return
                        }


                        me._judegeSelectDatetimeBefore = true
                    }
                }

            },
            // 判断是否要选择日期（当datetimeswiper左右切换的时候）
            judegeSelectDatetime: function () {
                var me = this;
                if (me.datetimeSwiper) {

                    if (me._judegeSelectDatetimeBefore === true) {
                        var activeNum = this.$('.item-circle.active').attr('data-week')
                        this.$('.datetime-title span').eq(activeNum).removeClass('active')
                        this.$('#datetime-swipe-' + this._currentDatetime).removeClass('active')
                        this._currentDatetime = me._newDatetime_judegeSelect
                        this.$('#datetime-swipe-' + this._currentDatetime).addClass('active')
                        var activeNum = this.$('.item-circle.active').attr('data-week')
                        this.$('.datetime-title span').eq(activeNum).addClass('active')

                        // me.setCircleSwiperBound()
                        setTimeout(function () {
                            me.TempviewRenderBefore()
                        }, 300)
                    } else {
                        me.uiRemoveChrysanthemum();
                        me.$('#circle-swipe-wrap .swiper-slide').removeClass('loading')
                        me.$('.content').removeClass('loading')
                    }
                }
            },

            // 初始化 datetime的 数据
            // 不存在startTime,endTime 则为默认值(一月前 -- 当前时间)
            initDatetimeData: function (startTime, endTime) {
                if (!startTime && !endTime) {
                    var currenrMoment = moment()
                    endTime = currenrMoment.format('YYYY-MM-DD')
                    startTime = currenrMoment.subtract(1, 'M').add(1, 'd').format('YYYY-MM-DD')
                }
                return this.creatDatetimeDataArr(startTime, endTime)
            },
            // 创建datetimeData数组  值格式如下：datetimeDataArr = [ [1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1] ]
            creatDatetimeDataArr: function (startTime, endTime) {
                var datetimeDataArr = []
                var datetimeDataArrItem = []

                this._startTime = startTime
                this._endTime = endTime

                var startNum = moment(startTime, 'YYYY-MM-DD').weekday()
                // 修正 0表示星期天
                if (startNum === 0) {
                    startNum = 7
                }
                var endNum = moment(endTime, 'YYYY-MM-DD').weekday()
                // 修正 0表示星期天
                if (endNum === 0) {
                    endNum = 7
                }

                var startDatetime = moment(startTime, 'YYYY-MM-DD').subtract(startNum - 1, 'd').format('YYYY-MM-DD')
                var endDatetime = moment(endTime, 'YYYY-MM-DD').add(7 - endNum, 'd').format('YYYY-MM-DD')

                // 总共多少天
                var datetimeDataTotalDay = moment(endDatetime, 'YYYY-MM-DD').diff(startDatetime, 'd') + 1
                this._datetimeDataTotalWeek = datetimeDataTotalDay / 7
                var datetimeDataIndex

                for (var i = 0; i < this._datetimeDataTotalWeek; i++) {
                    datetimeDataArrItem = []
                    for (var j = 0; j < 7; j++) {
                        datetimeDataIndex = moment(startDatetime, 'YYYY-MM-DD').add(7 * i + j, 'd')
                        datetimeDataArrItem.push({
                            num: datetimeDataIndex.format('DD'),
                            datetime: datetimeDataIndex.format('YYYY-MM-DD'),
                            disable: 7 * i + j + 1 < startNum || 7 * i + j > datetimeDataTotalDay - 8 + endNum
                        })
                    }
                    datetimeDataArr.push(datetimeDataArrItem);
                }

                this._datetimeDataArr = datetimeDataArr;
                return datetimeDataArr
            },
            // 初始化Datetime的html
            initDatetimeHtml: function (startTime, endTime) {
                var me = this;
                var datetimeHtml = this.creatDatetimeHtml(startTime, endTime);
                this.$('#datetime-swipe-wrap').html(datetimeHtml)
                // 添加默认选择日期 当前时间
                var nowTime = moment().format('YYYY-MM-DD');
                this.$('#datetime-swipe-' + this._currentDatetime).addClass('active')
                this.$('#datetime-swipe-' + nowTime + ' p').css("font-size", '12px').html('今天')

            },
            // 创建Datetime的html
            creatDatetimeHtml: function (startTime, endTime) {
                if (!this.datetimeTemp) {
                    this.datetimeTemp = this.$('#datetime-swipe-template').html()
                }
                var datetimeItemHtml, datetimeHtml = ''
                var datetimeDataArr = this.initDatetimeData(startTime, endTime)
                for (var i = 0; i < this._datetimeDataTotalWeek; i++) {
                    var datetimeItemHtml = _.template(this.datetimeTemp, {
                        datetimeDataArrItem: datetimeDataArr[i]
                    });
                    datetimeHtml = datetimeHtml + datetimeItemHtml;
                }
                return datetimeHtml
            },
            // 下拉刷新
            initScroll: function () {
                var me = this;
                if (!me.scrollPullDown) {
                    me.$pullDown = me.$('.pulldown');
                    me.scrollPullDown = new ScrollPullDown({
                        el: me.$el,
                        onScrollCallback: function () {
                            me.uiAddChrysanthemum()
                            me.scrollPullDown && me.scrollPullDown.resizePulldown()
                        },
                        onAnimationCallback: function () {
                            me.initDrivingRoute(true)
                            me.gethistoryTrackByDate()
                        },
                        onTouchend: function () {
                            if (me.$pullDown.hasClass('flip')) {
                                me.$pullDown.addClass('loading');
                                me.$('.pulldown .label').html('正在刷新...');
                                // 自定义动作
                                me.$('#circle-swipe-wrap .swiper-slide').addClass('loading')
                                me.$('.content').addClass('loading')
                            }

                        }
                    })
                } else {
                    me.scrollPullDown.myscroll.refresh();
                }

            },
            // 添加遮罩
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$('.content').find('.chrysanthemum').length === 0) {
                    me.$('.content').append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>加载中...</div></div></div>");
                }
            },
            // 删除遮罩
            uiRemoveChrysanthemum: function () {
                var me = this;
                me.$('#chrysanthemumWarp').remove();
            },
            // 跳到原生的地图
            gotoRouteDetail: function (el) {
                var me = this;
                var target = $(el.target).parents('.list-content');
                var index = target.attr("data-index");
                var mapType = window.localStorage['mapType'];

                OSApp.openDrivingTrajectory(JSON.stringify({
                    list: me._drivingData.arrayForDay,
                    cur: index,
                    mapType: mapType
                }));
            },
            //以下三个方法解决swipe和iscroll同时滑动问题
            onTouchStart: function (events) {
                this.touchNum = 0;
                // 停止swiper和iscroll
                if (this.datetimeSwiper) {
                    this.datetimeSwiper.params.onlyExternal = true;
                }
                // if (this.drivingCircleSwiper) {
                //     this.drivingCircleSwiper.params.onlyExternal = true;
                // }
                if (this.scrollPullDown && this.scrollPullDown.myscroll) {
                    this.scrollPullDown.myscroll.disable()
                }

                this.lastX = events.originalEvent.touches[0].clientX;
                this.lastY = events.originalEvent.touches[0].clientY;
                this.endX = 0;

            },
            onTouchMove: function (events) {
                if (this.touchNum !== 3) {
                    this.touchNum = this.touchNum + 1;
                    if (this.touchNum < 3) {
                        return
                    }
                    this.clientX = events.originalEvent.touches[0].clientX;
                    this.clientY = events.originalEvent.touches[0].clientY;

                    var changeX = Math.abs(this.clientX - this.lastX);
                    var changeY = Math.abs(this.clientY - this.lastY);
                    if (changeY) {
                        var tan = changeX / changeY;
                    } else {
                        var tan = 1111;
                    }
                } else {
                    this.endX = events.originalEvent.touches[0].clientX;
                    return
                }
                if (this.touchNum < 6) {
                    if (tan < 0.75 || tan === 0.75) {//
                        if (this.scrollPullDown && this.scrollPullDown.myscroll) {
                            this.scrollPullDown.myscroll.enable()
                        }
                        // this.touchNum = 0;
                    } else if (tan > 0.75) {//左右
                        if (this.datetimeSwiper) {
                            this.datetimeSwiper.params.onlyExternal = false;
                        }
                        // if (this.drivingCircleSwiper) {
                        //     this.drivingCircleSwiper.params.onlyExternal = false;
                        // }
                    }
                }

            },
            onTouchEnd: function (events) {
                delete this.touchNum;
                if (this.scrollPullDown && this.scrollPullDown.myscroll) {
                    this.scrollPullDown.myscroll.enable()
                }
                if (this.datetimeSwiper) {
                    this.datetimeSwiper.params.onlyExternal = false;
                }
                // if (this.drivingCircleSwiper) {
                //     this.drivingCircleSwiper.params.onlyExternal = false;
                // }
            }
        });
    });

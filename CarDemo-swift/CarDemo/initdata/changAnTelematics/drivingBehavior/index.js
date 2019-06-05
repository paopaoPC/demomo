define([
    'text!drivingBehavior/drivingBehavior.html',
    'common/navView',
    'common/ssUtil',
    'drivingBehavior/timeBehavior',
    'listview/ListView',
    'swipe',
    'drivingBehavior/checkUtil'
],
        function (template, View, ssUtil, TimeBehavior, ListView, swipe, cfg) {
            var Base = View;
            return Base.extend({
            	id:"drivingBehavior",
            	template: template,
                index: 0, //tab标号
            	events:{
                    "click .tab-item":"showTab",
                },
            	onShow:function(){
            		var me = this;
                    this._drivingRoute = ssUtil.load("drivingRouteForADay");
                    this._drivingRouteYes = ssUtil.load("drivingRouteForYesterdayDay");
                    // me.todAndYesObject();
                    me.init();
                    // me.showComparaResult();
                    me.scrollNumber();
            	},
                asyncHTML:function()
                {
                    if(this.mySwipe)
                    {
                        this.mySwipe.setup();
                    }
                },
                todAndYesObject: function(){
                    var me = this;
                    var yesterdayObject ;
                    var todayObject = me.drivingBehaviorObject(me._drivingRoute);
                    if (me._drivingRouteYes !== null) {
                        yesterdayObject = me.drivingBehaviorObject(me._drivingRouteYes);
                    }else{
                        yesterdayObject = {
                            totalTime: 0,
                            totalRapidAd: 0,
                            totalRapidDel: 0,
                            totalSpeeding: 0,
                            totalSharpTurn: 0,
                            totalSpeed:0
                        }
                    }
                    var objectArray = [];
                    objectArray.push(todayObject);
                    objectArray.push(yesterdayObject);
                    var totalObject ={
                        code: 0,
                        data: {
                            data:objectArray
                        },
                        OK: true
                    }
                    me.onUpdateDrivingBehavior(totalObject);
                },
                drivingBehaviorObject: function(type){
                    var me = this;
                    var totalTime = 0;//当天的总驾驶时间
                    var totalRapidAd = 0;//当天的急加速总次数
                    var totalRapidDel = 0;//当天的急减速总次数
                    var totalSpeeding = 0;//当天的超速总次数
                    var totalSharpTurn = 0;//当天的急转弯总次数
                    var totalSpeed = 0;//当天的最高时速
                    var i = 0;
                    for(var iRoute = 0; iRoute < type.length; iRoute++){
                        routeScore = type[iRoute];
                        totalTime += parseInt(routeScore.time);
                        totalRapidAd += parseInt(routeScore.rapidAd);
                        totalRapidDel += parseInt(routeScore.rapidDel);
                        totalSpeeding += parseInt(routeScore.speeding);
                        totalSharpTurn += parseInt(routeScore.sharpTurn);
                        totalSpeed += parseInt(routeScore.speed);
                        i++;
                    }
                    totalSpeed = Math.round(totalSpeed/i);//平均时速
                    var todayData = {
                        totalTime: totalTime,
                        totalRapidAd: totalRapidAd,
                        totalRapidDel: totalRapidDel,
                        totalSpeeding: totalSpeeding,
                        totalSharpTurn: totalSharpTurn,
                        totalSpeed:totalSpeed
                    };
                    return todayData;
                },
                init:function(){
                    var me = this;
                    me.index = 0;
                    //初始化水平列表
                    me.toplistview = new ListView({
                        el: me.el.querySelector("#nav-list"),
                        autoLoad: false
                    });
                    me.toplistview.IScroll.options.scrollX = true;
                    me.toplistview.IScroll.options.scrollY = false;
                    me.toplistview.refresh();

                    me.mySwipe = Swipe(this.getElement('#slider')[0], {
                        continuous: false,
                        callback: function(index, element) {
                            $(me.el).find("li.tab-item").removeClass("active");
                            $(me.el).find(".carsDetail-nav-tab li:nth-child(" + (index + 1) + ")").addClass("active");
                            // var tabLen = $(me.el).find("li.tab-item").width();
                            $(me.el).find(".scroll-lite span").animate({
                                left: index*50 + '%'
                            }, 300, 'linear');
                            if(index>1||index<1){
                                var el = $(".carsDetail-nav-tab .active")[0];
                            me.toplistview.IScroll.scrollToElement(el, 800, 0, 0);
                            }
                        },

                        transitionEnd: function(index, element) {}
                    });
                    //me.showTabItem(me.carsIntroduction, 0);
                    // me.initgetDrivingBehaviorToday();
                    me.todAndYesObject();
                    
                },
                onUpdateDrivingBehavior:function(data)
                {   var me = this;
                    me._drivingBehavior = data.data;
                    me.drivingBehavior(0,me._drivingBehavior);
                    me.drivingBehavior(1,me._drivingBehavior);
                    me.todComparYes();
                },
                initgetDrivingBehaviorToday:function(){
                    var me = this;
                    bfClient.getDrivingBehaviorToday({
                        type: "get",
                        dataType: "json", 
                        success: function (data) {
                            if (data) {
                                me.onUpdateDrivingBehavior(data);
                            } else {
                                console.log('获取数据失败');
                            }
                    }});
                },
                todComparYes: function(){
                    var me = this;
                    var img1 = '<img src="../drivingBehavior/img/hehavior_10.png" />';
                    var img2 = '<img src="../drivingBehavior/img/hehavior_19.png" />';
                    if (me._drivingBehavior.data[0].totalTime>me._drivingBehavior.data[1].totalTime) {
                        $(me.el).find(".drivingTime0").append(img1);
                        $(me.el).find(".drivingTime1").append(img2);
                    }else if (me._drivingBehavior.data[0].totalTime<me._drivingBehavior.data[1].totalTime) {
                        $(me.el).find(".drivingTime0").append(img2);
                        $(me.el).find(".drivingTime1").append(img1);
                    }else{

                    }
                    if (me._drivingBehavior.data[0].totalRapidAd>me._drivingBehavior.data[1].totalRapidAd) {
                        $(me.el).find(".HardAcceleration0").append(img1);
                        $(me.el).find(".HardAcceleration1").append(img2);
                    }else if (me._drivingBehavior.data[0].totalRapidAd<me._drivingBehavior.data[1].totalRapidAd) {
                        $(me.el).find(".HardAcceleration0").append(img2);
                        $(me.el).find(".HardAcceleration1").append(img1);
                    }else{

                    }
                    if (me._drivingBehavior.data[0].totalRapidDel>me._drivingBehavior.data[1].totalRapidDel) {
                        $(me.el).find(".RapidDeceleration0").append(img1);
                        $(me.el).find(".RapidDeceleration1").append(img2);
                    }else if (me._drivingBehavior.data[0].totalRapidDel<me._drivingBehavior.data[1].totalRapidDel) {
                        $(me.el).find(".RapidDeceleration0").append(img2);
                        $(me.el).find(".RapidDeceleration1").append(img1);
                    }else{

                    }
                    if (me._drivingBehavior.data[0].totalSpeeding>me._drivingBehavior.data[1].totalSpeeding) {
                        $(me.el).find(".Speeding0").append(img1);
                        $(me.el).find(".Speeding1").append(img2);
                    }else if (me._drivingBehavior.data[0].totalSpeeding<me._drivingBehavior.data[1].totalSpeeding) {
                        $(me.el).find(".Speeding0").append(img2);
                        $(me.el).find(".Speeding1").append(img1);
                    }else{

                    }
                    if (me._drivingBehavior.data[0].totalSharpTurn>me._drivingBehavior.data[1].totalSharpTurn) {
                        $(me.el).find(".Uturn0").append(img1);
                        $(me.el).find(".Uturn1").append(img2);
                    }else if (me._drivingBehavior.data[0].totalSharpTurn<me._drivingBehavior.data[1].totalSharpTurn) {
                        $(me.el).find(".Uturn0").append(img2);
                        $(me.el).find(".Uturn1").append(img1);
                    }else{

                    }
                    if (me._drivingBehavior.data[0].totalSpeed>me._drivingBehavior.data[1].totalSpeed) {
                        $(me.el).find(".MaximumSpeed0").append(img1);
                        $(me.el).find(".MaximumSpeed1").append(img2);
                    }else if (me._drivingBehavior.data[0].totalSpeed<me._drivingBehavior.data[1].totalSpeed) {
                        $(me.el).find(".MaximumSpeed0").append(img2);
                        $(me.el).find(".MaximumSpeed1").append(img1);
                    }else{

                    }
                },
                drivingBehavior:function(index,parms){
                    var me = this;
                    var _time = parms.data[index].totalTime;
                    var _changeTime = cfg.changeTimeType(_time);
                    var curLevel = cfg.check('drivingTime', _time);
                    var html = '<div style="background-color:'+curLevel.clr+';"><span>'+curLevel.l+'</span></div>';
                    $(me.el).find(".timeType"+index).append($(html));
                    this.elementHTML(".drivingTime"+index,_changeTime);

                    var _HardAcceleration = parms.data[index].totalRapidAd;
                    var curLevel1 = cfg.check('HardAcceleration', _HardAcceleration);
                    this.elementHTML('.HardAcceleration'+index, _HardAcceleration+"次");
                    var html = '<div style="background-color:'+curLevel1.clr+';"><span>'+curLevel1.l+'</span></div>';
                    $(me.el).find(".Acceleration"+index).append($(html));

                    var _RapidDeceleration = parms.data[index].totalRapidDel;
                    this.elementHTML('.RapidDeceleration'+index, _RapidDeceleration+"次");
                    var curLevel2 = cfg.check('RapidDeceleration', _RapidDeceleration);
                    var html = '<div style="background-color:'+curLevel2.clr+';"><span>'+curLevel2.l+'</span></div>';
                    $(me.el).find(".Deceleration"+index).append($(html));

                    var _Speeding = parms.data[index].totalSpeeding;
                    this.elementHTML('.Speeding'+index, _Speeding+"次");
                    var curLevel3 = cfg.check('Speeding', _Speeding);
                    var html = '<div style="background-color:'+curLevel3.clr+';"><span>'+curLevel3.l+'</span></div>';
                    $(me.el).find(".speed"+index).append($(html));

                    var _Uturn = parms.data[index].totalSharpTurn;
                    this.elementHTML('.Uturn'+index, _Uturn+"次");
                    var curLevel4 = cfg.check('Uturn', _Uturn);
                    var html = '<div style="background-color:'+curLevel4.clr+';"><span>'+curLevel4.l+'</span></div>';
                    $(me.el).find(".turn"+index).append($(html));

                    var _MaximumSpeed = parms.data[index].totalSpeed;
                    this.elementHTML('.MaximumSpeed'+index, _MaximumSpeed+"km/h");
                    var curLevel5 = cfg.check('MaximumSpeed', _MaximumSpeed);
                    var html = '<div style="background-color:'+curLevel5.clr+';"><span>'+curLevel5.l+'</span></div>';
                    $(me.el).find(".maxSpeed"+index).append($(html));
                },
                showTab: function(el) {
                    var me = this;
                    var $target = $(el.currentTarget);
                    var tabIndex = $target.attr("data-index");
                    var tabItem = $target.attr("id");
                    me.showTabItem(tabItem, tabIndex);
                },
                showTabItem: function(tabItem, tabIndex) {
                    var me = this;
                    me.mySwipe.slide(tabIndex, 500);
                    if (tabItem) {
                        // tabItem.refresh(); //调用新选择的页面的refresh方法。
                        $(me.el).find("li.tab-item").removeClass("active");
                        $(me.el).find("li#" + tabItem).addClass("active");
                        // var tabLen = $(me.el).find("li.tab-item").width();
                        $(me.el).find(".scroll-lite span").animate({
                            left: tabIndex*50 + '%'
                        }, 300, 'linear');
                        // $(tabItem.el).css("display", "inherit");
                    }

                },
                scrollNumber:function(){
                    var me = this;
                    var routeScore;
                    var i = 0;
                    var routeScoreValue = 0;
                    for(var iRoute = 0; iRoute < me._drivingRoute.length; iRoute++){
                        routeScore = me._drivingRoute[iRoute];
                        routeScoreValue += 100 - routeScore.rapidAd * 0.5 - routeScore.sharpTurn * 0.5 - routeScore.speeding * 1 - routeScore.rapidDel * 0.5;
                        i++;
                    }
                    if(routeScoreValue < 0){
                        routeScoreValue = 0;
                    }                
                    // _data = parseInt((Math.random()*100));
                    var _data = (routeScoreValue/i)|0;
                    if (_data == 100) {
                        _data = 99;
                    } 
                    console.log("++++++++++"+_data);
                    var arr = _data+"";
                    var _topDataUnit = -600;
                    var _topDataTen = -600;
                    if(arr < 10)
                    {
                        arr = "0"+arr;
                    }
                    _topDataUnit = -540 + 60 *arr[1];
                    _topDataTen = -540 + 60 *arr[0];
                    $(me.el).find(".the_unit").find("img").css("top",_topDataUnit+"px");
                    $(me.el).find(".the_unit").find("img").addClass("show-number"+arr[1]);
                    $(me.el).find(".ten_digit").find("img").css("top",_topDataTen+"px");
                    $(me.el).find(".ten_digit").find("img").addClass("show-number"+arr[0]);
                    setTimeout(function() {
                            if (_data<=60 && _data>=0) {
                                me.elementHTML(".text-remind","为了你和他人的生命安全,请小心行驶！")
                            }else if (_data>60 && _data<80) {
                                me.elementHTML(".text-remind","你的表现还算可以,小心为上策！")
                            }else{
                                me.elementHTML(".text-remind","今天开车技术阔以哟,再接再厉，么么哒！")
                            }
                    }, 3000);
                    
                }

            });
});
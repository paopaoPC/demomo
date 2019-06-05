define([
        'text!drivingBehavior/myDrivingBehavior.html',
        'common/navView',
        'common/ssUtil',
        'shared/js/datasource',
        'listview/ListView',
        "underscore",
        'text!drivingBehavior/myDrivingBehavior.temp',
        "listview/ListViewItem",
        "common/osUtil",
        'moment',
        'shared/js/notification'
    ],
    function (template, View, ssUtil, Datasource, ListView, _, myBehaviorTemplate, ListItemBase, osUtil, moment, Notification) {
        var RankListItem = ListItemBase.extend(
            {
                initialize: function (options) {
                    var me = this;
                    ListItemBase.prototype.initialize.call(this, options);
                    //render the template into HTML, append to self
                    // this.el.innerHTML = this.template(options.data);
                    var index = options.index;
                    var drivingTime = options.data.time;
                    var date = drivingTime.substring(0, 10);
                    var yearMonthDay = date.split("-");
                    var hour = drivingTime.substring(11);
                    //获取当前时间
                    var currenteTime = new Date();
                    var curYear = currenteTime.getFullYear();
                    var curMonth = currenteTime.getMonth() + 1 < 10 ? "0" + (currenteTime.getMonth() + 1) : currenteTime.getMonth() + 1;
                    var curDay = currenteTime.getDate() < 10 ? "0" + currenteTime.getDate() : currenteTime.getDate();
                    //获取当前时间的前一天
                    var preTime = new Date(currenteTime.getTime() - 24 * 60 * 60 * 1000);
                    var preYear = preTime.getFullYear();
                    var preMonth = preTime.getMonth() + 1 < 10 ? "0" + (preTime.getMonth() + 1) : preTime.getMonth() + 1;
                    var preDay = preTime.getDate() < 10 ? "0" + preTime.getDate() : preTime.getDate();
                    var textTime = "";
                    //时间比较
                    if (yearMonthDay[0] == curYear && yearMonthDay[1] == curMonth && yearMonthDay[2] == curDay) {
                        textTime = "今天"
                    } else if (yearMonthDay[0] == preYear && yearMonthDay[1] == preMonth && yearMonthDay[2] == preDay) {
                        textTime = "昨天"
                    } else {
                        textTime = yearMonthDay[1] + "-" + yearMonthDay[2]
                    }

                    var data = osUtil.clone(options.data);
                    data.time = hour;
                    data.day = textTime;
                    var el = $(_.template(myBehaviorTemplate)(data));
                    this.setContent(el);
                    if (options.userData.reTime == date) {
                        el.find(".day").hide();
                    } else {
                        options.userData.reTime = date;
                    }
                }
            });
        var Base = View;
        return Base.extend({
            id: "myDrivingBehavior",
            events: {
                "click .driving-rank": "myRank",
                "click .text-content, .program-end-value": "gotoNext"
            },
            gotoNext: function () {
                bfNaviController.push("drivingBehavior/experienceValue.html")
            },
            onViewPush: function (pushFrom, pushData) {
                this._from = pushFrom;
                if (pushData) {
                    this._drivingDatas = pushData.allDatas;
                    this._currentDatas = pushData.currentData;
                    this._currentDate = pushData.currentDate;
                    this._Score = pushData.Score;
                    this._selectdata = pushData.selectdata;
                } else {
                    this.initDrivingRoute();
                }
            },
            initDrivingRoute: function () {
                var me = this;
                var data = {
                    startDate: moment().format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD')
                };
                bfClient.historyTrackByDate({
                    data: data,
                    type: "get",
                    dataType: "json",
                    success: function (data) {
                        if (data.msg == '没有符合条件的数据') {
                            data.code = 0;
                            data.data = [];
                        }
                        if (data.code == 0) {
                            me._drivingRoute = data.data;
                            me._drivingDatas = me._drivingRoute;
                            me.dayScroe();
                            var newData = _.groupBy(me._drivingRoute, function (item) {
                                return item.startTime.substring(0, 10);
                            });
                            me._currentDate = moment().format('YYYY-MM-DD');
                            // me._currentDate = '2016-05-18'
                            var newCurrentData = newData[me._currentDate];
                            if (newCurrentData) {
                                me._currentDatas = {};
                                _.each(newCurrentData, function (item) {
                                    me._currentDatas.wholeCost = item.fee + (me._currentDatas.wholeCost || 0);
                                    me._currentDatas.wholeOil = item.oil + (me._currentDatas.wholeOil || 0);
                                    me._currentDatas.wholeRoute = item.mileage + (me._currentDatas.wholeRoute || 0);
                                    me._currentDatas.wholeSharpTurn = item.sharpTurn + (me._currentDatas.wholeSharpTurn || 0);
                                    me._currentDatas.wholeSpeedDown = item.speedDown + (me._currentDatas.wholeSpeedDown || 0);
                                    me._currentDatas.wholeSpeedUp = item.speedUp + (me._currentDatas.wholeSpeedUp || 0);
                                    me._currentDatas.wholeTime = item.spendTime + (me._currentDatas.wholeTime || 0);
                                    me._currentDatas.wholeScore = item.score + (me._currentDatas.wholeScore || 0);
                                });
                                me._Score = me._currentDatas.wholeScore;
                                me.$('#scoreTime span').html(me._currentDatas.wholeScore || '');
                            } else {
                                me._Score = 0;
                                me.$('#scoreTime span').html(0);
                                me._currentDatas = undefined;
                            }

                            me.initDatas();

                        } else {
                            me.clearViewRender();
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }

                    },
                    error: function () {
                        me.clearViewRender();
                        Notification.show({
                            type: "error",
                            message: "网络开小差"
                        });
                    }
                });
            },
            dayScroe: function () {
                var me = this;
                if (me._drivingRoute) {
                    for (var i = 0; i < me._drivingRoute.length; i++) {

                        me._drivingRoute[i].score = me.calculateScore(me._drivingRoute[i]);
                    }
                }
            },
            calculateScore: function (data) {
                var me = this;
                var score = 0;
                if (Number(data.mileage.toFixed(1)) <= 50) {
                    score = (Number(data.mileage.toFixed(1)) / 50) * 100
                        - (Number(data.sharpTurn) + Number(data.speedDown) + Number(data.speedUp)) * 5;
                } else if (Number(data.mileage.toFixed(1)) > 50) {
                    score = 100 + (Number(data.mileage.toFixed(1)) - 50) * 0.5
                        - (Number(data.sharpTurn) + Number(data.speedDown) + Number(data.speedUp)) * 5;
                }
                score = parseInt(score);//保留整数部分
                if (score < 0) {
                    score = 0;
                }
                return score;
            },
            goBack:function () {
                if(this._from == "drivingReport/index"){
                    // window.sessionStorage.setItem("onViewBack",true);
                }
                bfNaviController.pop(1);
            },
            onShow: function () {
                var contentHeight = this.$('.content').height();
                var headHeight = this.$('.driving-head').height();
                var imforHeight = this.$('.behavior-imfor').height();
                if (headHeight + imforHeight < contentHeight) {
                    // this.$('.behavior-imfor').css({'padding-bottom': contentHeight - headHeight - imforHeight + 'px'});
                }
                var me = this;
                me.initDatas();
                var data = window.sessionStorage.getItem("totalScore") || '';//驾驶总分数
                //var data=6000;
                var ranking = window.sessionStorage.getItem("ranking");//积分排名
                var val = 0;
                var stepValue = parseInt(data / 100);
                var value_end = 0;

                var rankLevelName = JSON.parse(window.localStorage.rankLevelName);
                var rank = parseInt(rankLevelName.rank);
                var title = rankLevelName.title;
                var description = rankLevelName.description;

                me.getElement(".program-start-value").text("LV" + rank);
                me.getElement(".program-end-value").text("LV" + (rank + 1));
                me.getElement(".text-content")[0].children[0].innerText = title;
                window.sessionStorage.setItem("Drivingdescipte", description);
                value_end = rankLevelName.scoreMax;


                data = Number(data);
                value_end = Number(value_end);


                var programLineWidth = me.getElement(".program-line").width();
                me.getElement(".program-green").width((data / value_end) * programLineWidth);
                var program_value = (data / (value_end / 6)).toFixed(0);
                me.getElement(".program-green").addClass("program-green-fill" + program_value);
                me.getElement(".gain-score")[0].children[0].innerText = me._Score || 0;
                me.getElement(".text-value span")[0].innerText = data;
                var ranking1 = ranking ? ranking:"--";
                me.elementHTML(".driving-rank_words", "我排在<span>" + ranking1 + "</span>名");
                me.getElement(".driving-rank_words").attr("data-value", ranking);
            },
            initDatas: function () {
                var me = this;
                var timeNode = me.getElement("#time");
                var scoreTimeNode = me.getElement("#scoreTime");
                var kilometerNode = me.getElement("#kilometer");
                var averSpeedNode = me.getElement("#averSpeed");
                var speedUpNode = me.getElement("#speedUp");
                var speedDownNode = me.getElement("#speedDown");
                var untrnNode = me.getElement("#untrn");
                if (this._currentDatas && (this._currentDatas.wholeTime >= 600)) {
                    timeNode.css("color", "#ea4f39");
                    timeNode.siblings(".icon-image").show();
                }//wfx 2/14
                timeNode.text(this._currentDatas ? this._currentDatas.wholeTime.toFixed(0) : 0);
                if (moment(this._currentDate).diff(moment(), 'd') != 0) {
                    scoreTimeNode.html(scoreTimeNode.html().replace("今日", this._currentDate));
                }
                if (this._currentDatas && this._currentDatas.wholeRoute >= 100) {
                    kilometerNode.css("color", "#ea4f39");
                    kilometerNode.siblings(".icon-image").show();
                }
                kilometerNode.text(this._currentDatas ? this._currentDatas.wholeRoute.toFixed(1) : 0);

                var averSpeed;
                if (this._currentDatas === undefined || this._currentDatas.wholeTime == 0 || this._currentDatas.wholeRoute == 0) {
                    averSpeed = 0;
                } else {
                    averSpeed = this._currentDatas.wholeRoute / this._currentDatas.wholeTime * 60
                }
                if (averSpeed >= 180) {
                    averSpeedNode.css("color", "#ea4f39");
                    averSpeedNode.siblings(".icon-image").show();
                }//wfx 2/14
                averSpeedNode.text(averSpeed.toFixed(0));

                if (this._currentDatas && this._currentDatas.wholeSpeedUp >= 10) {
                    speedUpNode.css("color", "#ea4f39");
                    speedUpNode.siblings(".icon-image").show();
                }
                speedUpNode.text(this._currentDatas && this._currentDatas.wholeSpeedUp || 0);

                if (this._currentDatas && this._currentDatas.wholeSpeedDown >= 10) {
                    speedDownNode.css("color", "#ea4f39");
                    speedDownNode.siblings(".icon-image").show();
                }
                speedDownNode.text(this._currentDatas && this._currentDatas.wholeSpeedDown || 0);

                if (this._currentDatas && this._currentDatas.wholeSharpTurn >= 10) {
                    untrnNode.css("color", "#ea4f39");
                    untrnNode.siblings(".icon-image").show();
                }
                untrnNode.text(this._currentDatas && this._currentDatas.wholeSharpTurn || 0);
            },
            myRank: function () {
                //var rankData = 205552;
                var rankData = this.getElement(".driving-rank_words").attr("data-value");
                bfNaviController.push("drivingBehavior/rankingList.html", rankData);
            },
            initListView: function () {
                var me = this;
                var data = "datasource";
                var list = "listview";
                this[data] = new Datasource({
                    storage: 'local',
                    identifier: 'driving-list',
                    url: "../drivingBehavior/data/myDrivingBehavior.json",
                    pageParam: 'pageIndex'
                });

                var listEl = this.getElement("#driving-list");//容器的element
                this[list] = new ListView({
                    id: "listview.",
                    el: listEl,
                    itemClass: RankListItem,
                    // itemTemplate : template,
                    dataSource: this[data],
                    userData: {reTime: ""}
                });
            },
            onRight: function () {
                var me = this;
                //if (me._drivingDatas == undefined || (me._drivingDatas && !me._drivingDatas.length)) {
                //
                //    Notification.show({
                //        type: "info",
                //        message: "暂无驾驶历史数据"
                //    });
                //    return;
                //}
                bfNaviController.push("drivingBehavior/historyBehavior.html", this._selectdata);
            }
        });
    });
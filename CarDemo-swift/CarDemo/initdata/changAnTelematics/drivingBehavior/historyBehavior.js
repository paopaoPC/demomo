define([
        'common/navView',
        'common/ssUtil',
        "underscore",
        'text!drivingBehavior/myDrivingBehavior.temp',
        "common/osUtil",
        'shared/js/datasource',
        'listview/ListView',
        'shared/js/client' // 因为bfClient没有继承shared的client，所以这里引用（不动bfclient）
    ],

    function(View, ssUtil, _, myBehaviorTemplate, osUtil, DataSource, ListView, Client) {
        var Base = View;
        var newDatasource = DataSource.extend({
            // 之前写的，不动里面的逻辑，当个黑河用  只需要里面的{time: hour,day:textTime} 
            compareTime: function(datas) {
                var me = this;
                var drivingTime = datas.startTime;
                var date = drivingTime.substring(0, 10);
                var yearMonthDay = date.split("-");
                var hour = drivingTime.substring(11, 16);
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

                return {time: hour, day:textTime} 

            },
            ajaxLoadData: function(options) {
                var me = this;
                var pageSize = options.data[this.options.pageSizeParam];
                pageSize = pageSize || 20;

                Client.ajax({
                    url: options.url,
                    type: 'post',
                    data: options.data,
                    success: function(response) {
                        // code = 3(数据为空) 和  sucess = true 都调用options.success。
                        // code = 3 时，sucess 是为false
                        if (response && (response.success || response.code == 3) && response.data) { // && response.success
                            //mark as finish
                            if (response.data == null) {
                                response.data = [];
                                response.data.length = 0;
                            }
                            if (response.data.length == 0 || response.total == response.data.length + me.size() || response.data.length < pageSize) {
                                me.setFinish();
                            };

                            // compareTime函数产生的对象（{time: hour,day:textTime}）放到接口数据中
                            _.each(response.data,function(item){
                              _.extend(item,me.compareTime(item));
                            })


                            //callback
                            options.success(response);
                        } else {
                            options.fail(response);
                        }
                    },
                    error: function(xhr, status) {
                        options.fail(xhr, status);
                    }
                });
            }
        });
        return Base.extend({
            id: "historyBehavior",
            onViewPush: function(pushFrom, pushData) {
                if (pushData) {
                    this._selectdata = pushData;
                }
            },
            onShow: function() {
                var me = this;
                this._flag = "";
                me.initListView();
            },
            // getHistoryDatas: function() {
            //     var me = this;
            //     var container = me.getElement(".history-container");
            //     container.empty();
            //     for (var i = 0; i < this._historyDatas.length; i++) {
            //         //时间比较
            //         me.compareTime(container, this._historyDatas[i]);
            //     };
            // },
            // compareTime: function(container, datas) {
            //     var me = this;
            //     var drivingTime = datas.startTime;
            //     var date = drivingTime.substring(0, 10);
            //     var yearMonthDay = date.split("-");
            //     var hour = drivingTime.substring(11, 16);
            //     //获取当前时间
            //     var currenteTime = new Date();
            //     var curYear = currenteTime.getFullYear();
            //     var curMonth = currenteTime.getMonth() + 1 < 10 ? "0" + (currenteTime.getMonth() + 1) : currenteTime.getMonth() + 1;
            //     var curDay = currenteTime.getDate() < 10 ? "0" + currenteTime.getDate() : currenteTime.getDate();
            //     //获取当前时间的前一天
            //     var preTime = new Date(currenteTime.getTime() - 24 * 60 * 60 * 1000);
            //     var preYear = preTime.getFullYear();
            //     var preMonth = preTime.getMonth() + 1 < 10 ? "0" + (preTime.getMonth() + 1) : preTime.getMonth() + 1;
            //     var preDay = preTime.getDate() < 10 ? "0" + preTime.getDate() : preTime.getDate();
            //     var textTime = "";
            //     //时间比较
            //     if (yearMonthDay[0] == curYear && yearMonthDay[1] == curMonth && yearMonthDay[2] == curDay) {
            //         textTime = "今天"
            //     } else if (yearMonthDay[0] == preYear && yearMonthDay[1] == preMonth && yearMonthDay[2] == preDay) {
            //         textTime = "昨天"
            //     } else {
            //         textTime = yearMonthDay[1] + "-" + yearMonthDay[2]
            //     }

            //     me.initTemplate(container, datas, hour, textTime, date);
            // },
            // initTemplate: function(container, datas, hour, textTime, date) {
            //     var me = this;

            //     var data = osUtil.clone(datas);
            //     data.time = hour;
            //     data.day = textTime;
            //     data.score = datas.score;

            //     var temp = _.template(myBehaviorTemplate);
            //     container.append(temp(data));
            //     if (this._flag == date) {
            //         var length = this.getElement('.one-driving-imfor').length;
            //         this.getElement('.one-driving-imfor').eq(length - 1).find(".day").hide();
            //     } else {
            //         this._flag = date;
            //     }
            // },
            //初始化listview
            initListView: function(carId) {
                var me = this;
                if (!this.listview) {
                    var Datasource = new newDatasource({
                        storage: 'none',
                        identifier: 'historyBHDatasource',
                        url: bfConfig.server + "/api/cardata/historyTrackByPagger",
                        requestParams: {
                            carId: bfDataCenter.getCarId(),
                        }
                    });
                    var listEl = this.$('#HCListview');
                    var template = _.template(me.$("#historyBehaviorTemplate").html()); ;
                    this.listview = new ListView({
                        id: 'historyBHListview',
                        el: listEl,
                        autoLoad: true,
                        itemTemplate: template,
                        dataSource: Datasource,
                        isPullToRefresh: true
                    });
                } else {
                    this.listview.IScroll && this.listview.IScroll.refresh();
                }
            },
            // initDrivingRoute: function() {
            //     var me = this;
            //     var data = {
            //         startDate: (me._selectdata && me._selectdata.startDate) || moment().subtract(1, 'months').format('YYYY-MM-DD'),
            //         endDate: (me._selectdata && me._selectdata.endDate) || moment().format('YYYY-MM-DD')
            //     };
            //     bfClient.historyTrackByDate({
            //         data: data,
            //         dataType: "json",
            //         success: function(data) {
            //             if (data.msg == '没有符合条件的数据') {
            //                 data.code = 0;
            //                 data.data = [];
            //             }
            //             if (data.code == 0) {
            //                 me._historyDatas = data.data;
            //                 var length = me._historyDatas.length;
            //                 me.getHistoryDatas();
            //             } else {
            //                 Notification.show({
            //                     type: "error",
            //                     message: data.msg
            //                 });
            //             }

            //         },
            //         error: function() {
            //             Notification.show({
            //                 type: "error",
            //                 message: "网络异常，请检查网络"
            //             });
            //         }
            //     });
            // },

        });
    });

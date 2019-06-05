define([
        'text!control/controlHistory.html',
        "common/navView",
        'butterfly',
        'shared/js/notification',
        'shared/js/datasource',
        'listview/ListView',
        "common/ssUtil",
        'shared/js/client'
    ],
    function (template, View, Butterfly, Notification, Datasource, ListView, ssUtil,Client) {
        var Base = View;
        var dataSourceClass1 = Datasource.extend({
            ajaxLoadData: function(options){
                var pageSize = options.data[this.options.pageSizeParam];
                pageSize = pageSize || 20;
                var me = this;
                Client.ajax({
                    url: options.url,
                    type: 'POST',
                    data: options.data,
                    success: function(response) {
                        // code = 3(数据为空) 和  sucess = true 都调用options.success。
                        // code = 3 时，sucess 是为false
                        if (response&& (response.success || response.code == 3) ) {// && response.success
                            if(!response.data){
                                response.data = {};
                            }
                            //mark as finish
                            if(response.data.data == null){
                                response.data.data = [];
                                response.data.data.length = 0;
                            }
                            if (response.data.data.length == 0
                                || response.data.total == response.data.data.length + me.size()
                                ||response.data.data.length<pageSize) {
                                me.setFinish();
                            };
                            //callback
                            options.success(response.data);
                        } else {
                            options.fail(response.data);
                        }
                    },
                    error: function(xhr, status) {
                        options.fail(xhr, status);
                    }
                });
            }
        })
        return Base.extend({
            onRemove: function () {
                if (this._timer) {
                    clearTimeout(this._timer);
                }
            },
            onShow: function () {
                var self = this;
                self._jindu = window.sessionStorage.jindu;
                if (self._timer) {
                    clearTimeout(self._timer);
                }

                var dataSource = new dataSourceClass1({
                    url: bfClient.GET_CONTROL_LIST,
                    pageParam:"page",
                    requestParams: {
                        carId: bfDataCenter.getCarId()
                    },
                    
                });
                var listEl = self.getElement("#controlHistory_list");
                var temp = function (item) {
                    var template = _.template(self.elementHTML("#controlHistory_controlItem"));
                    if (self.getElement("li").length >= 1) {
                        if (item.handleStatus == "Runing") {
                            item.handleStatus = "Timeout"
                        }
                    } else if (self.getElement("li").length == 0 && !window.sessionStorage.jindu) {
                        if (item.handleStatus == "Runing") {
                            item.handleStatus = "Timeout"
                        }
                    }
                    return template(item);
                };
                if (this._serviceList) {
                    this._serviceList = null;
                }
                var completeLoadBack = function () {
                    //因为页面高度若没有溢出窗口，则下拉刷新会失效，故要重新设置高度。
                    var H = self.$el.find('#controlHistory_list').height();
                    var h = self.$el.find('.scroller').height();
                    if( h <= H){
                        self.$el.find('.scroller').height(H+1);
                    }else {
                        self.$el.find('.scroller').height('auto');
                    }
                };
                this._serviceList = new ListView({
                    el: listEl,
                    itemTemplate: temp,
                    dataSource: dataSource,
                    isPullToRefresh: true,
                    completeLoadBack: function(){
                        completeLoadBack();
                        self.loopInfo();
                    }
                });


                //self.listenTo(self._serviceList, 'listviewPullDown', self.onShow);
                // self.loopInfo();
            },
            loopInfo: function () {
                var self = this;
                if (!self._jindu) {
                    self._jindu = 0;
                }
                if (window.sessionStorage.jindu) {
                    setTimeout(function () {
                     /*   var getControl = self.getElement('#controlHistory_jindu');
                        getControl.css("width", self._jindu + "%");
                        if (getControl.length > 0) {*/
                            //持续拉取
                            var requestOperationResult = function () {
                                if (self._getControl) {
                                    clearTimeout(self._getControl);
                                }
                                /*  var per = window.sessionStorage.jindu + '%';
                                self.getElement('#controlHistory_jindu').css('width', per);
                                self.elementHTML('#controlHistory_jindushu', per);*/
                                if (window.sessionStorage.jindu == undefined || window.sessionStorage.jindu == 100) {
                                    window.sessionStorage.removeItem("jindu");
                                    var cmdDescription =self.getElement("li:nth(0)").find(".cmdDescription").html();
                                    $(self.getElement("li:nth(0)").find(".item-content")).html("");
                                    var template = _.template(self.elementHTML("#controlHistory_controlItem"));
                                    var controlInfo = window.sessionStorage.controlInfo;
                                    if (controlInfo) {
                                        window.sessionStorage.removeItem("controlInfo");
                                        controlInfo = eval("(" + controlInfo + ")");
                                        var data = {
                                            cmdSendTime: controlInfo.cmdSendTime,
                                            tboxCmd: controlInfo.tboxCmd,
                                            handleStatus: controlInfo.handleStatus,
                                            requestId:"",
                                            userName:bfDataCenter.getUserSessionData().userFullname,
                                            resultDesc:controlInfo.handleStatusDesc,
                                            cmdDescription:cmdDescription,
                                        };
                                        var temp = template(data);
                                        $(self.getElement("li:nth(0)").find(".item-content")).html(temp);
                                    }
                                } else {
                                    self._getControl = setTimeout(requestOperationResult, 3000);
                                }
                            };
                            requestOperationResult();
                       // }
                    }, 500);
                }
            }
        });
    });
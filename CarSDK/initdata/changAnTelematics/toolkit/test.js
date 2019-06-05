define(
    [
        "text!toolkit/test.html",
        "common/navView",
        'butterfly',
        'shared/js/datasource',
        'listview/ListView',
        'shared/js/client',
        'shared/js/swiper_two',
        "common/ssUtil",
        "shared/js/notification",
        "moment",
        'shared/js/amap',
    ],
    function (template, View, Butterfly, Datasource, ListView, Client, Swiper, ssUtil, Notification,moment) {
        var Base = View;
        var  myScroll,a= 3,b=5;
        var localStorageContent = {
            count :2
        };
        var newDatasource = Datasource.extend({
            ajaxLoadData: function(options) {
                var me = this;
                options.data.page = options.data.page +1;
                Client.ajax({
                    url: options.url,
                    type: 'post',
                    data: options.data,
                    success: function(response) {
                        if (response && response.status_code == 0 ) {
                            if(response.data == null){
                                response.data = {};
                                response.data.content = [];
                            }
                            if(response.data.content == null){
                                response.data.content = [];
                            }
                            if (response.data.content && (response.data.content.length == 0 || response.data.totalElements == response.data.content.length + me.size() || response.data.content.length < 5)  ) {
                                me.setFinish();
                            };
                            cls.uiRemoveChrysanthemum();
                            response.data.data = response.data.content;

                            options.success(response.data);
                        } else  {
                            cls.uiRemoveChrysanthemum();
                            options.fail(response);
                        }
                    },
                    error: function(xhr, status) {
                        cls.uiRemoveChrysanthemum();
                        options.fail(xhr, status);
                    }
                });
            }
        });
        // var dataSourceClass1 = Datasource.extend({
        //     ajaxLoadData: function(options){
        //         var pageSize = options.data[this.options.pageSizeParam];
        //         pageSize = pageSize || 20;
        //         var me = this;
        //         Client.ajax({
        //             url: options.url,
        //             type: 'POST',
        //             data: options.data,
        //             success: function(response) {
        //                 // code = 3(数据为空) 和  sucess = true 都调用options.success。
        //                 // code = 3 时，sucess 是为false
        //                 if (response&& (response.success || response.code == 3) ) {// && response.success
        //                     if(!response.data){
        //                         response.data = {};
        //                     }
        //                     //mark as finish
        //                     if(response.data.data == null){
        //                         response.data.data = [];
        //                         response.data.data.length = 0;
        //                     }
        //                     if (response.data.data.length == 0
        //                         || response.data.total == response.data.data.length + me.size()
        //                         ||response.data.data.length<pageSize) {
        //                         me.setFinish();
        //                     };
        //                     //callback
        //                     options.success(response.data);
        //                 } else {
        //                     options.fail(response.data);
        //                 }
        //             },
        //             error: function(xhr, status) {
        //                 options.fail(xhr, status);
        //             }
        //         });
        //     }
        // })

        var cls =
        {
            events: {
                "click .system_ts":'gotoMessageDetails',
                "click .smn-button":'onClickSMN',
            }
        };

        cls.button = true;

        cls.onLeft = function(){
            bfNaviController.pop();
        };

        cls.onClickSMN = function(e){
            var  dataValue = $(e.currentTarget).attr('data-value');
            if(this._mySwiper){
                this._mySwiper.swipeTo(dataValue)
            }
        }

        cls.onRight = function(){
            this.updateAllInformationStatus();
        };

        cls.onRemove = function () {
            if (this._timer) {
                clearTimeout(this._timer);
            }
        }

        // 把所有未读消息设置成已读
        cls.updateAllInformationStatus = function(){
            var me = this;
            var infoTrack = $('.readStatus.no').parents('.system_ts');
            var infoTrackLength = infoTrack.length;
            var infoTrackIdsArr = [];
            if(infoTrackLength <= 0){
                return
            }
            for(var i=0;i<infoTrackLength;i++){
                infoTrackIdsArr.push(infoTrack.eq(i).attr('data-id'))
            }
            var infoTrackIds = infoTrackIdsArr.join(',');
            bfClient.updateAllInformationStatus({
                data: {
                    infoTrackIds: infoTrackIds
                    // actionType: bfDataCenter.getActionType(),
                    // readStatus: 1
                },
                success: function(netdata){
                    if (netdata.status_code == 0) {
                        me.$('.readStatus').removeClass('no');
                    }
                },
                error: function(){
                }

            })
        }

        cls.posGenHTML = function(){
           this.$('.swiper-message-nav .smn-button').removeClass('active').eq(0).addClass('active') 
        }
        cls.onShow = function () {
            var me = this;
            if(!this.firstView){
                me._mySwiper = new Swiper (this.$('#swiper-message')[0], {
                    direction: 'vertical',
                    loop: false,
                    initialSlide: this.controlIndex,
                    // 如果需要分页器
                    // pagination: '#control .content .swiper-pagination',
                    onSlideChangeEnd: function(swiper){
                        if(swiper.activeIndex){
                            me.$('.swiper-message-nav .smn-button').removeClass('active').eq(1).addClass('active')
                            me.$('#navRight').hide();
                        } else {
                            me.$('.swiper-message-nav .smn-button').removeClass('active').eq(0).addClass('active')
                            me.$('#navRight').show();
                        }
                        
                    }
                })
                this.uiAddChrysanthemum()
                this.tempViewList();
                this.firstView = true;
                // this.onShowControl()
            }
        };
        // cls.onShowControl = function () {
        //     var self = this;
        //     self._jindu = window.sessionStorage.jindu;
        //     if (self._timer) {
        //         clearTimeout(self._timer);
        //     }

        //     var dataSource = new dataSourceClass1({
        //         url: bfClient.GET_CONTROL_LIST,
        //         pageParam:"page",
        //         requestParams: {
        //             carId: bfDataCenter.getCarId()
        //         },
                
        //     });
        //     var listEl = self.getElement("#controlHistory_list");
        //     var temp = function (item) {
        //         var template = _.template(self.elementHTML("#controlHistory_controlItem"));
        //         if (self.getElement("li").length >= 1) {
        //             if (item.handleStatus == "Runing") {
        //                 item.handleStatus = "Timeout"
        //             }
        //         } else if (self.getElement("li").length == 0 && !window.sessionStorage.jindu) {
        //             if (item.handleStatus == "Runing") {
        //                 item.handleStatus = "Timeout"
        //             }
        //         }
        //         return template(item);
        //     };
        //     if (this._serviceList) {
        //         this._serviceList = null;
        //     }
        //     var completeLoadBack = function () {
        //         //因为页面高度若没有溢出窗口，则下拉刷新会失效，故要重新设置高度。
        //         var H = self.$el.find('#controlHistory_list').height();
        //         var h = self.$el.find('.scroller').height();
        //         if( h <= H){
        //             self.$el.find('.scroller').height(H+1);
        //         }else {
        //             self.$el.find('.scroller').height('auto');
        //         }
        //     };
        //     this._serviceList = new ListView({
        //         el: listEl,
        //         itemTemplate: temp,
        //         dataSource: dataSource,
        //         isPullToRefresh: true,
        //         completeLoadBack: function(){
        //             completeLoadBack();
        //             self.loopInfo();
        //         }
        //     });


        //     //self.listenTo(self._serviceList, 'listviewPullDown', self.onShow);
        //     // self.loopInfo();
        // }
        cls.loopInfo = function () {
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
        cls.tempViewList = function(catalogId){
            var me = this;
            var imUserId = window.localStorage['userId'];
            this._dataSource = new newDatasource({
                identifier : 'Message-list',
                url : bfConfig.server+"/appserver/api/information/getInformations",
                pageParam: "page",
                pageSizeParam: "limit",
                requestParams : {
                    carId: '',
                    actionType: bfDataCenter.getActionType() //常规车1  新能源2 商用车3
                }
            });
            me.showListView(me._dataSource);
        };
        cls.showListView = function(datas)
        {
            var me = this;
            me._time  = undefined
            var template =function(Item){
                var newMomentDate = moment(Item.createdAt,'YYYY-MM-DD')
                var diff = moment(moment().format('YYYY-MM-DD')).diff(newMomentDate,'d');
                if(diff == 0){
                    date = '今天'
                } else if (diff == 1){
                    date = '昨天'
                } else {
                    date = newMomentDate.format('YYYY.MM.DD')
                }
                var temp = _.template(me.elementHTML('#Message_Item'));
                if(me._time == date){
                   Item.noTime = true 
                }
                me._time = date
                Item.time = date;
                if(!Item.infoTypeImg){   //todo
                    Item.infoTypeImgUrl = "";
                }else{
                    Item.infoTypeImgUrl = Item.infoTypeImg;
                }
                if(!Item.titleImg){   //todo
                    Item.titleImg = "";
                }else{
                    // 后台传过来的titleImg有http格式的url地址，或者需要前端拼接的’句柄‘
                    if(Item.titleImg.indexOf && Item.titleImg.indexOf('http')>=0){
                        Item.titleImg = Item.titleImg;
                    } else {
                        Item.titleImg = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + Item.titleImg;
                    }
                }
                return temp(Item);
            };
            this.getElement('#Message_list ul').html('');
            var listEl = this.getElement('#Message_list');
            var Message_ListView = new ListView({
                id : "Message_ListView",
                el : listEl,
                itemTemplate : template,
                page: 1,
                pageSize: 15,
                dataSource : datas,
                isPullToRefresh: true
            });
            me.listenTo(Message_ListView, 'listviewPullDown', me.onListviewPullDown);
        };

        cls.onListviewPullDown = function(){
            this._time = undefined;
        }

         // 把本消息标志位已读消息
        cls.updateIInformationStatus = function(data){
            var me = this;
            bfClient.updateIInformationStatus({
                data: {
                    infoTrackId: data.id,
                    readStatus: 1
                }
            })
        }
      
        cls.gotoMessageDetails = function (el) {
            var me = this;
            var $target = $(el.currentTarget);



            this.button = false;
            var objStr = $target.attr("data-obj");
            var data = JSON.parse(objStr);

            //  没有data则提示
            if(!data){
                Notification.show({
                   type: 'error',
                   message: "数据异常"
                });
                return
            }

            // 接口 把未读标记为已读
            this.updateIInformationStatus(data);
            // UI 把未读标记为已读
            $target.find('.readStatus').removeClass('no');

            var jumpParamData = JSON.parse(data.jumpParam);
            if(jumpParamData && jumpParamData.action && jumpParamData.action == 'INNER_JUMP'  ){
                bfNaviController.push(jumpParamData.uri, _.extend({
                    objData:data
                },jumpParamData.uriParams));
            } else {
                if(jumpParamData && jumpParamData.uri){
                    window.open(jumpParamData.uri,'_system');
                } else {
                   Notification.show({
                       type: 'error',
                       message: "数据异常"
                    }); 
                }
            }


            
        };


        localStorageContent.content = function(){
            localStorage.setItem("json_data_content_message",JSON.stringify(localStorageContent.contentMessage));
            localStorageContent.data = JSON.parse(localStorage.getItem("json_data_content_message"));
        };
       
        cls.uiAddChrysanthemum = function () {
            var me = this;
            if (me.$el.find('.chrysanthemum').length === 0) {
                me.$el.append('<div id="HUDView" style="background-color: rgba(0, 0, 0, 0.4);" class="chrysanthemum active"><div></div><div style="font-size: 14px;color: white;margin-top: 50px;text-align: center;">加载中...</div></div>');
            }
        };
        cls.uiRemoveChrysanthemum = function () {
            var me = this;
            $('.chrysanthemum').remove();
        };
        return Base.extend(cls);
    }
);



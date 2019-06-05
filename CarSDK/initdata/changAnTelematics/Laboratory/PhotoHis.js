/**
 * Created by hp on 2016/10/11.
 */
define(
    [
        "text!Laboratory/PhotoHis.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "iscroll",
        "common/disUtil",
        'shared/js/datasource',
        'listview/ListView',
        "shared/js/notification",
        "Laboratory/lab-client",
        'shared/js/client'
    ],
    function (template, View, Butterfly, ssUtil,iscroll, disUtil, DataSource, ListView, Notification,LabClient,Client)
    {
        var Base = View;
        var myDataSource = DataSource.extend({
            ajaxLoadData: function(options) {
                //不传pageSize参数
                //delete options.data[this.options.pageSizeParam];
                var pageSize = options.data[this.options.pageSizeParam];
                pageSize = pageSize || 20;

                var me = this;
                Client.ajax({
                    url: options.url,
                    type: 'POST',
                    data: options.data,
                    success: function(response) {
                        if (response&& (response.success || response.code == 3)&&response.data ) {// && response.success
                            //mark as finish
                            if(response.data == null){
                                response.data = [];
                                response.data.length = 0;
                            }
                            if (response.data.length == 0
                                || response.data.total == response.data.length + me.size()
                                ||response.data.length<pageSize) {
                                me.setFinish();
                            };
                            //callback
                            // 处理成想要的格式
                            var newTimeArr = _.groupBy(response.data,function(item){
                               return moment(item.createTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
                            })


                            // 处理一下后台的数据 上一条和下一条数据日期重复的问题
                            var $PHitem = $('#PhotoHis .content .PHitem');
                            if($PHitem && $PHitem.html()){
                                var PHitemLength = $PHitem.length;
                                var $PHitemLast = $PHitem.eq(PHitemLength - 1);

                                var $PHitemTime = $PHitemLast.find('.PHitemTime');
                                var $PHitemTimeText = $PHitemTime.html();

                                var $PHitemImgWarp = $PHitemLast.find('.PHitemImgWarp')
                                var $PHitemImgWarpLength = $PHitemImgWarp.length;

                                var newTimeArrOfText = newTimeArr[$PHitemTimeText];
                                var newTimeArrOfTextLength = newTimeArrOfText && newTimeArrOfText.length || 0;

                                if(newTimeArrOfTextLength){
                                    var _photoHisTemplateImage = $('#PhotoHis #photoHisTemplate-image').html();
                                    var $PHitemImgWarpTwo = $PHitemImgWarp.eq($PHitemImgWarpLength-2);
                                    if($PHitemImgWarpTwo.html().trim() == ''){
                                        var item = newTimeArrOfText[0];
                                        var _newTemp = _.template(_photoHisTemplateImage,{
                                            src: bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + item.dsshandle
                                        })
                                        $PHitemImgWarpTwo.html(_newTemp);
                                        newTimeArrOfText.shift();
                                    }

                                    var $PHitemImgWarpOne = $PHitemImgWarp.eq($PHitemImgWarpLength-1);
                                    if($PHitemImgWarpOne.html().trim() == ''){
                                        var item = newTimeArrOfText[0];
                                        var _newTemp = _.template(_photoHisTemplateImage,{
                                            src: bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + item.dsshandle
                                        })
                                        $PHitemImgWarpOne.html(_newTemp);
                                        newTimeArrOfText.shift();
                                    }

                                    var photoHisTemplateItem = $('#PhotoHis #photoHisTemplate-item').html();
                                    for(var i=0,length=newTimeArrOfText.length;i<length;i++){
                                        newTimeArrOfText[i].img = bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + newTimeArrOfText[i].dsshandle
                                    }
                                    var tempAppend = _.template(photoHisTemplateItem,{
                                        'imgArr': newTimeArrOfText
                                    });
                                    $PHitemLast.find('.PHitemContent').append(tempAppend);

                                    delete newTimeArr[$PHitemTimeText];

                                }

                            }
                            
                            var newDataArr = [];
                            _.each(newTimeArr, function(item,key){
                              var newImgArr = [];
                              for(var i=0,length=item.length;i<length;i++){
                                newImgArr.push({
                                    img: bfDataCenter.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.getItem("token") + "&dsshandle=" + item[i].dsshandle
                                });
                              }
                              newDataArr.push({createTime:key,imgArr: newImgArr});
                            })
                            response.data = {};
                            response.data.data = newDataArr;

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
        });
        var cls =
        {
            _value : true,
            carData : null,
            events: {

            }
        };
        cls.onShow = function()
        {
            // this._initListView();
        };
        cls.posGenHTML = function(){
            this._initListView();
        };
        //下拉刷新
        cls.initScroll = function() {
            var me = this;
            if (!me.myscroll) {
                me.$iconOne =  this.$('.iconOne');
                me.$iconTwo =  this.$('.iconTwo');
                //bounceTime 为0，无法触发scrollEnd
                me.myscroll = new iscroll(this.$('#wrapper')[0], {
                    probeType: 2,
                    scrollX: false,
                    scrollY: true,
                    mouseWheel: true,
                    bounceTime: 2
                });
            } else {
                me.myscroll.refresh();
            }
        },
        cls._initListView = function(){
            var me = this;
            if(!this.listview){
                me.datasource = new myDataSource({
                    storage: 'none',
                    identifier: 'PhotoHis',
                    url: LabClient.getHistoryImage_url,
                    // url: '../Laboratory/data/PhotoHis.json',
                    requestParams: {
                        carId: bfDataCenter.getCarId()
                    }
                });
                var listEl = this.$("#photoHisList");
                var template = _.template(me.$("#photoHisTemplate").html());
                me.listview = new ListView({
                    id: 'PhotoHis',
                    el: listEl,
                    autoLoad: true,
                    itemTemplate: template,
                    dataSource: me.datasource,
                    isPullToRefresh: true
                });
            } else {
                this.listview.IScroll && this.listview.IScroll.refresh();
            }
        }
        return Base.extend(cls);
    }
);
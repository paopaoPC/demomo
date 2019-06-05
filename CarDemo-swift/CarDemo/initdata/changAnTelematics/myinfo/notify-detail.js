/**
 * Created by KirK-Jiang on 2015/1/22.
 */
/** add by liangchengguang
 *  发现详情
 */
define([
        'common/navView',
        'text!myinfo/notify-detail.html',
        'iscroll',
        'shared/js/notification',
        'shared/js/client',
        'shared/js/date-description',
        'shared/js/imgTag',
        'moment'
    ],
    function (View, viewTemplate, iscroll, Notification, Client, dateDescription, ImgTag, Moment) {
        var View = View.extend({
            id: 'discovery-detail',
            events: {},
            loadData: null,

            onShow: function () {
                var catalogId = Client.request("catalogId");
                var id = Client.request("id");
                this.getContent(catalogId, id);
            },
            getContent: function (catalogId, id) {
                var me = this;
                var from =Client.request("from");
                if(from=="toolkit"){
                    bfClient.getItemDetail({
                        data:{
                            id:id
                        },
                        success: function (req) {
                            var data1 = eval("(" + req.data + ")");
                            me.getElement("#detail-scroller").html(data1.contentBody);
                        }
                    });
                }else{
                    bfClient.loadNotifyDetail({
                        catalogId: catalogId,
                        id: id,
                        beforeSend: function () {
                            if (me.$el.find('.chrysanthemum').length === 0) {
                                me.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div></div>");
                            }
                        },
                        success: function (data) {
                            if (data && data.code === "0") {
                                me.loadData = data.data.data;
                                me.TempviewlateRender();
                            } else {
                                Notification.show({
                                    type: "error",
                                    message: '数据获取失败'
                                });
                            }
                        },
                        error: function (xhr, status) {
                            Notification.show({
                                type: "error",
                                message: '数据获取失败'
                            });
                        },
                        complete: function () {
                            me.$el.find('.chrysanthemum').remove();
                        }
                    });
                }
            },
            TempviewlateRender: function () {
                var me = this;

                var discoveryTemplate = _.template(me.$("#discovery-template").html(), me.loadData);
                me.$("#detail-scroller").html("");
                me.$("#detail-scroller").append(discoveryTemplate);
                var offwidth = document.body.offsetWidth - 20;
                var newhtml = ImgTag(this.loadData.body, offwidth, offwidth);
                $("#content").html(newhtml);
                $("#content").find('img').addClass("imgwidth");
                me.myScroll = new IScroll('#detail-wrapper', {
                    mouseWheel: true,
                    zoom: true,
                    scrollX: true,
                    zoomMin: 0.5,
                    wheelAction: 'zoom',
                    scrollY: true
                });
                var imgArray = $("#content").find('img');

                for (var i = 0; i < imgArray.length; i++) {
                    $(imgArray[i]).attr("onerror", "this.src='../carshowroom/img/error.ing'");
                    $(imgArray[i]).closest("p").css({
                        "text-indent": 0
                    });
                    imgArray[i].onload = function () {
                        me.refreshIScroll();
                    }
                    imgArray[i].onerror = function () {
                        me.refreshIScroll();
                    };
                }
                if (imgArray.length === 0) {
                    me.refreshIScroll();
                }

                $(window).resize(function () {
                    me.myScroll.refresh();
                });
            },
            refreshIScroll: function () {
                var me = this;
                me.myScroll.refresh();

            }
        });
        return View;
    });
define(
    [
        'common/navView',
        // 'text!toolkit/newIndex.html',
        'underscore',
        'toolkit/serviceDetail',
        "common/disUtil",
        'shared/js/notification',
    ],
    function (View,_,serviceDetail,disUtil,Notification) {
        return View.extend({
            events:{
                'click #toolkit-header-left':'onLeft',
                'click #otherService .block':'goOtherS',
                // 'click #TboxService .service':'goDetail',
                // 'click #TboxService .refreshIcon':'updateService'
            },
            //需添加点击变暗效果的页面原素
            effectDom:['#TboxService .service'],
            _unit:{
                'M':'月',
                'D':'天',
                'H':'小时',
                'KB':'KB',
                'MB':'MB'
            },
            _serviceviews:[],
            posGenHTML:function () {
                var toolkit=this;
                toolkit.SericeView = Backbone.View.extend({
                    events:{
                        'click':'goToService'
                    },
                    template:_.template(toolkit.$el.find('#template').html()),
                    initialize:function (data) {
                        this.data = data;
                        this.$el.html(this.template(data));
                        toolkit.$('#TboxService').append(this.$el);
                        toolkit._serviceviews.push(this);
                    },
                    goToService:function () {
                        if(this.data.isBuy){
                            bfNaviController.push('toolkit/serviceDetail.html',this.data);
                        }
                    }
                })
                toolkit.clickEffect();
            },
            onShow:function () {
                var me=this;
                bfClient.serviceDetail({
                    data:{
                        carId:bfDataCenter.getCarId()
                    },
                    beforeSend:function () {
                        me.uiAddChrysanthemum();
                    },
                    success:function (netdata) {
                        var data = netdata.data;
                        if(netdata.success&&data.length) {
                            me.$('#TboxService').removeClass('noData');
                            me._serviceviews.forEach(function (view) {
                                view.remove();
                            });
                            me._serviceviews.length=0;
                            var params =[];
                            for (var i = 0; i < data.length; i++) {
                                var param = {
                                    name: data[i].appInfo.appName,
                                    url: bfDataCenter.getDownLoadUrlForKey(data[i].appInfo.appImgHandler),
                                    isBuy: false,
                                    total: data[i].total,
                                    totalUnit: '',
                                    left: '',
                                    leftUnit: '',
                                    per: data[i].leftPercentage + '%',
                                    packet: data[i].balances,
                                };
                                if (!data[i].balances || data[i].balances.length == 0) {
                                    param.isBuy = false;
                                } else {
                                    param.totalUnit = me._unit[data[i].totalUnit.toUpperCase()];
                                    param.leftUnit = me._unit[data[i].balances[0].unit.toUpperCase()];
                                    param.isBuy = true;
                                    param.left = data[i].balances.reduce(function (pre, cur) {
                                        return pre + parseInt(cur.left);
                                    }, 0);
                                    for (var j = 0; j < param.packet.length; j++) {
                                        param.packet[j].unit = param.leftUnit;
                                    }
                                }
                                params.push(param);
                            }
                            params.forEach(function (param) {
                                new me.SericeView(param);
                            })
                        }else{
                            me.$('#TboxService').addClass('noData');
                            me._serviceviews.forEach(function (view) {
                                view.remove();
                            });
                            me._serviceviews.length=0;
                        }
                    },
                    error:function (error) {
                        if(!me._serviceviews.length){
                            me.$('#TboxService').addClass('noData');
                        }else{
                            me.$('#TboxService').removeClass('noData');
                        }
                        var eMsg = '获取车机服务信息失败';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "网络开小差";
                        }
                        Notification.show({
                            type:'error',
                            message:eMsg,
                        });
                    },
                    complete:function () {
                        me.uiRemoveChrysanthemum();
                    }
                })
            },
            uiAddChrysanthemum:function () {
                var me = this;
                if (me.$('.content').eq(0).find('#chrysanthemumWarp').length === 0) {
                    me.$('.content').eq(0).append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%;z-index:100'><div class='bf-chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>加载中...</div></div></div>");
                }
            },
            uiRemoveChrysanthemum:function () {
                this.$('#chrysanthemumWarp').remove();
            },
            clickEffect:function () {
                var self = this;
                this.effectDom.forEach(function (selector) {
                    self.$(selector).on('touchstart',function () {
                        $(this).css('opacity',0.6)
                    }).on('touchend',function () {
                        $(this).css('opacity',1)
                    })
                })
            },
            // goDetail:function (event) {
            //     this.clickEffect($(event.currentTarget));
            //     bfNaviController.push('toolkit/service.html');
            // },
            goOtherS:function (event) {
                var id=event.currentTarget.id;
                switch (id){
                    case 'operManual':
                        bfNaviController.push("toolkit/toolkitDetail.html");
                        break;
                    case "operIllegalSearch":
                        bfNaviController.push("cars/carList2.html");
                        break;
                    case "openBY":
                        openExtraUrl('http://cloud.mall.changan.com.cn/caecapp/main/index.html?biz=7&token='+window.localStorage.getItem('token'),'长安商城')
                        // butterfly.navigate("toolkit/changanSC.html");
                        break;
                    case "openPJ":
                        bfNaviController.push("autoNavigation/index.html");
                        break;
                    case "openFW":
                        navigator.appInfo.openSurService();
                        break;
                    case "openZS":
                        bfNaviController.push('Laboratory/index.html');
                        break;
                    case "openTT":
                        navigator.appInfo.openTeamTravel();
                        break;
                }
            },
            onLeft:function () {
                bfNaviController.pop();
            }
        })
    })
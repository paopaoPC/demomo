define([    
    "common/navView",
    "common/ssUtil",
    "common/elemUtil",
    "common/osUtil",
    "common/disUtil",
    'butterfly',
    'shared/js/client',
    'shared/js/notification',
    "swipe",
    "common/indicator", 
    "shared/js/amap",
    'css!shared/css/swiper.min.css'
    ],
    function (View, ssUtil,elemUtil, osUtil, disUtil, Butterfly, Client, Notification, swiper,indicator) {
        var Base = View;        
        return Base.extend({
            id: 'messageAmap',
            events: {
            },
            onViewPush: function(pushFrom, pushData){
                var me = this;
                if(pushData && pushData.objData){
                    this.summary = pushData.objData.summary;
                    this.infoTypeId = pushData.objData.infoTypeId;
                    // this.infoTypeId = 'EVENT_FENCE'
                    this.infoTypeName = pushData.objData.infoTypeName;
                    this.stubId = pushData.objData.stubId
                    // this.createdAt = pushData.objData.createdAt;
                    this.logId = pushData.logId

                    
                }
            },
            posGenHTML:function(){
                this._navTitle.html(this.infoTypeName);
                this.getElement("#messageAmap-content").css("height",disUtil.navClientHeight+"px");
                
            },
            onShow:function(){
                var me = this;

                if(!this.logId){
                     Notification.show({
                        type: "error",
                        message: '数据异常'
                    });
                    return 
                }

                if(me.infoTypeId == 'EVENT_FENCE'){
                    bfClient.getFenceByLogId({
                        data: {
                            'logId':  me.logId
                        },
                        success: function(data){
                            if(data && data.code == 0 && data.data){
                                me.carId = data.data.carId;
                                me.address = data.data.addrName;
                                me.plateNumber = data.data.carNum;
                                // "inwarn"代表驶入  "outwarn"代表使出
                                me.notifyType = data.data.actionType;
                                me.createdAt = data.data.actionTime;
                                try {
                                    var pointsData = JSON.parse(data.data.points);
                                    me.lng = pointsData.carLng;
                                    me.lat = pointsData.carLat
                                    me.fenceLng = pointsData.fenceLng;
                                    me.fenceLat = pointsData.fenceLat;
                                    me.distance = pointsData.fenceDistance;
                                } catch (err) {
                                    // Notification.show({
                                    //     type: "error",
                                    //     message: '数据异常'
                                    // });
                                }
                            } else {
                               Notification.show({
                                    type: "error",
                                    message: data.msg
                                }); 
                            }
                            me.drawMap(); 
                        },
                        error: function(){
                            Notification.show({
                                type: "error",
                                message: '网络开小差'
                            });
                            me.drawMap(); 
                        }
                    })
                } else {
                    bfClient.getCarEventByLogId({
                        data: {
                            'logId': me.logId
                        },
                        success: function(data){
                            if(data && data.code == 0 && data.data){
                                me.carId = data.data.carId;
                                me.address = data.data.addrName;
                                me.plateNumber = data.data.carNum;
                                me.createdAt = data.data.createTime;
                                try {
                                    var pointsData = JSON.parse(data.data.params);
                                    me.lng = pointsData.carLng;
                                    me.lat = pointsData.carLat;
                                } catch (err) {
                                 
                                }

                            } else {
                               Notification.show({
                                    type: "error",
                                    message: data.msg
                                }); 
                            }
                            me.drawMap(); 
                        },
                        error: function(){
                            Notification.show({
                                type: "error",
                                message: '网络开小差'
                            });
                            me.drawMap(); 
                        }
                    })
                }

            },
            remove: function(){
                this.map && this.map.destory && this.map.destory();
                indicator.stop()

                Base.prototype.remove.call(this);
                this.onRemove();
            },
            reloadAmap: function(){
                window.amapUrlCallback = this.drawMap.bind(this);
                var head= document.getElementsByTagName('head')[0];  
                var script= document.createElement('script');  
                script.type= 'text/javascript';  
                script.src= window.localStorage['amapUrl']+'&callback=amapUrlCallback';  
                head.appendChild(script); 
            },
            drawMap:function(){

                var self = this;

                if(typeof AMap == 'undefined' || !AMap || !AMap.Map){
                   this.reloadAmap();
                    return 
                }
                var map = new AMap.Map("messageAmap-content");
                this.map = map;


                //创建标注并构建标注选择活动页面
                var swiperSlideHtml = [];
                var el = this.$('#messageAmap-bottom').html();

                var template = _.template(el);
                swiperSlideHtml = template({
                    address:this.address,
                    notifyType: this.notifyType,
                    plateNumber: this.plateNumber,
                    createdAt: this.createdAt,
                    summary: this.summary

                })


                self.getElement(".swiper-wrapper").html(swiperSlideHtml);
                
                if(self.circle){
                    map.remove(self.circle);
                }
                if(!this.lng || !this.lat){
                    Notification.show({
                        type: "error",
                        message: "数据异常"
                    });
                    return
                }

                
                var icon = new AMap.Icon({
                    image: '../toolkit/img/localIcon.png',
                    imageSize: new AMap.Size(38, 38),
                    size: new AMap.Size(38, 38)
                    // size: new AMap.Size(24, 24)
                });
                self.amarker = new AMap.Marker({
                    icon: icon,
                    position: [this.lng, this.lat],
                    offset: new AMap.Pixel(-19,-19),
                    zIndex: 101,
                    map: map
                });

                if(this.infoTypeId == 'EVENT_FENCE'){
                    if(!this.fenceLng || !this.fenceLat){
                        Notification.show({
                            type: "error",
                            message: "数据异常"
                        });
                        return
                    }
                    self.circle = new AMap.Circle({
                        center: new AMap.LngLat(this.fenceLng, this.fenceLat),// 圆心位置
                        radius: this.distance, //半径
                        strokeColor: "#09aaec", //线颜色
                        strokeOpacity: 1, //线透明度
                        strokeWeight: 1, //线粗细度
                        fillColor: "#09aaec", //填充颜色
                        fillOpacity: 0.2//填充透明度
                    });

                    self.circle.setMap(map);
                }


                map.setZoomAndCenter(12, [this.lng, this.lat]);

                

            },
        
        });
});

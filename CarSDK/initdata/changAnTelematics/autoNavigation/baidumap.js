define([    
    "common/navView",
    "common/ssUtil",
    "common/elemUtil",
    "common/osUtil",
    "common/disUtil",
    "text!autoNavigation/baidumap.html",
    'butterfly',
    'shared/js/client',
    'shared/js/notification',
    "text!autoNavigation/addressTemplate.html",
    "swipe",
    'shared/js/amap',
    'css!shared/css/swiper.min.css'
    ],
    function (View, ssUtil,elemUtil, osUtil, disUtil, template, Butterfly, Client, Notification,swiperTemplate, swiper) {
        var Base = View;        
        return Base.extend({
            id: 'autoNavigation',
            events: {
                "click .shares": "clickShares",
            },
            posGenHTML:function(){
                this.getElement("#baidumap").css("height",disUtil.navClientHeight+"px");
            },
            asyncHTML:function(){
                
                var self = this;
                    self.drawMap();  
            },
            clickShares: function(e){
                var self = this;
                var $el = $(e.currentTarget);
                var lng = $el.attr("data-lng");
                var lat =  $el.attr("data-lat");
                var name =  $el.attr("data-name");
                self.addDestination(lng, lat, name, self.type, 0);
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

                var selectedDestination = ssUtil.load("selectedDestination");
                var self = this;

                if(typeof AMap == 'undefined' || !AMap || !AMap.Map){
                   this.reloadAmap();
                    return 
                }

                var map = new AMap.Map("baidumap");
        		osUtil.delayCall(function()
        		{
        			elemUtil.coverBaiduLogo(self.getElement("#baidumap"));
        		});
                
                var addresses = ssUtil.load("addressLists");
                var data_info = [];
                var swiperIdx = 0;
                for(var iAddress = 0; iAddress < Object.keys(addresses).length; iAddress++){
                    var address = addresses[iAddress];
                    data_info.push({lng:address.lng, lat:address.lat, name:address.name});
                    if(selectedDestination.lng == address.lng && selectedDestination.lat == address.lat){
                        swiperIdx = iAddress;
                    }
                }

                if(self.amarker){
                    map.remove(self.amarker);
                }

                var icon = new AMap.Icon({
                    image: '../autoNavigation/img/destination.png',
                    imageSize: new AMap.Size(46, 64),
                    size: new AMap.Size(46, 64)
                });
                self.amarker = new AMap.Marker({
                    icon: icon,
                    position: [selectedDestination.lng, selectedDestination.lat],
                    offset: new AMap.Pixel(-23,-64),
                    zIndex: 101,
                    map: map
                });
                // var point = new BMap.Point(selectedDestination.lng,selectedDestination.lat);

                // map.clearOverlays();
                map.setZoomAndCenter(15, [selectedDestination.lng, selectedDestination.lat]);
                // map.centerAndZoom(point, 15);
                // var myIcon = new BMap.Icon("../autoNavigation/img/destination.png", new BMap.Size(60,60));
                // var marker = new BMap.Marker(point,{icon:myIcon});  // 创建标注
                // map.addOverlay(marker);              // 将标注添加到地图中

                //创建标注并构建标注选择活动页面
                var swiperSlideHtml = [];
                for(var i=0;i<data_info.length;i++){

                    var template = _.template(swiperTemplate);                    

                    //添加数据到页面
                    swiperSlideHtml.push(
                        template({
                            lng:data_info[i].lng,
                            lat:data_info[i].lat,
                            name:data_info[i].name 
                        })
                    );
                }

                self.getElement(".swiper-wrapper").html(swiperSlideHtml);

                var searchLocationType = ssUtil.load("searchLocationType");
                var type = 0;
                if(searchLocationType == "setHome"){
                    type = 1;
                } else if(searchLocationType == "setCompany"){
                    type = 2;
                }
                self.type = type;

                //发送到车按钮事件
                self.getElement(".tocar").on("click",function(){
                    var lng = $(this).attr("data-lng");
                    var lat = $(this).attr("data-lat");
                    var name = $(this).attr("data-name");

                    self.addDestination(lng,lat,name, type, 1);
                });
                //保存按钮事件
                // self.getElement(".shares").on("click",function(){
                //     var lng = $(this).attr("data-lng");
                //     var lat = $(this).attr("data-lat");
                //     var name = $(this).attr("data-name");
                //     self.addDestination(lng, lat, name, type, 0);
                // });
                self.mySwiper = 
                    new Swipe(self.getElement(".swiper-container")[0],{
                        callback: function(activeIndex){
                            var routeIcon2Car = $(".swiper-wrapper").find(".swiper-slide").eq(activeIndex).find(".route-icon-save");
                            var lat = routeIcon2Car.attr("data-lat");             
                            var lng = routeIcon2Car.attr("data-lng");

                            if(self.amarker){
                                map.remove(self.amarker);
                            }

                            var icon = new AMap.Icon({
                                image: '../autoNavigation/img/destination.png',
                                imageSize: new AMap.Size(46, 64),
                                size: new AMap.Size(46, 64)
                                // size: new AMap.Size(24, 24)
                            });
                            self.amarker = new AMap.Marker({
                                icon: icon,
                                position: [lng, lat],
                                offset: new AMap.Pixel(-23,-64),
                                zIndex: 101,
                                map: map
                            });

                            map.setZoomAndCenter(15, [lng, lat]);

                            // var point = new BMap.Point(lng,lat);
                            // map.clearOverlays();
                            // map.centerAndZoom(point, 15);
                            // var myIcon = new BMap.Icon("../autoNavigation/img/destination.png", new BMap.Size(60,60));
                            // var marker = new BMap.Marker(point,{icon:myIcon});  // 创建标注
                            // map.addOverlay(marker);              // 将标注添加到地图中
                            osUtil.delayCall(function(){
                                $('.anchorBL').hide();
                            })
                        },
			         startSlide:swiperIdx 
                    });
                osUtil.delayCall(function(){

                    var elementArray = self.getElement(".routeAction");
                    for (var i = 0; i < elementArray.length; i++) {
                        elementArray[i].addEventListener("touchstart", function() {
                            self.oprationTouchStart();
                        }, false);
                        elementArray[i].addEventListener("touchend",function() {
                            self.oprationTouchEnd();
                        } , false);
                        elementArray[i].addEventListener("touchmove",function() {
                            self.oprationTouchMove();
                        } , false);
                    };
                });
            },
            oprationTouchMove: function() {
                this.mySwiper.pause();
            },
            oprationTouchStart:function(){
                this.mySwiper.pause();
            },
            oprationTouchEnd:function(){
                this.mySwiper.resume();
            },

            addDestination:function(lng,lat,name,type, isActive){

                // 判断是否已经添加该路劲信息，如果添加则不再重新添加
                var destinations = ssUtil.load("destinations");
                var isAddedAddress = false;
                if(destinations != null && isActive == 0){
                    for(var iItem = 0; iItem < Object.keys(destinations).length; iItem++){

                        if(destinations[iItem] == null) continue; //过滤非空值
                        
                        if(typeof(destinations[iItem].lat) == "undefined"){
                            var destLng = destinations[iItem].addrWGS.split(",")[0];
                            var destLat = destinations[iItem].addrWGS.split(",")[1];
                        } else {
                            var destLng = destinations[iItem].lng;
                            var destLat = destinations[iItem].lat;
                        }                        
                        
                        if(destLng == lng && destLat == lat){
                            isAddedAddress = true;
                            break;
                        }
                    }
                }
                
                if(type != 0){
                    isAddedAddress = false;
                }

                if(isAddedAddress && isActive == 0){
                    Notification.show({
                        type: "info",
                        message: "该地点已添加"
                    });
                    bfNaviController.pop(2);
                    return;
                }

                var typeString = "设置";
                if(type == 0){
                    typeString = "添加";
                }

                if(isActive == 1){
                    typeString = "发送";
                }

                self.lng = lng;
                self.lat = lat;

                bfClient.addDestination({
                    type: "post",
                    data : {lat:lat,lng:lng,name:name,type:type,active:isActive},
                    success: function (data) {
                        if (data && data.code == 0) {
                            if(data.msg)
                            {
                                Notification.show({
                                    type: "info",
                                    message: data.msg
                                });
                            }
                            ssUtil.save("refreshRouteInfo", true);
                            //保存搜索历史
                            var searchHistory = window.localStorage["searchHistory"];
                            if(searchHistory == null || searchHistory == "null"){
                                searchHistory = [];
                            } else {
                                searchHistory = JSON.parse(searchHistory);
                            }
                            
                            var isSearchedAddress = false;
                            for(var iItem = 0; iItem < Object.keys(searchHistory).length; iItem++){
                                var destLng = searchHistory[iItem].lng;
                                var destLat = searchHistory[iItem].lat;
                                if(destLng == lng && destLat == lat){
                                    isSearchedAddress = true;
                                    break;
                                }
                            }

                            if(!isSearchedAddress){
                                searchHistory.push({name:name,lng:lng,lat:lat});
                                window.localStorage["searchHistory"] = JSON.stringify(searchHistory);
                            } 

                            bfNaviController.pop(2);
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }
                }});
            },
        });
});

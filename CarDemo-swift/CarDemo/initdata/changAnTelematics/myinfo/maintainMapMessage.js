define([
    "common/navView",
    "common/osUtil",
    "common/elemUtil",
    "shared/js/client",
    'map/map-client',
    'shared/js/notification',
    'shared/js/amap',
],
    function (View, osUtil,elemUtil,Client,mapClient,Notification) {
        var Base = View;
        return Base.extend({
            id: 'CarLocationPage',
            events: 
            {
                
            },
            onViewPush : function(pushFrom, pushData)
            {
                this._locationStr = pushData;
            },
            asyncHTML: function(){
                this.getCurrentCity()
            },
            reloadAmap2: function(){
                window.amapUrlCallback = this.getCurrentCity.bind(this);
                var head= document.getElementsByTagName('head')[0];  
                var script= document.createElement('script');  
                script.type= 'text/javascript';  
                script.src= window.localStorage['amapUrl']+'&callback=amapUrlCallback';  
                head.appendChild(script); 
            },   
            getCurrentCity: function(){
                var me = this;
                if(typeof AMap == 'undefined' || !AMap || !AMap.Map){
                  this.reloadAmap2();
                  return 
                }
                var geocoder = new AMap.Geocoder({
                    radius: 100,
                });        
                mapClient.getCurrentLatLng(function(lng, lat){
                    geocoder.getAddress( [lng,lat], function(status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            if(result.regeocode.addressComponent &&result.regeocode.addressComponent.adcode){
                                me.amapAdcode = result.regeocode.addressComponent.citycode;
                                me.onShowView()
                            }
                        } else {
                            me.onShowView()
                        }
                    });   
                }, function (err) {
                    me.onShowView()
                    return;
                })
            },
            onShowView: function () {
                var me = this;
                var height = parseInt($(window).height())-38 + 'px';

                var map = new AMap.Map("maintain_map_content");
                me.map = map
                var self = this;
                osUtil.delayCall(function()
                {
                    elemUtil.coverBaiduLogo(self.getElement("#maintain_map_content"));
                });
                // var point = new AMap.Point(106.51, 29.43);
                // map.centerAndZoom(point, 12);
                // 将上面的改成高德地图
                // map.setZoomAndCenter(12, [106.51, 29.43]);


                // 创建地址解析器实例
                
                // var local = new BMap.LocalSearch(map, {
                //     renderOptions: {map: map, panel: "r-result"}
                // });
                // local.search(this._locationStr);
                AMap.service(["AMap.PlaceSearch"], function() {
                    var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
                        city:me.amapAdcode || '全国', //城市
                        map: me.map//,
                    });
                    //关键字查询
                    placeSearch.search(me._locationStr);
                 });



            }
        });
});

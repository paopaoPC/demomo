define([    
    "common/navView",
    "common/ssUtil",
    "text!autoNavigation/search.html",
    'butterfly',
    'shared/js/client',
    'shared/js/notification',
    "shared/js/baidumap-api-1.5",
    'map/map-client',
    "text!autoNavigation/searchResult.html",
    'shared/js/amap'
    ],
    function (View, ssUtil, template, Butterfly, Client, Notification, baiduMapApi,mapClient,searchResultTemplate) {
        var Base = View;        
        return Base.extend({
            id: 'autoNavigation',
            events:{
                "click #navLeft":"navLeft",
                "click .clearHistory":"clearHistory"
            },  
        onShow:function()
        {
                this.addr = "重庆";
                this.getElement("#searchLocation").focus();
                this.getCurrentCity();
        },
            posGenHTML:function(){
                var self = this;
                //自动获取文本框的焦点
                var searchHistory = window.localStorage["searchHistory"];
                if(searchHistory != null && searchHistory != "null"){
                    searchHistory = JSON.parse(searchHistory);
                    var historyResult = [];
                    ssUtil.save("addressLists",searchHistory);
                    for(var iResult = Object.keys(searchHistory).length - 1; iResult >= 0; iResult--){
                        var address = searchHistory[iResult];
                        var template = _.template(searchResultTemplate);

                        //添加数据
                        historyResult.push(
                            template({lng:address.lng,
                                lat:address.lat,
                                name:address.name,
                                resultType:'history-result',
                                city:'',
                                district:''})
                            );
                    }
                    self.getElement('#searchResult').html(historyResult);

                    self.getElement(".history-result").on("click",function(){
                        var addressName = $(this).attr("data-name");
                        var addressLng = $(this).attr("data-lng");
                        var addressLat = $(this).attr("data-lat");
                        var selectedType = ssUtil.load("searchLocationType");
                        var selectedAddress = {name:addressName,lng:addressLng,lat:addressLat};
                        ssUtil.save(selectedType,selectedAddress);
                        //显示百度地图
                        self.showOnMap(addressLat, addressLng, addressName);
                    })
                }
                
                self.getElement(".searchLocation").on("input propertychange",function(){
                    self.searchLocation();
                });
                
            },
            navLeft:function(){
                this.goBack();
            }, 
            reloadAmap: function(){
                window.amapUrlCallback = this.getCurrentCity.bind(this);
                var head= document.getElementsByTagName('head')[0];  
                var script= document.createElement('script');  
                script.type= 'text/javascript';  
                script.src= window.localStorage['amapUrl']+'&callback=amapUrlCallback';  
                head.appendChild(script); 
            },     
            searchLocation:function(){
                var self = this;
                if(!this.amapAdcode){
                    return
                }
                var searchType = ssUtil.load("searchLocationType");
                var searchedAddress = $("#searchLocation").val();
                //去除两端空格
                searchedAddress = searchedAddress.replace(/(^\s*)|(\s*$)/g, "");
                if(searchedAddress == "") return;
                // var region = "";
                var url = "http://ditu.amap.com/service/poiTipslite";
                var template = _.template(searchResultTemplate);
                
                $.ajax({
                    type: "get",
                    data: "words=" + searchedAddress + "&city=" + self.amapAdcode,
                    url: url,
                    success: function(data){
                        // 将返回的结果 转成原来的格式
                        var result = {}
                        result.status = data.status;
                        result.result = data.data && data.data.tip_list || [];


                        if(result.status == 1){ //成功
                            var searchResult = []; 
                            var searchedAddress = []; 

                            if(result.result.length == 0){
                                self.getElement('#searchResult').html('<div class="emptyresult">当前没有您搜索的相关结果</div>');
                                self.getElement("#clearAction").hide();
                                return;
                            } 

                            self.getElement("#clearAction").show();
                            for(var iResult = 0; iResult < Object.keys(result.result).length; iResult++){
                                var address = result.result[iResult].tip;

                                if(address.lnglat && address.lnglat.split && address.lnglat.split(',')){
                                    address.lng = address.lnglat.split(',')[0]
                                    address.lat = address.lnglat.split(',')[1]
                                    if(address.lng && address.lat){
                                        //添加数据
                                        searchResult.push(
                                            template({lng:address.lng,
                                                lat:address.lat,
                                                name:address.name,
                                                city:address.city,
                                                district:address.district,
                                                resultType:'search-result'})
                                            );

                                        //缓存搜索结果，用户百度绘图
                                        searchedAddress.push({lng:address.lng,
                                                lat:address.lat,
                                                name:address.name});
                                    }
                                }
                            }
                             
                                
                            self.getElement('#searchResult').html(searchResult);

                            self.getElement(".search-result").on("click",function(el){
                                var $target = $(el.currentTarget);
                                ssUtil.save("addressLists",searchedAddress);
                                var addressName = $target.attr("data-name");
                                var addressLng = $target.attr("data-lng");
                                var addressLat = $target.attr("data-lat");

                                var selectedType = ssUtil.load("searchLocationType");
                                var selectedAddress = {name:addressName,lng:addressLng,lat:addressLat};
                                ssUtil.save(selectedType,selectedAddress);

                                //显示百度地图
                                self.showOnMap(addressLat, addressLng, addressName);
                            });

                            
                        }                     
                    },
                    error: function(){

                    }
                })
            },
            getCurrentCity: function(){
                var me = this;
                if(typeof AMap == 'undefined' || !AMap || !AMap.Map){
                  this.reloadAmap();
                  return 
                }
                var geocoder = new AMap.Geocoder({
                    radius: 100,
                });        
                mapClient.getCurrentLatLng(function(lng, lat){
                    geocoder.getAddress( [lng,lat], function(status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            if(result.regeocode.addressComponent &&result.regeocode.addressComponent.adcode){
                                me.amapAdcode = result.regeocode.addressComponent.adcode;
                            }
                        }
                    });   
                }, function (err) {
                    Notification.show({
                        type: "error",
                        message: "定位失败"
                    });
                    return;
                })
            },
            clearHistory:function(){
                var self = this;
                self.getElement("#searchResult").html(" ");
                window.localStorage["searchHistory"] = null;
            },        
            showOnMap:function(lat, lng, name){
                ssUtil.save("selectedDestination",{lat:lat,lng:lng,name:name});
                butterfly.navigate("/autoNavigation/baidumap.html");
            }
        });
});

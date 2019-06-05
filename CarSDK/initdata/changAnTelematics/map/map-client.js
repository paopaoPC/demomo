define(['shared/js/client', 'shared/js/notification','application/AppConfig'], function (BaseClient, Notification,AppConfig) {
    return _.extend(BaseClient, {
        path_map_list: bfConfig.server + "/api/dealer/getAllDealerInfo",
        path_getWindowInfo: bfConfig.server + "/api/dealer/browse",
        path_getBdLngLat: "http://api.map.baidu.com/geoconv/v1/",
        path_getBdTimestamp: "http://api.map.baidu.com/direction/v1/routematrix",
        path_getGdLngLat:"http://restapi.amap.com/v3/assistant/coordinate/convert?",
        currentPoint: null,
        currentMarker: null,
        x_pi: 3.14159265358979324 * 3000.0 / 180.0,
        // 过滤data,获取附近的数据
        // data是个对象数组,对象里必须有lat,lng两个属性,表示经纬度
        //根据已经设置的zoom14过滤，这样就可以和地图的点匹配了
        getNearby: function (data, distance) {
            return data;
        },
        // 获取当前位置
        // 如果有cordova插件,通过插件获取,否则通过H5获取
        getCurrentLatLng: function (success, error) {
            var me = this;
            if (window.baiduLocation) {
                window.baiduLocation.startLocation(function (position) {
                    if (success) {
                        success(position.longitude, position.latitude, position.address);
                    }
                }, function (err) {
                    Notification.show({
                        type: "info",
                        message: "定位错误[" + err.code + "]"
                    });
                    if (error) {
                        error();
                    }
                });
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        //me.getBdLngLat({
                        //    lng: position.coords.longitude,
                        //    lat: position.coords.latitude,
                        //    ak: "hV7HLeVocogY084C1a65RUGK",
                        //    from: 1,
                        //    to: 5,
                        //    success: function (data) {
                        //        if (data) {
                        //            if (success) {
                        //                success(data.result[0].x, data.result[0].y);
                        //            }
                        //        }
                        //    },
                        //    error: function (err) {
                        //    }
                        //});
                        me.getGdLngLat({
                            lng: position.coords.longitude,
                            lat: position.coords.latitude,
                            ak: AppConfig.GdMapKey,
                            success: function (data) {
                                if (data.status == "1") {
                                    if (success) {
                                        var locations = data.locations.split(",");
                                        success(locations[0], locations[1],data);
                                    }
                                }
                            },
                            error: function (err) {
                                console.log("坐标转换失败");
                            }
                        });
                    }, function (err) {
                        switch (err.code) {
                            case err.PERMISSION_DENIED:
                                Notification.show({
                                    type: "info",
                                    message: "定位错误"
                                });
                                break;
                            case err.POSITION_UNAVAILABLE:
                                Notification.show({
                                    type: "info",
                                    message: "定位错误"
                                });
                                break;
                            case err.TIMEOUT:
                                Notification.show({
                                    type: "info",
                                    message: "定位错误"
                                });
                                break;
                            case err.UNKNOWN_ERROR:
                                Notification.show({
                                    type: "info",
                                    message: "定位错误"
                                });
                                break;
                        }
                        if (error) {
                            error();
                        }
                    }, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                }
            }

        },
        //所有经销点
        getMapList: function (params) {
            this.ajax({
                url: this.path_map_list,
                data: {},
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getBdLngLat: function (params) {
            this.ajax({
                url: this.path_getBdLngLat,
                data: {
                    coords: params.lng + "," + params.lat,
                    from: params.from,
                    to: params.to,
                    ak: params.ak
                },
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getGdLngLat: function (params) {
            $.ajax({
                url:this.path_getGdLngLat+"locations="+ params.lng + "," + params.lat+"&coordsys=gps&output=json&key="+AppConfig.GdMapKey,
                type:"GET",
                dataType:"json",
                timeout:"15000",
                success: params.success,
                error: params.error
            });
        },
        getBdTimestamp: function (params) {
            this.ajax({
                url: this.path_getBdTimestamp,
                data: {
                    origins: params.origins,
                    destinations: params.destinations,
                    mode: params.mode,
                    output: "json",
                    ak: params.ak
                },
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend,
            });
        },
        getWindowInfo: function (params) {
            this.ajax({
                url: this.path_getWindowInfo,
                data: {
                    lng: params.lng,
                    lat: params.lat,
                    scope: params.scope
                },
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend,
            });
        },
        //火星坐标转化成百度坐标
        bd_encrypt: function (gg_lng, gg_lat) {
            var me = this;
            var x = gg_lng,
                y = gg_lat;
            var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * me.x_pi);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * me.x_pi);
            var bd_lng = z * Math.cos(theta) + 0.0065;
            var bd_lat = z * Math.sin(theta) + 0.006;
            return {
                longitude: bd_lng,
                latitude: bd_lat
            };
        }
    });
});

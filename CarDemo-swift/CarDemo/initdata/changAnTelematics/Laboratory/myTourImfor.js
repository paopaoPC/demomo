define(
    [
        "text!Laboratory/myTourImfor.html",
        "common/navView",
        'butterfly',
        'shared/js/datasource',
        'listview/ListView',
        'shared/js/baidumap-api-1.5'
    ],
    function (template, View, Butterfly, Datasource,ListView, baiduMapApi) {
        var Base = View;
        return Base.extend({
            events:{
                "click .add-tour-list": "addTOurList",
                "click #myTourReview": "goMyTourReview",

            },
            onShow: function(){
                this.initDrivingRoute();
            },
            addTOurList: function(){
                bfNaviController.push("/Laboratory/mytourEdit.html");
            },
            goMyTourReview: function(){
                bfNaviController.push("/Laboratory/mytourReview.html");
            },
            initDrivingRoute: function(){
                var me = this;
                var map = new BMap.Map("driving-route");
                var points = [new BMap.Point(106.551416,29.571248),
                                new BMap.Point(106.607133,26.731618),
                                new BMap.Point(102.835687,24.916718),
                                new BMap.Point(100.959163,22.835873)
                            ];
                var startPoint = points[0];
                var endPoint = points[points.length - 1];
                var pl = new BMap.Polyline(points,{strokeColor:'#09aaec'});
                map.setViewport(points);
                map.addOverlay(pl);
                //添加起始图片覆盖物
                var sIcon = new BMap.Icon("../map/img/q.png", new BMap.Size(23, 32), {  
                        anchor: new BMap.Size(12,32),// 指定定位位置  
                        imageSize: new BMap.Size(23,32),
                        imageOffset: new BMap.Size(0, 0)});
                var eIcon = new BMap.Icon("../map/img/z.png", new BMap.Size(23, 32), {  
                        anchor: new BMap.Size(12,32),// 指定定位位置  
                        imageSize: new BMap.Size(23,32),
                        imageOffset: new BMap.Size(0, 0)});
                var smarker = new BMap.Marker(startPoint,{icon:sIcon});  // 创建标注
                map.addOverlay(smarker);              // 将标注添加到地图中
                var emarker = new BMap.Marker(endPoint,{icon:eIcon});
                map.addOverlay(emarker);
            }
        });
    });
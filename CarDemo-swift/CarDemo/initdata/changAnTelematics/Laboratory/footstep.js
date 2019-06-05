define(
    [
        "text!Laboratory/footstep.html",
        "common/navView",
        'butterfly',
        "shared/js/notification",
        "common/osUtil",
        "swipe",
        'shared/js/baidumap-api-1.5'
    ],
    function (template, View, Butterfly,Notification,osUtil,swipe,baidumap)
    {
        var Base = View;
        var cls =
        {
            _value : true,
            carData : null,
            events: {

            }
        };

        cls.onShow = function()
        {
            osUtil.delayCall(function(){
                var map = new BMap.Map("allmap");
                map.centerAndZoom(new BMap.Point(105.816624,33.604579), 6);  //设置地图中心点
                map.enableScrollWheelZoom();
                var MAX = 20;
                var markers = [];
                var pt = null;
                osUtil.delayCall(function(){
                    $.ajax({
                        url:"../Laboratory/footstep.json",
                        dataType:"json",
                        async:true,
                        type:"GET",
                        success:function(req){
                            for(var i=0;i<req.length;i++){
                                pt=new BMap.Point(req[i].lng, req[i].lat);
                                var circle = new BMap.Circle(pt,20000*req[i].count,{
                                    strokeColor:"#6699ff",
                                    strokeWeight:1,
                                    strokeOpacity:0.7}
                                ); //创建圆
                                circle.setFillColor("#6699ff");
                                circle.setFillOpacity(0.7);
                                map.addOverlay(circle);
                            }
                        },
                        error:function(){

                        }
                    });
                },100);
                osUtil.delayCall(function(){
                    map.addEventListener("zoomend", function(e){
                        map.clearOverlays();
                        var current_zoom=map.getZoom();
                        var k=null;
                        var Url=null;  //数据请求地址
                        //判断显示等级
                        if(current_zoom<=10){
                            //省市级
                            Url='../Laboratory/footstep.json';
                            if(current_zoom<=5){
                                k=20000;
                            }else{
                                k=20000/(current_zoom-5);
                            }
                        }else if(current_zoom<=13){
                            //区级
                            Url='../Laboratory/footstep2.json';
                            k=2000/(current_zoom-5);
                        }else{
                            //详细级
                            Url='../Laboratory/footstep2.json';
                            k=500/(current_zoom-5);
                        }
                        $.ajax({
                            url:Url,    //请求的url地址
                            dataType:"json",   //返回格式为json
                            async:true,//请求是否异步，默认为异步，这也是ajax重要特性
                            type:"GET",   //请求方式
                            success:function(req){
                                //请求成功时处理
                                for(var i=0;i<req.length;i++){
                                    pt=new BMap.Point(req[i].lng, req[i].lat);
                                    //创建圆
                                    var circle = new BMap.Circle(pt,k*req[i].count,{strokeColor:"#6699ff", strokeWeight:1, strokeOpacity:0.7});
                                    circle.setFillColor("#6699ff");
                                    circle.setFillOpacity(0.7);
                                    map.addOverlay(circle);
                                }
                            },
                            error:function(){
                                //请求出错处理
                                alert("Error");
                            }
                        });
                    });
                },200);
            });
        };
        return Base.extend(cls);
    }
);
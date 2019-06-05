define(
    [
        "text!Laboratory/findCar.html",
        "common/navView",
        'butterfly',
        'shared/js/datasource',
        'listview/ListView',
        "common/ssUtil",
        "shared/js/notification",
        "common/osUtil",
        "swipe",
        'shared/js/baidumap-api-v2.0',
        'Laboratory/lab-client'
    ],
    function (template, View, Butterfly, Datasource, ListView, ssUtil, Notification, osUtil, swipe, baidumap, LabClient) {
        var Base = View;
        var map;
        var point;
        var marker2;
        var infoWindow;
        var location = "小什子轻轨站";
        var cls =
        {
            _value: true,
            carData: null,
            events: {
                "click #take_photo": "take_photo"
            }
        };
        cls.onShow = function () {
            var me = this;
            osUtil.delayCall(function () {
                me.clientcar();
            });
        };
        cls.take_photo = function () {
            map.centerAndZoom(point, 15);
            var info =
                "<div><h4 style=" + "'margin:0 0 5px 0;padding:0.2em 0'" + ">地点：" + location + "</h4>" +
                "<p>拍照中……</p>" +
                "</div>";
            marker2.openInfoWindow(new BMap.InfoWindow(info, {enableMessage: false}));  //自动打开信息窗口
            var time = setTimeout(function () {
                var result = "<img id=" + "'result_img'" + " style=" + "'width:211px;height:110px;position: absolute;top: 11px;right: 8px;'" + " src=" + "'../Laboratory/images/result.jpg'" + "/>";
                var infoWindow_new = new BMap.InfoWindow(result, {enableMessage: false, width: 231, height: 130});  // 创建信息窗口对象
                marker2.openInfoWindow(infoWindow_new);  //自动打开信息窗口
                document.getElementById("result_img").onload = function () {
                    infoWindow_new.redraw();
                };
                $("#result_img").click(function () {
                    $("#photoShow").show();
                });
                $("#photoShow").click(function () {
                    $("#photoShow").hide();
                });
                clearTimeout(time);
            }, 500);
        };
        cls.clientcar = function () {
            map = new BMap.Map("carfind");
            map.centerAndZoom(point, 15);
            LabClient.getCarLocation({
                data: {
                    "carId": bfDataCenter.getCarId()
                },
                success: function (req) {
                    try {
                        location = req.data.addrDesc;
                        var sContent =
                            "<div><h4 style=" + "'margin:0 0 5px 0;padding:0.2em 0;white-space:normal; width:270px;'" + ">地点：" + req.data.addrDesc + "</h4>" +
                            "<p>本月剩余拍照次数：" + 16 + "次</p>" +
                            "</div>";
                        point = new BMap.Point(req.data.lng, req.data.lat);
                        infoWindow = new BMap.InfoWindow(sContent, {enableMessage: false, width: 290});  // 创建信息窗口对象
                        var myIcon = new BMap.Icon("../Laboratory/images/car.png", new BMap.Size(40, 50));
                        marker2 = new BMap.Marker(point, {icon: myIcon});  // 创建标注
                        map.addOverlay(marker2);
                        marker2.openInfoWindow(infoWindow);  //自动打开信息窗口
                        marker2.addEventListener("click", function () {
                            this.openInfoWindow(infoWindow);
                        });
                    } catch (e) {
                        console.log(e);
                    }
                },
                error: function () {
                    Notification.show({
                        type: "error",
                        message: "获取车辆位置失败"
                    });
                }
            });
        };
        return Base.extend(cls);
    }
);



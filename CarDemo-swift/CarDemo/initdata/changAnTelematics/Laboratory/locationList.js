define(
    [
        "text!Laboratory/locationList.html",
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
                "click .current_place":"get_current_place"
            }
        };
        cls.onShow = function(){
            $("#r-result").html("");
            this.get_place();
        };
        cls.get_current_place=function(){
            var place= event.target;
            var title=event.target.previousElementSibling.firstElementChild.innerHTML;
            window.localStorage['Current_place_name'] = title;
            // window.history.back();
                bfNaviController.pop();

        };
        cls.get_place=function(){
            var me=this;
            osUtil.delayCall(function(){
                // 百度地图API功能
                var map = new BMap.Map("l-map");
                map.centerAndZoom("成都", 11);
                var options = {
                    onSearchComplete: function(results){
                        // 判断状态是否正确
                        if (local.getStatus() == BMAP_STATUS_SUCCESS){
                            var s = [];
                            for (var i = 0; i < results.getCurrentNumPois(); i ++){
                                var src={"title":results.getPoi(i).title,"address":results.getPoi(i).address};
                                var template = _.template(me.elementHTML('#Place_list'),{
                                    data:src
                                });
                                $("#r-result").append(template);

                            }
                        }
                    }
                };
                var local = new BMap.LocalSearch(map, options);
                local.search("成都锦里");
            });
        };
        return Base.extend(cls);
    }
);
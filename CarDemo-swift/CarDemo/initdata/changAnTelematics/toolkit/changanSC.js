/**
 * Created by hp on 2016/11/7.
 */
define(
    [
        "common/navView",
        "text!toolkit/changanSC.html",
        'common/dataCenter',
        'common/osUtil',
        'common/ssUtil',
        'spin',
        "swipe",
        "common/disUtil",
        'shared/js/client',
        'shared/js/notification'
    ],
    function (View, template, DataCenter, osUtil, ssUtil, Spinner, swipe, disUtil, ShareClient, Notification) {
        var Base = View;
        return Base.extend({
            events: {
                "click .table-view-cell":"goDetail"
            },
            onShow: function () {

            },
            goDetail:function (el) {
                var me = this;
                var $ment = $(el.target);
                var id = $ment.attr("id");
                if(!id){
                    id = $ment.parent(".table-view-cell").attr("id");
                }
                switch (id){
                    case "buyCar":
                        butterfly.navigate("iframePage/buyCar.html")
                        break;
                    case "JXSCX":
                        butterfly.navigate("iframePage/storeRequire.html")
                        break;
                    case "JPPJ":
                        butterfly.navigate("iframePage/bestProduct.html")
                        break;
                    case "XSBY":
                        butterfly.navigate("iframePage/carMaintain.html")
                        break;
                }
            }
        });
    });
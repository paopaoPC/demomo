define([
        'text!control/remoteControl1.html',
        "common/navView",
        'butterfly',
        "common/osUtil",
        "common/lsUtil",
        "common/ssUtil",
        "common/disUtil",
        "shared/js/notification",
        "iscroll",
        "shared/plugin_dialog/js/dialog",
        'common/countDwonUtil',
        'common/imageCodeInterface'
    ],
    function (template, View, Butterfly, osUtil, lsUtil, ssUtil, disUtil, Notification,iscroll, dialog, CountDwon) {
        var Base = View;
        return Base.extend({
            id: "control",
            html: template,
            events: {
                
            },
            onShow:function(){
                
            }
        });
    });
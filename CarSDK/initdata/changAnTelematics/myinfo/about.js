/**
 * Created by hp on 2017/2/8.
 */
define([
        'text!myinfo/about.html',
        "common/navView",
        'butterfly',
        "common/osUtil",
        "common/ssUtil",
        "shared/js/notification",
        "common/disUtil",
        "modulesManager/ModuleManager",
        'shared/plugin_dialog/js/dialog'
    ],
    function (template, View, Butterfly, osUtil, ssUtil, Notification, disUtil,ModuleManager,dialog) {
        var Base = View;
        var cls = {
            events: {
                "click #Argument": "gotoArgument",
                "click #currentVersion": "checkUpdate"
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {

        };
        //onshow事件，初始化element
        cls.posGenHTML = function () {
            var me = this;
            if(typeof cordova != "undefined"){
                navigator.appInfo.getVersion(function (data) {
                    window.localStorage.setItem("currentVersion",data);
                    me.getElement("#versionNum").html(data);
                });
            }
        };
        cls.gotoArgument = function () {
            bfNaviController.push("myinfo/incallArgument.html");
        };
        cls.checkUpdate = function () {
            var me = this;
            if (me.isUpadting) return;
            me.isUpadting = true;
            me.$el.find('.content').append("<div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>正在检查...</div></div>");
            setTimeout(function () {
                me.$el.find('.chrysanthemum').remove();
                me.isUpadting = false;
            }, 15000);
            new ModuleManager().checkUpdates(true,
                function () {
                    me.$el.parent().find('.chrysanthemum').remove();
                    me.isUpadting = false;
                }, function (error) {
                    dialog.createDialog({
                        closeBtn: false,
                        buttons: {
                            '确定': function () {
                                this.close();
                            }
                        },
                        content: "当前版本:" + window.localStorage.currentVersion
                    });
                    me.$el.find('.chrysanthemum').remove();
                    me.isUpadting = false;
                });
        };
        return Base.extend(cls);
    });
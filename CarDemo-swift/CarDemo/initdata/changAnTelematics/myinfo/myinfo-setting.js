define(
        [
            "common/navView",
            'butterfly',
        'shared/plugin_dialogOld/js/dialog',

        ],
        function(View, butterfly,dialog){
            var Base = View;
            return Base.extend({
                events:{
                    "click #safeCenter": "safeCenter",
                    "click #about": "about",
                    "click #app-logout": "appLogout",

                },
                onShow: function(){
                    var contacts = bfDataCenter.getUserSessionValue('contactsMobile');
                    if(!contacts ||contacts == null || contacts == 'null' || contacts == 'undefined'){
                        this.getElement('.noCantacts2').css("visibility",'visible');
                    }else{
                        this.getElement('.noCantacts2').css("visibility",'hidden');
                    }
                },
                safeCenter: function(){
                     bfNaviController.push("myinfo/safeCenter.html");
                },
                about: function(){
                    bfNaviController.push("myinfo/about.html");
                },
                appLogout: function(){
                   var me = this;
                    dialog.createDialog({
                        closeBtn: false,
                        buttons: {
                            '确定': function () {
                                me.goLogout();
                                this.close();
                            },
                            '取消': function () {
                                this.close();
                            }
                        },
                        content: "是否确定注销当前用户?"
                    });
                },
                uiAddChrysanthemum: function () {
                    var me = this;
                    if (me.$el.find('.chrysanthemum').length === 0) {
                        me.$el.find('.content').append("<div id='chrysanthemumWarp'  style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active'><div></div><div style='font-size: 14px;color: white;margin-top: 50px;text-align: center;'>加载中...</div></div></div>");
                    }
                },
                uiRemoveChrysanthemum: function () {
                    var me = this;
                    me.$el.find('#chrysanthemumWarp').remove();
                },
                goLogout:function() {
                    var me = this;
                    if(navigator.packaging){
                        me.uiAddChrysanthemum();
                        navigator.packaging.logout(
                            {token: window.localStorage.token},
                            function (data) {
                                if (data.code == 0) {
                                    window.localStorage.removeItem("token");
                                    window.localStorage.removeItem("password");
                                    window.localStorage.removeItem("isLogin");
                                    window.hasChangeCar = true;
                                    bfAPP.gotoLogin();
                                    if(typeof cordova !="undefined" && navigator.appInfo.LogoutIM){
                                        navigator.appInfo.LogoutIM();
                                    }
                                } else {
                                    Notification.show({
                                        type: "error",
                                        message: data.msg
                                    });
                                }
                                me.uiRemoveChrysanthemum();
                            },
                            function (error) {
                                var eMsg = '发生未知错误';
                                if (typeof(error) === 'string') eMsg = error;
                                if (typeof(error) === 'object') {
                                    if (error.status == 0) eMsg = "网络开小差";
                                }
                                me.uiRemoveChrysanthemum();
                                Notification.show({
                                    type: "error",
                                    message: eMsg
                                });
                            }
                        );
                        return;
                    }
                    bfClient.userLogout(function (data) {
                        if (data.OK) {
                            window.localStorage.removeItem("token");
                            window.localStorage.removeItem("password");
                            window.localStorage.removeItem("isLogin");
                            bfAPP.gotoLogin();
                            window.hasChangeCar = true;
                            // navigator.appInfo.LogoutIM();
                        } else {
                            Notification.show({
                                type: "error",
                                message: data.msg
                            });
                        }
                    });
                },
            })
        });
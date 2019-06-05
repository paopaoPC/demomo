define([
        'text!Laboratory/jingdong-oauth.html',
        "common/navView",
        'butterfly',
        "shared/js/notification"
    ],
    function (template, View, Butterfly, Notification,iscroll, dialog, CountDwon) {
        var Base = View;
        return Base.extend({
            id: "jingdongOauth",
            html: template,
            events: {
            },
            // onLeft: function(){
            //     this.backToView()
            // },
            posGenHTML: function(){
                this.uiAddChrysanthemum()
            },
            // backToView: function(){
                // var length = bfNaviController._views.length -2
                // var key = bfNaviController._views[length].key
                // window.location.hash = key
                
            // },
            messageEvent: function(event){
                if(event.data == 'backToView'){
                    window.history.go(-3);
                    // 下面等同于 this.backToView()
                    // var length = bfNaviController._views.length -2
                    // var key = bfNaviController._views[length].key
                    // window.location.hash = key
                } else if(event.data == 'backToView_1'){
                    window.history.go(-1);
                }else{
                    var flag = event.data.success;
                    if(flag=='0'){
                        Notification.show({
                            type:"info",
                            message:"解绑失败"
                        });
                    }else if(flag=='1'){
                        Notification.show({
                            type:"info",
                            message:"解绑成功"
                        });
                        window.history.go(-1);
                    }else{
                        Notification.show({
                            type:"info",
                            message:"服务器异常"
                        });
                    }
                }
            },
            remove: function(){
                var me = this;
                window.removeEventListener('message',me.messageEvent,false);
            },
            onShow:function(){
                var me = this;
                var iframe = this.$('iframe');
                iframe.on('load',function(){
                    me.uiRemoveChrysanthemum()
                });
                window.addEventListener('message',me.messageEvent,false);
                var src = bfConfig.server + '/appserver/api/jd/oauth?token=' + window.localStorage.getItem("token")
                // var src = "https://paopaopc.github.io/oauth-test/index.html?code=111";
                iframe.attr('src',src)
            },
            uiAddChrysanthemum: function () {
                var me = this;
                if (me.$el.find('.chrysanthemum').length === 0) {
                    me.$el.append('<div id="HUDView" style="background-color: rgba(0, 0, 0, 0.4);" class="chrysanthemum active"><div></div><div style="font-size: 14px;color: white;margin-top: 50px;text-align: center;">加载中...</div></div>');
                }
            },
            uiRemoveChrysanthemum: function () {
                var me = this;
                $('.chrysanthemum').remove();
            }
        });
    });
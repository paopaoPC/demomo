/**
 * Created by hp on 2016/10/11.
 */
define(
    [
        "text!Laboratory/LaboratoryRemote.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "iscroll",
        "common/disUtil",
        "shared/js/notification",
        "Laboratory/lab-client"
    ],
    function (template, View, Butterfly, ssUtil,iscroll, disUtil, Notification,LabClient)
    {
        var Base = View;
        var cls =
        {
            _value : true,
            carData : null,
            events: {
                "click .LCIButton": "onLCIButton"
            }
        };
        cls.onShow = function()
        {
            // this._initListView();
        };
        cls.posGenHTML = function(){

        };
        cls.onLCIButton = function(e){
            var $currentTarget = $(e.currentTarget);
            var rawtext = $currentTarget.attr('data-value');
            // var controlType = $currentTarget.parents('.LCItem').attr('data-value');
            this.sendControl(rawtext);
        }
        cls.uiAddChrysanthemum= function () {
            var me = this;
            if (me.$el.find('.chrysanthemum').length === 0) {
                me.$el.append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>登录中...</div></div></div>");
            }
        },
        cls.uiRemoveChrysanthemum = function () {
            var me = this;
            $('#chrysanthemumWarp').remove();
        },
        cls.sendControl = function(rawtext){
            var me = this;
            var data = {
                rawtext: rawtext,
                account: '13805600639'
            }
            $.ajax({
                url:'http://autopre.openspeech.cn/ccag/demo/noopsyche',
                type: "get",
                data:data,
                beforeSend: function () {
                    me.uiAddChrysanthemum();
                },
                success: function (data) {
                    if(data.code == 0){
                        Notification.show({
                            type: "well",
                            message: "操作成功"
                        });
                    } else if(data.code == 1000){
                        Notification.show({
                            type: "error",
                            message: "服务器开小差"
                        });
                    } else if(data.code == 1001){
                        Notification.show({
                            type: "error",
                            message: "控制设备失败"
                        });
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        });
                    }
                },
                error: function () {
                    Notification.show({
                        type: "error",
                        message: "网络开小差"
                    });
                },
                complete: function () {
                    me.uiRemoveChrysanthemum();
                }
            })
        }
       
        return Base.extend(cls);
    }
);
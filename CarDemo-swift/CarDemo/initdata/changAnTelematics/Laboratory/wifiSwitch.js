/**
 * Created by 63471 on 2016/11/25.
 */
define(
    [
        "common/navView",
        "main/control-cmd",
        "shared/js/notification"
    ],
    function (View,controlCmd,Notification) {
        var Base = View;
        return Base.extend({
            events: {
                'click .switch li':'liChange',
              //  'click .openWifi' :'setWifi',
            },
            posGenHTML:function () {
                var me=this;
                var canOpenWifi =bfDataCenter.getUserSessionValue('canOpenWifi');
                var node = me.getElement('.openWifi');
                if(canOpenWifi){
                    var node=this.getElement('.openWifi');
                    node.text('设置中...');
                    return;
                };
                node.on('click',function () {
                    me.setWifi();
                });
            },
            onShow: function () {

            },
            onViewPush : function(pushfrom,pushData){
                this.carId=pushData;
            },
            liChange : function (el) {
                var clickedIndex = $(el.currentTarget).index();
                var currentIndex = $('.switch .selected').index();
                if(clickedIndex != currentIndex){
                    $(this.getElement(".switch li")[clickedIndex]).addClass('selected');
                    $(this.getElement(".switch li")[currentIndex]).removeClass('selected');
                }
            },
            setWifi:function () {
                var me = this;
                var operate = $('.switch .selected').index();
                var wifiAPSwitch;
                if(operate == 0){
                    wifiAPSwitch = 1;
                }else{
                    wifiAPSwitch = 0;
                };
                controlCmd.send({
                    data:{
                        carId:me.carId,
                        'cmd':"WifiUpdateSet",
                        'wifiAPSswitch':wifiAPSwitch,
                    },
                    controlCarSuccess:function(){
                        bfDataCenter.setUserSessionValue('canOpenWifi',false);
                        me.uiProgressReset("设置中...");
                    },
                    controlInfoError:function(){
                        bfDataCenter.setUserSessionValue('canOpenWifi',false);
                        me.uiProgressResult("设置失败");
                    },
                    controlInfoFail:function(){
                        bfDataCenter.setUserSessionValue('canOpenWifi',false);
                        me.uiProgressResult("设置失败");
                    },
                    controlInfoComplete: function(){
                        bfDataCenter.setUserSessionValue('canOpenWifi',false);
                        me.uiProgressResult("设置成功");
                    },
                    controlInfoTimeout: function(){
                        bfDataCenter.setUserSessionValue('canOpenWifi',false);
                        me.uiProgressResult("设置失败");
                    },
                    controlInfoRunning: function(){
                        bfDataCenter.setUserSessionValue('canOpenWifi',true);
                        me.uiProgressRunning();
                    }
                })
            },
            uiProgressRunning:function () {
                
            },
            uiProgressReset:function (str) {
                var me = this;
                var node =me.getElement('.openWifi');
                node.addClass("changeStatus");
                node.unbind("click");
                node.html(str);
            },
            uiProgressResult:function (str) {
                var me = this;
                var node =me.getElement('.openWifi');
                node.html('确定');
                Notification.show({
                    type:"error",
                    message:str
                });
                node.removeClass("changeStatus");
                node.on("click", function(){
                    me.setWifi();
                })
            },

        });
    });
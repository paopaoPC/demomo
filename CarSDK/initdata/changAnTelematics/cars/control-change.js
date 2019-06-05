define([
        "text!cars/control-change.html",
        "common/navView",
        'butterfly',
        "shared/js/notification",
    ],
    function (template, View, Butterfly, Notification) {

        var Base = View;
        var cls =
        {
            events: {
                "click .control-item":"setControlItem",
                'click #navRight':'onSubmit',
            }
        };
        cls.onShow = function () {

        };
        cls.posGenHTML =  function () {
            var me = this;
            var data = this._RemoteControl;
            //通过页面传过来的VIN号，查询出对应的车辆信息
            if(data.ac == 0){
                me.$('.control-item-air').hide()
            } else if(data.ac == 1){
                me.$('.control-item-air').show()
            } else if(data.ac == 2){
                me.$('.control-item-air').show()
            } 
            // // 闪灯鸣笛 remoteAlarm
            if(data.remoteAlarm ){
                me.$(".ontrol-item-flashLight").show()
                me.$(".control-item-remoteSearchCar").show()
            } else {
                me.$(".ontrol-item-flashLight").hide()
                me.$(".control-item-remoteSearchCar").hide()
            }
            if(data.sunroofOpen || data.sunroofClose){
                me.$('.control-item-dormer').show();
            } else {
                me.$('.control-item-dormer').hide();
            }
            // // 车门落锁
            if(data.doorLock){
                me.$('.control-item-lock').show()
            } else {
                me.$('.control-item-lock').hide()
            }
            // 车窗
            if(data.window){
                me.$('.control-item-carWindows').show()
            } else{
                me.$('.control-item-carWindows').hide()
            }
            if(data.airPurify){
                me.$('.control-item-purge').show();
            } else {
                me.$('.control-item-purge').hide();
            }


            bfClient.getQuick({
                data: {
                   car_id: this._RemoteControl.carId
                },
                success: function(res){
                    if(res && res.success && res.data){
                        for(i in res.data){
                            if(i !== 'car_id'){
                                if(res.data[i] == true){
                                    me.$('.'+i).addClass('select')
                                    me.$('.'+i).parent().addClass('select');
                                }
                            }
                        }
                        me.uiRemoveChrysanthemum()

                    } else {
                        me.uiRemoveChrysanthemum()
                        // Notification.show({
                        //     type:"error",
                        //     message: res.msg
                        // });
                        me.$('.alarm_quick').addClass('select')
                        me.$('.alarm_quick').parent().addClass('select');
                        me.$('.lock_solutuin_quick').addClass('select')
                        me.$('.lock_solutuin_quick').parent().addClass('select');
                        me.$('.send_car_quick').addClass('select')
                        me.$('.send_car_quick').parent().addClass('select');
                    }
                },
                error: function(){
                    Notification.show({
                        type:"error",
                        message: '网络开小差'
                    });
                    me.uiRemoveChrysanthemum()
                }
            })

        }
        cls.onViewPush = function(pushFrom, pushData){
            this._RemoteControl = pushData;
        }
        cls.onSubmit = function(){
            var me = this;
            var $elArr = this.$('.control-item-select.select');
            var elLength = $elArr.length;
            if(elLength==0){
                Notification.show({
                    type:"error",
                    message: '至少添加一个快捷应用'
                });
                return
            }
            var controlData = { 
              "ac_quick": false,
              "air_purify_quick": false,
              "alarm_quick": false,
              "flash_light_quick": false,
              "lock_solutuin_quick": false,
              "sunroof_quick": false,
              "window_quick": false,
              "send_car_quick": false
            };
            controlData['car_id'] = this._RemoteControl.carId;

            for(var i=0;i<elLength;i++){
                var dataValue = $elArr.eq(i).attr('data-value');
                controlData[dataValue] = true;
            }
            this.uiAddChrysanthemum()
            bfClient.addQuick({
                dataStr: JSON.stringify(controlData),
                success: function(res){
                    if(res && res.success){
                        Notification.show({
                            type:"well",
                            message:"提交成功"
                        });
                        me.uiRemoveChrysanthemum()
                        bfNaviController.pop();
                    } else {
                        me.uiRemoveChrysanthemum()
                        Notification.show({
                            type:"error",
                            message: res.msg
                        });
                    }
                },
                error: function(){
                    Notification.show({
                        type:"error",
                        message: '网络开小差'
                    });
                    me.uiRemoveChrysanthemum()
                }
            });
        };
        cls.setControlItem = function(e){
            var $el = $(e.currentTarget).find('.control-item-select');
            var isSelect = $el.hasClass('select');
            if(isSelect){
                $el.removeClass('select');
                $el.parent().removeClass('select');
            } else {
                // 判断有没有超过三个
                var selectLength = this.$('.control-item-select.select').length;
                if(selectLength<3){
                    $el.addClass('select');
                    $el.parent().addClass('select');
                } else {
                    Notification.show({
                        type:"well",
                        message:"最多只能添加3个"
                    });
                }
            }
        }
        cls.uiAddChrysanthemum = function () {
            var me = this;
            if (me.$el.find('.chrysanthemum').length === 0) {
                me.$el.append('<div id="HUDView" style="background-color: rgba(0, 0, 0, 0.4);" class="chrysanthemum active"><div></div><div style="font-size: 14px;color: white;margin-top: 50px;text-align: center;">加载中...</div></div>');
            }
        };
        cls.uiRemoveChrysanthemum = function () {
            var me = this;
            $('.chrysanthemum').remove();
        };
        return Base.extend(cls);
    }
);

define(
    [
        "text!bluetooth/shared.html",
        "common/navView",
        'butterfly',
        'shared/timePicker/js/date',
        "shared/js/notification",
        'shared/js/swiper_min',
        "moment",
         "shared/js/scroll-pull-down",
    ],
    function (template, View, Butterfly, DatePicker, Notification,Swiper,moment,ScrollPullDown) {
        var Base = View;
        var cls =
        {
            id: 'bluetoothSharedListView',
            events: {
                'click #navRight':'onClickRight',
                // 'click .item-input-1':'onPick1',
                'click .item-input-2':'onPick2',
                'click .shared-btn':'onShared',
                'click .slic-item-operate':'showDialog',
                'click .input-item-time': 'onModifyTime',
                'click .contact': 'onContact',
                'click .dialog-warp-phone-cancel': 'hideDialog',
                'click .dialog-warp-phone-ok': 'revokePermissionbtn',
                'click .slic-item-operate-edit': 'onEditItem',
                'click .shared-list-item-content': 'onEditItem',
            },
            phone: '',
            startTime: '',
            endTime: '',
            selectTime: '',
            vin: ''
        };
        cls.onEditItem = function(e){
            var index = $(e.currentTarget).parents('.shared-list-item').attr('data-index');
            var data = this.listData[index];
            bfNaviController.push('bluetooth/shared-list-item.html',{
                data:data
            })
        }
        cls.onContact = function(){
        }
        cls.onClickRight = function(){

        }
        cls.initScroll = function () {
            var me = this;
            if (!me.scrollPullDown) {
                me.$pullDown = me.$('.pulldown');
                me.scrollPullDown = new ScrollPullDown({
                    el: me.$el,
                    onScrollCallback: function () {
                        me.getGrantList(true)
                    },
                    onScrollEnd: function () {
                        if (me.$pullDown.hasClass('flip')) {
                            me.$pullDown.addClass('loading');
                            me.$('.pulldown .label').html('正在刷新...');
                            me.scrollPullDown.scrollCallback();
                        }
                        me.scrollPullDown.setUILoadingPer(0);
                    }
                })
            } else {
                me.scrollPullDown.myscroll.refresh();
            }
        }
        cls.showDialog = function(e){
            this.CacheE = e;
            var phoneNumber = $(e.currentTarget).attr('data-phone')
            this.$('.dialog-warp-phone-content-top span').html(phoneNumber)
            this.$('.dialog-warp-phone').show()
        }
        cls.hideDialog = function(){
            this.$('.dialog-warp-phone').hide()
        }
        cls.onViewPush = function(pushFrom, pushData){
            if(pushData && pushData.vin){
                this.vin = pushData.vin
            }
        }
        cls.posGenHTML=function(){
            var me = this;
            me.phone = bfDataCenter.getUserMobile()
            if(this.vin == ''){
                this.vin = bfDataCenter.getCarData().vin;
            }
            // me.startTime = moment().format('YYYY-MM-DD HH:mm')
            // me.$('#item-input-1').html(me.startTime)
            me.bindDatePicker()
        };
        cls.onShow = function () {
            var me = this;
            this.getGrantList()
        };
        cls.onModifyTime = function(e){
            var me = this;
            var $current = $(e.currentTarget);
            var dataValue = $current.attr('data-value');
            if(me.startTime == ''){
                me.startTime = moment().format('YYYY-MM-DD HH:mm');
                me.$('#item-input-1').html(me.startTime);
            }
            me.endTime = moment(me.startTime).add(dataValue,'h').format('YYYY-MM-DD HH:mm');
            me.$('#item-input-2').html(me.endTime);
        };
        cls.repeatLogin = function(ParentRes,parentFun){
            var me = this;
            bfClient.winmu_getCheckCode({
                data: {
                    phone: me.phone,
                },
                success: function(data){
                    if(data.code == 0){
                        var checkCode = data.data;
                        window.loginandgetdata_blueTooth_bluetooth_shared_2 = function(data){
                            if(data.code == 200){
                                parentFun()
                            } else {
                               Notification.show({
                                type:'info',
                                message: ParentRes.msg,
                               })  
                            }
                        }
                        OSApp.loginandgetdata_blueTooth(JSON.stringify({
                            phone:me.phone,
                            vin: me.vin,
                            checkCode: checkCode,
                            token: window.localStorage['token']
                        }),'loginandgetdata_blueTooth_bluetooth_shared_2') 
                    } else {
                        Notification.show({
                         type:'info',
                         message: ParentRes.msg,
                        })  
                    }
                },
                error: function(res){
                   Notification.show({
                    type:'info',
                    message: ParentRes.msg,
                   })  
                }
            })
        };
        cls.getGrantList = function(noneed){
            var me = this;
            // me.$('.shared-list').hide()
            // me.$('.shared-list-content').html('')
            if(!noneed){
            me.uiAddChrysanthemum()
            }

            window.grantList_blueTooth_bluetooth_shared_3 = function(data){
                // var data = {
                //     code: 200,
                //     data: [{"startTime":1545565320000,"phone":"18883866149","nickName":"跑跑跑跑跑跑跑跑跑","expireTime":1546170120000,"userType":"USER"},{"startTime":1545567360000,"phone":"13032320617","nickName":"","expireTime":1546172160000,"userType":"USER"},{"startTime":1545569520000,"phone":"18136659004","nickName":"","expireTime":1546174320000,"userType":"USER"}]
                //     // data: []
                // }
                if(data.code == '502' && data.msg == '令牌错误'){
                    me.repeatLogin(data,me.getGrantList.bind(me));
                    return
                }
                me.uiRemoveChrysanthemum()
                if(data.code == '200'){
                    if(data.data.length>0){
                        me.listData = data.data;
                        var faultTemplate = _.template(me.$('#bluetoothSharedView_temp').html(), {
                            "dataArr": data.data
                        });
                        me.$('.shared-list-content').html(faultTemplate)
                        me.$('.shared-list').show()
                        me.$('.shared-no-network').hide()
                        me.$('.shared-no-car').hide()
                    } else {
                        me.$('.shared-list').hide()
                        me.$('.shared-no-network').hide()
                        me.$('.shared-no-car').show()
                    }
                    me.initScroll()
                } else {
                   Notification.show({
                    type:'info',
                    message: data.msg,
                   }) 
                   me.$('.shared-list').hide()
                   me.$('.shared-no-network').show()
                   me.$('.shared-no-car').hide()
                    me.initScroll()
                }
                me.scrollPullDown && me.scrollPullDown.resizePulldown();
            }
            if(typeof OSApp !== 'undefined'){
                OSApp.grantList_blueTooth(JSON.stringify({
                    vin: me.vin,
                    token: window.localStorage['token']
                }),'grantList_blueTooth_bluetooth_shared_3')
            }
            
        }
        cls.revokePermissionbtn = function(){
            var me = this;
            var e = this.CacheE;
            var $current = $(e.currentTarget);
            // var vin = $current.attr('data-vin')
            me.hideDialog()
            var phone = $current.attr('data-phone')
            me.uiAddChrysanthemum()
            window.revokePermissionbtn_blueTooth_shared_1 = function(data){
                if(data.code == '502' && data.msg == '令牌错误'){
                    me.repeatLogin(data,me.revokePermissionbtn.bind(me,e));
                    return;
                }
                if(data.code == '200'){
                   me.getGrantList() 
                } 
                me.uiRemoveChrysanthemum()
               Notification.show({
                type:'info',
                message: data.msg,
               }) 
            }
            OSApp.revokePermissionbtn_blueTooth(JSON.stringify({
                vin: me.vin,
                phone: phone,
                userPhone: me.phone
            }),'revokePermissionbtn_blueTooth_shared_1')
        }
        cls.onShared = function(){
            var me = this;
            var phone = this.$('#phone-input').val()
            if(phone == ""){
                Notification.show({
                    type:'info',
                    message:'手机号不能为空',
                })
                return
            }
            var reg = /^\d{11}$/;
            if( !reg.test(phone) ){
                Notification.show({
                    type:'info',
                    message:'手机号格式错误',
                })
                return
            }
            if(this.startTime == ''){
                Notification.show({
                    type:'info',
                    message:'开始时间不能为空',
                })
                return
            }

            if(this.endTime == ''){
                Notification.show({
                    type:'info',
                    message:'结束时间不能为空',
                })
                return
            }
            if(this.startTime == this.endTime){
                Notification.show({
                    type:'info',
                    message:'开始时间不能等于结束时间',
                })
                return
            }
            // if(moment(this.startTime).diff(moment(this.endTime))>=0){
            //     Notification.show({
            //         type:'info',
            //         message:'结束时间不能早于开始时间',
            //     })
            //     return
            // }
            me.uiAddChrysanthemum()
            window.grantUser_blueTooth_bluetooth_shared_1 = function(data){
                if(data.code == '502' && data.msg == '令牌错误'){
                    me.repeatLogin(data,me.onShared.bind(me));
                    return;
                }
                if(data.code == 200){
                    // me.getGrantList() 
                    bfClient.getUserAppData_shared({
                        shareusernumber: phone,
                        vin: me.vin
                    })
                }
                me.uiRemoveChrysanthemum()
                Notification.show({
                    type:'info',
                    message: data.msg.replace(/授权开始时间/g,'开始时间').replace(/过期时间/g,'结束时间'),
                }) 
            }
            OSApp.grantUser_blueTooth(JSON.stringify({
				userPhone:me.phone,
                phone: phone,
                vin: me.vin,
                startTime: moment(me.startTime).valueOf(),
                expireTime: moment(me.endTime).valueOf(),
                token: window.localStorage['token']
            }),'grantUser_blueTooth_bluetooth_shared_1')

        }
        cls.onViewBack=function () {
        };
        cls.onViewPush = function (pushFrom, pushData) {
             
        };
        // 拉数据的时候，添加菊花
        cls.uiAddChrysanthemum = function (msg) {
            var me = this;
            if (me.$('.content').eq(0).find('#chrysanthemumWarp').length === 0) {
                if(!msg){
                    msg = '正在加载'
                }
                me.$('.content').eq(0).append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%;z-index:100;top:-100px'><div class='bf-chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 12px;color: white;margin-top: 55px;'>"+ msg +"</div></div></div>");
            }
        };
        // 删除菊花
        cls.uiRemoveChrysanthemum =function () {
            this.$('#chrysanthemumWarp').remove();
        };
        cls.bindDatePicker = function() { //绑定日期控件
            var me = this;
            me.dp = DatePicker($);
            var initTime = moment().format("YYYY-MM-DD HH:mm");
            me.$('#item-input-datepick').date({
                theme: "datetime",
                time: initTime
            }, function(data) {
                if(me.selectTime == 'startTime'){
                    me.startTime = moment(data).format('YYYY-MM-DD HH:mm')
                    me.$('#item-input-1').html(me.startTime)
                } else if(me.selectTime == 'endTime') {
                    me.endTime = moment(data).format('YYYY-MM-DD HH:mm')
                    me.$('#item-input-2').html(me.endTime)
                }
            }, function() {
                //取消的回调
            });
        }
        cls.onPick1 = function(){
           var me = this;
           me.$('#phone-input').blur();
           
           setTimeout(function(){
                me.selectTime = 'startTime';
                if(me.startTime == ''){
                     me.dp.time = moment().format("YYYY-MM-DD HH:mm");
                } else {
                     me.dp.time = me.startTime;
                }
                me.$('#item-input-datepick').trigger('click');
           },200)
        };
        cls.onPick2 = function(){
           var me = this;
           me.$('#phone-input').blur();
           
           setTimeout(function(){
                me.selectTime = 'endTime';
                if(me.endTime == ''){
                     if(me.startTime == ''){
                         me.dp.time = moment().format("YYYY-MM-DD HH:mm");
                     } else {
                         me.dp.time = moment(me.startTime).add(1,'h').format('YYYY-MM-DD HH:mm');
                     }
                } else {
                     me.dp.time = me.endTime;
                }
                me.$('#item-input-datepick').trigger('click');
           },200)
        };
        cls.onRight = function () {
     
        };
        return Base.extend(cls);
    }
);

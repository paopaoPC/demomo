// // 业务正常处理
//     ErrorCode_OK = 200,
//     /// 服务异常
//     ErrorCode_InternalServerError = 500,// 服务异常
//     ///参数异常
//     ErrorCode_ParameterError = 501,//参数异常
//     /// 接口对应的服务未部署或者业务异常
//     ErrorCode_BadGateway = 502,//业务异常
//     ///解密失败
//     ErrorCode_NoActivity = 503,//未激活,代表checkcode失效，需要传入新的checkcode,并且重新登录
//     ///Token过期
//     ErrorCode_TokenExpired = 504,//Token过期,代表登录失效，需要重新登录，
    
//     ErrorCode_Uninitialized = 510,//appid未初始化
    
//     ErrorCode_UnRegister = 511,//用户未注册，请先注册后使用
    
//     ErrorCode_BLEUnlearned = 512,//蓝牙未学习
    
//     ErrorCode_NetworkException = 1000,//网络异常
    
//     ErrorCode_NoToken = 1010,//没有token，登录失败，获取token异常
    
//     ErrorCode_NOAnyVehicle = 1011,//此用户未绑定任何车辆
    
//     ErrorCode_BTAdressInvalidate = 1012,//蓝牙地址不正确
    
//     ErrorCode_BleInfoInvalidate = 1013,//蓝牙模块读取的VIN跟绑定的的VIN不匹配，无法绑定
    
//     ErrorCode_BleSNInvalidate = 1014,//蓝牙SN不正确，请输入正确的SN
    
//     ErrorCode_VinInvalidate = 1015,//指定的VIN格式不正確或者未找到此车辆
    
//     ErrorCode_PhoneInvalidate = 1016,//指定phone参数不正确
    
//     ErrorCode_CheckCodeInvalidate = 1017,//checkcode参数不正确
    
//     ErrorCode_BleNotInPowerON = 2000,//蓝牙未打开
    
//     ErrorCode_ScanBleTimeout = 2001,//扫描连接蓝牙超时
    
//     ErrorCode_getBtInfoError = 2002,//蓝牙通讯失败
    
//     ErrorCode_UnbindBld = 2003,//未绑定蓝牙，请先绑定蓝牙
    
//     ErrorCode_LimitedOperation = 2004,//离线操作受限，一般是网络不畅导致，需要联网操作一遍
    
//     ErrorCode_passcodeError = 2005,//配对码错误，暂时无法判断，此错误码暂时不会返回，
    
//     ErrorCode_noAuthority = 2006,//授权失败，您无权限授权此车辆
    
//     ErrorCode_mobileError = 2007,//授权和解除授权时输入的手机号码格式不正确，请输入正确的手机号
    
//     ErrorCode_checkCodeError = 2008,//checkCode参数异常
    
//     ErrorCode_NeedDebugMode = 2009,//需要插入诊断仪让蓝牙模块进入诊断模式才能进行绑定操作
define(
    [
        "common/navView",
        "text!bluetooth/index.html",
        'butterfly',
        'shared/js/swiper_two',
        "shared/js/notification",
        "moment",
        "appTheme/changeCarType",
        'shared/progress/progress',
    ],
    function (View, template, Butterfly,Swiper, Notification,moment,CarResource,progress) {
        var Base = View;
        var cls =
        {
            id: 'bluetoothView',
            html: template,
            events: {
                'click #navRight':'onClickRight',
                'click .share-bluetooth':'onShare',
                'click .content-faile-btn':'initData',
                'click .SS-one-item':'onControlBtn',
                'click .blueetoothStatus-wrap-icon': 'onConnectEvent',
                // 'click .control-switch input': 'onChangeSwitch',
                'click .switch-shadow': 'onChangeSwitch',

                'touchstart .control-btn-long': 'touchStartLong',
                'touchmove .control-btn-long': 'touchMoveLong',
                'touchend .control-btn-long': 'touchEndLong',
            },
            bluetoothIsLine: false,
            isNoNeed: 0,
            vin: '',
            mobile: '',
            pp_fire: 0,
            pp_doorLeft: false,
            pp_doorRight: false,
            pp_touchLongType: '',
            pp_touchLongTime: 0,
            pp_touchLongIsFirst: 0,
            pp_touchLongKey: '',
            bluetoothStaus: false
        };

        cls.onConnectEvent = function (argument) {
            var me = this;
            var $blueeIcon = $('#bluetoothView .content .blueetoothStatus-wrap-icon');
            if($blueeIcon.hasClass('active') || $blueeIcon.hasClass('loading')){
                return
            }
            $blueeIcon.addClass('loading')
            setTimeout(function(){
                $blueeIcon.removeClass('loading')
            },12000)
            window.getBlueToothStatus_blueTooth_home_index_234234234sefssdffsd = function(data){
               if(data.data == "true"){
                    // $('#home .SS-one-item-wrap-trunk').addClass('unable')
                    // $('#home .SS-one-item-wrap-slidingdoor').addClass('unable')
                    me.bluetoothStaus = true;

                    var $blueeIcon = $('#bluetoothView .content .blueetoothStatus-wrap-icon');
                    if($blueeIcon.hasClass('active') || $blueeIcon.hasClass('loading')){
                        console.log('1')
                    } else {
                         $blueeIcon.addClass('loading')
                         setTimeout(function(){
                             $blueeIcon.removeClass('loading')
                         },12000)
                    }
                    if(typeof OSApp !== 'undefined'){
                         OSApp.cancelConnect_blueTooth(JSON.stringify({}));
                     }

                    me.connectbt_blueTooth()
               } else {
                    me.bluetoothStaus = false;
                    $('#bluetoothView .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
                    // $('#home .SS-one-item-wrap-trunk').removeClass('unable')
                    // $('#home .SS-one-item-wrap-slidingdoor').removeClass('unable')
                    if($('.notification').html() != '请打开蓝牙后，再次尝试'){
                        Notification.show({
                            type:'info',
                            message: '请打开蓝牙后，再次尝试',
                        })
                    }
               }
            }
            OSApp.getBlueToothStatus_blueTooth(JSON.stringify({
            }),'getBlueToothStatus_blueTooth_home_index_234234234sefssdffsd')
        }

        cls.onControlBtn = function(e){
            var me = this;
            if(e){
                var dataValue = $(e.currentTarget).attr('data-value')
            } 

            if(dataValue){
                if(!me.bluetoothStaus){
                    if($('.notification').html() != '请打开蓝牙后，再试'){
                        Notification.show({
                            type:'info',
                            message: '请打开蓝牙后，再试',
                        })
                    }
                    return
                }
                

                window.getConnectStatus_blueTooth_bluetooth_index123123 = function(res){
                    if(res.data == '1' || res.data == 'true'){

                        // if(me.beforeTime){
                        //    var diff = moment().diff(me.beforeTime) 
                        // } else {
                        //     var diff = 300000;
                        // }
                        // if(diff<2000){
                        //     if($('.notification').html() != '指令间隔太短，稍后再试'){
                        //         Notification.show({
                        //             type:'info',
                        //             message: '指令间隔太短，稍后再试',
                        //         })
                        //     }
                        //     return
                        // }
                        // me.beforeTime = moment();

                        $('#bluetoothView .content .blueetoothStatus-wrap-icon').addClass('active').removeClass('loading');
                        me.$('.bluetoothPasscode').hide();
                        // me.startGetConnectStatus_blueTooth()
                        // if(me.__powerstatus_blueetooth != 0){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '非OFF档，无法进行控制',
                        //     })
                        //     return 
                        // }
                        // if(me.__blueCarStatus.driverDoorLockStatus == 0 && dataValue == 'actionLock_blueTooth'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '车辆已闭锁',
                        //     })
                        //     return 
                        // } else if(me.__blueCarStatus.driverDoorLockStatus == 1 && dataValue == 'actionUnlock_blueTooth'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '车辆已解锁',
                        //     })
                        //     return 
                        // }
                        // if(me.__blueCarStatus.sunroofStatus == false && dataValue == 'actionSunroofClose'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '天窗已关闭',
                        //     })
                        //     return 
                        // } else if(me.__blueCarStatus.sunroofStatus == true && dataValue == 'actionSunroofOpen') {
                        //     Notification.show({
                        //         type:'info',
                        //         message: '天窗已打开',
                        //     })
                        //     return 
                        // }
                        // if(me.__blueCarStatus.trunkStatus == true && dataValue == 'actionOpenTrunk_blueTooth'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '后备箱已打开',
                        //     })
                        //     return 
                        // }
                        if(!window.__currentIs4G()){
                            if(OSApp.getOfflineExpiryTime() - moment().unix() > 0 && OSApp.getOfflineRemainingTimes()>0){
                                var number = OSApp.getOfflineRemainingTimes() -1;
                                if(number>0){
                                    Notification.show({
                                        type:'info',
                                        message: '离线控制剩余'+number+'次',
                                    })
                                }
                                me.bluetoothControl(dataValue)
                            } else {
                                me.uiRemoveChrysanthemum()
                                Notification.show({
                                    type:'info',
                                    message: '离线控制超限，连接网络后再试',
                                })
                            }
                        } else {
                            me.bluetoothControl(dataValue)
                        }
                    } else {
                        me.uiRemoveChrysanthemum()
                        if($('.notification').html() != '蓝牙连接失败，请靠近车辆再试'){
                            Notification.show({
                                type:'info',
                                message: '蓝牙连接失败，请靠近车辆再试',
                            })
                        }
                        $('#bluetoothView .content .blueetoothStatus-wrap-icon').removeClass('active');
                        // me.stopGetConnectStatus_blueTooth()
                        // me.connectbt_blueTooth(me.bluetoothControl.bind(me,dataValue))
                    }
                }
                OSApp.getConnectStatus_blueTooth(JSON.stringify({}),'getConnectStatus_blueTooth_bluetooth_index123123')
            }
        }
        cls.initSwiper = function(){
            var me = this;
            if(!me.first){
                setTimeout(function(){
                    me._mySwiper = new Swiper(me.$('#swiper22')[0], {
                        direction: 'vertical',
                        loop: false,
                        initialSlide: 0,
                        // 如果需要分页器
                        pagination: '#bluetoothView .swiper-pagination',
                        onSlideChangeEnd: function(swiper){
                            // me.getControlStatussyn(); 
                        }
                    })
                    // _.each(controlIndexs,function(item,index){
                    //     if(_.indexOf(me._controlIndexs,item)<0){
                    //         me._mySwiper && me._mySwiper.removeSlide(item-1)
                    //     }
                    // })
                },200)
                // setTimeout(function(){
                    // me.initSVG();
                    // me.initMobiscrollAuction()
                // },500)
                me.first = true;
            }
        };
        cls.bluetoothControl = function(data){
            var me = this;
            me.uiAddChrysanthemum('指令发送中')
            switch(data){
                // 锁车指令
                case 'actionLock_blueTooth':
                    window.actionLock_blueToothCallback_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionLock_blueTooth(JSON.stringify({}),'actionLock_blueToothCallback_bluetooth_index')
                    // OSApp.setStatistics('actionLock_blueTooth','')
                    bfClient.getUserAppData_control({
                        item: '车锁',
                        status: '关',
                        vin: me.vin
                    })
                    break;
                // 解锁指令
                case 'actionUnlock_blueTooth':
                    window.actionUnlock_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionUnlock_blueTooth(JSON.stringify({}),'actionUnlock_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionUnlock_blueTooth','')
                    bfClient.getUserAppData_control({
                        item: '车锁',
                        status: '开',
                        vin: me.vin
                    })
                    break;
                //车窗自动升起
                case 'actionSunroofClose':
                    window.actionSunroofClose_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionSunroofClose(JSON.stringify({}),'actionSunroofClose_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionSunroofClose','')
                    bfClient.getUserAppData_control({
                        item: '天窗',
                        status: '关',
                        vin: me.vin
                    })
                    break;
                //车窗自动降窗
                case 'actionSunroofOpen':
                    window.actionSunroofOpen_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionSunroofOpen(JSON.stringify({}),'actionSunroofOpen_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionSunroofOpen','')
                    bfClient.getUserAppData_control({
                        item: '天窗',
                        status: '开',
                        vin: me.vin
                    })
                    break;
                //打开左侧滑门
                case 'actionLeftSlidingDoor_blueTooth':
                    window.actionLeftSlidingDoor_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionLeftSlidingDoor_blueTooth(JSON.stringify({}),'actionLeftSlidingDoor_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionLeftSlidingDoor_blueTooth','')
                    // bfClient.getUserAppData_control({
                    //     item: '',
                    //     status: '开',
                    //     vin: me.vin
                    // })
                    break;
                //打开右侧滑门
                case 'actionRightSlidingDoor_blueTooth':
                    window.actionRightSlidingDoor_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionRightSlidingDoor_blueTooth(JSON.stringify({}),'actionRightSlidingDoor_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionRightSlidingDoor_blueTooth','')
                    bfClient.getUserAppData_control({
                        item: '右滑门',
                        status: '无',
                        vin: me.vin
                    })

                    break;
                //打开后备箱
                case 'actionOpenTrunk_blueTooth':
                    window.actionOpenTrunk_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionOpenTrunk_blueTooth(JSON.stringify({}),'actionOpenTrunk_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionOpenTrunk_blueTooth','')
                    bfClient.getUserAppData_control({
                        item: '后备箱',
                        status: '开',
                        vin: me.vin
                    })
                    break;
                //启动引擎
                case 'actionStartEngine_blueTooth':
                    window.actionStartEngine_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionStartEngine_blueTooth(JSON.stringify({}),'actionStartEngine_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionStartEngine_blueTooth','')
                    break;
                //熄火
                case 'actionStopEngine_blueTooth':
                    window.actionStopEngine_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionStopEngine_blueTooth(JSON.stringify({}),'actionStopEngine_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('actionStopEngine_blueTooth','')
                    break;
                //寻车
                case 'actionSearchVeicle_blueTooth':
                    window.actionSearchVeicle_blueTooth_bluetooth_index = function(data){
                        me.uiRemoveChrysanthemum()
                        if(data.code != '200'){
                            if($('.notification').html() != data.msg){
                                Notification.show({
                                    type:'info',
                                    message: data.msg,
                                })
                            }
                        } else {
                            if($('.notification').html() != '指令发送成功'){
                                Notification.show({
                                    type:'info',
                                    message: '指令发送成功',
                                })
                            }
                        }
                    }
                    OSApp.actionSearchVeicle_blueTooth(JSON.stringify({}),'actionSearchVeicle_blueTooth_bluetooth_index')
                    OSApp.setStatistics('actionSearchVeicle_blueTooth','')

                    break;
                case 'whistle0_blueTooth':
                    window.whistle0_blueTooth_bluetooth_index = function(data){
                       me.uiRemoveChrysanthemum()
                       if(data.code != '200'){
                           if($('.notification').html() != data.msg){
                               Notification.show({
                                   type:'info',
                                   message: data.msg,
                               })
                           }
                       } else {
                           if($('.notification').html() != '指令发送成功'){
                               Notification.show({
                                   type:'info',
                                   message: '指令发送成功',
                               })
                           }
                       }
                    }
                    OSApp.whistle0_blueTooth(JSON.stringify({}),'whistle0_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('whistle0_blueTooth','')
                    bfClient.getUserAppData_control({
                        item: '闪灯',
                        status: '开',
                        vin: me.vin
                    })

                   break;
                case 'whistle1_blueTooth':
                    window.whistle1_blueTooth_bluetooth_index = function(data){
                       me.uiRemoveChrysanthemum()
                       if(data.code != '200'){
                           if($('.notification').html() != data.msg){
                               Notification.show({
                                   type:'info',
                                   message: data.msg,
                               })
                           }
                       } else {
                           if($('.notification').html() != '指令发送成功'){
                               Notification.show({
                                   type:'info',
                                   message: '指令发送成功',
                               })
                           }
                       }
                    }
                    OSApp.whistle1_blueTooth(JSON.stringify({}),'whistle1_blueTooth_bluetooth_index')
                    // OSApp.setStatistics('whistle1_blueTooth','')
                    bfClient.getUserAppData_control({
                        item: '闪灯鸣笛',
                        status: '开',
                        vin: me.vin
                    })
                    
                   break;
            }
        }

        cls.touchStartLong = function(e){
            this.pp_touchLongType = $(e.currentTarget).attr('data-touch');
            this.pp_touchLongTime = moment().valueOf();
            this.pp_touchLongIsFirst = true;
            this.pp_touchLongKey = window.setInterval(this.touchEvent.bind(this),200)

        }

        cls.touchMoveLong = function(e){

        }

        cls.touchEvent = function(){
            if(moment().valueOf() - this.pp_touchLongTime > 550){
                if(this.pp_touchLongIsFirst == true){
                    this.pp_touchLongIsFirst = false
                    this.onControlBtn(undefined,this.pp_touchLongType,true)
                } else {
                    if(this.pp_touchLongType == 'actionLongLock_blueTooth'){
                        OSApp.actionLongLock_blueTooth(JSON.stringify({}))
                    } else if(this.pp_touchLongType == 'actionLongUnlock_blueTooth'){
                        OSApp.actionLongUnlock_blueTooth(JSON.stringify({}))
                    }
                }
            }
        }

        cls.touchEndLong = function(e){
            window.clearInterval(this.pp_touchLongKey)
            if(moment().valueOf() - this.pp_touchLongTime < 200){
              this.onControlBtn(undefined,this.pp_touchLongType)  
            }
        }

        cls.onClickRight = function(){
            bfNaviController.push('bluetooth/help.html')
        }
        cls.onViewPush = function(pushFrom, pushData){
            if(pushData && pushData.vin){
                this.vin = pushData.vin
            }
        }
        cls.posGenHTML=function(){
            var me = this;
            window.__blueToothStateUpdate = function(data){
                if(data == 3){
                   me.bluetoothStaus = true; 
                   setTimeout(function(){
                    me.connectbt_blueTooth()
                   },300)
               } else {
                   me.bluetoothStaus = false;
                   me.$('.bluetoothPasscode').hide();
                   $('#bluetoothView .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
                   // me.stopGetConnectStatus_blueTooth()
               }
            };
            this.mobile = bfDataCenter.getUserMobile();
            if(this.vin == ''){
                this.$('.share-bluetooth').show()
                this.vin = bfDataCenter.getCarData().vin;
            } else {
                this.$('.share-bluetooth').hide()
            }
            this.$('#navTitle').html('蓝牙钥匙')
            this.initData()
        };
        cls.swithFire = function(data){
            var me = this;
            setTimeout(function(){
                me.$('#switch-fire').prop("checked",data);
            },0)
        };
        cls.swithDoorLeft = function(data){
            var me = this;
            setTimeout(function(){
                me.$('#switch-door-left').prop("checked",data);
            },0)
        }
        cls.swithDoorRight = function(data){
            var me = this;
            setTimeout(function(){
                me.$('#switch-door-right').prop("checked",data);
            },0)  
        }
        cls.onShow = function (options) {
            var me = this;
            if(options && options.isNoTbox == 'true'){
                this.$el.find('.page').addClass('isNoTbox')
            }

            
            
        };
        cls.onShare = function(){
            bfNaviController.push('bluetooth/shared.html')
        };
        cls.onChangeSwitch = function(e){
            var me = this;
            var $input = $(e.currentTarget).parent().find('input');
            var dataType = $input.attr('data-type')
            var openStutas = $input.prop("checked")
            if(dataType == 'door-left'){
                if(openStutas){
                    me.onControlBtn(undefined,'actionLeftSlidingDoor_blueTooth');
                } else {
                    me.onControlBtn(undefined,'actionLeftSlidingDoor_blueTooth');
                }
            } else if(dataType == 'door-right'){
                if(openStutas){
                    me.onControlBtn(undefined,'actionRightSlidingDoor_blueTooth');
                } else {
                    me.onControlBtn(undefined,'actionRightSlidingDoor_blueTooth');
                }
            } else if(dataType == 'fire'){
                if(openStutas){
                    me.onControlBtn(undefined,'actionStopEngine_blueTooth');
                } else {
                    me.onControlBtn(undefined,'actionStartEngine_blueTooth');
                }
            }
        };
        // 显示失败的界面 
        cls.show_UIerror = function(){
            var me = this;
            me.uiRemoveChrysanthemum()
            me.$('.content .content-success').hide()
            me.$('.content .content-faile').show()
        }
        cls.show_UIsuccess = function(){
            var me = this;
            me.uiRemoveChrysanthemum()
            me.$('.content .content-success').show()
            me.$('.content .content-fail').hide()
            me.initSwiper()
            setTimeout(function(){
          

                CarResource.checkCarUniqueRescore(function (defaultPicture,isNeedCB,needOtheranimate) {
                    me.$('.yubiao-icon').hide()
                     me.iframe_ht_1 = me.$('#iframe_test_1');
                      me.iframe_ht_1.show()
                      me.iframe_ht_1.attr('src',CarResource.appDirecotry() + 'f201/index.html')
                      var iframe = me.iframe_ht_1.get(0);
                      me.threeD = iframe;
                      window.threeD11 = iframe;  
                }, function () {
                    me.$('.yubiao-icon').show()
                }, progress,undefined,'f201');

            },400)
            setTimeout(function(){
                window.__getBlueToothStateByBlueeIndexView = function(data){
                 if(deviceIsIOS){
                    me.__powerstatus_blueetooth = data.BCM_PowerStatusFeedback;
                 }else{
                  me.__powerstatus_blueetooth = data.bCM_PowerStatusFeedback;
                 }
                 me.__blueCarStatus = data;

                    if(me.threeD){
                        me.threeD.contentWindow.openDoor('qlc', data.driverDoorStatus?1:0);   //车门打开状态
                        me.threeD.contentWindow.openDoor('hlc', data.leftRearDoorStatus?1:0);
                        me.threeD.contentWindow.openDoor('qrc', data.passengerDoorStatus?1:0);
                        me.threeD.contentWindow.openDoor('hrc', data.rightRearDoorStatus?1:0);
                        me.threeD.contentWindow.openDoor('bc', data.trunkStatus?1:0);     //后备箱打开状态

                        me.threeD.contentWindow.openWindows('qlbc', data.driverWindowStatus==0?0:1,data.driverWindowStatus);      //四门车窗打开状态
                        me.threeD.contentWindow.openWindows('hlbc', data.leftRearWindowStatus==0?0:1,data.leftRearWindowStatus);
                        me.threeD.contentWindow.openWindows('qrbc', data.passengerWindowStatus==0?0:1,data.passengerWindowStatus);
                        me.threeD.contentWindow.openWindows('hrbc', data.rightRearWindowStatus==0?0:1,data.rightRearWindowStatus);
                        me.threeD.contentWindow.openWindows('tcc', data.sunroofStatus?1:0,data.sunroofStatus?1:0);   //天窗
                        me.threeD.contentWindow.openLock && me.threeD.contentWindow.openLock(data.driverDoorLockStatus);  
                    }
                    
                } 
            },800)
        }
        cls.bindCar_bluetooth_before = function(){
            var me = this;
            bfClient.winmu_getSN({
                data: {
                    vin: me.vin,
                }, 
                success: function(data){
                    if(data.code == 0){
                        me.bindCar_bluetooth(data.data.sn);
                    } else {
                        me.show_UIerror()
                        Notification.show({
                            type:'info',
                            message:data.data,
                        })
                    }
                },
                error: function(){
                    me.show_UIerror()
                }
            })
        }
        cls.bindCar_bluetooth = function(sn){
            var me = this;
            bfClient.winmu_bindCar({
                data: {
                    phone: me.mobile,
                    vin: me.vin,
                    sn: sn
                }, 
                success: function(data){
                    if(data.code == 0){
                        me.initData(undefined,true);
                    } else {
                        me.show_UIerror()
                        Notification.show({
                            type:'info',
                            message:data.msg,
                        })
                    }
                },
                error: function(){
                    me.show_UIerror()
                }
            })
        }
        // 登录失败，sdk注册( 1.获取checkCode  2.注册sdk)
        cls.register_bluetooth = function(checkCode){
            var me = this;
            bfClient.winmu_syncUser({
                data: {
                    phone: me.mobile,
                    checkCode: checkCode
                }, 
                success: function(data){
                    if(data.code == 0){
                        me.initData(undefined,true);
                    } else {
                        me.show_UIerror()
                        Notification.show({
                            type:'info',
                            message:data.msg,
                        })
                    }
                },
                error: function(){
                    me.show_UIerror()
                }
            })
        
        }
        cls.startGetConnectStatus_blueTooth = function(){
            var me = this;
            if(!me.setIntervalKey){
                window.getConnectStatus_blueTooth_bluetooth_index_22qwewqe = function(data){
                    if(data.data == "true" || data.data == '1'){
                         $('#bluetoothView .content .blueetoothStatus-wrap-icon').addClass('active').removeClass('loading');
                            me.$('.bluetoothPasscode').hide();
                        // me.startGetConnectStatus_blueTooth()
                    } else {
                        $('#bluetoothView .content .blueetoothStatus-wrap-icon').removeClass('active');
                        if((deviceIsIOS || (OSApp.isAndroidNeedCode && OSApp.isAndroidNeedCode('','')) )  && me.$('.bluetoothPasscode span').html() && me.bluetoothStaus){
                            me.$('.bluetoothPasscode').show();
                        }
                        // me.stopGetConnectStatus_blueTooth()
                    }
                }
                me.setIntervalKey = window.setInterval(function(){
                    OSApp.getConnectStatus_blueTooth(JSON.stringify({}),'getConnectStatus_blueTooth_bluetooth_index_22qwewqe')
                },500)
            }
        }
        cls.stopGetConnectStatus_blueTooth = function(){
            var me = this;
            if(me.setIntervalKey){
                clearInterval(me.setIntervalKey);
                me.setIntervalKey = undefined;
            }
             
        }
        // 设置默认车辆
        cls.setdefaultvehicle_blueTooth = function(){
            var me = this;
            window.setdefaultvehicle_blueTooth_bluetooth_index = function(data){
                if(data.code == 200){
                    // 连接蓝牙
                    var $blueeIcon = $('#bluetoothView .content .blueetoothStatus-wrap-icon');
                    if($blueeIcon.hasClass('active') || $blueeIcon.hasClass('loading')){
                        console.log('1')
                    } else {
                         $blueeIcon.addClass('loading')
                         setTimeout(function(){
                             $blueeIcon.removeClass('loading')
                         },12000)
                    }
                    if(typeof OSApp !== 'undefined'){
                         OSApp.cancelConnect_blueTooth(JSON.stringify({}));
                     }
                    me.connectbt_blueTooth()
                    me.show_UIsuccess();
                } else {
                    me.show_UIerror()
                    Notification.show({
                        type:'info',
                        message: 'SDK设置默认车辆失败',
                    })
                }
            }
            OSApp.setdefaultvehicle_blueTooth(JSON.stringify({
                vin: me.vin
            }),'setdefaultvehicle_blueTooth_bluetooth_index')
        }
        cls.connectbt_blueTooth = function(sucessFn){
            var me = this;
            window.getBlueToothStatus_blueTooth_bluetooth_index = function(data){
               if(data.data == "true"){
                    me.bluetoothStaus = true;
                    window.connectbt_blueTooth_bluetooth_index = function(data){
                        // me.$('.bluetoothPasscode').hide();
                        if(data.code == '200'){
                            $('#bluetoothView .content .blueetoothStatus-wrap-icon').addClass('active').removeClass('loading');
                           
                            sucessFn && sucessFn()
                        } else {
                            $('#bluetoothView .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
                            // me.uiRemoveChrysanthemum()
                            // if($('.notification').html() != '蓝牙连接失败，请靠近车辆再试'){
                            //     sucessFn && Notification.show({
                            //         type:'info',
                            //         message: '蓝牙连接失败，请靠近车辆再试',
                            //     })
                            // }
                        }
                    }
                    OSApp.connectbt_blueTooth(JSON.stringify({
                        vin: me.vin,
                        phone: me.mobile
                    }),'connectbt_blueTooth_bluetooth_index')
               } else {
                    me.bluetoothStaus = false;
                    $('#bluetoothView .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
               }
            }
            OSApp.getBlueToothStatus_blueTooth(JSON.stringify({
            }),'getBlueToothStatus_blueTooth_bluetooth_index')

            window.getpasscode_blueTooth_bluetooth_index = function(data){
                if(data.data){
                    // me.$('.bluetoothPasscode').show();
                    me.$('.bluetoothPasscode span').html(data.data)
                } else {
                    // me.$('.bluetoothPasscode').hide();
                    me.$('.bluetoothPasscode span').html('')
                }
            }
           OSApp.getpasscode_blueTooth && OSApp.getpasscode_blueTooth(JSON.stringify({
               vin: me.vin
           }),'getpasscode_blueTooth_bluetooth_index')


            me.startGetConnectStatus_blueTooth()

   
            
        }
        // 初始化sdk数据 （1.获取checkCode 2.登录sdk）
        cls.initData = function(e,noNeed){
            var me = this;
            if(!noNeed){
                me.isNoNeed = 0;
            } else {
                me.isNoNeed = me.isNoNeed + 1;
            }
            me.$('.content .content-success').hide()
            me.$('.content .content-faile').hide()
            me.uiAddChrysanthemum()
            if(window.__currentIs4G()){
                bfClient.winmu_getCheckCode({
                    data: {
                        phone: me.mobile,
                    },
                    success: function(data){
                        if(data.code == 0){
                            var checkCode = data.data;
                            bfClient.winmu_syncUser({
                                data: {
                                    phone: me.mobile,
                                    checkCode: checkCode
                                }, 
                                success: function(data){
                                    if(data.code == 0){
                                        if(typeof OSApp == 'undefined'){
                                            me.show_UIsuccess();
                                             // me.$('.content .content-success').hide()
                                             //   me.$('.content .content-faile').show()
                                        } else {
                                            window.loginandgetdata_blueTooth_bluetooth_index = function(data){
                                                if(data.code == 200){
                                                    me.setdefaultvehicle_blueTooth();
                                                } else if(data.code == 511 && me.isNoNeed <= 3){
                                                    me.register_bluetooth(checkCode)
                                                } else if(data.code == 1011 && me.isNoNeed <= 3){
                                                    me.bindCar_bluetooth_before(checkCode)
                                                } else {
                                                    me.show_UIerror()
                                                    Notification.show({
                                                        type:'info',
                                                        message:data.msg,
                                                    })
                                                }
                                           }
                                           OSApp.loginandgetdata_blueTooth(JSON.stringify({
                                               phone:me.mobile,
                                               vin: me.vin,
                                               checkCode: checkCode,
                                               token: window.localStorage['token']
                                           }),'loginandgetdata_blueTooth_bluetooth_index') 
                                        }
                                    } else {
                                        me.show_UIerror()
                                        Notification.show({
                                            type:'info',
                                            message:data.msg,
                                        })
                                    }
                                },
                                error: function(){
                                    me.show_UIerror()
                                }
                            })
                            
                            
                        } else {
                            me.show_UIerror()
                            Notification.show({
                                type:'info',
                                message:data.msg,
                            })
                        }
                    },
                    error: function(res){
                        me.show_UIerror()
                    }
                })
            } else {
                window.getVehicleListWithPhone_blueTooth_home_i2342342343324 = function(res){
                    if(res.code == '200'){
                        me.setdefaultvehicle_blueTooth();
                    } else {
                        me.show_UIerror()
                         Notification.show({
                            type:'info',
                            message: '离线设置默认车辆失败',
                        })
                    }
                }
                OSApp.getVehicleListWithPhone_blueTooth(JSON.stringify({  
                    phone: bfDataCenter.getUserMobile(),
                    checkCode: '',
                    token: window.localStorage['token']
                }), 'getVehicleListWithPhone_blueTooth_home_i2342342343324')
             }
        }
        // 拉数据的时候，添加菊花
        cls.uiAddChrysanthemum = function (msg) {
            var me = this;
            if (me.$('.content').eq(0).find('#chrysanthemumWarp').length === 0) {
                if(!msg){
                    msg = '正在加载，请耐心等待'
                }
                me.$('.content').eq(0).append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%;z-index:100;top:0'><div class='bf-chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 12px;color: white;margin-top: 55px;'>"+ msg +"</div></div></div>");
            }
        };
        // 删除菊花
        cls.uiRemoveChrysanthemum =function () {
            this.$('#chrysanthemumWarp').remove();
        };
        cls.onViewBack=function () {
        };
        cls.onRemove = function () {
            window.__getBlueToothStateByBlueeIndexView = undefined;
            this.stopGetConnectStatus_blueTooth()
            if(typeof OSApp !== 'undefined'){
                OSApp.cancelConnect_blueTooth(JSON.stringify({}));
            }
        }
        cls.onRight = function () {
     
        };
        return Base.extend(cls);
    }
);

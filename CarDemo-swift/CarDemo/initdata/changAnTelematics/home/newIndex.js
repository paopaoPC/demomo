/**
 * 首页由4个子view构成，对应四个html四个区域：诊断报告()、保养里程(mileView)、中间的油量区域(oilView)、底部的控制区域(swiperView)，每一个区域的主要逻辑封装在对应的子view中
 * 页面的刷新使用的是backbone的model驱动，即model的属性一旦变化，便会触发相应的chang事件，执行相应的回调。
 * model的初始化在posGenHTML中；model的chang事件绑定是在各个子View的initialize中；
 */

define(
    [
        'backbone',
        "text!home/newIndex.html",
        'common/navView',
        'toolkit/newIndex',
        'shared/js/scroll-pull-down',
        'shared/js/swiper_two',
        'shared/js/notification',
        "shared/plugin_dialog/js/dialog",
        "shared/plugin_dialogOld/js/dialog",
        // 'control/air',
        // 'control/autoAir',
        // 'control/remote',
        // 'control/carWindows',
        'control/index',
        'common/ssUtil',
        "iscroll",
        "common/control-cmd",
        "appTheme/changeCarType",
        'shared/progress/progress',
        //"home/globalFunc",
    ],
    function (Backbone,template,View,Toolkit,ScrollPullDown,Swiper,Notification,dialog,oldDialog,controlIndex,ssUtil,iscroll,controlCmd ,CarResource,progress) {
    // function (Backbone,template,View,Toolkit,ScrollPullDown,Swiper,Notification,dialog,oldDialog,Air,autoAir,Remote,CarWindows,controlIndex,ssUtil,iscroll,controlCmd ,CarResource,progress) {
        var Base = View;

        //是否能刷新的标志位，避免反复刷新
        var canRefresh = true;

        /**controllRuning用来表示是否正在发送控制指令中，值有布尔值和字符两种类型
         * @type {string} 有'door','air','dormer'，'whistle'表示控制的对象
         * @type {boolean} 为false，则表示没有进入到控制过程
         */
        // var controlRunning = false;
        window.controlRunning = false;
        window.carstatus_ljc = 0;   //车辆点火状态
        window.__getIs3DShow__ = function(data){
            if(data == 'v302' || data == 'f201'){
                return true
            } else {
                return false
            }
        }

        //backbone原set方法只有在属性值发生变化才触发相应‘change’事件;
        //在原来基础上添加参数trigger,若为true,则无论属性值是否变化都会触发相应的change事件，为false则与Backbone的原set方法一样。
        var Model = Backbone.Model.extend({
            set:function (prop,value,options) {
                var params = {};
                if(typeof(prop) == 'string') {
                    options = options ? options : {};
                    params[prop] = value;
                } else if(typeof(prop) == 'object'){
                    options = value ? value : {};
                    params = prop;
                } else { return this};

                if(options.trigger) {
                    Backbone.Model.prototype.set.call(this, params, {silent: true});
                    var array = Object.keys(params);
                    for(var i=0, length=array.length; i<length; i++){
                        this.trigger('change:'+array[i],this,params[array[i]]);
                    }
                }else{
                    Backbone.Model.prototype.set.call(this, params,options);
                }
            }
        });

        var model = new Model();
        var controlCmds = {
            ac_quick: 2,
            air_purify_quick: 5,
            alarm_quick: 1,
            flash_light_quick: 1,
            lock_solutuin_quick: 1,
            sunroof_quick: 6,
            window_quick: 4
        }
        var newControlIndexs = [1,2,3,4,5,6];
        var newRemoteConfigObject = [];

        var cls = {
            id: "home",
            html: template,
            model:model,
            events: {
                'click #controlListView .CLV-button-warp':'onControlDetail',
                'click .change3DView': 'onChange3DView',
                'click .blueetoothStatus-wrap-icon': 'onConnectEvent',
                'click .sharedBluee-top-close': 'sharedBlueeTopContent',
                'click .sharedBluee-top-content': 'sharedBlueopClose',

            },
            isLoginBlueTooth: {}
        };
        cls.sharedBlueopClose = function(){
            if(window.threeDDD && window.threeDDD.contentWindow){
                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
             }
             $('#home .sharedBluee-top').hide()
            bfNaviController.push('/cars/index.html',{
                RemoteControl: this._RemoteControl,
                isTwo: true
            });
        }
        cls.sharedBlueeTopContent = function(){
            $('#home .sharedBluee-top').hide()
        }
        cls.initSwiper = function(){
            var me = this;
            // if(!me.first){
                setTimeout(function(){
                    me._mySwiper = new Swiper (me.$('#swiper22')[0], {
                        direction: 'vertical',
                        loop: false,
                        initialSlide: 0,
                        // 如果需要分页器
                        pagination: '#home .content .swiper-pagination',
                        onSlideChangeEnd: function(swiper){
                            // me.getControlStatussyn(); 
                        }
                    })
                    // _.each(controlIndexs,function(item,index){
                    //     if(_.indexOf(me._controlIndexs,item)<0){
                    //         me._mySwiper && me._mySwiper.removeSlide(item-1)
                    //     }
                    // })
                },0)
                setTimeout(function(){
                    me.initSVG();
                    me.initMobiscrollAuction()
                },500)
                // me.first = true;
            // }
        };
        // 拉数据的时候，添加菊花
        cls.uiAddChrysanthemum_blueetooth = function (msg) {
            var me = this;
            if (me.$('.content').eq(0).find('#chrysanthemumWarp').length === 0) {
                if(!msg){
                    msg = '正在加载，请耐心等待'
                }
                me.$('.content').eq(0).append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%;z-index:100;top:0'><div class='bf-chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 12px;color: white;margin-top: 55px;'>"+ msg +"</div></div></div>");
            }
        };
        // 删除菊花
        cls.uiRemoveChrysanthemum_blueetooth =function () {
            this.$('#chrysanthemumWarp').remove();
        };
        /**
         * 用svg画出遮罩层
         * 其本质用线画了个圆，但线的宽度超过了原的半径
         * stroke-dasharray和stroke-dashoffset是关键，如何使用就去问度娘了
         */
        cls.initSVG =function () {
            var me=this;
            var W=50;
            var P=Math.PI;
            var $path = me.$('.slider-svg path');
            var $svg = me.$('.slider-svg');
            var path = ['M'+(0.5*W)+' 0','a'+0.5*W+' '+0.5*W+',0,1,0,0.5 0 Z'];
            $svg.attr({'width':1*W,'height':1*W,'stroke-width':1*W});
            $path.attr('d',path.join(' '));
            me.svgLength=1*W*P+2;
            $path.css({'stroke-dasharray':me.svgLength,'stroke-dashoffset':0,'stroke':'rgba(2, 23, 48, 0.8)'});
        }
        cls.onChange3DView = function(e){
            var me = this;
            var iframe_ht = $('#iframe_test');
            var Path = CarResource.ResourcePath();
            var oilview =  this.$('#oilView')

            var $el = $(e.currentTarget);
            var isActive = $el.hasClass('active');
            if(isActive){//关闭3D
                $el.removeClass('active')
                if(iframe_ht){
                    window.localStorage['3Dstatus'] = false;
                    cls.refresh3Dstatus = true;
                    iframe_ht.attr("src", "");
                    iframe_ht.css("visibility", "hidden");
                    oilview.css("visibility", "visible");
                    me.$('.oilView_car.main_car').css('background-image','url(' + me.pp_defaultPicture + ')')
                    if(iframe_ht.get(0).contentWindow){ 
                        // iframe_ht.get(0).contentWindow.document.write("");
                        // iframe_ht.get(0).contentWindow.document.clear();
                        iframe_ht.get(0).contentWindow.document.body.innerHTML ="";
                    }   
                    this.onShow();
                }
            } else{//打开3D
                Notification.show({
                    type:"info",
                    message:"打开3D手机性能可能会变差哟"
                });
                $el.addClass('active');
                window.localStorage['3Dstatus'] = true;
                cls.refresh3Dstatus = false;
                // alert(Path);
                iframe_ht.attr("src", Path + "index.html");
                var iframe = iframe_ht.get(0);
                cls.threeD = iframe;
                window.threeDDD = iframe;
                iframe_ht.css("visibility", "visible");
                oilview.css("visibility", "hidden");
                // setTimeout(this.onShow(),3000);
                this.onShow();
            }
        },
        cls.initMobiscrollAuction = function(){
            var me = this;
            $(me.$el.find('#auctionType0')).mobiscroll().scroller({ 
                theme: "ios",
                display: 'bottom',
                animate: false,
                buttons: [{ 
                    text: '确定',
                    handler: "set"
                }, 'cancel'],
                context: me.$el,
                height: 78,
                showLabel: false,
                wheels:  [
                    [{
                        keys: [0, 1],
                        values: ['制冷','制热']
                    }, {
                        keys: [3, 2, 1],
                        values: ['高级','中级','低级']
                    }]
                ],
                onBeforeShow: function(inst){
                 
                },
                onSelect: function(valueText, inst) {
                    if(window.localStorage['engineStatus'] == "fault"){
                        dialog.createDialog({
                            closeBtn: false,
                            buttons: {
                                '知道了': function () {
                                    this.close();
                                    this.destroy();
                                },
                            },
                            content: "<p>发动机状态异常，空调打开失败</p>"
                        });
                        return
                    }
                    var valueArr = valueText.split(" ");
                    var airModel = valueArr[0];
                    var windPower = valueArr[1];
                    me.uiAddChrysanthemum()
                    controlCmd.ControlAir(true,{data:{airModel: airModel,windPower:windPower}},me._inner_options);
                }
            });


            var _data = {
                    theme: "ios",
                    mode: "scroller",
                    display: "bottom",
                    animate: false,
                    buttons: [{ 
                        text: '确定',
                        handler: "set"
                    }, 'cancel'],
                    lang: "zh",
                    height: 78,
                    context: me.$el,
                    inputClass: "auction-input",
                    onBeforeShow: function(inst){
                        if (me._temperature) {
                            inst.setVal(me._temperature);
                        }
                        inst.refresh()
                    },
                    onShow: function(inst) {},
                    onSelect: function(value, inst) {
                        if(window.localStorage['engineStatus'] == "fault"){
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '知道了': function () {
                                        this.close();
                                        this.destroy();
                                    },
                                },
                                content: "<p>发动机状态异常，空调打开失败</p>"
                            });
                            return
                        }
                        me.uiAddChrysanthemum()
                        controlCmd.ControlAir(true,{data:{temperature:inst._tempValue}},me._inner_options);
                    }
            };
            $(me.$el.find('#auctionType')).mobiscroll().select(_data);
        }
        cls.onControlDetail = function(e){
            var me = this;
            var cmd = $(e.currentTarget).children().attr('data-value');
            if(cmd == 'send_car_quick'){
                // navigator.appInfo.openCarLocationView({showControl:"true"});//true为TBox车，false为非tBox
                // setTimeout(refreshCarLocation());
                // OSApp.openCarLocationView({showControl:"true"});//true为TBox车，false为非tBox
                OSApp.openCarLocationView('{showControl:"true"}');//true为TBox车，false为非tBox
                setTimeout(refreshCarLocation(),500);
                return
            }
            if(cmd == 'ac_quick'){
                if(me._RemoteControl.ac == 1){
                    var controlIndex = 2;
                } else if(me._RemoteControl.ac == 2) {
                    var controlIndex = 3;
                }
            } else {
                var controlIndex = controlCmds[cmd];
            }
            this.goToControlDetail({newControlIndexs:newControlIndexs,controlIndex:controlIndex},model,me._RemoteControl,me.pp_defaultPicture,me.pp_isNeedCB,me.pp_needOtheranimate)
        },
        cls.goToControlDetail = function(options,model,RemoteControl,defaultPicture,isNeedCB,needOtheranimate){
            var me = this
            if(!options || !options.newControlIndexs || options.newControlIndexs.length<=0 ){
                Notification.show({
                    type:"error",
                    message:"当前该车型无控制选项"
                });
                return
            }
            // if(window.threeDDD && window.threeDDD.contentWindow){
                        //    window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                        // }
            if(!me.controlIndex){
                me.controlIndex = new controlIndex(options,model,RemoteControl,bfDataCenter.getCarId(),defaultPicture,isNeedCB,needOtheranimate);
            } else {
                if(me.controlIndex.carId == bfDataCenter.getCarId()){
                    me.controlIndex.show();
                    me.controlIndex.onShow({controlIndex:options.controlIndex,defaultPicture:defaultPicture,isNeedCB:isNeedCB,needOtheranimate:needOtheranimate})
                } else {
                    me.controlIndex.$el.remove()
                    delete me.controlIndex
                    me.controlIndex = new controlIndex(options,model,RemoteControl,bfDataCenter.getCarId(),defaultPicture,isNeedCB,needOtheranimate);
                }
                
            }
        },
        // cls.change3Dxx =function(carID){
            // var data = bfDataCenter.getCarList()
            // var length = data.length;
            // for(var i=0;i<length;i++){
            //     if(carID == data[i].carId){
            //         if(data[i].carUniqueCode == 'v301-s'){

            //         } else {

            //         }
            //     }
            // }
            // }
        // }
        //获取被分享车辆
        cls.showSharCarList = function(){
            var me = this;
            //先获取checkCode
             // var bluetoothMyinfo = bfDataCenter.getUserData().myInfo;
             if(window.__currentIs4G()){
                bfClient.winmu_getCheckCode({
                   data: {
                       phone: window.localStorage['userMobile'],
                   },
                   success: function(data){
                       if(data.code == 0){ 
                           //获取checkCode成功
                           var checkCode = data.data;
                           // var bluetoothMyinfo = bfDataCenter.getUserData().myInfo;
                           //同步checkCode
                           bfClient.winmu_syncUser({
                               data: {
                                   phone: window.localStorage['userMobile'],
                                   checkCode: checkCode
                               }, 
                               success: function(data){
                                   if(data.code == 0){
                                       window.getVehicleListWithPhone_blueTooth_home_index_1qweqweqwe = function(res){
                                           if(res.code == '200'){
                                               //让loding看不到
                                               me._sharDataList = res.data;//把车辆列表存入sharDataList
                                               if(res.data.length>0){
                                                   $('#home .sharedBluee-top').show()
                                               } else {
                                                   $('#home .sharedBluee-top').hide()
                                               }
                                           }
                                       }
                                       OSApp.getVehicleListWithPhone_blueTooth(JSON.stringify({  
                                           phone: bfDataCenter.getUserMobile(),
                                           checkCode: checkCode,
                                           token: window.localStorage['token']
                                       }), 'getVehicleListWithPhone_blueTooth_home_index_1qweqweqwe')
                                   }
                               },
                                error: function(){
                               }    
                           })    


                          
                       }else{
                           //获取checkCode失败
                           me.getElement(".swiper-message-nav").css('display', 'none');
                           // me.getElement(".content").css('top', '0px');
                       }
                   },
                   error: function(res){
                       //获取checkCode失败
                       me.getElement(".swiper-message-nav").css('display', 'none');
                       // me.getElement(".content").css('top', '0px');
                   }
                })
             } else {
                window.getVehicleListWithPhone_blueTooth_home_index_1qweqweqwe = function(res){
                    if(res.code == '200'){
                        //让loding看不到
                        me._sharDataList = res.data;//把车辆列表存入sharDataList
                        if(res.data.length>0){
                            $('#home .sharedBluee-top').show()
                        } else {
                            $('#home .sharedBluee-top').hide()
                        }
                    }
                }
                OSApp.getVehicleListWithPhone_blueTooth(JSON.stringify({  
                    phone: bfDataCenter.getUserMobile(),
                    checkCode: '',
                    token: window.localStorage['token']
                }), 'getVehicleListWithPhone_blueTooth_home_index_1qweqweqwe')
             }
                

        }
        cls.posGenHTML = function () {
            var home = this;
            /**
             * app进入初始化时，会拉carList接口异步获取车辆信息，
             * 由于是异步操作，初次进入首页时，carlist接口便还没有返回结果。
             * bfDataCenter的'NEW_CAR_LIST'表示接口已有结果，所以首页的第一次刷新写在carLIst事件回调里。
             */
             // home.change3D = function(carID){
             //    home.change3Dxx(carID)
             // }
            home.homeNewCarList = function () {
                //只在‘首次’进入首页并‘没车’时跳转到车友圈
                // if(window.localStorage.getMainDatas&&!bfDataCenter.getCarId()&&!home.carLife){
                //     bfNaviController.current().view.uiShowTabItem(1);
                //     home.carLife=true;
                // };
                home.updateCarStatus({
                    start: function () {
                        console.log('开始菊花');
                        //111
                        home.uiAddChrysanthemum();
                    },
                    complete: function () {
                        home.uiRemoveChrysanthemum();
                        console.log('消除菊花');
                        setTimeout(function () {
                            if (navigator.splashscreen) {
                                navigator.splashscreen.hide();
                            }
                        },1000)
                    }
                })
            };
            
            bfDataCenter.on('NEW_CAR_LIST',home.homeNewCarList);
            // bfDataCenter.on("CURRENT_CARVIN_CHANGED", home.change3D);
            bfClient.getBaseConfigData({});
            //初始化model数据
            model.set({
                oil:'',
                mileage:'',
                updateTime:'',
                checkResult:'',
                position:'',
                carNumber:'',
                control:{
                    door:'',
                    air:'',
                    dormer:'',
                    whistle:'',
                },
                //这个door不单单指车门的状态，还包括天窗、车灯、后备箱等状态。
                //door与control的状态表示不同，比如door.LF表示车门的开关,而control表示车门是否落锁；所以两者状态并不一致
                door:{
                    LF: 0,
                    LB: 0,
                    RF: 0,
                    RB: 0,
                    lowBeam:0,
                    dormer:0,
                    trunk:0,
                    positionLamp:0,
                    turnLndicator:0,
                },
                swiperStatus:0, //表示车辆未点火、未激活等其他状态，其值为0~5之间，还有一种是'noCar'，表示帐号没有车辆
            }, {silent:true});


            //定义headerView,SwiperView，mileageView等5个view
            home.defineView(home);

            // home.newToolkit();//实例化服务界面
            window.__blueToothStateUpdate = function(data){
                if(data == 3){
                //     $('#home .SS-one-item-wrap-trunk').addClass('unable')
                //     $('#home .SS-one-item-wrap-slidingdoor').addClass('unable')
                   home.bluetoothStaus = true;


                   var $blueeIcon = $('#home .content .blueetoothStatus-wrap-icon');
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
                   


                   setTimeout(function(){
                    home.connectbt_blueTooth()
                   },300)
               } else {
                   home.bluetoothStaus = false;
                   me.$('.bluetoothPasscode').hide();
                   // $('#home .SS-one-item-wrap-trunk').removeClass('unable')
                   //  $('#home .SS-one-item-wrap-slidingdoor').removeClass('unable')
                   $('#home .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
                   // home.stopGetConnectStatus_blueTooth()
               }
            };
            window.__getBlueToothState = function(data){
                if(window.__getBlueToothStateByBlueeIndexView){
                    window.__getBlueToothStateByBlueeIndexView(data);
                } else {
                    if(deviceIsIOS){
                        home.__powerstatus_blueetooth = data.BCM_PowerStatusFeedback;
                    }else{
                     home.__powerstatus_blueetooth = data.bCM_PowerStatusFeedback;
                    }
                    home.__blueCarStatus = data;
                    window.threeDDD.contentWindow.openDoor('qlc', data.driverDoorStatus?1:0);   //车门打开状态
                    window.threeDDD.contentWindow.openDoor('hlc', data.leftRearDoorStatus?1:0);
                    window.threeDDD.contentWindow.openDoor('qrc', data.passengerDoorStatus?1:0);
                    window.threeDDD.contentWindow.openDoor('hrc', data.rightRearDoorStatus?1:0);
                    window.threeDDD.contentWindow.openDoor('bc', data.trunkStatus?1:0);     //后备箱打开状态

                    window.threeDDD.contentWindow.openWindows('qlbc', data.driverWindowStatus==0?0:1,data.driverWindowStatus);      //四门车窗打开状态
                    window.threeDDD.contentWindow.openWindows('hlbc', data.leftRearWindowStatus==0?0:1,data.leftRearWindowStatus);
                    window.threeDDD.contentWindow.openWindows('qrbc', data.passengerWindowStatus==0?0:1,data.passengerWindowStatus);
                    window.threeDDD.contentWindow.openWindows('hrbc', data.rightRearWindowStatus==0?0:1,data.rightRearWindowStatus);
                    window.threeDDD.contentWindow.openWindows('tcc', data.sunroofStatus?1:0,data.sunroofStatus?1:0);   //天窗
                    window.threeDDD.contentWindow.openLock && window.threeDDD.contentWindow.openLock(data.driverDoorLockStatus);   

                    if(data.driverDoorStatus != 0 || data.leftRearDoorStatus != 0 || data.passengerDoorStatus != 0 || data.rightRearDoorStatus != 0){
                        $('.LCCB-carDoor span').html('开').addClass('active')
                    } else {
                        $('.LCCB-carDoor span').html('关').removeClass('active')
                    }

                    if(data.driverWindowStatus != 0 || data.leftRearWindowStatus != 0 || data.passengerWindowStatus != 0 || data.rightRearWindowStatus != 0){
                        $('.LCCB-carWindow span').html('开').addClass('active')
                    } else {
                        $('.LCCB-carWindow span').html('关').removeClass('active')
                        
                    }

                    if(data.driverDoorLockStatus == '1'){
                        $('.SS-one-item-wrap-door.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                        $('.LCCB-carLock span').html('开').addClass('active')
                    } else if(data.driverDoorLockStatus == '0') {
                        $('.SS-one-item-wrap-door.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        $('.LCCB-carLock span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-door.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        $('.LCCB-carLock span').html('--').removeClass('active')
                    }
          

                    if(data.sunroofStatus == '1'){
                        $('.SS-one-item-wrap-dormer.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                        $('.LCCB-carDormer span').html('开').addClass('active')
                    } else if(data.sunroofStatus == '0') {
                        $('.SS-one-item-wrap-dormer.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        $('.LCCB-carDormer span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-dormer.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        $('.LCCB-carDormer span').html('--').removeClass('active')
                    }

                    if(control.trunkStatus == '1'){
                        $('.SS-one-item-wrap-trunk .SS-one-item').addClass('isOpenStatus')
                        $('.LCCB-trunk span').html('开').addClass('active')
                    } else if(control.trunkStatus == '0') {
                        $('.SS-one-item-wrap-trunk .SS-one-item').removeClass('isOpenStatus')
                        $('.LCCB-trunk span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-trunk .SS-one-item').removeClass('isOpenStatus')
                        $('.LCCB-trunk span').html('--').removeClass('active')
                    }


                }
               
            }
            setTimeout(function(){
                home.showSharCarList()
            },1000)
            // window.__getBlueToothState = function(data){
            //     if(me.pp_doorLeft != data.leftRearDoorStatus && data.leftRearDoorStatus != me.$('#switch-door-left').prop("checked") ){
            //         me.pp_doorLeft = data.leftRearDoorStatus;
            //         me.swithDoorLeft(data.leftRearDoorStatus)
            //     }
            //     if(me.pp_doorRight != data.rightRearDoorStatus && data.rightRearDoorStatus != me.$('#switch-door-right').prop("checked") ){
            //         me.pp_doorRight = data.rightRearDoorStatus;
            //         me.swithDoorRight(data.rightRearDoorStatus)
            //     }
            // }
        };
        // 初始化sdk数据 （1.获取checkCode 2.登录sdk）
        cls.initData = function(e,noNeed){
            var me = this;
            me.isLoginBlueTooth = {};
            if(!noNeed){
                me.isNoNeed = 0;
            } else {
                me.isNoNeed = me.isNoNeed + 1;
            }
            // me.$('.content .content-success').hide()
            // me.$('.content .content-faile').hide()

            if(window.__currentIs4G()){
                me.uiAddChrysanthemum()
                bfClient.winmu_getCheckCode({
                    data: {
                        phone: window.localStorage['userMobile'],
                    },
                    success: function(data){
                        if(data.code == 0){
                            var checkCode = data.data;
                            bfClient.winmu_syncUser({
                                data: {
                                    phone: window.localStorage['userMobile'],
                                    checkCode: checkCode
                                }, 
                                success: function(data){
                                    if(data.code == 0){
                                        if(typeof OSApp === 'undefined'){
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
                                               phone:window.localStorage['userMobile'],
                                               vin: bfDataCenter.getCarData().vin,
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
                                    Notification.show({
                                        type:'info',
                                        message:'蓝牙接口网络请求失败',
                                    })
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
                        Notification.show({
                            type:'info',
                            message:'蓝牙接口网络请求失败',
                        })
                    }
                })
            } else {
                me.setdefaultvehicle_blueTooth()
            }
            
        }
        // 显示失败的界面 
        cls.show_UIerror = function(){
            var me = this;
            me.uiRemoveChrysanthemum_blueetooth()
        }
        cls.show_UIsuccess = function(){
            var me = this;
            me.uiRemoveChrysanthemum_blueetooth()
        }
        // 设置默认车辆
        cls.setdefaultvehicle_blueTooth = function(noNetwork){
            var me = this;
            window.setdefaultvehicle_blueTooth_home_index_33 = function(data){
                if(data.code == 200){
                    // 连接蓝牙
                    me.isLoginBlueTooth = {};
                    me.isLoginBlueTooth[bfDataCenter.getCarData().vin] = true;

                    var $blueeIcon = $('#home .content .blueetoothStatus-wrap-icon');
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
            if(typeof OSApp == 'undefined'){
                me.show_UIsuccess();
            } else {
                OSApp.setdefaultvehicle_blueTooth(JSON.stringify({
                    vin: bfDataCenter.getCarData().vin
                }),'setdefaultvehicle_blueTooth_home_index_33')
            }
            
        }
        cls.bindCar_bluetooth_before = function(){
            var me = this;
            bfClient.winmu_getSN({
                data: {
                    vin: bfDataCenter.getCarData().vin,
                }, 
                success: function(data){
                    if(data.code == 0 && data.data){
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
                    Notification.show({
                        type:'info',
                        message:'蓝牙接口网络请求失败',
                    })
                }
            })
        }
        cls.bindCar_bluetooth = function(sn){
            var me = this;
            bfClient.winmu_bindCar({
                data: {
                    phone: window.localStorage['userMobile'],
                    vin: bfDataCenter.getCarData().vin,
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
                    Notification.show({
                        type:'info',
                        message:'蓝牙接口网络请求失败',
                    })
                }
            })
        }
        // 登录失败，sdk注册( 1.获取checkCode  2.注册sdk)
        cls.register_bluetooth = function(checkCode){
            var me = this;
            bfClient.winmu_syncUser({
                data: {
                    phone: window.localStorage['userMobile'],
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
                    Notification.show({
                        type:'info',
                        message:'蓝牙接口网络请求失败',
                    })
                }
            })
        }
        cls.onConnectEvent = function (argument) {
            var me = this;

            var $blueeIcon = $('#home .content .blueetoothStatus-wrap-icon');
            if($blueeIcon.hasClass('active') || $blueeIcon.hasClass('loading')){
                return
            }
            $blueeIcon.addClass('loading')
            setTimeout(function(){
                $blueeIcon.removeClass('loading')
            },12000)
            window.getBlueToothStatus_blueTooth_home_index_234234234 = function(data){
               if(data.data == "true"){
                    // $('#home .SS-one-item-wrap-trunk').addClass('unable')
                    // $('#home .SS-one-item-wrap-slidingdoor').addClass('unable')
                    me.bluetoothStaus = true;
                    me.connectbt_blueTooth()
               } else {
                    me.bluetoothStaus = false;
                    $('#home .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
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
            }),'getBlueToothStatus_blueTooth_home_index_234234234')
        }
        // 必须蓝牙钥匙配置
        cls.connectbt_blueTooth = function(sucessFn){
            var me = this;
            window.getBlueToothStatus_blueTooth_home_index_111 = function(data){
               if(data.data == "true"){
                    // $('#home .SS-one-item-wrap-trunk').addClass('unable')
                    // $('#home .SS-one-item-wrap-slidingdoor').addClass('unable')
                    me.bluetoothStaus = true;
                    window.connectbt_blueTooth_home_index_333 = function(data){
                        if(data.code == '200'){
                            // $('#home .SS-one-item-wrap-trunk').addClass('unable')
                            // $('#home .SS-one-item-wrap-slidingdoor').addClass('unable')
                            $('#home .content .blueetoothStatus-wrap-icon').addClass('active').removeClass('loading');
                            sucessFn && sucessFn()
                        } else {
                            // $('#home .SS-one-item-wrap-trunk').removeClass('unable')
                            // $('#home .SS-one-item-wrap-slidingdoor').removeClass('unable')
                            $('#home .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
                            // if($('.notification').html() != '蓝牙连接失败，请靠近车辆再试'){
                            //     sucessFn && Notification.show({
                            //         type:'info',
                            //         message: '蓝牙连接失败，请靠近车辆再试',
                            //     })
                            // }
                        }
                    }
                    if(me.isBlueToothCar == true && me.isLoginBlueTooth[bfDataCenter.getCarData().vin] == true){
                        OSApp.connectbt_blueTooth(JSON.stringify({
                            vin: bfDataCenter.getCarData().vin,
                            phone: window.localStorage['userMobile']
                        }),'connectbt_blueTooth_home_index_333')
                    }
               } else {
                    me.bluetoothStaus = false;
                    $('#home .content .blueetoothStatus-wrap-icon').removeClass('active').removeClass('loading');
                    // $('#home .SS-one-item-wrap-trunk').removeClass('unable')
                    // $('#home .SS-one-item-wrap-slidingdoor').removeClass('unable')
               }
            }
            OSApp.getBlueToothStatus_blueTooth(JSON.stringify({
            }),'getBlueToothStatus_blueTooth_home_index_111')

            window.getpasscode_blueTooth_home_index_222 = function(data){
                if(data.data){
                    // me.$('.bluetoothPasscode').show();
                    me.$('.bluetoothPasscode span').html(data.data)
                } else {
                    // me.$('.bluetoothPasscode').hide();
                    me.$('.bluetoothPasscode span').html('')
                }
            }
           OSApp.getpasscode_blueTooth && OSApp.getpasscode_blueTooth(JSON.stringify({
               vin: bfDataCenter.getCarData().vin
           }),'getpasscode_blueTooth_home_index_222')
           
            me.startGetConnectStatus_blueTooth()

        }
        // 开始遍历蓝牙状态
        cls.startGetConnectStatus_blueTooth = function(){
            var me = this;
            if(!me.setIntervalKey){
                window.getConnectStatus_blueTooth_home_index_22 = function(data){
                    if(data.data == "true" || data.data == '1'){
                        $('#home .content .blueetoothStatus-wrap-icon').addClass('active').removeClass('loading');
                        me.$('.bluetoothPasscode').hide();
                    } else {
                        $('#home .content .blueetoothStatus-wrap-icon').removeClass('active');
                        if((deviceIsIOS || (OSApp.isAndroidNeedCode && OSApp.isAndroidNeedCode('','')) ) && me.$('.bluetoothPasscode span').html() && me.bluetoothStaus && me.isBlueToothCar){
                            me.$('.bluetoothPasscode').show();
                        }
                    }
                }
                me.setIntervalKey = window.setInterval(function(){
                    OSApp.getConnectStatus_blueTooth(JSON.stringify({}),'getConnectStatus_blueTooth_home_index_22')
                },500)
            }
        }
        // 停止遍历蓝牙状态
        cls.stopGetConnectStatus_blueTooth = function(){
            var me = this;
            if(me.setIntervalKey){
                clearInterval(me.setIntervalKey);
                me.setIntervalKey = undefined;
            }
             
        }
        cls.onShow=function(){
        	ssUtil.clear("copLastMile");
            ssUtil.clear("copSpaceMile");
            if(!this.firstOnshow && window.localStorage['fromPush']){
                if(window.localStorage['fromPush'] == 2){
                    OSApp.openCarLocationView('{showControl:"true"}');
                    setTimeout(refreshCarLocation(),500);
                    return
                } else if(window.localStorage['fromPush'] == 3){
                    bfNaviController.push('toolkit/newIndex.html',{},{'effect':'noIO'})
                    return
                }
                this.firstOnshow = true
            }

            if( window._Bola_deviceInfo && window._Bola_deviceInfo.OS != "iOS"){
                if(window.localStorage['3Dstatus'] != 'false'){
                    $('.change3DView').addClass('active')    
                } else {
                    $('.change3DView').removeClass('active')  
                }
            }
            
            var me=this;
            /**
             * 显示当前的环境，方便测试人员知道
             */
            if(bfConfig.server.indexOf("preprod") != -1){
                bfDebugManager.setDebugable(true);
                Notification.show({
                    type:"error",
                    message:"当前为预生产环境，开起调试界面"
                });
            }else if(bfConfig.server.indexOf("tspdemo") != -1){
                bfDebugManager.setDebugable(true);
                Notification.show({
                    type:"error",
                    message:"当前为测试环境，开起调试界面"
                });
            }
            /**
             * 请求主机连接
             */
            GlobalgetBaseUrl();
            //返回首页，会自动刷新数据，但若返回前正在下拉刷新，或发送控制指令，则不会刷新
            if(me.isInit) {
                me.updateCarStatus({
                    start: function () {
                        console.log('onshow里的菊花开始');
                        me.uiAddChrysanthemum();
                    },
                    complete:function(){
                        me.uiRemoveChrysanthemum();
                        console.log('onshow里的菊花结束');
                    }
                });
                //服务器下发的配置会更改滑块数量，每次更改后swiper都需要reset
                // me.swiperView.swiperReset();
            }else{
                //只有首次打开首页时的初始化, 各个view实例化
                //11111
                var headview =new headerView();

                var messageview = new messageView();
                // var checkresuletview =new checkResultView();
                // var mileageview = new mileageView();
                me.oilview = new oilView();
                me.listContainView = new listContainView();
                me.controlListView = new controlListView();
                // me.swiperView = new swiperView();
                me.isInit=true;
            }
            me.initScroll();//初始化iscroll，及下拉刷新相关事件
            setTimeout(function(){
                if(window.threeDDD && window.threeDDD.contentWindow){
                        window.threeDDD.contentWindow.recovery && window.threeDDD.contentWindow.recovery()
                     }
            },400)
            me.upIosModel();
          
        };
        // 上传ios的系统版本和手机型号
        cls.upIosModel = function(){
            // 每个月只掉一次
            if(deviceIsIOS && bfConfig._config.runtime !== "RELEASE" ){
                return
            }
            var userMobile = window.localStorage['userMobile'];
            if( window.localStorage['upIosModel'+userMobile] != moment().format('YYYYMM')){
                // console.log('你好呀');
                setTimeout(function(){
                    var data = {
                        userId: window.localStorage['userId'],
                        vin: bfDataCenter.getCarData() && bfDataCenter.getCarData().vin || '',
                        timestamp: moment().valueOf(),
                        applist: [],
                        brand: '苹果',
                        phonemodel: typeof OSApp !== 'undefined' && JSON.parse(OSApp.getInfo()).phoneType || '',
                        systemversion: typeof OSApp !== 'undefined' && JSON.parse(OSApp.getInfo()).OSVersion || '',
                        longitude:'',
                        latitude:'',
                        province: '',
                        city: ''
                    }
                    bfClient.upIosModel({
                        data: data,
                        success: function(res){
                            if(res.success == true){
                                window.localStorage['upIosModel'+userMobile] = moment().format('YYYYMM');
                            }
                        }
                    })
                },15000)
            }

        },
        cls.onRemove = function () {
            bfDataCenter.off('NEW_CAR_LIST',this.homeNewCarList);
            // bfDataCenter.off('CURRENT_CARVIN_CHANGED',this.change3D);
        }
        cls.onDeviceBack=function () {
            if(controlCmd.onDeviceBack()){
                return true;
            };
            if(this.controlIndex && this.controlIndex._isShow){
                this.controlIndex.removeView();
                return true
            }
            return false;
        }
        cls.onViewBack=function (backFrom, backData) {
            //若控制过程中，切换车辆。则将控制动画直接清除。
            if(backData == 'changeCar'){
                if(controlRunning){
                    controlCmd.param.loopInfo = false;
                    controlRunning = false;
                    var svg = this.$('#swiper .slider-svg');
                    var path = svg.find('path');
                    svg.css({'display':'none'});
                    path.css('stroke-dashoffset',0);
                    // cancelAnimationFrame(this.swiperView.animationId)
                }
                // if( this.swiperView.isActiving){
                //     this.swiperView.isActiving=false;
                //     this.swiperView.$('#swiper-warning .btn').removeClass('setTimeout')
                // }
            }
        };
        // cls.newToolkit = function () {
        //     var home =this;
            // home.$el.on('touchend',function () {
            //     if(home.scrollPullDown && home.scrollPullDown.myscroll){
            //         if(home.scrollPullDown.myscroll.maxScrollY - home.scrollPullDown.myscroll.y > 60){
            //             bfNaviController.push('toolkit/newIndex.html',{},{effect:'Up'})
            //         }
            //     }
            // })
        // };
        cls.defineView = function (home) {
            headerView = Backbone.View.extend({
                el:home.$('#nav-bar')[0],
                model: model,
                events:{
                    'click #navTitle':'goCarIndex',
                    'click #navRight':'onClickRight',
                    'click #navLeft':'goMyinfoIndex'
                },
                initialize: function () {
                    var div=document.createElement('div');
                    div.id='updateTime';
                    div.innerHTML="更新时间:---- -- -- --:--:--";
                    this.$el.append(div);
                    // this.listenTo(this.model, 'change:updateTime',this.updateTime);
                    this.listenTo(this.model,'change:carNumber',this.updateCarNumber);
                    home.clickEffect(this.$el.find('#navTitle'));
                },
                // updateTime:function (model, time) {
                //     if(!time||time=='-1'){
                //         this.$('#updateTime').text('');
                //     }else{
                //         time = time.substr(0,19);
                //         this.$('#updateTime').text('更新时间:  '+time);
                //     };
                // },
                goMyinfoIndex:function(){
                    // require("wy")
                    // OSApp.closeView();
                    window.__closeCurentView()
                    // if(typeof MobclickAgent != "undefined"){
                    //       MobclickAgent.onEvent('0505');
                    //     }
                    // bfNaviController.push('myinfo/index.html');
                },
                updateCarNumber:function (model,carNumber) {
                    var carId = bfDataCenter.getCarId();
                    if(!carId){
                        carNumber = '车辆列表';
                        home._navTitle.removeClass('afterShow');
                    }
                    else if(carNumber == '__this__is__f201__icon__'){
                        home._navTitle.html('<span class="f201__icon"></span>');
                        home._navTitle.addClass('afterShow');
                        return
                    }else if(!carNumber||carNumber=='-1'){
                        carNumber='我的爱车';
                        home._navTitle.removeClass('afterShow');
                    }else{
                        if(carNumber == 'DEMO车辆'){
                            carNumber = '演示车辆'
                        }
                        home._navTitle.addClass('afterShow');
                    }
                    home._navTitle.html(carNumber);
                },
                goCarIndex: function () {
                    if(window.threeDDD && window.threeDDD.contentWindow){
                        window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                    }
                    bfNaviController.push('/cars/index.html',{
                        RemoteControl: home._RemoteControl,
                        isTwo: false
                    });
                },
                onClickRight: function(){
                    
                    if(home._RemoteControl && home._RemoteControl.statusCheck){
                      if(!bfDataCenter.getCarId()){
                        return
                      }
                      home.updateCarDataByControl();
                    } else {
                      home.onShow()
                    }
                }
            });

            messageView = Backbone.View.extend({
                el:home.$('.message-wrap')[0],
                model: model,
                events:{
                  
                },
                initialize: function () {
                    this.listenTo(this.model, 'change:updateTime',this.updateTime);
                },
                updateTime:function (model, time) {
                    if(!time||time=='-1'){
                        this.$('.updateTimeContent').text('更新时间: ----.--.-- --:--:--');
                    }else{
                        // time = time.substr(0,19);
                        time = moment(time).format("YYYY.MM.DD HH:mm:ss")
                        this.$('.updateTimeContent').text('更新时间:  '+time);
                    };
                }
            });


            oilView = Backbone.View.extend({
                el:home.$('#oilView'),
                model:model,
                events:{
                },
                initialize:function () {
                    var me = this;
                    //model的数据变化与渲染函数绑定
                    me.listenTo(me.model,'change:door',me.setCarPicture);
                    me.listenTo(me.model,'change:oil',me.update);
                },
                /**
                 * 更新车辆渲染图
                 */
                setCarPicture:function (model,door) {
                    var me = this;
                     var props = ['LF', 'LB', 'RF', 'RB', 'lowBeam', 'dormer', 'trunk', 'positionLamp', 'turnLndicator'];
                    var carId = bfDataCenter.getCarId();

                    function setPicture(selector, image) {
                        if (Object.prototype.toString.call(selector) == '[object Object]') {
                            for (var p in selector) {
                                $oilView.find(p).css('background-image', selector[p])
                            }
                            return;
                        }
                        if (typeOf(selector) == 'string') {
                            $oilView.find(selector).css('background-image', image)
                        }
                    };

                    //若车辆渲染图相关数据出现0和1之外的值，比如-1或者null,则默认重置为0；
                    if (!door) {
                        door = {
                            LF: 0,
                            LB: 0,
                            RF: 0,
                            RB: 0,
                            lowBeam: 0,
                            dormer: 0,
                            trunk: 0,
                            positionLamp: 0,
                            turnLndicator: 0,
                        }
                    } else if (door != 'noCar') {
                        for (var i = 0; i < props.length; i++) {
                            if (door[props[i]] != 1) {
                                door[props[i]] = 0;
                            }
                        }
                    }

                    var $oilView = me.$el;
                    var hasResource = bfDataCenter.getUserValue('HasResource'), Path;

                    var home = this;
                    var iframe_ht = home.$('#iframe_test');
                    var oilview = $('#home .content #oilView');
                    switch (true) {
                        //没车
                        case door == 'noCar':
                            iframe_ht.attr("src", "");
                            iframe_ht.css("visibility", "hidden");
                            oilview.css("visibility", "visible");
                            if(window._Bola_deviceInfo && window._Bola_deviceInfo.OS != 'iOS'){
                                $('.change3DView').hide();
                            }
                            $oilView.addClass('noCar');
                            console.log('door设置为noCar++++');
                            break;
                        case hasResource:
                             var data = bfDataCenter.getCarList();
                            var carID = bfDataCenter.getCarId();
                            var length = data.length;
                           if(window._Bola_deviceInfo && window._Bola_deviceInfo.OS != "iOS"){
                           	    var jsonStr = window.localStorage['CpuInfo'];
                                if(jsonStr){
                                    var obj = JSON.parse(jsonStr);
                                    var cpu = obj.cpuInfo;
                                    var ram = obj.ramSize;
	                            } else {
	                               var cpu = 1;
	                                var ram = 1; 
	                            }
                            } else {
                               var cpu = 5;
                                var ram = 5; 
                            }
                            //  var cpu = 5;
                            // var ram = 5; 
                            Path = CarResource.ResourcePath();
                            // var canvas_is_webgl = document.getElementById('canvas_is_webgl');
                            // var gl = canvas_is_webgl.getContext('webgl');
                            var gl = true;
                            // alert(navigator.userAgent);
                            for(var i=0;i<length;i++) {
                                if (carID == data[i].carId) {    //判断当前carid与绑定车辆的carid                                  
                                    if (window.__getIs3DShow__(data[i].seriesCode.toLowerCase()) && cpu.toFixed(1) > 1.5 && ram >= 3 && gl  && (window.localStorage['3Dstatus'] != 'false' || (window._Bola_deviceInfo && window._Bola_deviceInfo.OS == 'iOS')) ) {
                                        console.log('这是v302车型-------');
                                        if(window._Bola_deviceInfo && window._Bola_deviceInfo.OS != "iOS"){
                                            $('.change3DView').show();
                                        }
                                        if (iframe_ht.attr("src") != '') {                     // 判断iframe是否已经赋值
                                            console.log('3D already exits');
                                        }else{
                                                iframe_ht.attr("src", Path + "index.html");
                                                var iframe = iframe_ht.get(0);
                                                cls.threeD = iframe;
                                                window.threeDDD = iframe;
                                                cls.refresh3Dstatus = false;
                                                iframe_ht.css("visibility", "visible");
                                                oilview.css("visibility", "hidden");
                                        }
                                    } else {
                                        if(window._Bola_deviceInfo && window._Bola_deviceInfo.OS != "iOS"){
                                            if(window.__getIs3DShow__(data[i].seriesCode.toLowerCase()) && cpu.toFixed(1) > 1.5 && ram >= 3 && gl){
                                                $('.change3DView').show();
                                            } else{
                                                $('.change3DView').hide();
                                            }
                                        }
                                        
                                            console.log('这不是v302车型+++++');
                                            iframe_ht.attr("src", "");
                                            iframe_ht.css("visibility", "hidden");
                                            oilview.css("visibility", "visible");
                                            if(iframe_ht.get(0).contentWindow){  
                                            // iframe_ht.get(0).contentWindow.document.write("");
                                            // iframe_ht.get(0).contentWindow.document.clear();
                                            iframe_ht.get(0).contentWindow.document.body.innerHTML ="";
                                            }  

                                            $oilView.removeClass('noCar');
                                            if(!me.defaultPicture){
                                                console.log('使用下载的资源包');
                                                setPicture({
                                                    '.main_car': 'url(' + Path + 'car1.png)',
                                                    '.LF': 'url(' + Path + 'LF' + door.LF + '.png)',
                                                    '.LB': 'url(' + Path + 'LB' + door.LB + '.png)',
                                                    '.RF': !!door.RF ? 'url(' + Path + 'RF1.png)' : 'url(' + Path + 'RF0.png)',
                                                    '.RB': !!door.RB ? 'url(' + Path + 'RB1.png)' : 'url(' + Path + 'RB0.png)',
                                                    '.lowBeam': !!door.lowBeam ? 'url(' + Path + 'lowBeam1.png)' : 'none',
                                                    '.positionLamp': !!door.positionLamp ? 'url(' + Path + 'positionLamp1.png)' : 'none',
                                                    // '.turnLndicator': !!door.turnLndicator ? 'url('+Path+'turnLndicator1.png)' : 'none',
                                                    '.dormer': !!door.dormer ? 'url('+Path+'dormer1.png)' : 'url('+Path+'dormer0.png)',
                                                    '.trunk': !!door.trunk ? 'url(' + Path + 'trunk1.png)' : 'none',
                                                })
                                            } else {
                                                console.log('使用下载的默认图');
                                                setPicture({
                                                    '.main_car': 'url(' + me.defaultPicture + ')',
                                                    '.LF': 'none',
                                                    '.LB': 'none',
                                                    '.RF': 'none',
                                                    '.RB': 'none',
                                                    '.lowBeam': 'none',
                                                    '.positionLamp': 'none',
                                                    '.dormer': 'none',
                                                    '.trunk': 'none',
                                                });
                                            }
                                        
                                        }
                                    }
                                }
                            break;
                        default:
                            iframe_ht.attr("src", "");
                            iframe_ht.css("visibility", "hidden");
                            oilview.css("visibility", "visible");
                            if(window._Bola_deviceInfo && window._Bola_deviceInfo.OS != "iOS"){
                                $('.change3DView').hide();
                            }
                            if(iframe_ht.get(0).contentWindow){
                                // iframe_ht.get(0).contentWindow.document.write("");
                                // iframe_ht.get(0).contentWindow.document.clear();
                                iframe_ht.get(0).contentWindow.document.body.innerHTML ="";
                            }
                            Path = '../home/img/CAR.png';
                            $oilView.removeClass('noCar');
                            console.log('使用本地的默认图');
                            setPicture({
                                '.main_car': 'url(' + Path + ')',
                                '.LF': 'none',
                                '.LB': 'none',
                                '.RF': 'none',
                                '.RB': 'none',
                                '.lowBeam': 'none',
                                '.positionLamp': 'none',
                                '.dormer': 'none',
                                '.trunk': 'none',
                            });
                            break;
                    }
                },
                update:function (model,oil) {
                    var me = this;
                    // var rem=parseFloat(document.documentElement.style.fontSize);
                    // var mileAge = me.$('#CTanimateShow');
                    // mileAge.css('transition-duration','0s');
                    // mileAge.addClass('reset').width(0);
                    // var $oilText = me.$('.canDrivingMil span')
                    // var OIL_WARNING = 0.05;

                    // setTimeout(function () {
                    //     var per;
                    //     switch(true) {
                    //         case oil > OIL_WARNING:
                    //             per= Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
                    //             mileAge.css({'transition-duration':'0.6s','background-color':'#00d5fe'});
                    //             // $oilText.html(per);
                    //             mileAge.width(per+'%');
                    //             break;
                    //         //小于300km，字体颜色变成橘红色,以提醒用户
                    //         case 0<=oil&&oil<=OIL_WARNING:
                    //             per=Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
                    //             mileAge.css({'transition-duration':'0.6s','background-color':'#f00c0c'});
                    //             // $oilText.html(per);
                    //             mileAge.width(per+'%');
                    //             break;
                    //         case oil !=='' &&oil != -1 && oil <=0:
                    //             // $oilText.html(0);
                    //             break;
                    //         default:
                    //             // $oilText.html('--');
                    //     }
                    // },5);

                    var $oilText = $('#home .canDrivingMil span')
                    var OIL_WARNING = 0.05;

                    setTimeout(function () {
                        var per;
                        switch(true) {
                            case oil > OIL_WARNING:
                                per= Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
                                $oilText.html(per);
                                break;
                            //小于300km，字体颜色变成橘红色,以提醒用户
                            case 0<=oil&&oil<=OIL_WARNING:
                                per=Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
                                $oilText.html(per);
                                break;
                            case oil !=='' &&oil != -1 && oil <=0:
                                $oilText.html(0);
                                break;
                            default:
                                $oilText.html('--');
                        }
                    },5);
                }
            });


            controlListView = Backbone.View.extend({
                el:home.$('#controlListView'),
                model:model,
                events:{
                    'click .list-contain-item':'onClickContain',
                    'click .control-info-net-error-button-wrap':'reloadData',
                    'click #swiper-warning .button1':'operation',
                    'click #swiper-warning .button2':'goAddCar',
                    'click .SS-one-item':'onClickIconButton',
                    "click .controlListView-top-left": 'onControlListViewTopLeft',
                    "click .controlListView-top-right": 'onControlListViewTopRight',
                },
                initialize:function () {
                    var me = this;
                    me.listenTo(me.model,'change:swiperStatus',me.swiperStatus);
                    
                },
                reloadData: function(){
                    home.onShow()
                },
                goAddCar:function () {
                    bfNaviController.push('addChanganCar/addCarView.html');
                },
                /**
                 * 有时车辆由于tbox没有激活等原因，getCarState接口获取不到数据。此时根据返回的code值，进行说明；
                 * code的值范围0~5或者‘noCar’，表示帐号没车；
                 */
                swiperStatus:function (model,status) {
                    var me= this;
                    var $swiper = me.$el;
                    var $message = $swiper.find('#swiper-warning .message');
                    var $btn = $swiper.find('#swiper-warning .button1');
                    var $btn2 = $swiper.find('#swiper-warning .button2');
                    var carId = bfDataCenter.getCarId();

                     home.$('#list-contain').show();
                     home.$('.controlListView-top').show();
                    home.$('.swiper-container').show();
                    home.$('.canDrivingStatus-wrap').show();
                    home.$('#CTanimate').show();
                    home.$('.yubiao-icon').hide();
                    // home.$('#navLeft').show();
                    if(status === 0){
                        $swiper.removeClass('noData');
                        // me.$('.CLV-button-content').css('display',"-webkit-box");
                        // me.$('.CLV-button-content').css('display',"flex");
                        me.isActiving=false;
                        $btn.removeClass('setTimeout');
                    }else{
                        $swiper.addClass('noData');
                        me.$('.CLV-button-content').hide();
                        $btn.hide();
                        $btn2.hide();
                        var description;
                        switch (status){
                            case 1:
                                $message.css('margin-top','5px');
                                description='当前车辆未完成初始化,请完成初始化之后进行操作!';
                                $btn.removeClass('setTimeout');
                                me.isActiving=false;
                                $btn.show();
                                $btn.text('初始化');
                                break;
                            case 2:
                                $message.css('margin-top','30px');
                                description='请激活车联网基础服务';
                                break;
                            case 3:
                                $message.css('margin-top','30px');
                                description='当前车辆不支持车联网服务';
                                break;
                            case 4:
                                $message.css('margin-top','30px');
                                description='越权操作';
                                break;
                            case 5:
                                $message.css('margin-top','5px');
                                description='请务必在车辆处于点火状态下,执行激活操作';
                                $btn.show();
                                $btn.text('激活');
                                break;
                            case 'noCar':
                                $message.css('margin-top','30px');
                                if(window.localStorage.getMainDatas == 'false'){
                                    description= '用户数据获取失败,请下拉刷新看看';
                                }
                                else {
                                    $message.css('margin-top','-65px');
                                    me.isActiving=false;
                                    $btn.removeClass('setTimeout');
                                    // $btn.show();
                                    $btn2.show();
                                    // $btn.text('添加模拟车辆');
                                    description = '当前并无车辆数据<br />请先添加车辆';

                                    home.$('#list-contain').hide();
                                    home.$('.controlListView-top').hide();
                                    home.$('.swiper-container').hide();

                                    home.$('.canDrivingStatus-wrap').hide();
                                    home.$('#CTanimate').hide();
                                    home.$('.yubiao-icon').show();
                                    // home.$('#navLeft').hide();
                                }
                                break;
                        }
                        $message.html(description);
                    };
                    home.initScroll()
                    home._mySwiper && home._mySwiper.reInit()
                },
                operation:function () {
                    var me=this,
                        status = this.model.get('swiperStatus');
                    var $message = me.$('#swiper-warning .message');
                    switch (status){
                        case 1:
                            controlCmd.upControlStatus({
                                controlCarSuccess:function () {
                                    home.uiAddChrysanthemum();
                                },
                                controlCarError:function () {
                                    home.uiRemoveChrysanthemum();
                                },
                                controlInfoComplete:function () {
                                    home.uiRemoveChrysanthemum();
                                    home.updateCarStatus();
                                },
                                controlInfoTimeout:function () {
                                    home.uiRemoveChrysanthemum();
                                },
                                controlInfoFail:function () {
                                    home.uiRemoveChrysanthemum();
                                },
                            });
                            break;
                        case 5:
                            //激活操作，isActive标志位是来控制计时的开关；
                            var btn = me.$el.find('#swiper-warning .button');
                            if(me.isActiving){
                                return;
                            };
                            var time = 180000;
                            //避免反复激活
                            bfClient.activeDevice({
                                data:{carId:bfDataCenter.getCarId()},
                                success:function (netdata) {
                                    if(netdata.scode ==0 &&netdata.success){
                                        $message.css('margin-top','0px')
                                        $message.html('激活过程一般在3分钟以内<br />您可以通过下拉刷新页面查看激活结果');
                                        me.isActiving=true;
                                        btn.addClass('setTimeout');
                                        (function timeOut() {
                                            if(time>=0&&me.isActiving){
                                                btn.text(time/1000+'s');
                                                time -=1000;
                                                setTimeout(timeOut,1000);
                                            }
                                        })();
                                        setTimeout(function () {
                                            if(me.isActiving){
                                                me.isActiving=false;
                                                btn.removeClass('setTimeout');
                                                btn.text('激活');
                                                home.updateCarStatus({
                                                    start: function () {
                                                        //111
                                                        home.uiAddChrysanthemum();
                                                    },
                                                    complete: function () {
                                                        home.uiRemoveChrysanthemum();
                                                    }
                                                });
                                            }
                                            return;
                                        },time+2000);
                                    }else {
                                        Notification.show({
                                            type: 'info',
                                            message: netdata.msg
                                        })
                                    }
                                },
                                error:function (error) {
                                    var eMsg = '激活车辆设备失败';
                                    if (typeof(error) === 'string') eMsg = error;
                                    if (typeof(error) === 'object') {
                                        if (error.status == 0) eMsg = "网络开小差";
                                    }
                                    Notification.show({
                                        type:'error',
                                        message:eMsg,
                                    });
                                },
                            })

                            break;
                        // case 'noCar':
                        //     bfClient.addDemoCar({
                        //         type: 'post',
                        //         success: function (data) {
                        //             if (data.code == 0) {
                        //                 Notification.show({
                        //                     type: 'info',
                        //                     message: '添加虚拟车辆成功~~'
                        //                 });
                        //                 bfAPP.trigger("IM_EVENT_CAR_CHANGED");
                        //                 home.getMyCars();
                        //             } else if (data.code == 1) {
                        //                 Notification.show({
                        //                     type: 'error',
                        //                     message: '添加失败~~'
                        //                 });
                        //             }
                        //         }
                        //     });
                        //     break;
                    }
                },
                // 处理发送前的一些逻辑操作，比如选温度，选档位
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
                onClickIconButton: function(e){
                    var me = this;
                    //不得重复控制
                    if(controlRunning){
                        var $slider=$(event.currentTarget);
                        var type=$slider[0].dataset.type,
                            cmd=$slider[0].dataset.cmd;
                        var msg = type == controlRunning ? '当前指令未执行完成' : '上一条指令未执行完成';
                        if(msg == '当前指令未执行完成' || msg == '上一条指令未执行完成'){
                            Notification.show({
                                type:'info',
                                message:msg,
                            })
                        }
                        
                        return;
                    }
                    window.getConnectStatus_blueTooth_home_index_1 = function(res){
                        if(res.data == '1' || res.data == 'true'){
                            $('#home .content .blueetoothStatus-wrap-icon').addClass('active').removeClass('loading');
                            me.$('.bluetoothPasscode').hide();
                            me.onControlBluetoothBtn(e);
                        } else {
                            $('#home .content .blueetoothStatus-wrap-icon').removeClass('active');
                            me.controlCar(e);
                        }
                    }
                    
                    if(typeof OSApp !== 'undefined' && $(e.currentTarget).attr('data-value') != undefined ){
                        OSApp.getConnectStatus_blueTooth(JSON.stringify({}),'getConnectStatus_blueTooth_home_index_1')
                    } else {
                        me.controlCar(e);
                    }
                },
                createDialog:function (str1,str2) {
                    dialog.createDialog({
                        closeBtn: false,
                        buttons: {
                            '知道了': function () {
                                this.close();
                                this.destroy();
                            },
                        },
                        content: "<p>"+str1+"暂不支持"+str2+"操作</p>"
                    });
                },
                /**
                 * 控制业务逻辑分两步；
                 * 1、发送控制指令，接口返回车辆是否收到
                 * 2、车辆执行命令，然后app不断的发送请求，了解车辆执行的结果如何；
                 */
                controlCar:function (event) {
                    var me=this;
                    var $slider=$(event.currentTarget);
                    var type=$slider[0].dataset.type,
                        cmd=$slider[0].dataset.cmd;
                    //2、进入控制逻辑
                    cmd= cmd==='0';//原cmd若为0则要操作就是打开，1则是关闭
                    options=me.loopOptions(type,cmd,$slider);
                    switch(type){
                        case 'trunk':
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '知道了': function () {
                                        this.close();
                                        this.destroy();
                                    },
                                },
                                content: "<p>此功能只能在蓝牙连接后使用</p>"
                            });
                        case 'slidingdoor':
                            dialog.createDialog({
                                closeBtn: false,
                                buttons: {
                                    '知道了': function () {
                                        this.close();
                                        this.destroy();
                                    },
                                },
                                content: "<p>此功能只能在蓝牙连接后使用</p>"
                            });
                        case 'autoAir':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0104');
                            }
                            if(cmd){
                                me._inner_options = options;
                                me.$('#auctionType').mobiscroll('show');
                            } else {
                                home.uiAddChrysanthemum()
                               controlCmd.ControlAir(cmd,options); 
                            }
                            break;
                        case 'carWindows':
                                home.uiAddChrysanthemum()
                            controlCmd.ComtrolCarWindows(cmd,options);
                            break;
                        case 'air':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0104');
                            }
                            if(cmd){
                                me._inner_options = options;
                                me.$('#auctionType0').mobiscroll('show');
                            } else {
                                home.uiAddChrysanthemum()
                               controlCmd.ControlAir(cmd,options); 
                            }
                            break;
                        case 'door':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0107');
                            }
                            home.uiAddChrysanthemum()
                            controlCmd.ControlDoor(cmd,options);
                            break;
                        case 'dormer':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0105');
                            }
                            if(cmd) {
                                //天窗只能关闭，不能开启
                                if(home._RemoteControl && home._RemoteControl.sunroofOpen){
                                    home.uiAddChrysanthemum()
                                    controlCmd.ControlDormer(cmd,options);
                                } else {
                                    me.createDialog('天窗','开启')
                                }
                            }else{
                                home.uiAddChrysanthemum()
                                controlCmd.ControlDormer(cmd,options);
                            }
                            break;
                        case 'whistle':
                            home.uiAddChrysanthemum()
                            controlCmd.ControlWhistle(cmd,options);
                            break;
                        // case 'updateCarInfo':
                        //     controlCmd.ControlUpdateCarInfo(options);
                        //     break;
                        case 'purge':
                            // if(cmd){
                            //     oldDialog.createDialog({
                            //         closeBtn: false,
                            //         buttons: {
                            //             '确定': function() {
                            //                 controlCmd.ControlPurge(cmd,options);
                            //                 this.close();
                            //             },
                            //             '取消': function() {
                            //                 this.close();
                            //             }
                            //         },
                            //         content: "温馨提示：关闭车窗车门后净化效果更好"
                            //     });
                                
                            // } else {
                                home.uiAddChrysanthemum()
                               controlCmd.ControlPurge(cmd,options); 
                            // }
                            break;
                    };
                },
                loopOptions:function (type,cmd,activeslide) {
                    var me=this;
                    var timeStart;
                    var svg=$(activeslide).find('.slider-svg');
                    var path = svg.find('path');
                    // var text = $(activeslide).find('.description');
                    var model = me.model;
                    var id;
                    //跟乘用车不同，商用车app进入其他页面后，当前页面会被display:none;
                    //若当前页面正在执行css动画，则动画会被中断，从而也不会触发aniamtionend和transitionend事件
                    //所以此处采用js动画作为解决方案。
                    //若57s后接口还没有返回结果，动画进度会停在当前状态。
                    function animate() {
                        me.animationId = requestAnimationFrame(function () {
                            var time = Date.now();
                            // me.swiper.params.onlyExternal=true;
                            if(time-timeStart<=57000){
                                svg.css({'display':'block'});
                                path.css('stroke-dashoffset', (home.svgLength+1) / 60000 * (time - timeStart));
                                me.animationId = requestAnimationFrame(animate);
                            }else{
                                path.css('stroke-dashoffset', (home.svgLength+1)*0.95);
                            }
                        })
                    };
                    function stopAnimate(type) {
                        path.css({'transition':'stroke-dashoffset 0.3s',
                            'stroke-dashoffset':home.svgLength});
                        setTimeout(function () {
                            svg.css({'display':'none'});
                            path.css({'transition':'none',
                                'stroke-dashoffset':0})
                        },300)
                        cancelAnimationFrame(me.animationId);
                        controlRunning = false;
                        // me.swiper.params.onlyExternal=false;
                        // 如果是 跟新车辆状况，则需要刷新整个页面
                        // if(type == 'updateCarInfo'){
                        //     me.onShow();
                        // } else {
                            home.updateControlstatus(bfDataCenter.getCarId());
                        // }
                    }

                    cmd = cmd=='0'? 1 : 0;
                    /**
                     * 各个回调的说明请看common/control-cmd.js的send()里的说明
                     */
                    var options={
                        controlCarSuccess:function (data) {
                            //1、禁止swiper滑动
                            //2、变更滑块描述文字
                            //3、开始控制过程动画
                            //4、设置标识位controlRunning
                            timeStart=Date.now();
                            // me.swiper.params.onlyExternal=true;
                            // var control =_.clone(model.attributes.control);
                            // control[type] = 'controling';
                            // model.set('control',control);
                            // home.uiRemoveChrysanthemum()
                            animate();
                            controlRunning = type;
                        },
                        controlCarError:function () {
                            stopAnimate();
                        },
                        controlInfoRunning:function () {

                        },
                        controlInfoComplete:function () {
                            stopAnimate(type);
                            if(type == 'purge'){
                                // if(cmd){
                                //     me.$('.purge-img-two').removeClass('animate');
                                // } else {
                                //     me.$('.purge-img-two').removeClass('animate');
                                //     setTimeout(function(){
                                //         me.$('.purge-img-two').addClass('animate')
                                //     },0)
                                // }
                                setTimeout(function(){
                                    home && home.updateControlstatus && home.updateControlstatus(bfDataCenter.getCarId());
                                },10*60*1000)
                            }
                            // if(type == 'air'){
                            //     if(cmd){
                            //         me.$('.air-img-two').removeClass('animate');
                            //         setTimeout(function(){
                            //             me.$('.air-img-two').addClass('animate')
                            //         },0)
                            //     } else {
                            //         me.$('.air-img-two').removeClass('animate');
                            // }
                            // }
                            // if(type == 'dormer'){
                            //     if(cmd == true){
                            //         me.$('.dormer-img-two').css('top','125px');
                            //     } else {
                            //         me.$('.dormer-img-two').css('top','16px');
                            //     }
                            // }
                            // if(type == 'carWindows'){
                            //     if(cmd == true){
                            //         me.$('.carWindows-img-two').css('top','80px');
                            //     } else {
                            //         me.$('.carWindows-img-two').css('top','40px');
                            //     }
                            // }
                            if(type == 'whistle'){
                                var hasResource = bfDataCenter.getUserValue('HasResource'),Path;
                                if(hasResource){
                                    Path = CarResource.ResourcePath();
                                }else{
                                    
                                    Notification.show({
                                        type:'info',
                                        message:'控制指令执行成功'
                                    })
                                    return;
                                }

                                var count =3;
                                var light = me.$('#oilView .turnLndicator');
                                (function flashLight() {
                                    if(count>0) {
                                        count--;
                                        light.css('background-image', 'url(' + Path + 'turnLndicator1.png)')
                                        setTimeout(function () {
                                            light.css('background-image', 'none');
                                            setTimeout(flashLight, 300);
                                        }, 300);
                                    }
                                }());
                            };

                            Notification.show({
                                type:'info',
                                message:'控制指令执行成功'
                            })
                        },
                        controlInfoTimeout:function () {
                            stopAnimate()
                        },
                        controlInfoFail:function () {
                            stopAnimate()
                        },
                    };
                    return options;
                },
                onControlBluetoothBtn: function(e){
                    var me = this;
                    // if(home.beforeTime){
                    //    var diff = moment().diff(home.beforeTime) 
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
                    // home.beforeTime = moment();


                    var dataValue = $(e.currentTarget).attr('data-value')
                    if(dataValue){
                        // if(home.__powerstatus_blueetooth != 0){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '非OFF档，无法进行控制',
                        //     })
                        //     return 
                        // }
                        // if(home.__blueCarStatus.driverDoorLockStatus == 0 && dataValue == 'actionLock_blueTooth'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '车辆已闭锁',
                        //     })
                        //     return 
                        // } else if(home.__blueCarStatus.driverDoorLockStatus == 1 && dataValue == 'actionUnlock_blueTooth'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '车辆已解锁',
                        //     })
                        //     return 
                        // }
                        // if(home.__blueCarStatus.sunroofStatus == false && dataValue == 'actionSunroofClose'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '天窗已关闭',
                        //     })
                        //     return 
                        // } else if(home.__blueCarStatus.sunroofStatus == true && dataValue == 'actionSunroofOpen') {
                        //     Notification.show({
                        //         type:'info',
                        //         message: '天窗已打开',
                        //     })
                        //     return 
                        // }
                        // if(home.__blueCarStatus.trunkStatus == true && dataValue == 'actionOpenTrunk_blueTooth'){
                        //     Notification.show({
                        //         type:'info',
                        //         message: '后备箱已打开',
                        //     })
                        //     return 
                        // }

                        home.uiAddChrysanthemum_blueetooth('指令发送中')
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
                                home.uiRemoveChrysanthemum_blueetooth()
                                Notification.show({
                                    type:'info',
                                    message: '离线控制超限，连接网络后再试',
                                })
                            }
                          
                            
                        } else {
                            me.bluetoothControl(dataValue)
                        }
                        
                    }
                },
                bluetoothControl: function(data){
                    var me = this;
                    switch(data){
                        // 锁车指令
                        case 'actionLock_blueTooth':
                            window.actionLock_blueToothCallback_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                            break;
                        // 解锁指令
                        case 'actionUnlock_blueTooth':
                            window.actionUnlock_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                            break;
                        //车窗自动升起
                        case 'actionSunroofClose':
                            window.actionSunroofClose_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                            break;
                        //车窗自动降窗
                        case 'actionSunroofOpen':
                            window.actionSunroofOpen_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                            break;
                        //打开左侧滑门
                        case 'actionLeftSlidingDoor_blueTooth':
                            window.actionLeftSlidingDoor_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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

                            break;
                        //打开右侧滑门
                        case 'actionRightSlidingDoor_blueTooth':
                            window.actionRightSlidingDoor_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                            break;
                        //打开后备箱
                        case 'actionOpenTrunk_blueTooth':
                            window.actionOpenTrunk_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                            break;
                        //启动引擎
                        case 'actionStartEngine_blueTooth':
                            window.actionStartEngine_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                                home.uiRemoveChrysanthemum_blueetooth()
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
                            OSApp.setStatistics('actionStopEngine_blueTooth','')
                            break;
                        //寻车
                        case 'actionSearchVeicle_blueTooth':
                            window.actionSearchVeicle_blueTooth_bluetooth_index = function(data){
                                home.uiRemoveChrysanthemum_blueetooth()
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
                               home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                           break;
                        case 'whistle1_blueTooth':
                            window.whistle1_blueTooth_bluetooth_index = function(data){
                               home.uiRemoveChrysanthemum_blueetooth()
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
                                vin: bfDataCenter.getCarData().vin
                            })
                           break;
                    }
                },
                onControlListViewTopLeft: function(){
                    OSApp.openCarLocationView('{showControl:"true"}');//true为TBox车，false为非tBox
                    setTimeout(refreshCarLocation(),500);
                },
                onControlListViewTopRight: function(){
                    if(window.threeDDD && window.threeDDD.contentWindow){
                                                    window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                                                 }
                    bfNaviController.push('bluetooth/shared.html')
                },
            })


            listContainView = Backbone.View.extend({
                el:home.$('#list-contain'),
                model:model,
                events:{
                    'click .list-contain-item':'onClickContain',
                },
                initialize:function () {
                    var me = this;
                    // home.clickEffect(me.$el.find('#PM2500'));
                    //model的数据变化与渲染函数绑定
                    me.listenTo(me.model,'change:position',me.setCarPosition);
                    me.listenTo(me.model,'change:checkResult',me.update);
                    me.listenTo(me.model,'change:PM25',me.setPM25);
                    me.listenTo(me.model,'change:temperature',me.setTemperature);
                    me.listenTo(me.model,'change:oil',me.setOil);
                    me.listenTo(me.model,'change:control',me.setCarInfoText);
                    me.listenTo(me.model,'change:door',me.setCarInfoTextDoor);
                },
                setTemperature: function(model,temperature){
                    if(temperature && temperature>-100){
                         // this.$('.LCCB-temperature').show()
                        this.$('.LCCB-temperature .CTSW-text').html(temperature+'℃');
                    } else {
                         // this.$('.LCCB-temperature').hide()
                        this.$('.LCCB-temperature .CTSW-text').html('--');
                    }
                },
                setCarInfoText: function(model,control){
                    if(control.carWindows == '1'){
                        $('.SS-one-item-wrap-carWindows.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                        this.$('.LCCB-carWindow span').html('开').addClass('active')
                    } else if(control.carWindows == '0') {
                        $('.SS-one-item-wrap-carWindows.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-carWindow span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-carWindows.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-carWindow span').html('--').removeClass('active')
                    }
                    if(control.door == '1'){
                        $('.SS-one-item-wrap-door.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                        this.$('.LCCB-carLock span').html('开').addClass('active')
                    } else if(control.door == '0') {
                        $('.SS-one-item-wrap-door.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-carLock span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-door.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-carLock span').html('--').removeClass('active')
                    }

                    if(control.dormer == '1'){
                        $('.SS-one-item-wrap-dormer.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                        this.$('.LCCB-carDormer span').html('开').addClass('active')
                    } else if(control.dormer == '0') {
                        $('.SS-one-item-wrap-dormer.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-carDormer span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-dormer.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-carDormer span').html('--').removeClass('active')
                    }

                    if(control.trunk == '1'){
                        $('.SS-one-item-wrap-trunk .SS-one-item').addClass('isOpenStatus')
                        this.$('.LCCB-trunk span').html('开').addClass('active')
                    } else if(control.trunk == '0') {
                        $('.SS-one-item-wrap-trunk .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-trunk span').html('关').removeClass('active')
                    } else {
                        $('.SS-one-item-wrap-trunk .SS-one-item').removeClass('isOpenStatus')
                        this.$('.LCCB-trunk span').html('--').removeClass('active')
                    }

                    if(control.air == '1'){
                        $('.SS-one-item-wrap-air.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                    } else {
                        $('.SS-one-item-wrap-air.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                    }
                    if(control.autoAir == '1'){
                        $('.SS-one-item-wrap-autoAir.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                    } else {
                        $('.SS-one-item-wrap-autoAir.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                    }
                    if(control.purge == '1'){
                        $('.SS-one-item-wrap-purge.SS-one-item-close .SS-one-item').addClass('isOpenStatus')
                    } else {
                        $('.SS-one-item-wrap-purge.SS-one-item-close .SS-one-item').removeClass('isOpenStatus')
                    }
                },
                setCarInfoTextDoor: function(model,door){
                    if(!door){
                        this.$('.LCCB-carDoor span').html('--').removeClass('active')
                        return
                    }
                    var isOpen = door.LB || door.LF || door.RB || door.RF;
                    if(isOpen){
                        this.$('.LCCB-carDoor span').html('开').addClass('active')
                    } else {
                        this.$('.LCCB-carDoor span').html('关').removeClass('active')
                    }
                },
                setOil: function(model,oil){
                    if(oil){
                        this._oil = oil;
                        oil= Math.ceil(oil*100) >= 100? '100' : Math.ceil(oil*100);
                    //     this.$('.LCCB-oil span').html(oil+'%');
                    } else {
                        this._oil = '';
                    //     this.$('.LCCB-oil span').html('--');
                    }
                   
                },
                onClickContain: function(e){
                    var me = this;
                    var dataValue = $(e.currentTarget).attr('data-value');
                    switch(dataValue){
                        case 'contain-conditions':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0101')
                            }
                            if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            bfNaviController.push('/cartest/index1.html',{
                                PM25: home._PM25Text,
                                temp: home._temperature,
                                _caData: home._caData,
                                remainMileage: home._remainMileage,
                                oil: this._oil,
                                airPurifyStatus: home.airPurifyStatus,
                                defaultPicture: home.pp_defaultPicture,
                                remoteControl:home._RemoteControl,
                                _updateControlstatus:home._updateControlstatus,
                                _carConf_getConf: home._carConf_getConf
                            });
                            break; 
                        case 'contain-location':
                        //  alert('点击开始刷新位置')
                              OSApp.openCarLocationView('{showControl:"true"}');
                        	// sm("do_Page").fire("openCarLocationView",{showControl:"true"});
//                            OSApp.openCarLocationView();//true为TBox车，false为非tBox
                           
                            setTimeout(refreshCarLocation(),500);
                            break; 
                        case 'contain-control':
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0504');
                            }
                            home.goToControlDetail({newControlIndexs:newControlIndexs},me.model,home._RemoteControl,home.pp_defaultPicture,home.pp_isNeedCB,home.pp_needOtheranimate);
                            break; 
                        case 'contain-diagnoses':
                            break; 
                        case 'contain-shopping':
                        if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            bfNaviController.push('toolkit/newIndex.html')
                            break; 
                        case 'contain-trajectory':
                        if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0502');
                            }
                            bfNaviController.push('drivingReport/index.html')
                            break; 
                        case 'contain-news':
                        if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            bfNaviController.push("toolkit/test.html")
                            break; 
                        case 'contain-car-life':
                        if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0504');
                            }
                            bfNaviController.push("mishang/index.html")
                            break;
                        case 'contain-car-friend':
                        if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            if(typeof MobclickAgent != "undefined"){
                                MobclickAgent.onEvent('0503');
                            }
                            bfNaviController.push("carLife/newIndex.html")
                            break;
                        case 'contain-bluetooth':
                        if(window.threeDDD && window.threeDDD.contentWindow){
                                window.threeDDD.contentWindow.pause && window.threeDDD.contentWindow.pause()
                             }
                            bfNaviController.push("bluetooth/index.html")
                            break;
                    }
                },
                setCarPosition: function(model,position){
                    var me=this;
                    $position = me.$('.contain-location .LCC-bottom');
                    $position.html(position);
                },
                update:function (model,result) {
                    var me=this;
                    var text=me.$('.contain-diagnoses .LCC-bottom');

                    switch (result){
                        case 'risk':
                            text.html('风险');
                            break;
                        case 'normal':
                            text.html('正常');
                            break;
                        case 'fault':
                            text.html('故障');
                            break;
                        default:
                            text.html('--');
                    }
                },
                setPM25:function (model,PM25) {
                    var description = this.$('.LCCB-pm25 span');
                    if(PM25>0){
                        // this.$('.LCCB-pm25').show();
                        switch(true){
                            case PM25<=35&&PM25>0:
                                description.text('优')
                                home._PM25Text = '优';
                                description.css('color','green');
                                break;
                            case PM25<=75&&PM25>35:
                                description.text('良')
                                home._PM25Text = '良';
                                description.css('color','yellow');
                                break;
                            case PM25<=115&&PM25>75:
                                description.text('轻度污染')
                                home._PM25Text = '轻度污染';
                                description.css('color','orange');
                                break;
                            case PM25<=150&&PM25>115:
                                description.text('中度污染')
                                home._PM25Text = '中度污染';
                                description.css('color','red');
                                break;
                            case PM25<=250&&PM25>150:
                                description.text('重度污染')
                                home._PM25Text = '重度污染';
                                description.css('color','#f10d42');
                                break;
                            case PM25>250:
                                description.text('严重污染')
                                home._PM25Text = '严重污染';
                                description.css('color','#9f0842');
                                break;
                            default:
                                description.text('--')
                                home._PM25Text = '--';
                                description.css('color','#8a8a8a')
                                break
                        }
                    } else {
                        description.text('--')
                        description.css('color','#8a8a8a');
                        home._PM25Text = '';
                    }
                    
                },

            });
        }
        //刷新整车数据
        // var carstatus = 2;
        cls.updateCarStatus=function (options) {
            var me = this;
            var carId = bfDataCenter.getCarId();
            me._caData = {};
            //  无论有没有车，都要获取用户消息
              /**
              * 跟新  未读的消息数
             */
            bfClient.getUnReadInfoNumber({
                data: {
                    // trackUserId: window.localStorage['userId'],
                    // realReceiverId: '',
                    actionType: bfDataCenter.getActionType()
                },
                success: function (netdata) {
                     if (netdata.status_code == 0 && netdata.data && (netdata.data != 0)) {
                       if(parseInt(netdata.data) >99){
                            me.$('.LCC-news-number').html('99+').show()
                        } else {
                            me.$('.LCC-news-number').html(netdata.data).show()
                        }
                    } else {
                        me.$('.LCC-news-number').hide()
                    }
                },
                error: function (error) {
                    me.$('.LCC-news-number').hide()
                }
            });
            if (!carId) {
                model.set({
                        door:'noCar',
                        carNumber: '',
                        updateTime:'',
                        checkResult:'',
                        position:'获取位置失败',
                    }
                );
                model.set(
                    {
                        oil: undefined,
                        mileage: undefined,
                        swiperStatus: 'noCar',
                    },
                    {
                        trigger: true
                    }
                );
                // me.$('#navRight').html('');
                //获取车辆列表
                bfClient.getCarList({
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        // OSApp.showStatus("error", '获取车辆列表')
                        if (data.code == 0) {
                            var newArr = data.data.filter(function(item){
                                return item.seriesCode !== "testSeries"
                            })
                            if(newArr.length == 0){
                                bfDataCenter.setCarList(null);
                                bfDataCenter.setCarId(null);
                                return
                            }
                            //让loding看不到
                            bfDataCenter.setCarList(newArr);  //更新本地缓存的车辆列表 lxc
                            bfDataCenter.setCarId(newArr[0].carId);
                        }
                    }
                });
                return;
            }
            // if (!canRefresh) {
            //     return;
            // }

            canRefresh = false;
            // me.scrollPullDown.myscroll.disable();//下拉刷新时禁止滚动
            options && options.start && options.start();

            //刷新结束后的回调
            var complete = function () {
                //    me.scrollPullDown.myscroll.enable();//恢复下拉滚动
                canRefresh = true;
                me.scrollPullDown.resizePulldown();
                options && options.complete && options.complete();
            };

            /**
             *更新车辆位置
             */
            model.set('position', '正在获取位置...')

            bfClient.getCarLocation({
                data: {carId: carId},
                success: function (netdata) {
                    // OSApp.showStatus("error", '位置')
                    if (netdata.success && netdata.scode == 0) {
                        var data = netdata.data;
                        if(data.status == 1){
                            window.carstatus_ljc = 1;
                        }else{
                            window.carstatus_ljc = 0;
                        }
                        var address = data.addrDesc;
                        if (address != '') {
                            model.set('position', address)
                        } else {
                            model.set('position', '无名路')
                        }
                    } else {
                        model.set('position', '获取位置失败')
                    }
                },
                error: function (error) {
                    model.set('position', '获取位置失败');
                }
            });
            bfClient.serviceDetail({
                data:{
                    carId:bfDataCenter.getCarId()
                },
                success: function(res){
                    // OSApp.showStatus("error", '服务详情')
                    if(res && res.success && res.data && res.data.length>0){
                        var dataLength = res.data;
                        var data = res.data;
                        var hasDanger;
                        for(var i=0; i<dataLength; i++){
                            if(data[i].total>0 && data[i].leftPercentage<10){
                                hasDanger = true;
                                i = dataLength;
                            }
                        }
                        if(hasDanger){
                            me.$('.list-contain-item.contain-shopping').addClass('danger');
                        } else {
                            me.$('.list-contain-item.contain-shopping').removeClass('danger')
                        }
                    } else {
                        me.$('.list-contain-item.contain-shopping').removeClass('danger')
                    }
                },
                error: function(){
                    me.$('.list-contain-item.contain-shopping').removeClass('danger')
                }
            })
            this.getRemoteControl(options,carId)
        };

        cls.updateCarDataByControl = function(e){
            var me = this;
            //不得重复控制
            if(controlRunning){
                var type;
                var msg = type == controlRunning ? '当前指令未执行完成' : '上一条指令未执行完成';
                Notification.show({
                    type:'info',
                    message:msg,
                })
                return;
            }
            controlCmd.upControlStatus({
                controlCarSuccess:function () {
                    me.uiAddChrysanthemum_PIN();
                },
                controlCarError:function () {
                    me.uiRemoveChrysanthemum_PIN();
                },
                controlInfoComplete:function () {
                    setTimeout(function(){
                        me.uiRemoveChrysanthemum_PIN();
                        me.updateCarStatus();
                    },600)
                    
                },
                controlInfoTimeout:function () {
                    me.uiRemoveChrysanthemum_PIN();
                },
                controlInfoFail:function () {
                    me.uiRemoveChrysanthemum_PIN();
                },
            });
        }
         // 右上角刷新的loading
        cls.uiAddChrysanthemum_PIN = function(){
            this.$('.im-default-nav-bar').addClass('disable');
        }
        // 左上角刷新的loading
        cls.uiRemoveChrysanthemum_PIN = function(){
            this.$('.im-default-nav-bar').removeClass('disable');
        }
        // 远程控制的时候转圈 控制方法
         cls.loopOptions = function () {
             var me=this;
             var model = me.model;
             var id;
            
             function animate() {
                
             };
             function stopAnimate(type) {
                 
             }

             /**
              * 各个回调的说明请看common/control-cmd.js的send()里的说明
              */
             var options={
                 controlCarSuccess:function (data) {
                    me.uiRemoveChrysanthemum();
                     animate();
                     controlRunning = type;
                 },
                 controlCarError:function () {
                     stopAnimate();
                 },
                 controlInfoRunning:function () {

                 },
                 controlInfoComplete:function () {
                     stopAnimate(type);

                     Notification.show({
                         type:'info',
                         message:'控制指令执行成功'
                     })
                 },
                 controlInfoTimeout:function () {
                     stopAnimate()
                 },
                 controlInfoFail:function () {
                     stopAnimate()
                 },
             };
             return options;
         }

         // 初始化控制项的按钮
        cls.initControlBtn = function(){
            var me = this;
            if(me.initControlBtnNumber>6){
                return
            } else if(!me._RemoteControl){
                setTimeout(function(){
                    me.initControlBtnNumber ++
                    me.initControlBtn()
                },500)
                return
            }
            me.initControlBtnNumber = 0;

            var newRemoteConfigObjectLength = 0
            var newArr = []
            if(me._RemoteControl.sunroofOpen || me._RemoteControl.sunroofClose){
                newArr.push('#control-dormer-temp')
                newRemoteConfigObjectLength ++;
            }
            // 蓝牙
            if(me.isBlueToothCar){
                newArr.push('#control-trunk-slidingdoor-temp');
                newRemoteConfigObjectLength ++;
            }

            if(me._RemoteControl.window){
                newArr.push('#control-carWindows-temp')
                newRemoteConfigObjectLength ++;
            }

            if(me._RemoteControl.airPurify){
                newArr.push('#control-purge-temp');
                newRemoteConfigObjectLength ++;
            }
            
            if(me._RemoteControl.ac == 0){
            } else if(me._RemoteControl.ac == 1){
                newArr.push('#control-air-temp') 
                newRemoteConfigObjectLength ++;
            } else if(me._RemoteControl.ac == 2){
                newArr.push('#control-autoAir-temp')
                newRemoteConfigObjectLength ++;
            }

            if(newArr[0] == newRemoteConfigObject[0] && newArr[1] == newRemoteConfigObject[1] && newArr[2] == newRemoteConfigObject[2] && newArr[3] == newRemoteConfigObject[3] && newArr[4] == newRemoteConfigObject[4] && newArr[5] == newRemoteConfigObject[5]){
               console.log('不变')
               me._mySwiper && me._mySwiper.reInit()
            } else {
               newRemoteConfigObject = newArr;
               me.$('#swiper22').html('<div class="swiper-wrapper"></div><div class="swiper-pagination"></div>');
               me.$('.swiper-wrapper').html(me.$('#control-first-temp').html());
               for(var i = 0; i< newRemoteConfigObjectLength;i=i+2){
                   var div1=document.createElement("div");  
                   div1.className = "swiper-slide swiper-slide-one";
                   if(i+1>=newRemoteConfigObjectLength){
                       div1.innerHTML = me.$(newRemoteConfigObject[i]).html() + me.$('#control-xxxxxx-temp').html()
                   } else {
                       div1.innerHTML = me.$(newRemoteConfigObject[i]).html() + me.$(newRemoteConfigObject[i+1]).html()
                   }
                   me.$('.swiper-wrapper')[0].appendChild(div1)
               }
               me.initSwiper()  
            }
            
            

        }
        // 控制项是否显示隐藏的接口
        cls.getRemoteControlFun = function(res){
            var me = this;
            var data = res.data
            me._RemoteControl = data;
            if(data.wifi == 1){
                window.hasWifi = true;
            } else {
                window.hasWifi = false;
            }

            if(data.ac == 0){
                me.$('.LCCB-temperature').hide()
            } else if(data.ac == 1){
                me.$('.LCCB-temperature').hide()
            } else if(data.ac == 2){
                me.$('.LCCB-temperature').show()
            }
            

            
            me.$('.control-info').hide()
            me.$('.CLV-button-content').css('display',"-webkit-box");
            me.$('.CLV-button-content').css('display',"flex");
        }

        // 控制项是否能够控制的接口
        cls.carconfig_getConditionFun = function(res){
            var me = this;
            // 车窗
            if(res.data.windowStatus){
                me.$('.LCCB-carWindow').show()
            } else {
                me.$('.LCCB-carWindow').hide()
            }
            // 车门
            if(res.data.doorStatus){
                me.$('.LCCB-carDoor').show()
            } else {
                me.$('.LCCB-carDoor').hide()
            }
            // 后备箱
            if(res.data.trunkStatus){
                me.$('.LCCB-trunk').show()
            } else {
                me.$('.LCCB-trunk').hide()
            }
            // 天窗
            if(res.data.sunroofStatus){
                me.$('.LCCB-carDormer').show()
            } else {
                me.$('.LCCB-carDormer').hide()
            }
            if(res.data.airPurifyStatus){
                me.$('.LCCB-pm25').show()
            } else {
                me.$('.LCCB-pm25').hide()
            }
            me.airPurifyStatus = res.data.airPurifyStatus;

             // 车锁  是标配
            //  if(res.data.doorStatus1){
            //     me.$('.LCCB-carLock').show()
            // } else {
            //     me.$('.LCCB-carLock').hide()
            // }
        }
        // 获取车辆配置信息(是否是燃油车，是否带蓝牙钥匙，是否是tbox
        cls.carconfig_carConf_getConfFun = function(res,options,carId){
            var me = this;
            me._carConf_getConf = res.data;
            if(res.data.fuelType == 0){
                window.localStorage['fs_FuelType'] = 0;
                me.$('.content #content-top').removeClass('elect')
                me.$('.content #content-top').removeClass('oil')
                me.$('.content #content-top').addClass('oil')
                me.$('.LCCB-bigLight').hide()
            } else if(res.data.fuelType == 1){
                window.localStorage['fs_FuelType'] = 1;
                me.$('.content #content-top').removeClass('elect')
                me.$('.content #content-top').removeClass('oil')
                me.$('.content #content-top').addClass('elect')
                me.$('.LCCB-bigLight').show()
            }
            if(res.data.bluetoothKey == true){
                me.$('.controlListView-top-right').show()
                me.$('.blueetoothStatus-wrap').show()

                me.isBlueToothCar = true;

                if(me.isLoginBlueTooth[bfDataCenter.getCarData().vin] != true){
                    me.initData()
                }
                // me.$('.contain-bluetooth').show();
            } else {
                me.$('.controlListView-top-right').hide()
                me.$('.blueetoothStatus-wrap').hide()
                me.isBlueToothCar = false;
                // me.$('.contain-bluetooth').hide(); 
            }
            me.initControlBtnNumber = 0;
            me.initControlBtn()
            me.initScroll()
            // 是否是tbox车辆
            if(res.data.tboxNetworkType == null){
                canRefresh = true;
                me.scrollPullDown.resizePulldown();
                options && options.complete && options.complete();
                var license = bfDataCenter.getCarData().plateNumber;
                var carName = bfDataCenter.getCarData().carName;
                if (carName && carName.length > 5) {
                    carName = carName.substr(0, 4) + '...';
                }
                var title = license || carName || null;
                model.set({
                    carNumber: title
                });
                me.$('.home-oushang-style-download').hide()
                if (!me.bluetoothView) {
                    me.bluetoothView = new Bluetooth();
                    me.$('.home-blueethod-view').html(me.bluetoothView.getRoot())
                     me.bluetoothView.show({'isNoTbox':'true'})
                    me.bluetoothView.setLeftVisible(false);
                } else {
                    me.bluetoothView.onShow({'isNoTbox':'true'});
                }
                me.$('.home-blueethod-view').show()
                me.$('#navLeft').css('visibility','hidden')
                me.$('#navRight').css('visibility','hidden')
            } else {
                me.getCarState(options,carId);  
                me.$('.home-oushang-style-download').hide()
                me.$('#navLeft').css('visibility','visible')
                me.$('#navRight').css('visibility','visible')
            }
        }
        // 获取远程控制项接口，接口访问成功并缓存到本地。远程控制项有三个接口：1：控制项是否显示隐藏的接口，2：控制项是否能够控制的接口，3：获取车辆配置信息(是否是燃油车，是否带蓝牙钥匙，是否是tbox)
        cls.getRemoteControl = function(options,carId){
            var me = this;
            var myCarData = bfDataCenter.getCarList()
            if(myCarData){
               var groupMyCarData = _.indexBy(myCarData,function(item){
                    return item.carId
               })
            } else {
                var groupMyCarData = {};
                bfClient.getCarList({
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        if (data.code == 0) {
                             var newArr = data.data.filter(function(item){
                                return item.seriesCode !== "testSeries"
                            })
                            if(newArr.length == 0){
                                bfDataCenter.setCarList(null);
                                return
                            }
                            //让loding看不到
                            bfDataCenter.setCarList(newArr);  //更新本地缓存的车辆列表 lxc
                            me.getRemoteControl(options,carId);
                        }
                    }
                });
                return
            }
            var carData = groupMyCarData[bfDataCenter.getCarId()];

            var confCode = carData && carData.confCode;
            var modelCode = carData && carData.modelCode;
            if(confCode && confCode.indexOf('.')>0){
                var codeArr = confCode.split('.');
                modelCode = codeArr[0];
                confCode = codeArr[1];
            } else if(!confCode && modelCode == "测试车") {
                modelCode = "DEMO"
                confCode = ""
            }
            // if(confCode && confCode.indexOf('.') > 0) {
            //     var codeArr = confCode.split('.');
            // }
            // 测试数据 写死
            // modelCode = 'SC6468BAH5';
            // confCode = 'A4D'

            // modelCode = 'SC6481BBH5';
            // confCode = 'V51A'
            if(window.__currentIs4G()){
                if(window.localStorage['getRemoteControl'+modelCode+confCode] && window.localStorage['getRemoteControlTime'+modelCode+confCode] == moment().format('YYYY-MM-DD')   ){
                    me.getRemoteControlFun(JSON.parse(window.localStorage['getRemoteControl'+modelCode+confCode]))
                } else {
                    bfClient.getRemoteControl({
                        data: {
                            confCode: confCode,
                            modelCode: modelCode
                        },
                        success: function(res){
                            if(res.success){
                                window.localStorage['getRemoteControlTime'+modelCode+confCode] = moment().format('YYYY-MM-DD');
                                window.localStorage['getRemoteControl'+modelCode+confCode] = JSON.stringify(res);
                                me.getRemoteControlFun(res)
                        } else {
                                window.hasWifi = false;
                            newControlIndexs = [];
                            // me.$('#updateCarInfo00').hide()
                            // me.$('#autoAir00').hide()
                            // me.$('#purge00').hide();
                            // me.$('#air00').hide()
                            // me.$('#carWindows00').hide()
                            // me.$('#door00').hide()
                            // me.$("#whistle00").hide()
                            // me.$('#dormer00').hide();
                            // me.$('#dormer00').attr('data-sunroof-open','false')

                            me.$('.control-info').show()
                            me.$('.control-info .control-info-net-error').hide();
                            me.$('.control-info .control-info-no-data').show();
                            me.$('.CLV-button-content').hide()
                            me.$('.LCCB-temperature').hide()

                        }

                    },
                    error: function(data){
                        window.hasWifi = false;
                        // me.$('#updateCarInfo00').hide()
                        // me.$('#autoAir00').hide()
                        // me.$('#purge00').hide();
                        // me.$('#air00').hide()
                        // me.$('#carWindows00').hide()
                        // me.$('#door00').hide()
                        // me.$("#whistle00").hide()
                        // me.$('#dormer00').hide();
                        // me.$('#dormer00').attr('data-sunroof-open','false')
                        
                        me.$('.control-info').show()
                        me.$('.control-info .control-info-net-error').show();
                        me.$('.control-info .control-info-no-data').hide();
                        me.$('.CLV-button-content').hide()
                            me.$('.LCCB-temperature').hide()

                        newControlIndexs = [];
                        me._RemoteControl = undefined;

                    }
                })
                }
            } else {
                var dataStr = window.localStorage['getRemoteControl'+modelCode+confCode];
                var dataObj = dataStr && JSON.parse(dataStr)
                if(dataObj){
                    me.getRemoteControlFun && me.getRemoteControlFun(dataObj)
                } 
            }
            
            if(window.__currentIs4G()){
                if(window.localStorage['carconfig_getCondition'+modelCode+confCode] && window.localStorage['carconfig_getConditionTime'+modelCode+confCode] == moment().format('YYYY-MM-DD')){
                    me.carconfig_getConditionFun(JSON.parse(window.localStorage['carconfig_getCondition'+modelCode+confCode]))
                } else {
                    bfClient.carconfig_getCondition({
                        data: {
                            confCode: confCode,
                            modelCode: modelCode
                        },
                        success: function(res){
                            if(res.success && res.data){
                                    window.localStorage['carconfig_getConditionTime'+modelCode+confCode] = moment().format('YYYY-MM-DD');
                                    window.localStorage['carconfig_getCondition'+modelCode+confCode] = JSON.stringify(res);
                                    me.carconfig_getConditionFun(res)
                            } else {
                                me.$('.LCCB-carWindow').hide()
                                me.$('.LCCB-carDoor').hide()
                                me.$('.LCCB-carDormer').hide()
                                me.$('.LCCB-pm25').hide()
                                // me.$('.LCCB-carLock').hide()

                                me.airPurifyStatus = false;
                            }
                        },
                        error: function(res){
                            me.$('.LCCB-carWindow').hide()
                            me.$('.LCCB-carDoor').hide()
                            me.$('.LCCB-carDormer').hide()
                            me.$('.LCCB-pm25').hide()
                            // me.$('.LCCB-carLock').hide()

                            me.airPurifyStatus = false;
                        }
                    })
                }
            } else {
                var dataStr = window.localStorage['carconfig_getCondition'+modelCode+confCode];
                var dataObj = dataStr && JSON.parse(dataStr)
                if(dataObj){
                    me.carconfig_getConditionFun && me.carconfig_getConditionFun(dataObj)
                } 
            }

            if(window.__currentIs4G()){
                if(window.localStorage['carconfig_carConf_getConf'+modelCode+confCode] && window.localStorage['carconfig_carConf_getConfTime'+modelCode+confCode] == moment().format('YYYY-MM-DD')){
                    me.carconfig_carConf_getConfFun(JSON.parse(window.localStorage['carconfig_carConf_getConf'+modelCode+confCode]),options,carId)
                } else {
                    bfClient.carconfig_carConf_getConf({
                        data: {
                            confCode: confCode,
                            modelCode: modelCode
                        },
                        success: function(res){
                            if(res.success && res.data){
                                window.localStorage['carconfig_carConf_getConfTime'+modelCode+confCode] = moment().format('YYYY-MM-DD');
                                window.localStorage['carconfig_carConf_getConf'+modelCode+confCode] = JSON.stringify(res);
                                me.carconfig_carConf_getConfFun(res,options,carId);
                            } else {
                                me._carConf_getConf = undefined;
                                me.$('.content #content-top').removeClass('elect')
                                me.$('.content #content-top').removeClass('oil')
                                me.$('.LCCB-bigLight').hide()
                                me.$('.content #content-top').addClass('oil')
                                // me.$('.content #content-top').addClass('elect')
                                me.$('.contain-bluetooth').hide(); 
                                me.initScroll()
                               me.getCarState(options,carId);  
                               me.$('.home-oushang-style-download').hide()
                               me.$('#navLeft').css('visibility','visible')
                               me.$('#navRight').css('visibility','visible') 
                         }
                        },
                        error: function(){
                            me._carConf_getConf = undefined;
                            me.$('.contain-bluetooth').hide(); 
                            me.initScroll()
                            me.getCarState(options,carId); 
                            me.$('.LCCB-bigLight').hide()
                            me.$('.home-oushang-style-download').hide()
                            me.$('#navLeft').css('visibility','visible')
                            me.$('#navRight').css('visibility','visible')
                        }
                    })
                }
            } else {
                var dataStr = window.localStorage['carconfig_carConf_getConf'+modelCode+confCode];
                var dataObj = dataStr && JSON.parse(dataStr)
                if(dataObj){
                    me.carconfig_carConf_getConfFun && me.carconfig_carConf_getConfFun(dataObj,options,carId)
                } 
            }


            // bfClient.getQuick({
            //     data: {
            //         'car_id': bfDataCenter.getCarId()
            //     },
            //     success: function(res){
            //         if(res && res.success && res.data){
            //             var buttonNum = 0;
            //             me.$('.CLV-button').attr('class','CLV-button').attr('data-value','').parent().hide();
            //             for(i in res.data){
            //                 if(i !== 'car_id'){
            //                     if(res.data[i] == true){
            //                         me.$('.CLV-button').eq(buttonNum).addClass('CLV-button-'+i)
            //                         me.$('.CLV-button').eq(buttonNum).attr('data-value',i).parent().show();
            //                         buttonNum ++;
            //                     }
            //                 }
            //             }

            //         } else {
            //             me.$('.CLV-button').attr('class','CLV-button').attr('data-value','').parent().hide();
            //             me.$('.CLV-button').eq(0).addClass('CLV-button-alarm_quick');
            //             me.$('.CLV-button').eq(0).attr('data-value','alarm_quick').parent().show();
            //             me.$('.CLV-button').eq(1).addClass('CLV-button-lock_solutuin_quick');
            //             me.$('.CLV-button').eq(1).attr('data-value','lock_solutuin_quick').parent().show();
            //             me.$('.CLV-button').eq(2).addClass('CLV-button-send_car_quick');
            //             me.$('.CLV-button').eq(2).attr('data-value','send_car_quick').parent().show();
            //             // Notification.show({
            //             //     type:"error",
            //             //     message: res.msg
            //             // });
            //         }
            //     },
            //     error: function(){
            //         me.$('.CLV-button').attr('class','CLV-button').attr('data-value','').parent().hide();
            //         // Notification.show({
            //         //     type:"error",
            //         //     message: '网络开小差'
            //         // });
            //     }
            // })

           
        }
        // 获取车辆详情接口
        cls.getCarState = function(options,carId){
            // OSApp.showStatus("error", '车况')
            var me = this;
            //刷新结束后的回调
            var complete = function () {
                //    me.scrollPullDown.myscroll.enable();//恢复下拉滚动
                canRefresh = true;
                me.scrollPullDown.resizePulldown();
                options && options.complete && options.complete();
            };
            /**
             * 更新 检测结果、保养里程、更新时间、车名、油量
             */
            var getCarStateSuccess = function (netdata) {
                console.log('getCarState回调success开始');
                window.localStorage[window.__currentPhone+'getCarState'+carId] = JSON.stringify(netdata)

                var data = netdata.data;
                if(netdata.success && data){

                    var  carName = data.carName,
                        updateTime = data.checkTime,
                        license = data.license,
                        title;

                    if(netdata.data.carUniqueCode && netdata.data.carUniqueCode.toLocaleLowerCase() == 'f201'){
                        title = '__this__is__f201__icon__'
                    } else {
                        //更新标题栏车牌号和上次‘更新时间’，字数超过5个的显示‘...’
                        if (carName && carName.length > 5) {
                            carName = carName.substr(0, 4) + '...';
                        }
                        title = license || carName || null;
                    }
                    model.set({
                        carNumber: title,
                        updateTime: updateTime,
                    });
                }else{
                    model.set({
                        carNumber: '',
                        updateTime: '',
                    });
                };
                // netdata.scode = 6;
                // 首页的渲染逻辑
                if (netdata.success && netdata.scode == 0) {
                    if (netdata.data) {
                        window.sessionStorage.setItem("totalScore", netdata.data.totalScore || 0);
                        window.sessionStorage.setItem("ranking", netdata.data.ranking || '');
                    }
                    // chargingGunConnectionState 表示线的连接状态  0表示未连接，1表示连接
                    // chargeStatus 表示充电状态 3表示未充电，1表示 充电中， 4表示充电结束  254
                            // me.$('#CTanimate').attr('class','elect-status-no');
                            // me.$('#CTanimate').attr('class','elect-status-ing');
                            // me.$('#CTanimate').attr('class','elect-status-end');
                            // me.$('#CTanimate').attr('class','elect-status-read');
                            // me.$('#CTanimate').attr('class','elect-status-error');
                    // if(netdata.data.chargingGunConnectionState == 0){
                    //     me.$('#CTanimate').attr('class','elect-status-no');
                    // } else{
                        if(netdata.data.chargeStatus == 3){
                            me.$('#CTanimate').attr('class','elect-status-no');
                        } else if(netdata.data.chargeStatus == 1){
                            me.$('#CTanimate').attr('class','elect-status-ing');
                        } else if(netdata.data.chargeStatus == 4){
                            me.$('#CTanimate').attr('class','elect-status-end');
                        } else if(netdata.data.chargeStatus == 254){
                            me.$('#CTanimate').attr('class','elect-status-error');
                        } else {
                           me.$('#CTanimate').attr('class','elect-status-no'); 
                    }
                    // }
                    // 剩余可行驶里程：remainedPowerMile     剩余电量百分比：soc
                    // 充电枪连接状态：chargingGunConnectionState   电池充电状态：chargeStatus 
                    // 百公里能耗：averageEnergyConsumption
                    if(netdata.data.remainedPowerMile>=0){
                        me.$('.canDrivingMil-more-number').html(netdata.data.remainedPowerMile + ' km')
                    }
                    if(netdata.data.soc >= 0){
                        me.$('.elect-canDrivingMil-number').html(netdata.data.soc + ' %')
                    }
                    if(netdata.data.averageEnergyConsumption>=0){
                          me.$('.canDrivingMil-energy-consumption').html(Math.round(netdata.data.averageEnergyConsumption*100)/100+' kw·h/百公里')
                    }
                    bfDataCenter.setCarDevice(data.currentDevice);
                    var oil = data.oil,
                        lastMile = parseInt(data.lastMaintainMileage),
                        maintainSpaceMileage = parseInt(data.maintainSpaceMileage),
                        checkResult = data.stateDescription,
                        totalMeter = parseInt(data.totalOdometer),
                        PM25 = parseInt(data.pm25),
                        remainMileage;

                    if(me.$('.content #content-top').hasClass('elect')){
                        // if()
                        oil = netdata.data.soc/100
                    }

                    lastMile = lastMile == -1 ? 0 :lastMile;
                    if(maintainSpaceMileage != -1 && totalMeter != -1) {
                        remainMileage = lastMile + maintainSpaceMileage - totalMeter;
                    }else {
                        remainMileage = '';
                    }
                    me._remainMileage = remainMileage;
                    me._caData.lastMaintainMileage = lastMile;
                    me._caData.maintainSpaceMileage = maintainSpaceMileage;
                    me._caData.totalMeter = totalMeter;
                    me.$('.contain-trajectory .LCC-bottom').html(totalMeter+'KM')
                    model.set({
                            checkResult: checkResult,
                            swiperStatus:netdata.scode,
                            PM25:PM25,
                    },
                    {
                        trigger: true
                    });
                    model.set({
                            oil: oil,
                            mileage: remainMileage,
                        },
                        {trigger: true}
                    );
                    me.setIsPrivacyDrvingHistory(netdata.data);
                    // 缓存一下驾驶页面的 驾驶积分数据等级的分数
                    me.cacheDrivingScoreData(netdata.data);
                    //服务器下发配置更新
                    bfDataCenter.setCarData(netdata.data);
                    bfDataCenter.trigger("UPDATE_MAIN");
                    // me.swiperView.swiperReset();

                    //检查资源包
                    CarResource.checkCarUniqueRescore(function (defaultPicture,isNeedCB,needOtheranimate) {
                        // debugger
                        console.log('defaultPicture路径为：'+defaultPicture+';hasResource值为'+bfDataCenter.getUserValue('HasResource'));
                        if(defaultPicture){
                            me.oilview.defaultPicture = defaultPicture;
                            me.pp_defaultPicture = defaultPicture;
                        }else{
                            me.oilview.defaultPicture ='';
                            me.pp_defaultPicture = '';
                        }
                        me.pp_isNeedCB = isNeedCB;
                        me.pp_needOtheranimate = needOtheranimate;

                        me.updateControlstatus(carId, complete);
                    }, function () {
                        console.log('资源包error回调开始');
                        if(me.oilview){
                           me.oilview.defaultPicture ='';
                           me.pp_defaultPicture = '';
                           progress.removeProgress();
                           me.updateControlstatus(carId, complete); 
                        }
                        
                    }, progress);
                } else {
                    console.log('scode为'+netdata.scode);
                    me.$('#CTanimate').attr('class','elect-status-no');
                    CarResource.checkCarUniqueRescore(function (defaultPicture,isNeedCB,needOtheranimate) {
                        console.log('defaultPicture路径为：'+defaultPicture+';hasResource值为'+bfDataCenter.getUserValue('HasResource'));
                        if(defaultPicture){
                            me.oilview.defaultPicture = defaultPicture;
                            me.pp_defaultPicture = defaultPicture;
                        }else{
                            me.oilview.defaultPicture ='';
                            me.pp_defaultPicture = '';
                        }
                        me.pp_isNeedCB = isNeedCB;
                        me.pp_needOtheranimate = needOtheranimate;
                        model.set({door:''},{trigger: true});
                    },function () {
                        console.log('资源包error回调开始');
                        if(me.oilview){
                        me.oilview.defaultPicture ='';
                        me.pp_defaultPicture = '';
                        me.pp_isNeedCB = '';
                        me.pp_needOtheranimate = '';
                        progress.removeProgress();
                        model.set({door:''},{trigger: true});
                        }
                    },progress);
                    me._caData = {};
                    model.set({
                        checkResult:'',
                        swiperStatus:netdata.scode,
                        PM25:'',
                    },
                    {
                        trigger: true
                    });
                    model.set({
                            oil: '--',
                            mileage: '',
                        },
                        {trigger: true}
                    );
                    complete();
                }
            }
            var getCarStateError = function (error) {
                console.log('getCarState回调error开始')
                var eMsg = '获取车辆信息失败';
                if (typeof(error) === 'string') eMsg = error;
                if (typeof(error) === 'object') {
                    if (error.status == 0) eMsg = "网络开小差";
                }
                me.$('#CTanimate').attr('class','elect-status-no');
                model.set({door: ''});
                model.set({
                    'control':{
                        autoAir: '',
                        air:'',
                        door:'',
                        carWindows: '',
                        whistle:'',
                        dormer:'',
                        purge: '',
                        updateCarInfo: 0,
                        trunk: ''
                    },
                });
                model.set({'temperature': ''});

                me.$('#list-contain').show();
                me.$('.controlListView-top').show();
                me.$('.swiper-container').show();
                me.$('.canDrivingStatus-wrap').show();
                me.$('#CTanimate').show();
                me.$('.yubiao-icon').hide();
                me.initScroll()
                me._mySwiper && me._mySwiper.reInit()

                me.$('.LCCB-carWindow span').html('--').removeClass('active');
                me.$('.LCCB-carDoor span').html('--').removeClass('active');
                me.$('.LCCB-carDormer span').html('--').removeClass('active');
                me.$('.LCCB-carLock span').html('--').removeClass('active');
                me.$('.LCCB-bigLight span').html('--');
                me.$('.canDrivingMil-more-number').html('--')
                me.$('.canDrivingMil-energy-consumption').html('--')
                me.$('.elect-canDrivingMil-number').html('--')
                me.$('.LCCB-temperature .CTSW-text').html('--')
                model.set({oil: undefined});
                Notification.show({
                    type: "error",
                    message: eMsg
                });
                complete();
            }
            if(window.__currentIs4G()){
                bfClient.getCarState(carId, getCarStateSuccess,getCarStateError);
            } else {
                var dataStr = window.localStorage[window.__currentPhone+'getCarState'+carId];
                var dataObj = dataStr && JSON.parse(dataStr)
               if(dataObj){
                   getCarStateSuccess && getCarStateSuccess(dataObj)
               } else {
                    me.uiRemoveChrysanthemum()
                   getCarStateError && getCarStateError('没有本地缓存')
               }
            }
        }

        // 车的轨迹显隐
        cls.setIsPrivacyDrvingHistory = function(data){
            // if(data.isPrivacyDrvingHistory == 1){
            //     window.localStorage['isPrivacyDrvingHistory'] = 1;
            // } else {
            //     window.localStorage['isPrivacyDrvingHistory'] = 0;
            // }
            // 当没有isPrivacyDrvingHistory的时候，去请求正确的接口
            var me= this;
            if(window.localStorage['isPrivacyDrvingHistory'] == undefined){
                bfClient.getCarInfoById({
                    options: {
                        loading: false
                    },
                    data: {'carId': bfDataCenter.getCarId()},
                    success: function (data) {
                        me.setIsPrivacyDrvingHistory1(data.data);
                    },
                    error: function(){
                        $('#home #chrysanthemumWarp').remove()
                    }
                });
            }
            
        }
        // 车的轨迹显隐缓存
        cls.setIsPrivacyDrvingHistory1 = function(data){
            if(data.isPrivacyDrvingHistory == 1){
                window.localStorage['isPrivacyDrvingHistory'] = 1;
            } else {
                window.localStorage['isPrivacyDrvingHistory'] = 0;
            }
        }


        // 拉数据的时候，添加菊花
        cls.uiAddChrysanthemum = function () {
            var me = this;
            if (me.$('.content').eq(0).find('#chrysanthemumWarp').length === 0) {
                me.$('.content').eq(0).append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%;z-index:100;top:0'><div class='bf-chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>加载中...</div></div></div>");
            }
        };
        // 删除菊花
        cls.uiRemoveChrysanthemum =function () {
            this.$('#chrysanthemumWarp').remove();
        };

        cls.cacheDrivingScoreData = function(data){
            if(data){
                window.localStorage.rankLevelName = JSON.stringify(data.rankLevelName || '')
                window.localStorage.rankLevelScore = data.totalScore || 0
            }
        };
        // 获取车辆状态接口
        cls.updateControlstatus=function (carId,func) {
            // OSApp.showStatus("error", '更新updateControlstatus')
            var me=this;
            window.localStorage['refreshstatus'] = true;
            bfClient.getControlStatus({
                data:{carId:carId},
                success: function (netdata) {
                    // OSApp.showStatus("error", '更新updateControlstatus success')
                    console.log('controlstatus回调success开始');
                    if(netdata.success&&netdata.code==0) {
                        var data = netdata.data;
                        me._updateControlstatus = data;
                        var trunk = parseInt(data.trunk);
                        var air=parseInt(data.air.status),
                            //车辆渲染图的车辆状态
                            dormer=parseInt(data.sunroof),
                            door={
                                LF:parseInt(data.leftFrontDoor),
                                LB:parseInt(data.leftRearDoor),
                                RF:parseInt(data.rightFrontDoor),
                                RB:parseInt(data.rightRearDoor),
                                lowBeam:parseInt(data.lowBeam),
                                dormer:dormer,
                                positionLamp:parseInt(data.positionLamp),
                                // turnLndicator:parseInt(data.turnLndicator),
                                trunk:parseInt(data.trunk),
                            },
                        carWindows = parseInt(data.leftFrontDoorrWindow)
                            ||parseInt(data.leftRearDoorrWindow)
                            ||parseInt(data.rightFrontDoorrWindow)
                            ||parseInt(data.rightRearWindow);
                        //车辆控制滑块的车门状态
                        Door = parseInt(data.leftFrontDoorLock)
                            ||parseInt(data.leftRearDoorLock)
                            ||parseInt(data.rightFrontDoorLock)
                            ||parseInt(data.rightRearDoorLock)
                            ||parseInt(data.trunk);
                        if(data.vehicleTemperature && data.vehicleTemperature>-100){
                            me._temperature=temperature=data.vehicleTemperature;
                            me.$('.temperature-debug').show();
                            me.$('.temperature-debug').html(temperature+"°C"); 
                        } else {
                            me.$('.temperature-debug').hide();
                            me._temperature=temperature='';
                        }
                        me._carWindows = carWindows;
                        // 平台在 空气净化器这里传的值 和其他的相反，即 开是0，关是1 
                        if(data.airPurifierStatus == 0){
                            var airPurifier = 1;
                        } else {
                            var airPurifier = 0;
                        }
                        if(data.highBeam == 1 || data.lowBeam == 1){
                            me.$('.LCCB-bigLight span').html('开')
                        } else {
                            me.$('.LCCB-bigLight span').html('关')
                        }
                        // var airPurifier = parseInt(data.airPurifierStatus || 0);
                        model.set({
                            'control':{
                                autoAir: air,
                                air:air,
                                door:Door,
                                carWindows:carWindows,
                                whistle:0,
                                dormer:dormer,
                                purge: airPurifier,
                                updateCarInfo: 0,
                                trunk: trunk
                            },
                        });
                        model.set({'door':door}, {trigger:true});
                        model.set({'temperature': me._temperature});
                        if(me._temperature && me._temperature >-100)
                        {
                            // me.$('.LCCB-temperature').show()
                            me.$('.LCCB-temperature .CTSW-text').html(me._temperature+'°')
                        } else {
                            // me.$('.LCCB-temperature').hide()
                            me.$('.LCCB-temperature .CTSW-text').html('--')
                        }
                    }else{
                        me._updateControlstatus = undefined;
                        model.set({door: ''});
                        model.set({
                            'control':{
                                autoAir: '',
                                air:'',
                                door:'',
                                carWindows: '',
                                whistle:'',
                                dormer:'',
                                purge: '',
                                updateCarInfo: 0,
                                trunk: ''
                            },
                        });
                        me.$('.LCCB-bigLight span').html('--')
                        model.set({'temperature': ''});
                        Notification.show({
                            type:'error',
                            message: netdata.msg
                        });
                    }
                    func&&func();
                    if(window.localStorage['3Dstatus'] != 'false'){  //在3D模型的情况下刷新模型状态
                    me.updateanimation(data);
                    }
                   
                },
                error: function (error) {
                    me._updateControlstatus = undefined;
                    var eMsg = '获取车辆信息失败';
                    if (typeof(error) === 'string') eMsg = error;
                    if (typeof(error) === 'object') {
                        if (error.status == 0) eMsg = "网络开小差";
                    }
                    me.$('.LCCB-bigLight span').html('--')
                    if(window.__currentIs4G()){
                      Notification.show({
                          type:'error',
                          message:'获取车辆信息失败'
                      });  
                    } else {
                        model.set({door: ''});
                    }
                    
                    func&&func();
                    
                },
            });
        };
        //控制模型动画接口  需传入后台获取的车辆控制状态data,因为f201 模型开发无法实现，拖了很久很久。所以兼容了一下f201的写法
        cls.updateanimation = function (data) {
            var me = this;
            var threeD = cls.threeD;
            var refreshstatus = cls.refresh3Dstatus;
            if(bfDataCenter.getCarData().seriesCode.toLowerCase() == 'f201'){
                if (threeD&&threeD.contentWindow&&threeD.contentWindow.hasLoad&&refreshstatus) {
                    me.modelAnimation(threeD,data);
                }else{
                    var iframe_ht = me.$('#iframe_test');
                    cls.refresh3Dstatus = true;
                    if(iframe_ht.attr("src") != ''){
                        var t1 = window.setInterval(updatemodel,1000);      //设置每隔1s判断模型是否加载完成
                        function updatemodel() {
                            if(threeD.contentWindow&&threeD.contentWindow.hasLoad&&data){
                                window.clearInterval(t1);
                                setTimeout(function(){
                                    me.modelAnimation(threeD,data)
                                    },"2000");
                            }
                        }
                    }
                }
            } else {
                if (threeD&&threeD.contentWindow&&threeD.contentWindow.openDoor&&threeD.contentWindow.openWindows&&refreshstatus) {
                    me.modelAnimation(threeD,data);
                }else{
                    var iframe_ht = me.$('#iframe_test');
                    cls.refresh3Dstatus = true;
                    if(iframe_ht.attr("src") != ''){
                        var t1 = window.setInterval(updatemodel,1000);      //设置每隔1s判断模型是否加载完成
                        function updatemodel() {
                            var process = window.localStorage['process'];
                            if(threeD.contentWindow&&threeD.contentWindow.openDoor&&threeD.contentWindow.openWindows&&data&&process>=1){
                                window.clearInterval(t1);
                                // console.log("____======="+process+"////////////////");
                                setTimeout(function(){
                                    me.modelAnimation(threeD,data)
                                    },"2000");
                                window.localStorage['process'] = 0;
                            }
                        }
                    }
                }
            }
            
        }
        // 3D模型提供出来的动画Api
        cls.modelAnimation = function(threeD,data) {
            // threeD.contentWindow.changeAnyColor("#000f10");   修改模型车身颜色
            threeD.contentWindow.openDoor('qlc', data.leftFrontDoor);   //车门打开状态
            threeD.contentWindow.openDoor('hlc', data.leftRearDoor);
            threeD.contentWindow.openDoor('qrc', data.rightFrontDoor);
            threeD.contentWindow.openDoor('hrc', data.rightRearDoor);
            threeD.contentWindow.openDoor('bc', data.trunk);     //后备箱打开状态

            threeD.contentWindow.openWindows('qlbc', data.leftFrontDoorrWindow,data.leftAnteriorWindowDegree);      //四门车窗打开状态
            threeD.contentWindow.openWindows('hlbc', data.leftRearDoorrWindow,data.leftRearWindowDegree);
            threeD.contentWindow.openWindows('qrbc', data.rightFrontDoorrWindow,data.rightAnteriorWindowDegree);
            threeD.contentWindow.openWindows('hrbc', data.rightRearWindow,data.rightRearWindowDegree);
            threeD.contentWindow.openWindows('tcc', data.sunroof?1:0,data.sunroof?1:0);   //天窗

            threeD.contentWindow.openLock && threeD.contentWindow.openLock(data.leftFrontDoorLock);   //天窗
            threeD.contentWindow.rotationToggle(1);  //保持模型一直自转

            threeD.contentWindow.lightToggle(data.light);  //车辆灯光
            threeD.contentWindow.speedToggle(window.carstatus_ljc); //车轮转动状态
        }
        // 按钮按下的效果
        cls.clickEffect = function ($dom) {
            $dom.on('touchstart',function () {
                $(this).css('opacity','0.6');
            });
            $dom.on('touchend',function () {
                $(this).css('opacity','1');
            })
        }
        // 初始化 iscroll，使页面可以滚动
        cls.initScroll=function () {
            var me = this;
            if(!me.scrollPullDown){
                me.$pullDown = me.$('.pulldown');
                // me.containIscroll = new iscroll(this.$('#wrapper11')[0],{
                //         probeType: 2,
                //         scrollX: false,
                //         scrollY: true,
                //         mouseWheel: true
                // });
                // me.containIscroll.on('scrollStart', function() {
                //     me.scrollPullDown && me.scrollPullDown.myscroll.refresh()
                //     me.scrollPullDown && me.scrollPullDown.myscroll.disable()
                // })
                // me.containIscroll.on('scrollEnd', function() {
                //     me.scrollPullDown && me.scrollPullDown.myscroll.refresh()
                //     me.scrollPullDown && me.scrollPullDown.myscroll.enable()

                // })
                me.scrollPullDown = new ScrollPullDown({
                    el: me.$el,
                    click:true,
                    onScrollCallback: function(){
                        var carId = bfDataCenter.getCarId();
                        if(!carId){
                            // if(window.localStorage.getMainDatas == 'false'){
                                me.getMyCars({
                                    success:function () {
                                        me.scrollPullDown.resizePulldown();
                                    },
                                    error:function () {
                                        me.scrollPullDown.resizePulldown();
                                    },
                                });
                            // }else{
                            //     me.scrollPullDown.resizePulldown();
                            // }
                        }else {
                            me.updateCarStatus();
                        }
                    }
                });
                // me.scrollPullDown.myscroll.on('scrollStart', function() {
                //     me.containIscroll && me.containIscroll.disable()
                //     me.containIscroll && me.containIscroll.refresh()
                // })
                // me.scrollPullDown.myscroll.on('scrollEnd', function() {
                //     me.containIscroll && me.containIscroll.refresh()
                //     me.containIscroll && me.containIscroll.enable()
                // })
                // me.$('.swiper-container').on('touchstart',function () {
                //     me.scrollPullDown.myscroll.disable();
                // });
                // me.$('.swiper-container').on('touchend',function () {
                //     me.scrollPullDown.myscroll.enable();
                // })
            }else{
                me.scrollPullDown.myscroll.refresh();
            }
        };
        // 获取车辆列表
        cls.getMyCars = function (options) {
            var me=this;
            bfClient.getMainDatas(function (data) {
                window.localStorage.getMainDatas = true;
                me._onUpdateMainDatas(data);
                options&&options.success&&options.success();
            }, function () {
                window.localStorage.getMainDatas = false;
                options&&options.error&&options.error();
                var eMsg = '获取车辆信息失败';
                if (typeof(error) === 'string') eMsg = error;
                if (typeof(error) === 'object') {
                    if (error.status == 0) eMsg = "网络开小差";
                }
                Notification.show({
                    type:'error',
                    message:eMsg,
                });
            });
        },
        // 获取车辆列表的数据跟新操作
        cls._onUpdateMainDatas = function (data) {
            if (data.OK) {
                var newArr = data.data.filter(function(item){
                    return item.seriesCode !== "testSeries"
                })
                var carsInfos = newArr;
                bfDataCenter.setCarList(carsInfos);
                if (carsInfos.length === 0) {
                    bfDataCenter.setCarDevice(null);
                    bfDataCenter.setCarId(null);
                    bfDataCenter.trigger("NEW_CAR_LIST");
                }
                else if (!bfDataCenter.getCarId())	// No vin, but has car
                {
                    var selectIndex = 0;
                    var length = carsInfos.length;
                    for(var i=0;i<length;i++){
                        if(carsInfos[i].seriesCode == 'testSeries'){
                            selectIndex ++
                        } else {
                            break
                        }
                        
                    }
                    if(selectIndex>=length){
                        selectIndex =0;
                    }
                    var deviceType = (carsInfos[selectIndex].currentDeviceType);
                    bfDataCenter.setCarDevice(deviceType);
                    bfDataCenter.setCarId(carsInfos[selectIndex].carId);
                    bfDataCenter.trigger("NEW_CAR_LIST");
                } else if (data.code == 3) {
                    bfDataCenter.setCarDevice(null);
                    bfDataCenter.setCarId(null);
                    bfDataCenter.trigger("NEW_CAR_LIST");
                } else {
                    var hasCurCar = 0;
                    for (var i = 0; i < carsInfos.length; i++) {
                        if (carsInfos[i].carId == bfDataCenter.getCarId()) {
                            hasCurCar = 1;
                        }
                    }
                    if (hasCurCar == 0) {
                        var deviceType = (carsInfos[0].currentDeviceType);
                        bfDataCenter.setCarDevice(deviceType);
                        bfDataCenter.setCarId(carsInfos[0].carId);
                    }
                    bfDataCenter.trigger("NEW_CAR_LIST");
                }
            } else {
                bfDataCenter.trigger("NEW_CAR_LIST");
            }
        };
        return Base.extend(cls)
    })

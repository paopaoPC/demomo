define([
        'text!control/index.html',
        "common/navView",
        'butterfly',
        "common/osUtil",
        "common/lsUtil",
        "common/ssUtil",
        "common/disUtil",
        "shared/js/notification",
        "iscroll",
        'shared/js/swiper_two',
        "shared/plugin_dialog/js/dialog",
        "shared/plugin_dialogOld/js/dialog",
        "common/control-cmd",
        "appTheme/changeCarType",
        'shared/progress/progress',
        "appTheme/changeCarType",
        'css!shared/css/swiper.min.css'
    ],
    function (template, View, Butterfly, osUtil, lsUtil, ssUtil, disUtil, Notification,iscroll,Swiper, dialog,oldDialog,controlCmd,CarResource,progress,CarResource) {
        var Base = View;
        var controlTexts = ['远程控制','空调控制','空调控制','车窗控制','空气净化','天窗控制'];
        var controlIndexs = [6,5,4,3,2,1];
        /**controllRuning用来表示是否正在发送控制指令中，值有布尔值和字符两种类型
         * @type {string} 有'door','air','dormer'，'whistle'表示控制的对象
         * @type {boolean} 为false，则表示没有进入到控制过程
        */
        // var controlRunning = false;
        var controlModel;
        return Base.extend({
            id: "controlIndex",
            html: template,
            events: {
                'click .icon-button':'onClickIconButton',
                'click #navLeft':'removeView',
                'click #navRight':'onClickRight',
            },
            refreshError: function(){
                this.onShow()
            },
            goBack: function(){
                
            },
            onClickRight: function(){
                bfNaviController.push("control/controlHistory.html")
            },
            // 处理发送前的一些逻辑操作，比如选温度，选档位
            onClickIconButton: function(e){
                this.controlCar(e);
            },
            constructor: function(options,model,RemoteControl,carId,defaultPicture,isNeedCB,needOtheranimate){
                var me = this;
                $('#controlIndex').remove()

                 me.controlIndex = 0;
                 me.carId = carId;
                if(options){
                    this.genControlText(options.newControlIndexs);
                    this.controlIndex = this.genControlIndex(options.controlIndex);
                    this._defaultPicture = defaultPicture;
                    this._isNeedCB = isNeedCB;
                    this._needOtheranimate = needOtheranimate;
                }

                this._model = model;
                this._RemoteControl = RemoteControl;



                this.listenTo(this._model,'change:door',this.setCarPicture);
                this.listenTo(this._model,'change:control',this.setControlState);

                this._MinTemp = 18;
                this._MaxTemp = 32;
                Base.prototype.constructor.call(this, options);
                var root = $("body");
                var siblingView = root.children("#airView");
                if (siblingView.length == 1) {
                    return;
                };
                this.$el.css({
                    'position': 'absolute',
                    'top': '0px',
                    'bottom': '0px',
                    'width': '100%',
                    'z-index': 100,
                  });
                this.$el.append($(template)[0]);
                root.append(this.el);
                setTimeout(function(){
                    // if(typeof(device) != 'undefined'){
                     
                      var Path = CarResource.ResourcePath();
                      if(me._defaultPicture){
                          me.$('.oilView_car.main_car').css('background-image','url('+ Path+ 'carDefault.png' +')');
                      }
                      if(me._isNeedCB){
                          me.$('.air-img-one').css('background-image','url('+ Path+ 'cb-air-bg.png' +')');
                          me.$('.purge-img-one').css('background-image','url('+ Path+ 'cb-air-bg.png' +')');
                          me.$('.dormer-img-one').css('background-image','url('+ Path+ 'cb-control-dormer-one.png' +')');
                          me.$('.dormer-img-two').css('background-image','url('+ Path+ 'cb-control-dormer-two.png' +')');
                      }  
                      if(me._needOtheranimate){
                        me.$('.air-img-two').css('background-image','url('+ Path+ 'air-content.png' +')');
                        me.$('.purge-img-two').css('background-image','url('+ Path+ 'purge-content.png' +')');
                        if(me._needOtheranimate == 'v302'){
                            me.$('.purge-img-two').css('top','110px');
                        }
                      } 
                    // }
                    // }
                    if(RemoteControl && RemoteControl.ac == '2'){
                        me.$('.air-temp-value').show();
                    } else {
                        me.$('.air-temp-value').hide();
                    }
                    
                },0)
                
                
                this.render();              
            },
            render: function(){
                Base.prototype.render.call(this);
                this._navTitle.text(this._controlTexts[0])
                this.onShow();
            },
            genControlIndex: function(index){
                // var newIndex = this._controlIndexs.indexOf(index)
                var newIndex = _.indexOf(this._controlIndexs,index)
                if(newIndex == -1){
                    newIndex = 0;
                }
                return newIndex;
            },
            genControlText: function(newControlIndexs){
                var me = this;
                if(newControlIndexs){
                    this._controlIndexs = newControlIndexs;
                    this._controlTexts = [];
                    _.each(newControlIndexs,function(item){
                        me._controlTexts.push(controlTexts[item-1]);
                    })
                }
            },
            onShow: function(options){
                var me = this;
                this._isShow = true;
                setTimeout(function(){
                    if(!me.firstRend){
                       me.setControlState(me._model,me._model.attributes.control);
                       me.initMobiscrollAuction()  
                       me.getCarTest()
                       me.getControlStatussyn();
                       
                       me.firstRend = true;
                    }
                },500)
                
                if(options){
                    this.genControlText(options.newControlIndexs);
                    this.controlIndex = this.genControlIndex(options.controlIndex);

                    me._defaultPicture = options.defaultPicture;
                    me._isNeedCB = options.isNeedCB;
                    me._needOtheranimate = options.needOtheranimate;
                    if(me._defaultPicture || me._isNeedCB || me._needOtheranimate){
                      setTimeout(function(){
                          if(typeof(device) != 'undefined'){
                            var Path = CarResource.ResourcePath();
                            if(me._defaultPicture){
                                me.$('.oilView_car.main_car').css('background-image','url('+ Path+ 'carDefault.png' +')');
                            }
                            if(me._isNeedCB){
                                me.$('.air-img-one').css('background-image','url('+ Path+ 'cb-air-bg.png' +')');
                                me.$('.purge-img-one').css('background-image','url('+ Path+ 'cb-air-bg.png' +')');
                                me.$('.dormer-img-one').css('background-image','url('+ Path+ 'cb-control-dormer-one.png' +')');
                                me.$('.dormer-img-two').css('background-image','url('+ Path+ 'cb-control-dormer-two.png' +')');
                            } 
                            if(me._needOtheranimate){
                                me.$('.air-img-two').css('background-image','url('+ Path+ 'air-content.png' +')');
                                me.$('.purge-img-two').css('background-image','url('+ Path+ 'purge-content.png' +')');
                                if(me._needOtheranimate == 'v302'){
                                    me.$('.purge-img-two').css('top','110px');
                                }
                            } 
                          }
                          
                      },600)  
                    }
                    
                }

                
                var text = this._controlTexts[this.controlIndex];
                me._mySwiper && me._mySwiper.swipeTo(this.controlIndex,0);
                if(text){
                    this._navTitle.text(text)
                }
                me.animateSlideInRight();
                setTimeout(function(){
                    me._mySwiper && me._mySwiper.reInit();
                },0)
            },
            getCarTest: function(){
                var me = this;
                bfClient.getCarTestData({
                    data: {carId: bfDataCenter.getCarId()},
                    success: function (data) {
                        if (data.success && data.data) {
                            var newData = data.data.details;
                            var dataLength = newData.length;
                           for(var i=0;i<dataLength;i++){
                                if(newData[i].child){
                                    var newChildData = newData[i].child;
                                    var childLength = newChildData.length;
                                    for(var j=0;j<childLength;j++){
                                        if(newChildData[j].itemCode == 'engineSystemStatus'){
                                            window.localStorage['engineStatus'] = newChildData[j].status;
                                            break;
                                        }
                                    }
                                } else {
                                    if(newData[i].itemCode == 'engineSystemStatus'){
                                        window.localStorage['engineStatus'] = newData[i].status;
                                        break;
                                    }
                                }
                                
                           }
                        }

                    }
                });
            },
            getControlStatussyn: function(){
                if(!this.isGetStatusing){
                    this.updateControlstatus(bfDataCenter.getCarId());
                }
            },
            asyncHTML: function(){
                var me = this;
                if(!me.first){
                    setTimeout(function(){
                        me._mySwiper = new Swiper (me.$('#swiper22')[0], {
                            direction: 'vertical',
                            loop: false,
                            initialSlide: me.controlIndex,
                            // 如果需要分页器
                            pagination: '#control .content .swiper-pagination',
                            onSlideChangeEnd: function(swiper){
                                me._navTitle.text(me._controlTexts[swiper.activeIndex]); 
                                me.getControlStatussyn(); 
                            }
                        })
                        _.each(controlIndexs,function(item,index){
                            if(_.indexOf(me._controlIndexs,item)<0){
                                me._mySwiper && me._mySwiper.removeSlide(item-1)
                            }
                        })

                    },0)
                    setTimeout(function(){
                        me.initSVG();
                    },500)
                    me.first = true;
                }
            },
            removeView: function(){
                var me = this;
                this._isShow = false;
                me.animateSlideOutRight(function(){
                    me.remove()
                });
            },
            /**
             * 用svg画出遮罩层
             * 其本质用线画了个圆，但线的宽度超过了原的半径
             * stroke-dasharray和stroke-dashoffset是关键，如何使用就去问度娘了
             */
            initSVG:function () {
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
            },
            createAutoDialog: function(){

            },
            initMobiscrollAuction: function(){
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
                            controlCmd.ControlAir(true,{data:{temperature:inst._tempValue}},me._inner_options);
                        }
                };
                $(me.$el.find('#auctionType')).mobiscroll().select(_data);
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

                //不得重复控制
                if(controlRunning){
                    var msg = type == controlRunning ? '当前指令未执行完成' : '上一条指令未执行完成';
                    Notification.show({
                        type:'info',
                        message:msg,
                    })
                    return;
                }
                //2、进入控制逻辑
                cmd= cmd==='0';//原cmd若为0则要操作就是打开，1则是关闭
                options=me.loopOptions(type,cmd,$slider);
                switch(type){
                    case 'autoAir':
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEvent('0104');
                        }
                        if(cmd){
                            me._inner_options = options;
                            me.$('#auctionType').mobiscroll('show');
                        } else {
                           controlCmd.ControlAir(cmd,options); 
                        }
                        break;
                    case 'carWindows':
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
                           controlCmd.ControlAir(cmd,options); 
                        }
                        break;
                    case 'door':
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEvent('0107');
                        }
                        controlCmd.ControlDoor(cmd,options);
                        break;
                    case 'dormer':
                        if(typeof MobclickAgent != "undefined"){
                            MobclickAgent.onEvent('0105');
                        }
                        if(cmd) {
                            //天窗只能关闭，不能开启
                            if(me._RemoteControl && me._RemoteControl.sunroofOpen){
                                controlCmd.ControlDormer(cmd,options);
                            } else {
                                me.createDialog('天窗','开启')
                            }
                        }else{
                            controlCmd.ControlDormer(cmd,options);
                        }
                        break;
                    case 'whistle':
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
                           controlCmd.ControlPurge(cmd,options); 
                        // }
                        break;
                };
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
            updateControlstatus:function (carId,func) {
                var me=this;
                me.isGetStatusing = true;
                bfClient.getControlStatus({
                    data:{carId:carId},
                    success: function (netdata) {
                        console.log('controlstatus回调success开始');
                        if(netdata.success&&netdata.code==0) {
                            var data = netdata.data;
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
                                me.$('.air-temp-value span').html(data.vehicleTemperature); 
                                // me.$('.air-temp-value').show();
                            } else {
                                // me.$('.air-temp-value').hide();
                                me._temperature=temperature='';
                                me.$('.air-temp-value span').html('--'); 
                            }
                            // 设置
                            me._carWindows = carWindows;
                            // 平台在 空气净化器这里传的值 和其他的相反，即 开是0，关是1 
                            if(data.airPurifierStatus == 0){
                                var airPurifier = 1;
                            } else {
                                var airPurifier = 0;
                            }
                            // var airPurifier = parseInt(data.airPurifierStatus || 0);
                            me._model.set({
                                'control':{
                                    autoAir: air,
                                    air:air,
                                    door:Door,
                                    carWindows:carWindows,
                                    whistle:0,
                                    dormer:dormer,
                                    purge: airPurifier,
                                    updateCarInfo: 0
                                },
                            });
                            me._model.set({'door':door}, {trigger:true});
                            me._model.set({'temperature': me._temperature});
                        }else{
                            me._model.set({door: ''});
                            me._model.set({
                                'control':{
                                    autoAir: '',
                                    air:'',
                                    door:'',
                                    carWindows: '',
                                    whistle:'',
                                    dormer:'',
                                    purge: '',
                                    updateCarInfo: 0
                                },
                            });
                            me._model.set({'temperature': ''});
                            Notification.show({
                                type:'error',
                                message: netdata.msg
                            });
                        }
                        func&&func();
                        me.isGetStatusing = false;
                    },
                    error: function (error) {
                        console.log('controlstatus回调error开始')
                        var eMsg = '获取车辆信息失败';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "网络开小差";
                        }
                        if(window.__currentIs4G()){
                            Notification.show({
                                type:'error',
                                message:'获取车辆信息失败'
                            });
                        }
                        
                        func&&func();
                        me.isGetStatusing = false;
                    },
                });
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
                            path.css('stroke-dashoffset', (me.svgLength+1) / 60000 * (time - timeStart));
                            me.animationId = requestAnimationFrame(animate);
                        }else{
                            path.css('stroke-dashoffset', (me.svgLength+1)*0.95);
                        }
                    })
                };
                function stopAnimate(type) {
                    path.css({'transition':'stroke-dashoffset 0.3s',
                        'stroke-dashoffset':me.svgLength});
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
                        me.updateControlstatus(bfDataCenter.getCarId());
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
                                me && me.updateControlstatus && me.updateControlstatus(bfDataCenter.getCarId());
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
            remove: function(){
                $('#control.page').parent().hide();
            },
            setControlState: function(model,control){
                var me = this;
                if(control.air){
                    if(me._needOtheranimate){
                        setTimeout(function(){
                             me.$('.air-img-two').removeClass('animate-'+me._needOtheranimate);
                             me.$('.air-img-two').addClass('animate-'+me._needOtheranimate)
                         },0) 
                    } else {
                       setTimeout(function(){
                            me.$('.air-img-two').removeClass('animate');
                            me.$('.air-img-two').addClass('animate')
                        },0) 
                    }
                } else {
                    if(me._needOtheranimate){
                        setTimeout(function(){
                            me.$('.air-img-two').removeClass('animate-'+me._needOtheranimate);
                        },0)
                    } else {
                        setTimeout(function(){
                            me.$('.air-img-two').removeClass('animate');
                        },0)
                    }
                }
                if(control.carWindows){
                    setTimeout(function(){
                        me.$('.carWindows-img-two').css('top','80px');
                    },0)
                } else {
                    setTimeout(function(){
                        me.$('.carWindows-img-two').css('top','40px');
                    },0)
                }
                if(control.dormer){
                    setTimeout(function(){
                        me.$('.dormer-img-two').css('top','55px');
                    },0)
                } else {
                    setTimeout(function(){
                        me.$('.dormer-img-two').css('top','16px');
                    },0)
                }
                if(control.purge){
                    if(me._needOtheranimate){
                        setTimeout(function(){
                            me.$('.purge-img-two').removeClass('animate-'+me._needOtheranimate);
                            me.$('.purge-img-two').addClass('animate-'+me._needOtheranimate)
                        },0)
                    } else {
                        setTimeout(function(){
                            me.$('.purge-img-two').removeClass('animate');
                            me.$('.purge-img-two').addClass('animate')
                        },0)
                    }
                    
                } else {
                    if(me._needOtheranimate){
                        setTimeout(function(){
                            me.$('.purge-img-two').removeClass('animate-'+me._needOtheranimate);
                        },0)
                    } else {
                        setTimeout(function(){
                            me.$('.purge-img-two').removeClass('animate');
                        },0)
                    }
                    
                }
                if(control.door){
                    setTimeout(function(){
                        me.$('.oilView_lock_staus').removeClass('lock').addClass('unlock');
                    },0)
                } else {
                    setTimeout(function(){
                        me.$('.oilView_lock_staus').removeClass('unlock').addClass('lock');
                    },0)
                }
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
                switch (true) {
                    //没车
                    case door == 'noCar':
                        $oilView.addClass('noCar');
                        console.log('door设置为noCar');
                        break;
                    //默认图
                    case !!me._defaultPicture:
                        $oilView.removeClass('noCar');
                        console.log('使用下载的默认图');
                        setPicture({
                            '.main_car': 'url(' + me._defaultPicture + ')',
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
                    case hasResource&&!me._defaultPicture:
                        Path = CarResource.ResourcePath();
                        $oilView.removeClass('noCar');
                            console.log('使用下载的资源包');
                        setPicture({
                            '.main_car': 'url(' + Path + 'car1.png)',
                            '.LF': 'url(' + Path + 'LF' + door.LF + '.png)',
                            '.LB': 'url(' + Path + 'LB' + door.LB + '.png)',
                            '.RF': !!door.RF ? 'url(' + Path + 'RF1.png)' : 'none',
                            '.RB': !!door.RB ? 'url(' + Path + 'RB1.png)' : 'none',
                            '.lowBeam': !!door.lowBeam ? 'url(' + Path + 'lowBeam1.png)' : 'none',
                            '.positionLamp': !!door.positionLamp ? 'url(' + Path + 'positionLamp1.png)' : 'none',
                            // '.turnLndicator': !!door.turnLndicator ? 'url('+Path+'turnLndicator1.png)' : 'none',
                            '.dormer': !!door.dormer ? 'url('+Path+'dormer1.png)' : 'url('+Path+'dormer0.png)',
                            '.trunk': !!door.trunk ? 'url(' + Path + 'trunk1.png)' : 'none',
                        })
                        break;
                    default:
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
            
            
        });
    });

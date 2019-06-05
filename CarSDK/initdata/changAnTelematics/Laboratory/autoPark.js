/**
 * Created by 63471 on 2017/4/25.
 */
define(
    [
        "common/navView",
        'main/control-cmd',
        "shared/js/notification",
        "vue",
        'shared/plugin_dialog/js/dialog'
    ],
    function (View,controlCmd,Notification,Vue,dialog){
        var baseView = View;
        Vue.directive('visible',{
            update:function (el,bind) {
                if(bind.value){
                    el.style.visibility = 'visible';
                }else{
                    el.style.visibility = 'hidden';
                }
            }
        })
        return baseView.extend({
            posGenHTML:function () {
                var me=this;
                var vm = me.vm = new Vue({
                    el:me.$('.content')[0],
                    data:{
                        running:false,
                        description:'自动泊车入库\n指令正在发送中',
                        translate:'translate3d(0,0,0)',
                        hidden:0,
                        parkIn:'rotate(90deg)',
                    },
                    methods:{
                        Park:function () {
                            var vm = this;
                            if(vm.running){
                                return;
                            }
                            var carId = bfDataCenter.getCarId();
                            var autoParkModel =parseInt(event.target.dataset.model);
                            function complete(){
                                vm.running = false;
                                me.$('#animating').hide();
                                me.$('#standby').show();
                            }
                            var options = {
                                data:{
                                    cmd:'AutoParking',//'AutoParking',UpCarCondition
                                    carId:carId,
                                    autoParkModel:autoParkModel,
                                },
                                controlCarSuccess:function () {
                                    vm.running = true;
                                    vm.description ='自动泊车入库\n指令正在发送中';
                                    if(autoParkModel){
                                        vm.description ='自动泊车出库\n指令正在发送中';
                                        vm.hidden = 2;
                                        vm.parkIn ='translate3d(-166%,-191.5%,0) rotate(180deg)'
                                    }
                                    me.$('#standby').fadeOut(500,'linear',function () {
                                        me.$('#animating').fadeIn(500,'linear');
                                    });
                                },
                                controlInfoComplete:function () {
                                    Notification.show({
                                        type:'info',
                                        message:'指令发送成功'
                                    });
                                    vm.parking(autoParkModel);
                                },
                                controlInfoRunning:function () {
                                },
                                controlInfoTimeout:function () {
                                    complete()
                                },
                                controlInfoFail:function () {
                                    complete()
                                },
                                controlInfoError:function () {
                                    complete()
                                },
                            };
                            console.log('autoParkModel: '+options.data.autoParkModel);
                            controlCmd.send(options);
                        },
                        parking:function (autoParkModel) {
                            var parkInfoId;
                            var vm = this;
                            var def = $.Deferred();
                            var parkInId;
                            var outLotId;
                            var preState = -1;
                            var states = autoParkModel==1 ? ['INIT','PARKING_OUT_RUNING','PARKING_OUT_COMPLETE','OUT_GARAGE_AUTO_DRIVING','OUT_GARAGE_AUTO_DRIVING_COMPLETE']
                                : ['INIT','IN_GARAGE_AUTO_DRIVING','FIND_PARKING','STOP_NEXT_PARKING','PARKING_IN_RUNING','PARKING_IN_COMPLETE'];
                            var parkCallBack= {
                                INIT:function () {
                                    vm.description=autoParkModel ==1 ?'自动泊车出库\n车辆正在初始化':'自动泊车入库\n车辆正在初始化';
                                },
                                IN_GARAGE_AUTO_DRIVING:function () {
                                    var start = Date.now();
                                    (function findLot() {
                                        var time = Date.now();
                                        var translate = vm.translate =(time-start)%3000/30*0.58333;
                                        var index = Math.floor(translate*12/100)+1;
                                        if(vm.hidden){
                                            var endIndex = vm.hidden>=9 ? vm.hidden-7 : vm.hidden;
                                            if(index == endIndex-1){
                                                def.resolve();
                                                return;
                                            }
                                        }
                                        requestAnimationFrame(findLot);
                                    })();
                                    vm.description='自动泊车入库\n正在自动驾驶寻找车位';
                                },
                                FIND_PARKING:function () {
                                    vm.description='自动泊车入库\n找到车位';
                                },
                                STOP_NEXT_PARKING:function () {
                                    var translate = vm.translate;
                                    var index= Math.floor(translate*12/100)+7;
                                    vm.hidden = index>12 ? index-7 : index;
                                    console.log('hidden: '+vm.hidden);
                                    vm.description='自动泊车入库\n在车位旁停下';
                                },
                                PARKING_IN_RUNING:function () {
                                    def.then(function () {
                                        var parkInTime = Date.now();
                                        (function parkIn() {
                                            var time = (Date.now() - parkInTime)%3000;
                                            if(time <2000){
                                                var a = time/2000*Math.PI/2;
                                                var x = 166*Math.sin(a);
                                                var y = 91.5*Math.sin(a);
                                                var r = 90+Math.atan(0.8430332*Math.tan(a))/Math.PI*180;
                                                vm.parkIn = 'translate3d(-'+x+'%,-'+y+'%,0) rotate('+r+'deg)';
                                            }else{
                                                vm.parkIn = 'translate3d(-170%,-'+(91.5+time/10-200)+'%,0) rotate(180deg)';
                                            }
                                            parkInId = requestAnimationFrame(parkIn);
                                        })();
                                        vm.description='自动泊车入库\n正在倒车入库中';
                                    });
                                },
                                PARKING_IN_COMPLETE:function () {
                                    cancelAnimationFrame(parkInId);
                                    vm.parkIn = 'translate3d(-170%,-191.5%,0) rotate(180deg)';
                                    clearTimeout(parkInfoId);
                                    dialog.createDialog({
                                        closeBtn: false,
                                        buttons: {
                                            '确定': function () {
                                                vm.running = false;
                                                vm.hidden = 0;
                                                vm.translate=0;
                                                vm.parkIn = 'rotate(90deg)';
                                                me.$('#animating').hide();
                                                me.$('#standby').show();

                                                this.close();
                                            },
                                        },
                                        content: "车辆自动泊车入库成功",
                                    });
                                },
                                PARKING_OUT_RUNING:function () {
                                    var parkOutTime = Date.now();
                                    (function parkOut() {
                                        var time = (Date.now() - parkOutTime)%3000;
                                        if(time >1000){
                                            var a = (time-1000)/2000*Math.PI/2;
                                            var x = 166*Math.cos(a);
                                            var y = 91.5*Math.cos(a);
                                            var r = 90+Math.atan(0.8430332/Math.tan(a))/Math.PI*180;
                                            vm.parkIn = 'translate3d(-'+x+'%,-'+y+'%,0) rotate('+r+'deg)';
                                        }else{
                                            vm.parkIn = 'translate3d(-170%,-'+(191.5-time/10)+'%,0) rotate(180deg)';
                                        }
                                        parkInId = requestAnimationFrame(parkOut);
                                    })();
                                    vm.description = '自动泊车出库\n正在自动出库中';
                                },
                                PARKING_OUT_COMPLETE:function () {
                                    cancelAnimationFrame(parkInId);
                                    vm.parkIn = 'translate3d(0,0,0) rotate(90deg)';
                                    vm.description = '自动泊车出库\n自动出库完成,准备驶出车库';
                                },
                                OUT_GARAGE_AUTO_DRIVING:function () {
                                    vm.hidden = 0;
                                    var outLotTime = Date.now();
                                    (function parkOutLot(){
                                        var time = Date.now()-outLotTime;
                                        vm.translate = time%3000/30*0.58333;
                                        outLotId = requestAnimationFrame(parkOutLot);
                                    })();
                                    vm.description = '自动泊车出库\n正在驶出车库中';
                                },
                                OUT_GARAGE_AUTO_DRIVING_COMPLETE:function () {
                                    cancelAnimationFrame(outLotId);
                                    vm.transition = 'transform 1.5s linear';
                                    setTimeout(function () {
                                        vm.translate = 83;
                                    },10);
                                    me.$('#lot').css('transition','transform 2s linear')
                                        .one('transitionend',function () {
                                            $(this).css('transition','none');
                                            vm.description = '自动泊车出库\n自动泊车出库成功';
                                            dialog.createDialog({
                                                closeBtn: false,
                                                buttons: {
                                                    '确定': function () {
                                                        vm.running = false;
                                                        vm.translate=0;
                                                        vm.parkIn = 'rotate(90deg)';
                                                        me.$('#animating').hide();
                                                        me.$('#standby').show();
                                                        this.close();
                                                    },
                                                },
                                                content: "车辆自动泊车出库成功",
                                            });
                                        })
                                    clearTimeout(parkInfoId);
                                }
                            };
                            function controlInfo(){
                                bfNet.doAPI({
                                    api:'/api/car/getControlInfoAutoPark',
                                    data:{carId:bfDataCenter.getCarId()},
                                    options: {loading: false},
                                    success:function (data) {
                                        if(data.code ==0){
                                            var current = states.indexOf(data.data);
                                            if(current ==-1){
                                                vm.running = false;
                                                vm.hidden = 0;
                                                vm.translate=0;
                                                vm.parkIn = 'rotate(90deg)';
                                                me.$('#animating').hide();
                                                me.$('#standby').show();
                                                Notification.show({
                                                    type: "error",
                                                    message: '数据异常：'+data.data,
                                                })
                                                return;
                                            };
                                            if(current > preState){
                                                (function loop() {
                                                    preState++;
                                                    parkCallBack[states[preState]]();
                                                    if(current>preState){
                                                        setTimeout(loop,3000)
                                                    }else if(current < states.length-1){
                                                        setTimeout(controlInfo,3000)
                                                    }
                                                })()
                                            }else {
                                                setTimeout(controlInfo,3000);
                                            }
                                        }else{
                                            vm.description ='状态获取失败\n正在重新请求数据';
                                            setTimeout(controlInfo,3000);
                                        }
                                    },
                                    error:function () {
                                        Notification.show({
                                            type: "error",
                                            message: '连接服务器失败，请检查网络状况',
                                        });
                                        vm.running = false;
                                        vm.hidden = 0;
                                        vm.translate=0;
                                        vm.parkIn = 'rotate(90deg)';
                                        me.$('#animating').hide();
                                        me.$('#standby').show();
                                    }
                                })
                            }
                            controlInfo();
                            // function controlInfo() {
                            //     bfNet.doAPI({
                            //         api:'/api/car/getControlInfoAutoPark',
                            //         data:{carId:bfDataCenter.getCarId()},
                            //         success:function (data) {
                            //             if(data.code ===0){
                            //                 switch (data.data){
                            //                     case 'INIT':
                            //                         if(state != 'INIT'){
                            //                             vm.description='自动泊车入库\n车辆正在初始化';
                            //
                            //                             state = 'INIT';
                            //                         }
                            //                         break;
                            //                     case  'IN_GARAGE_AUTO_DRIVING':
                            //                         if(state != 'IN_GARAGE_AUTO_DRIVING'){
                            //                             var start = Date.now();
                            //                             (function findLot() {
                            //                                 var time = Date.now();
                            //                                 var translate = vm.translate =(time-start)%3000/30*0.58333;
                            //                                 var index = Math.floor(translate*12/100)+1;
                            //                                 if(vm.hidden){
                            //                                     var endIndex = vm.hidden>=9 ? vm.hidden-7 : vm.hidden;
                            //                                     if(index == endIndex-1){
                            //                                         def.resolve();
                            //                                         return;
                            //                                     }
                            //                                 }
                            //                                 requestAnimationFrame(findLot);
                            //                             })();
                            //                             vm.description='自动泊车入库\n正在自动驾驶寻找车位';
                            //                             state='IN_GARAGE_AUTO_DRIVING';
                            //                         }
                            //                         break;
                            //                     case 'FIND_PARKING':
                            //                         if(state != 'FIND_PARKING'){
                            //                             vm.description='自动泊车入库\n找到车位';
                            //                             state ='FIND_PARKING';
                            //                         }
                            //                         break;
                            //                     case 'STOP_NEXT_PARKING':
                            //                         if(state != 'STOP_NEXT_PARKING'){
                            //                             var translate = vm.translate;
                            //                             var index= Math.floor(translate*12/100)+7;
                            //                             vm.hidden = index>12 ? index-7 : index;
                            //                             console.log('hidden: '+vm.hidden);
                            //                             vm.description='自动泊车入库\n在车位旁停下';
                            //                             state = 'STOP_NEXT_PARKING';
                            //                         }
                            //                         break;
                            //                     case 'PARKING_IN_RUNING':
                            //                         if(state != 'PARKING_IN_RUNING'){
                            //                             def.then(function () {
                            //                                 var parkInTime = Date.now();
                            //                                 (function parkIn() {
                            //                                     var time = (Date.now() - parkInTime)%6000;
                            //                                     if(time <4000){
                            //                                         var a = time/4000*Math.PI/2;
                            //                                         var x = 166*Math.sin(a);
                            //                                         var y = 91.5*Math.sin(a);
                            //                                         var r = 90+Math.atan(0.8430332*Math.tan(a))/Math.PI*180;
                            //                                         vm.parkIn = 'translate3d(-'+x+'%,-'+y+'%,0) rotate('+r+'deg)';
                            //                                     }else{
                            //                                         vm.parkIn = 'translate3d(-170%,-'+(91.5+time/20-200)+'%,0) rotate(180deg)';
                            //                                     }
                            //                                     parkInId = requestAnimationFrame(parkIn);
                            //                                 })();
                            //                                 vm.description='自动泊车入库\n正在倒车入库中';
                            //                             });
                            //                             state = 'PARKING_IN_RUNING';
                            //                         }
                            //                         break;
                            //                     case 'PARKING_IN_COMPLETE':
                            //                         if(state != 'PARKING_IN_COMPLETE'){
                            //                             cancelAnimationFrame(parkInId);
                            //                             vm.parkIn = 'translate3d(-170%,-191.5%,0) rotate(180deg)';
                            //                             clearTimeout(parkInfoId);
                            //                             dialog.createDialog({
                            //                                 closeBtn: false,
                            //                                 buttons: {
                            //                                     '确定': function () {
                            //                                         vm.running = false;
                            //                                         vm.hidden = 0;
                            //                                         vm.translate=0;
                            //                                         vm.parkIn = 'rotate(90deg)';
                            //                                         me.$('#animating').hide();
                            //                                         me.$('#standby').show();
                            //
                            //                                         this.close();
                            //                                     },
                            //                                 },
                            //                                 content: "车辆自动泊车入库成功",
                            //                             });
                            //                             state = 'PARKING_IN_COMPLETE';
                            //                         }
                            //                         break;
                            //                     case 'PARKING_OUT_RUNING':
                            //                         if(state != 'PARKING_OUT_RUNING'){
                            //                             var parkOutTime = Date.now();
                            //                             (function parkOut() {
                            //                                 var time = (Date.now() - parkOutTime)%6000;
                            //                                 if(time >2000){
                            //                                     var a = (time-2000)/4000*Math.PI/2;
                            //                                     var x = 166*Math.cos(a);
                            //                                     var y = 91.5*Math.cos(a);
                            //                                     var r = 90+Math.atan(0.8430332/Math.tan(a))/Math.PI*180;
                            //                                     vm.parkIn = 'translate3d(-'+x+'%,-'+y+'%,0) rotate('+r+'deg)';
                            //                                 }else{
                            //                                     vm.parkIn = 'translate3d(-170%,-'+(191.5-time/20)+'%,0) rotate(180deg)';
                            //                                 }
                            //                                 parkInId = requestAnimationFrame(parkOut);
                            //                             })();
                            //                             vm.description = '自动泊车出库\n正在自动出库中';
                            //                             state = 'PARKING_OUT_RUNING';
                            //                         }
                            //                         break;
                            //                     case 'PARKING_OUT_COMPLETE':
                            //                         if(state != 'PARKING_OUT_COMPLETE'){
                            //                             cancelAnimationFrame(parkInId);
                            //                             vm.parkIn = 'translate3d(0,0,0) rotate(90deg)';
                            //                             vm.description = '自动泊车出库\n自动出库完成,准备驶出车库';
                            //                             state = 'PARKING_OUT_COMPLETE';
                            //                         }
                            //                         break;
                            //                     case 'OUT_GARAGE_AUTO_DRIVING':
                            //                         if(state != 'OUT_GARAGE_AUTO_DRIVING'){
                            //                             vm.hidden = 0;
                            //                             var outLotTime = Date.now();
                            //                             (function parkOutLot(){
                            //                                 var time = Date.now()-outLotTime;
                            //                                 vm.translate = time%3000/30*0.58333;
                            //                                 outLotId = requestAnimationFrame(parkOutLot);
                            //                             })();
                            //                             vm.description = '自动泊车出库\n正在驶出车库中';
                            //                             state = 'OUT_GARAGE_AUTO_DRIVING';
                            //                         }
                            //                         break;
                            //                     case 'OUT_GARAGE_AUTO_DRIVING_COMPLETE':
                            //                         if(state != 'OUT_GARAGE_AUTO_DRIVING_COMPLETE'){
                            //                             cancelAnimationFrame(outLotId);
                            //                             vm.transition = 'transform 1.5s linear';
                            //                             setTimeout(function () {
                            //                                 vm.translate = 83;
                            //                             },10);
                            //                             me.$('#lot').css('transition','transform 2s linear')
                            //                                 .one('transitionend',function () {
                            //                                     $(this).css('transition','none');
                            //                                     vm.description = '自动泊车出库\n自动泊车出库成功';
                            //                                     vm.translate = 0;
                            //                                     dialog.createDialog({
                            //                                         closeBtn: false,
                            //                                         buttons: {
                            //                                             '确定': function () {
                            //                                                 vm.running = false;
                            //                                                 vm.translate='translate3d(0,0,0)';
                            //                                                 vm.parkIn = 'rotate(90deg)';
                            //                                                 me.$('#animating').hide();
                            //                                                 me.$('#standby').show();
                            //                                                 this.close();
                            //                                             },
                            //                                         },
                            //                                         content: "车辆自动泊车出库成功",
                            //                                     });
                            //                                 })
                            //                             clearTimeout(parkInfoId);
                            //                             state = 'OUT_GARAGE_AUTO_DRIVING_COMPLETE';
                            //                         }
                            //                         break;
                            //                     case 'STANDBY':
                            //                         if(state != 'STANDBY'){
                            //                             vm.description = '自动泊车出库\n正在自动出库中';
                            //                             state = 'STANDBY';
                            //                         }
                            //                         break;
                            //                 }
                            //             }
                            //             console.log(data.msg);
                            //             parkInfoId = setTimeout(controlInfo,3000);
                            //         },
                            //         error:function (err) {
                            //             Notification.show({
                            //                 type: "error",
                            //                 message: '连接服务器失败，请检查网络状况'
                            //             });
                            //         }
                            //     })
                            // }
                        },
                    }
                })
            },
            onShow:function () {

            },
            onLeft:function () {
                this.vm.$destroy();
                bfNaviController.pop(1);
            }
        })
    })
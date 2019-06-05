define(
    [
        "text!cars/index1.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "shared/js/notification",
        "hammer",
        "shared/plugin_dialog/js/dialog",
        "shared/js/scroll-pull-down",
        'shared/js/swiper_two',
        'css!common/css/im.css'
                
    ],
    function (template, View, Butterfly, ssUtil, Notification, Hammer, Alert, ScrollPullDown, Swiper) {
        var Base = View;
        var RESISTANCE_RATIO = 0.84;
        var PULLDOWN_Y = 60;
        var cls =
        {
            id: 'cars-index1',
            html: template,
            events: {
                "click #navRight": "addCar",
                "click #navLeft": "onCloseView",
                // "click #addCarDemo": "addCarDemo",
                "click .set-car-status": "setCurrentCar",
                "click .car-item":"authItemClick",
                'click .car-data-left': 'onViewList',
                "click .smn-button":'onClickSMN',
                "click .shar-car-data": "goBlueView",
            },
            isFistLoading:true,
        };
        cls.onCloseView = function(){
            OSApp.closeView();
        }
        cls.goBlueView =function(el){
            bfNaviController.push("bluetooth/index.html",{vin:$(el.currentTarget).find('.shar-rows-vin').attr('id')})
        }

        cls.onClickSMN = function(e){
            var  dataValue = $(e.currentTarget).attr('data-value');
            if(this._mySwiper){
                this._mySwiper.swipeTo(dataValue)
            }
        }
        cls.onViewList = function(e){
            var me = this;
            this._detailCarId = $(e.currentTarget).attr('carId-number');
            bfNaviController.push('/cars/carDetails.html?' + this._detailCarId,me._RemoteControl );
        }
      
        cls.onViewPush = function(pushFrom, pushData){
            this._RemoteControl = pushData.RemoteControl;
            this._isTwo = pushData.isTwo;
        }

        cls.onShow = function () {
            $('.ui-mask').remove()
            $('.ui-dialog-old').remove()
            this.getList();
            this.showSharCarList();
            this.initScroll();
            this.initSwiper();
            //this.initAuditeCarsView()
        };
        //框架路由在执行翻页动画前会拉取数据，造成手机卡顿。
        cls.onHide = function () {
        }
        cls.onLeft = function () {
            bfNaviController.pop(1);
        }
                
        cls.initSwiper = function(){
            var me = this;
            me._mySwiper = new Swiper(this.$('#swiper-message')[0], {
                    direction: 'vertical',
                    loop: false,
                    autoplay: false,//可选选项，自动滑动
                    onlyExternal : true,
                    initialSlide: 0,
                    // 如果需要分页器
                    // pagination: '#control .content .swiper-pagination',
                    onSlideChangeEnd: function(swiper){
                        console.log(swiper.activeIndex)
                        if(swiper.activeIndex){      
                                me.$('.swiper-message-nav .smn-button').removeClass('active').eq(1).addClass('active')
                                me.showSharTemplate();
                        } else {
                                me.$('.swiper-message-nav .smn-button').removeClass('active').eq(0).addClass('active')
                                me.getList();
                        }
                    }
            })
            if(!me.first){
                setTimeout(function(){
                    if(me._isTwo){
                        me._mySwiper.swipeTo(1,0)
                        me.$('.swiper-message-nav .smn-button').removeClass('active').eq(1).addClass('active')
                    } else {
                        // me._mySwiper.swipeTo(1,0)
                        me.$('.swiper-message-nav .smn-button').removeClass('active').eq(0).addClass('active')
                    }
                    
                    me.first = true;
                },100)
            }

            // setTimeout(function(){
            //      me._mySwiper.disableTouchControl();
            // },800);
           
        }
                
        //下拉刷新
        cls.initScroll = function () {
            var me = this;
            if (!me.scrollPullDown) {
                me.$pullDown = me.$('.pulldown');
                me.scrollPullDown = new ScrollPullDown({
                    el: me.$el,
                    onScrollCallback: function () {
                        me.getList();
                        me.getNoAuditeCars();
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
                me.$pullDown2 = me.$('.swiper-slide-two .pulldown');
                me.scrollPullDown2 = new ScrollPullDown({
                    el: me.$el.find('.swiper-slide-two'),
                    onScrollCallback: function () {
                       me.showSharCarList(); 
                    },
                    onScrollEnd: function () {
                        if (me.$pullDown2.hasClass('flip')) {
                            me.$pullDown2.addClass('loading');
                            me.$('.swiper-slide-two .pulldown .label').html('正在刷新...');
                            me.scrollPullDown2.scrollCallback();
                        }
                        me.scrollPullDown2.setUILoadingPer(0);
                    }
                })
            } else {
                me.scrollPullDown.myscroll.refresh();
                me.scrollPullDown2.myscroll.refresh();
            }
        }
                
        cls.authItemClick = function (el) {
            var me =this;
            var ment = $(el.currentTarget);
            var vallue = ment.attr('data-delete');
            var divBlock = ment.find(".car-item-left");
            var deleteBlock = ment.find(".deleteBlock");
            var el_target = $(el.target)[0].className;
            var Item_item=ment.find(".des-new")[0];
            var Item=$(Item_item).children('div:last-child')[0].className;
            var Item_target=$(Item_item).children('div:last-child')[0];
            if(vallue&& Item !='deleteBlock'&& el_target===''){
                deleteBlock.stop(true,true).animate({right:"-21%"},100);
                divBlock.stop(true,true).animate({left:"0"},100, function () {
                    ment.removeAttr('data-delete');
                });
                return;
            }else if(vallue&& el_target==='deleteBlock'){
                bfClient.deleteAuth({
                    data:{
                        orderId:$(el.target).attr('id')
                    },
                    success: function (req) {
                        if(req.code == 0 && req.success ==true){
                            /**
                             * 删除成功后调用
                             * */
                            Notification.show({
                                type:"error",
                                message:'删除成功'
                            });
                            var authList=parseInt(me.getElement(".failedCar").length);
                            console.log(authList);
                            if(authList != "1"){
                                me.getNoAuditeCars();
                            }else{
                                $(el.currentTarget).remove();
                                me.getElement(".no-audite-title").hide();
                            }
                        }else{
                            Notification.show({
                                type:"error",
                                message:data.msg
                            });
                        }
                    },error: function () {
                        Notification.show({
                            type:"error",
                            message:'删除失败，稍后再试'
                        });
                    }
                });
                return;
            }
            switch (Item){
                case 'car-status-doing' :
                    this.goToAudite();
                    break;
                case 'car-status-error' :
                    var blockDiv = $(ment).find(".car-item-left");
                    var blockDivSibgs=$(ment).siblings().children(".car-item-left");
                    var deleteDiv = $(ment).find(".deleteBlock");
                    var deleteDivSibgs=$(ment).siblings().children(".deleteBlock");
                    blockDivSibgs.stop(true).animate({left:"0"},300,function(){
                        var data_delete=blockDiv.parent().attr("data-delete");
                        $(blockDivSibgs).parent().removeAttr('data-delete');
                    });
                    deleteDivSibgs.stop(true).animate({right:"-21%"},300);
                    $(deleteDiv).animate({right:'0'},300);
                    this.gotoAiditeError($(Item_target));
                    break;
                default :
                    break;
            }
        }
        cls.goToAudite = function (el) {
            bfNaviController.push("addChanganCar/auditing.html")
        }
        cls.gotoAiditeError = function (el) {
            var index = el.attr("data-index");
            var data = {
                vin: this._dataCars[index].vin,
                enginNo: this._dataCars[index].enginNo,
                certificationResultMsg: this._dataCars[index].certificationResultMsg,
                orderId: this._dataCars[index].orderId
            }
            bfNaviController.push("addChanganCar/auditedError.html", data)
        }
        cls.setCurrentCar = function (el) {
           
            var target = $(el.currentTarget);
            window.localStorage.removeItem('isPrivacyDrvingHistory')
            var index = target.attr("index");
            var deviceType = (this._dataList[index].currentDeviceType);
            bfDataCenter.setCarDevice(deviceType);
            bfDataCenter.setUserValue('carUniqueCode', this._dataList[index].seriesCode);
            bfDataCenter.setCarId(this._dataList[index].carId);
            bfDataCenter.setPinCode(null);
            //todo 清楚检测标志位
            window.hasTest = false;
            //TODO 设置 切换车辆的标志位
            window.hasChangeCar = true;
            bfDataCenter.setUserValue("resourceTime", null);
            if(bfNaviController.getView(-2)&&bfNaviController.getView(-2).name == 'main/index'){
                if(bfNaviController.getView(-2).view.drivingReport){
                    bfNaviController.getView(-2).view.drivingReport.remove();
                    bfNaviController.getView(-2).view.drivingReport = null;
                }
            }
            // navigator.appInfo.didChangeCar(this._dataList[index].carId, function(){}, function(){});
            bfNaviController.popTo("main/index", 'backToHome');
            el.stopPropagation();
        }
        cls.addCar = function () {
            // butterfly.navigate('/cars/addCar.html');
            // bfNaviController.push("addChanganCar/index.html")
            bfNaviController.push("addChanganCar/addCarView.html")
        }
        
                // cls.addCarDemo = function () {
        //     var self = this;
        //     //添加虚拟车辆
        //     bfClient.addDemoCar({
        //         type: 'post',
        //         success: function (data) {
        //             if (data.code == 0) {
        //                 Notification.show({
        //                     type: 'info',
        //                     message: '添加虚拟车辆成功~~'
        //                 });
        //                 bfAPP.trigger("IM_EVENT_CAR_CHANGED");
        //                 self.onShow();
        //             } else if (data.code == 1) {
        //                 Notification.show({
        //                     type: 'error',
        //                     message: '添加失败~~'
        //                 });
        //             }
        //         }
        //     });
        // }

        cls.gotodetails = function (el) {
            // var me = this;
            // for (var i = 0; i < this.getElement(".car-data-left").length; i++) {

            //     (function (node) {
            //         var mapHammer = new Hammer(node);
            //         mapHammer.on('tap', function () {
            //             this._detailCarId = $(node).attr("carId-number");
            //             $(node).parents("li").addClass("active");
            //             setTimeout(function () {
            //                 $(node).parents("li").removeClass("active");
            //             }, 300);
            //             bfNaviController.push('/cars/carDetails.html?' + this._detailCarId,me._RemoteControl );
            //         });
            //     })(this.getElement(".car-data-left")[i]);
            // }
            // (function (node) {
            //     var mapHammer = new Hammer(node);
            //     mapHammer.on('tap', function () {
            //         this._detailCarId = $(node).attr("carId-number");
            //         $(node).parents("li").addClass("active");
            //         setTimeout(function () {
            //             $(node).parents("li").removeClass("active");
            //         }, 300);
            //         bfNaviController.push('/cars/carDetails.html?' + this._detailCarId,me._RemoteControl);
            //     });
            // })(this.getElement(".car-current")[0]);
        };

        cls.getList = function () {
            var me = this;
            //获取车辆管理列表
            bfClient.getCarListCarPage({
                type: "get",
                dataType: "json",
                success: function (data) {
                    if (data.code == 0) {
                        var newArr = data.data.filter(function(item){
                            return item.seriesCode !== "testSeries"
                        })
                        if(newArr.length == 0){
                            data.code = 3;
                        }
                    }
                    
                    if (data.code == 0) {
                        //让loding看不到
                        me._dataList = newArr;//把车辆列表存入dataList
                        bfDataCenter.setCarList(newArr);  //更新本地缓存的车辆列表 lxc
                        var curCarId = bfDataCenter.getCarId();
                        if (me._dataList.length == 0) {

                            bfDataCenter.setCarId(null);
                            bfDataCenter.setCarDevice(null);
                            me.otherCar = false;
                            me.getElement('#nocar').css('display', 'block');
                            me.getElement('#nocar').on('click', function () {
                                // butterfly.navigate('/cars/addCar.html');
                                bfNaviController.push("addChanganCar/addCarView.html")
                            });
                            // me.getElement("#addCarDemo").css("display", 'block');
                            me.getElement("#currentCa").hide();
                        } else if (me._dataList.length >= 1) {
                            me.getElement("#wrapper").show();
                            me.getElement('#nocar').css('display', 'none');
                            // me.getElement('#addCarDemo').css('display', 'none');
                            me.getElement("#currentCa").show();
                            if (!curCarId) {
                                var deviceType = (me._dataList[0].currentDeviceType);
                                bfDataCenter.setCarDevice(deviceType);
                                bfDataCenter.setCarId(me._dataList[0].carId);
                                curCarId = bfDataCenter.getCarId();
                            }
                            for (var i = 0; i < me._dataList.length; i++) {
                                if (me._dataList[i].carId == curCarId) {
                                    me._currentCar = me._dataList[i];
                                    me._dataList.splice(i, 1);
                                    break;
                                }
                            }

                            if (!me._currentCar) {
                                var deviceType = (me._dataList[0].currentDeviceType);
                                bfDataCenter.setCarDevice(deviceType);
                                bfDataCenter.setCarId(me._dataList[0].carId);
                                me._currentCar = me._dataList[0];
                            };
                            me.showTemplate();//进行渲染
                            me.gotodetails();
                            me.deleteCar();
                        }
                        me.initScroll();
                    } else if (data.code == 3) {
                        // me.getElement("#currentCarView").remove();
                        // me.getElement("#wrapper").hide();
                        // Notification.show({
                        //  type:"info",
                        //  message:data.msg
                        // });
                        bfDataCenter.setCarDevice(null);
                        bfDataCenter.setCarId(null);
                        bfDataCenter.setCarList(null); // 没有车辆的时候，清除本地缓存
                        me.otherCar = false;
                        me.getElement('#nocar').css('display', 'block');
                        me.getElement('#nocar').on('click', function () {
                            // butterfly.navigate('/cars/addCar.html');
                            bfNaviController.push("addChanganCar/addCarView.html")
                        });
                        // me.getElement("#addCarDemo").css("display", 'block');
                        me.getElement("#currentCa").hide();
                        // me.initScroll();
                    }
                    me.getNoAuditeCars();
                    //me.$('.swiper-message-nav .smn-button').removeClass('active').eq(0).addClass('active')
                },
                error: function () {
                    me.getElement("#wrapper").hide();
                    me.getElement('#nocar').css('display', 'none');
                    // me.getElement('#addCarDemo').css('display', 'none');
                    Notification.show({
                        type: "error",
                        message: '网络开小差'
                    });
                    me.getNoAuditeCars();
                },
                complete: function () {
                       if(me.isFistLoading){
                            me.isFistLoading =false;
                            // me.$('.swiper-message-nav .smn-button').removeClass('active').eq(0).addClass('active');
                            // me._mySwiper && me._mySwiper.swipeTo(0);
                       }                       
                        //让loding看不到
                        me.scrollPullDown && me.scrollPullDown.resizePulldown();
                }
            });
        }
            
        //获取被分享车辆
        cls.showSharCarList = function(){
            var me = this;
            // //先获取checkCode
            //  if(window.__currentIs4G()){
            //     bfClient.winmu_getCheckCode({
            //        data: {
            //            phone: bfDataCenter.getUserMobile(),
            //        },
            //        success: function(data){
            //            if(data.code == 0){ 
            //                //获取checkCode成功
            //                var checkCode = data.data;
            //                // var bluetoothMyinfo = bfDataCenter.getUserData().myInfo;
            //                //同步checkCode
            //                bfClient.winmu_syncUser({
            //                    data: {
            //                        phone: bfDataCenter.getUserMobile(),
            //                        checkCode: checkCode
            //                    }, 
            //                    success: function(data){
            //                        if(data.code == 0){
            //                            window.getVehicleListWithPhone_blueTooth_car_index_1 = function(res){
            //                                if(res.code == '200'){
            //                                    console.log("获取绑定列表"+res.data);
            //                                    //让loding看不到
            //                                    me._sharDataList = res.data;//把车辆列表存入sharDataList
            //                                    me.showSharTemplate()
            //                                    me.getElement(".swiper-container").css('padding-top', '40px');
                                              
                                              
            //                                    me.getElement(".swiper-message-nav").css('display', 'block');
            //                                    me.initScroll();

            //                                }else if(res.code == '202'){
            //                                    //列表没有数据
            //                                    // me.showSharTemplate();
            //                                    me.getElement(".swiper-container").css('padding-top', '0px');
            //                                     me.getElement(".swiper-message-nav").css('display', 'none');
            //                                     me.initScroll();
            //                                     me._mySwiper.swipeTo(0)
            //                                }else{
            //                                     //获取授权列表失败
            //                                   me.getElement(".swiper-container").css('padding-top', '0px');
            //                                     me.getElement(".swiper-message-nav").css('display', 'none');
            //                                     me.initScroll();
            //                                     me._mySwiper.swipeTo(0)
            //                                }
            //                                   me.scrollPullDown2 && me.scrollPullDown2.resizePulldown();
            //                            }
            //                            OSApp.getVehicleListWithPhone_blueTooth(JSON.stringify({  
            //                                phone: bfDataCenter.getUserMobile(),
            //                                checkCode: checkCode
            //                            }), 'getVehicleListWithPhone_blueTooth_car_index_1')
            //                        }else{
            //                         me.getElement(".swiper-message-nav").css('display', 'none');
            //                         me.initScroll();
            //                        }
            //                    },
            //                     error: function(){
            //                         me.getElement(".swiper-message-nav").css('display', 'none');
            //                         me.initScroll();
            //                    }    
            //                })    


                          
            //            }else{
            //                //获取checkCode失败
            //                me.getElement(".swiper-message-nav").css('display', 'none');
            //                // me.getElement(".content").css('top', '0px');
            //            }
            //        },
            //        error: function(res){
            //            //获取checkCode失败
            //            me.getElement(".swiper-message-nav").css('display', 'none');
            //            // me.getElement(".content").css('top', '0px');
            //        }
            //     }) 
            //  } else {
            //     window.getVehicleListWithPhone_blueTooth_car_index_1213213 = function(res){
            //        if(res.code == '200'){
            //            console.log("获取绑定列表"+res.data);
            //            //让loding看不到
            //            me._sharDataList = res.data;//把车辆列表存入sharDataList
            //            me.showSharTemplate()
            //            me.getElement(".swiper-container").css('padding-top', '40px');
            //            me.getElement(".swiper-message-nav").css('display', 'block');
            //            me.initScroll();

            //        }else if(res.code == '202'){
            //            //列表没有数据
            //            // me.showSharTemplate();
            //            me.getElement(".swiper-container").css('padding-top', '0px');
            //             me.getElement(".swiper-message-nav").css('display', 'none');
            //             me.initScroll();
            //             me._mySwiper.swipeTo(0)
            //            // me.getElement(".content").css('top', '0px');
            //        }else{
            //             //获取授权列表失败
            //            me.getElement(".swiper-container").css('padding-top', '0px');
            //            me.getElement(".swiper-message-nav").css('display', 'none');
            //            me.initScroll();
            //            me._mySwiper.swipeTo(0)
            //            // me.getElement(".content").css('top', '0px');
            //        }
            //        me.scrollPullDown2 && me.scrollPullDown2.resizePulldown();
            //    }
            //    OSApp.getVehicleListWithPhone_blueTooth(JSON.stringify({  
            //        phone: bfDataCenter.getUserMobile(),
            //        checkCode: ''
            //    }), 'getVehicleListWithPhone_blueTooth_car_index_1213213')
            //  }
                   
        }
                
        cls.showNoCarButtom = function () {
            var me = this;
            if (!this.auditeCar && !this.otherCar) {
                me.getElement("#wrapper").hide();
                me.getElement('#nocar').css('display', 'block');
                me.getElement('#nocar').on('click', function () {
                    // butterfly.navigate('/cars/addCar.html');
                    // bfNaviController.push("addChanganCar/index.html")
                    bfNaviController.push("addChanganCar/addCarView.html")
                });
            };
        }
        cls.getNoAuditeCars = function () {
            var me = this;
            bfClient.getNoAuditeCars({
                type: "get",
                dataType: "json",
                success: function (data) {
                    if (data.code == 0) {
                        me._dataCars = data.data;
                        if (!me._dataCars || me._dataCars.length == 0) {
                            me.auditeCar = false;
                        } else {
                            me.getElement(".no-audite-title").show();
                            me.initAuditeCarsView()
                        }
                    } else {
                        me.auditeCar = false
                    }
                },
                error: function () {
                }
            })
        }
        cls.initAuditeCarsView = function () {
            var auditeCarList = _.template(this.getElement("#noAuditeCarlist").html(), {
                "rows": this._dataCars
            })
            this.elementHTML(".noAuditeList", auditeCarList);
            this.initScroll();
            //TODO 测试代码
           var authList = this.getElement('.failedCar');

            for(var i=0;i<authList.length;i++){
                console.log("123");
                (function (Item) {
                    var itemSH=$(Item).find(".des-new")[0];
                    var itemClass=$(itemSH).children('div:last-child')[0].className;
                    switch(itemClass){
                        case "car-status-doing":
                            //var blockDiv = $(Item).find(".car-item-left");
                            //var blockDivSibgs=$(Item).siblings().children(".car-item-left");
                            //var deleteDiv = $(Item).find(".deleteBlock");
                            //var deleteDivSibgs=$(Item).siblings().children(".deleteBlock");
                            var HammerPin = new Hammer(Item);
                            HammerPin.on('pan', function (el) {
                                if(-(el.deltaX) > 45) {
                                    query();
                                }
                            });
                            var query = _(function() {
                                    Notification.show({
                                        type:"error",
                                        message:'审核中无法删除'
                                    });
                            }).debounce(500);
                            break;
                        case "car-status-error":
                            var blockDiv = $(Item).find(".car-item-left");
                            var blockDivSibgs=$(Item).siblings().children(".car-item-left");
                            var deleteDiv = $(Item).find(".deleteBlock");
                            var deleteDivSibgs=$(Item).siblings().children(".deleteBlock");
                            var HammerPin = new Hammer(Item);
                            HammerPin.on('panleft panright', function (el) {
                                var location = el.distance;
                                if(el.distance<45){
                                    return;
                                }else if(el.type==="panleft"){
                                    blockDiv.parent().attr("data-delete",1);
                                    $(blockDiv).animate({left:'-21%'},300);
                                    //当前Item所有兄弟的left and right恢复初始状
                                    $(blockDivSibgs).stop(true).animate({left:"0"},300,function(){
                                        $(blockDivSibgs).parent().removeAttr('data-delete');
                                    });
                                    deleteDivSibgs.stop(true).animate({right:"-21%"},300);
                                    $(deleteDiv).animate({right:'0'},300);
                                }else {
                                    deleteDiv.stop(true).animate({right:"-21%"},300);
                                    blockDiv.stop(true).animate({left:"0"},300, function () {
                                        blockDiv.parent().removeAttr('data-delete');
                                    });
                                }
                            });
                            break;
                        default :
                            break;
                    }
                })(authList[i]);
            }
        }
        cls.showTemplate = function () {

            var token = window.localStorage.getItem("token");
            //建立当前车辆的模板
            var currentCarTempList = _.template(this.getElement("#currentCar").html(), {
                "currentCar": this._currentCar,
                "token": token
            });
            //建立车辆列表的模板
            var carListTempList = _.template(this.getElement("#carlist").html(), {
                "rows": this._dataList,
                "token": token
            });
            this.elementHTML('#carList', carListTempList);
            //把模板填充进去html
            this.elementHTML('#currentCa', currentCarTempList);
        };


 
        
        cls.showSharTemplate = function () {
            var me =this;
            // var token = window.localStorage.getItem("token");
            // //建立分享车辆的模板
            // var  sharCarTempList = _.template(this.getElement("#sharCarListTml").html(), {
            //     "sharRows": this._sharDataList, 
            //     "token": token
            // });
            // this.elementHTML('#sharCarList',sharCarTempList);
        };


                
        cls.deleteCar = function () {
            var me = this;
            //车辆接触绑定功能隐藏，接口问题解决再开启
            // this._dialog = null;
            // var longPressNode = me.getElement(".view_list");
            // for (var inode = 0; inode < longPressNode.length; inode++) {
            //     var node = longPressNode[inode];
            //     var id = $(node).attr("carId-number");
            //     (function (el) {
            //         var hammer = new Hammer(node);
            //         var innerid = id;
            //         hammer.on('press', function (e) {
            //             var target = $(e.target).parents(".car-data").find(".car-data-left");
            //             target = target.attr("carid-number");
            //             var carId = target;
            //             me._dialog = Alert.createDialog({
            //                 closeBtn: false,
            //                 buttons: {
            //                     '取消': function () {
            //                         this.close();
            //                     },
            //                     '确定': function () {
            //                         bfNaviController.push('cars/deleteEquipmentBanding.html', {
            //                             carId: carId,
            //                             from: "index"
            //                         });
            //                         this.close();
            //                     }
            //                 },
            //                 content:"<div style='text-align: center;padding-bottom:15px;font-size:20px'>车辆解绑</div>" +
            //                 "解除绑定后将无法继续使用车联网服务，是否继续？",
            //             });
            //         });
            //     })(node, id)
            // }
        }
        cls.onDeviceBack = function () {
            if (this._dialog) {
                this._dialog.close();
                return true;
            }
            this.onLeft();
            return false;
        }
        return Base.extend(cls);
    });



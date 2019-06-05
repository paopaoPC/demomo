define(
    [
        "common/navView",
        "text!toolkit/index.html",
        'common/dataCenter',
        'common/osUtil',
        'common/ssUtil',
        'spin',
        "swipe",
        "common/disUtil",
        'shared/js/client',
        'shared/js/notification'
    ],
    function (View, template, DataCenter, osUtil, ssUtil, Spinner, swipe, disUtil, ShareClient, Notification) {
        refreshTookit = function () {
            var v = bfNaviController.current();
            if (v) {
                v.view.onShow();
            }
        };
        carLocations = function () {
            bfClient.getCarLocation({
                data: {carId: bfDataCenter.getCarId()},
                success: function (data) {
                    if (data.code == 0) {
                        navigator.appInfo.carLocationView({
                            carLocation: {
                                lat: data.data.lat + "",
                                lng: data.data.lng + "",
                                addr: data.data.addrDesc,
                                heading: data.data.heading == null ? 0.00 : data.data.heading
                            },
                            carState: data.data.status == 1 ? "on" : "off"
                        });
                    }
                    else {
                        navigator.appInfo.showStatus("error", "刷新位置失败");
                    }
                },
                error: function (error) {
                    navigator.appInfo.showStatus("error", "刷新位置失败");
                }

            });
        };
        var updatingCarStateTimer = null;


        startCarState = function () {
            if (updatingCarStateTimer !== null) {
                return;
            }
            updatingCarStateTimer = setInterval(function () {
                    carLocations();
                },
                10000);
        };

        stopCarState = function () {
            if (updatingCarStateTimer !== null) {
                clearInterval(updatingCarStateTimer);
                updatingCarStateTimer = null;
            }
        };
        var Base = View;
        return Base.extend({
            id: "toolkit",
            html: template,
            events: {
                "click .operation-block": "goToDetail",
                "click #adArea .swipe-wrap img": "goToDiscovery"
            },
            hideElement:function () {
                var carUniqueCode = bfDataCenter.getUserValue("carUniqueCode");
                if(carUniqueCode&&carUniqueCode.toLowerCase() == 's401'){
                    this.MoreFunc();
                }else{
                  this.getElement("#unNormal").css("display","none");
                  this.getElement("#normalBlock").css("display","block");
                }
            },
            MoreFunc:function () {
                this.getElement("#unNormal").css("display","block");
                this.getElement("#normalBlock").css("display","none");
            },
            goToDetail: function (el) {
                var id = $(el.currentTarget).attr('id');
                if(!id){
                    return
                }
                // $(el.currentTarget).addClass("active");
                switch (id) {
                    case 'operManual':
                        butterfly.navigate("/toolkit/toolkitDetail.html");
                        break;
                    case 'operGoods':
                        butterfly.navigate('/sales/index.html');
                        break;
                    case "operIllegalSearch":
                    {
                        butterfly.navigate("cars/carList2.html");
                    }
                        break;
                    case "operWbHistory":
                        if (bfDataCenter.getCarDevice() == 'tbox') {
                            bfNaviController.push("/myinfo/maintainHistoryTbox.html", {});
                        } else {
                            var spaceMile = ssUtil.load("spaceMile");
                            var totalMile = ssUtil.load("totalMile");
                            var lastMile = ssUtil.load("lastMile");
                            bfNaviController.push("/myinfo/maintainHistory.html",{
                                spanceMile: spaceMile, wholeMile: totalMile, nextMile: lastMile
                            });
                        }
                        break;
                    case "openYY":
                        // butterfly.navigate("iframePage/storeRequire.html")
                        butterfly.navigate("Laboratory/Peripheralimage.html");
                        break;
                    case "openBY":
                        // butterfly.navigate("iframePage/carMaintain.html");
                        butterfly.navigate("toolkit/changanSC.html");
                        break;
                    case "openBX":
                        butterfly.navigate("iframePage/carInsurInquiry1.html")
                        break;
                    case "openZX":
                         butterfly.navigate("iframePage/buyCar.html")
                        break;
                    case "openPJ":
                        // butterfly.navigate("iframePage/bestProduct.html")
                        butterfly.navigate("autoNavigation/index.html");
                        break;
                    case "operCA":
                        window.open('../toolkit/other.html');
                        break;
                    case "operZT":
                        window.open('../toolkit/other1.html');
                        break;
                    case "openSJ":
                        navigator.appInfo.openElectronicFence();
                        osUtil.delayCall(function () {
                            carLocations();
                        });
                        break;
                    case "openFW":
                        navigator.appInfo.openSurService();
                        break;
                    case "openZS":
                        butterfly.navigate('Laboratory/index.html');
                        break;
                    case "openKF":
                        window.open('../toolkit/other5.html');
                        break;
                    case "openPD":
                        butterfly.navigate("toolkit/products.html");
                        break;
                    case "openDrive":
                        butterfly.navigate("toolkit/testDrive.html");
                        break;
                    case "openDrive1":
                        butterfly.navigate("toolkit/testDrive1.html");
                        break;
                    case "openTT":
                        navigator.appInfo.openTeamTravel();
                        break;
                }
            },
            onShow: function () {
                // this.getElement(".swipe-wrap").html("");  //清空以前的数据
                // this.getElement(".swipe-wrap").append("<figure><img src='../toolkit/img/banner_02.png' class='defaultImg'/></figure>");
//              this.initSwip();
                this.setUIHeight();
                this.getAdPicturesBefore();
            },
            setUIHeight: function(){
                var $content = this.$('.content');
                var contentWidth = $content.width();
                this.$('.swipe-wrap').height(0.5253333*contentWidth);
                var contentHeight = $content .height();
                var adAreaHeight = this.$('#adArea').height();
                this.$('.im-textclr-gray').height(contentHeight -adAreaHeight);
            },
            initSwip: function(){
                var slides=document.getElementsByClassName("point");
                if(typeof (this.InfoSlider) == "object"){
                    delete this.InfoSlider;
                }
                this.InfoSlider = new Swipe(this.getElement('#adSwipe')[0], {
                    auto:1500,
                    continuous: true,
                    disableScroll: false,
                    callback:function (index,elem) {
                        if(slides.length==2)
                        {
                            if(index%2==0){
                                index=0;
                            }
                            else{
                                index=1;
                            }
                        }
                        for(var i=0;i<slides.length;i++){
                            if(i!= index){
                                slides[i].style.background="#ffffff";
                            }
                            else{
                                slides[i].style.background="#ee3a4a";
                            }
                        }
                    }

                });
            },
            goToDiscovery: function (el) {
                var me = this;
                var $target = $(el.currentTarget);
                var id = $target.attr("data-id");
                if(!id){
                    return;
                }
                butterfly.navigate('toolkit/messageContent.html?' + id);
            },
            posGenHTML: function () {
                var from = ShareClient.request("type");
                if (from == "fromMyinfo") {
                    this.setLeftVisible(true);
                }
            },
            getAdPictures: function (catalogId) {
                var self = this;
                var loadNode = self.getElement(".loading-img");
                var swipeNode = self.getElement(".swipe");
                bfClient.getContentList({
                    data: {
                        'catalogId': catalogId   //广告id
                    },
                    success: function (data) {
                        if (data.code == '0' && data.data && data.data.data) {  //lxc
                            var value = data.data.data;
                            console.log(value);
                            var node = self.getElement(".swipe-wrap");
                            var one = self.getElement(".one");
                            node.empty();
                            one.empty();
                            var j = 0;
                            for (var i = 0; i < value.length; i++) {
                                //取有地址的图片作为第一张
                                if (value[i].attachmentList) {
                                        node.append("<figure><img class='imgSwipe' data-id='" + value[i].contentId + "' src='" + (value[i].attachmentList && value[i].attachmentList[0].openUrl || '' ) + "'/></figure>");
                                    if (value.length!=1 && value.length!=0){
                                        one.append("<i class='point'></i>");
                                    }
                                }
                            }
                            var o = document.getElementById("one").getElementsByTagName('i').length;
                            var firstChild=$("#one>:first");
                            if (o >= 2){
                                firstChild.css('background','#ee3a4a');
                                document.getElementById("one").style.display="flex";
                            }
                            self.initSwip();
                            node.find(".imgSwipe")[0].onload =function(argument) {
                                loadNode.remove();

                                // swipeNode.show();
                            }

                        } else {
                            console.log("请求服务器出错~~");
                        }
                    },error:function () {
                    }
                });

            },
            getAdPicturesBefore: function(){
                var self = this;
                bfClient.getRootIdByType({
                    data: {
                        'businessType': 'CA_IMAGE'
                    },
                    options: {loading: false},
                    success: function (data) {
                        if (data.code == '0' && data.data && data.data[0] && data.data[0].manualId) {
                            self.getAdPictures(data.data[0].manualId);
                        } else {
                            Notification.show({
                                type: 'info',
                                message: '广告图片获取失败'
                            });
                        }
                    },
                    error: function () {
                        console.log("广告图片获取失败")
                        self.InfoSlider = new Swipe(self.getElement('#adSwipe')[0], {
                            continuous: false
                        });
                    }
                });
            },


            //初始化图片swipe
            initImgSwipe: function () {
                var me = this;
                me.getElement("#position").css("display", "block");
                var elem = me.getElement("#adSwipe")[0];
                me.mySwipe = new Swipe(elem, {
                    continuous: true,
                    disableScroll: false,
                    callback: function (index, elem) {
                        var whichPage;
                        index = isNaN(index) ? 0 : index;

                        if (me.getElement("#position").children("li").length == 2) {
                            index = index % 2;
                        }

                        whichPage = index + 1;
                        me.getElement("#position").children("li").removeClass("on");
                        me.getElement("#position").children("li:nth-child(" + whichPage + ")").addClass("on");
                        me.mySwipe.restart();
                    },
                    transitionEnd: function (index, elem) {
                    }
                });

            },

            initSpin: function (index) {
                var me = this;
                var opts = {
                    lines: 10, // The number of lines to draw
                    length: 7, // The length of each line
                    width: 3, // The line thickness
                    radius: 8, // The radius of the inner circle
                    color: '#ccc', // #rbg or #rrggbb
                    speed: 1, // Rounds per second
                    trail: 100, // Afterglow percentage
                    shadow: false // Whether to render a shadow
                };
                var target = document.getElementById('spin' + index);
                var spinner = new Spinner(opts).spin(target);
                this.getElement(".defauleimg" + index).show();
            }
        });
    });

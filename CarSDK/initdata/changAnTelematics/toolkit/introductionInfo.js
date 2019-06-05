define(
    [
        "text!toolkit/introductionInfo.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "shared/js/notification",
        "hammer",
        "swipe",
        'iscroll'
    ],
    function (template, View, Butterfly, ssUtil, Notification, Hammer, swipe) {
        var Base = View;
        var cls = {
            events: {
                // "click #pullUp": "pullUpAction",
                "click #slider": "shiftHead",
                "click .contentBottom": "showCatalog",
                "click .leftMenuMask": "hideCatalog",
                "click .LMSCItem": "selectLMSCItem",//选择章节
                'touchstart .scroller': 'onTouchStart',
                'touchend .scroller': 'onTouchEnd',
                'touchmove .scroller': 'onTouchMove'
            }
        };
        cls.onViewPush = function (pushFrom, data) {
            if (data.nameStr) {
                this._seriesName = data.nameStr;
            }
        };
        //清除页面内容
        cls.clearViewRender = function(){
            if(this.childArr){
                var length = this.childArr.length;
            }
            var num = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
            for(var i=0;i<length;i++){
                if(i != num && i != num-1 && i != num+1 ){
                    this.$("#thelist #thelistHead").eq(i).html('');
                    this.$("#thelist li").eq(i).html('');
                }
            }
            
        }

        cls.resetScrollIndex = function(i){
            if(i < 0 || i == this.childArr.length){
                return
            }
            this['myScroll'+i].scrollTo(0,0,0);

        }

        cls.initSwipe = function(){
            var me = this;
            if(!this.mySwipe){
                this.mySwipe = new Swipe(me.getElement("#slider")[0], {
                    continuous: false,
                    closeEndMotion: true,
                    callback: function(index, element) {
                        if(!me.swipeNotFirstInit){
                            me.swipeNotFirstInit = true;
                        } else {
                            setTimeout(function(){
                                window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] = index;
                                me.refreshScrollIndex(index);
                                me.clearViewRender();
                                me.onShow();
                               
                            },0)
                        }
                        // 这里的300是 swipe的默认speed为300
                        setTimeout(function(){
                            me.resetScrollIndex(index-1);
                            me.resetScrollIndex(index+1);
                        },300)
                        
                    },
                    // onTouchStart: function(swipe){
                    //     swipe.touches.diff = 0;
                    // },
                    // onTouchMove: function(swipe,even){
                    // },
                    // onSlideChangeEnd: function(swipe){
                    //     window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] = swipe.activeIndex;
                    //     me.refreshScrollIndex(swipe.activeIndex);

                        // if(me.childArr && me.childArr[swipe.activeIndex+1]){
                        //     var idAdd = me.childArr[swipe.activeIndex+1].contentId;
                        //     var sessionStrAdd = 'bookChapter-' + idAdd;
                        //     if(me[sessionStrAdd]){
                        //         me.viewRender(me[sessionStrAdd],1);
                        //     } 
                        // }

                        // if(me.childArr && me.childArr[swipe.activeIndex-1]){
                        //     var idSub = me.childArr[swipe.activeIndex-1].contentId;
                        //     var sessionStrSub = 'bookChapter-' + idSub;
                        //     if(me[sessionStrSub]){
                        //         me.viewRender(me[sessionStrSub],-1);
                        //     } 
                        // }

                    //     me.clearViewRender();

                    //     me.onShow();
                    // },
                    // onTouchEnd: function(swipe,even){
                    //     console.log('initSwipeEnd')
                    //     var diff = swipe.touches.diff;
                    //     if(swipe.activeIndex == 0 && diff >= 100){
                    //         Notification.show({
                    //             type: 'info',
                    //             message: '当前已是第一章'
                    //         });
                    //     }
                    //     if(swipe.activeIndex == swipe.snapGrid.length-1  && diff <= -100){
                    //         Notification.show({
                    //             type: 'info',
                    //             message: '当前已是最后一章'
                    //         });
                    //     }
                    // },
                });
            }
       }
        cls.slideSwipeIndex = function(index){
            if(this.mySwipe){
                this.mySwipe.slide(index,1);
            }
        }


        cls.shiftHead = function () {
            var me = this;
            this.$navBar.show();
            this.$contentBottom.show();
            setTimeout(function () {
                me.$navBar.toggleClass('active');
                me.$contentBottom.toggleClass('active');
            }, 0);

        };

        cls.hideHead = function(){
            this.$navBar.removeClass('active');
            this.$contentBottom.removeClass('active');
        }

        cls.showCatalog = function () {
            var num = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
            this.$('.LMSContent .LMSCItem').removeClass('active').eq(parseInt(num)).addClass('active');
            this.$('.leftMenuSelectWrap').addClass('active');
            this.$('.leftMenuMask').show();
        };

        cls.hideCatalog = function () {
            this.$('.leftMenuSelectWrap').removeClass('active');
            this.$('.leftMenuMask').hide();
            this.$navBar.hide();
            this.$navBar.removeClass('active');
            this.$contentBottom.hide();
            this.$contentBottom.removeClass('active');
        };

        cls.selectLMSCItem = function (e) {
            var self = this;
            this.$('.LMSContent > .LMSCItem').removeClass('active');
            var $currentTarget = $(e.currentTarget);
            $currentTarget.addClass('active');
            var index = $currentTarget.attr('data-index');

            window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] = index;


            var id = $currentTarget.attr('data-id');
            var content = $('.LMSCIText', $currentTarget).html();

            this.hideCatalog();

            this.onShow();
            var num = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
            self.slideSwipeIndex(num);

        };

        cls.posGenHTML = function () {
            var self = this;
            this.first = true;

            self.$navBar = this.$('#nav-bar');
            self.$contentBottom = this.$('.contentBottom');

            self.setContentHead();
        };

        cls.setContentHead = function(){
            deviceIsIOS && this.$('.contentHead').css('margin-top','20px');
        };

        cls.onShow = function () {
            var self = this;
            if(this.first){
                self.getMessageInfo();
                this.first = false;
            } else {
                var number = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
                self.UIContentHead();
                self.getContentIndex(number);
                self.getContentIndex(number-1);
                self.getContentIndex(number+1);
            }
        };
        //获取一级目录
        cls.getMessageInfo = function () {
            var self = this;
            bfClient.getContentListByRootId({
                data: {
                    'catalogId': bfDataCenter.getToolsCarTypeId()
                },
                options:{loading:true},
                success: function (data) {
                    if (data.code == 0 || data.code == -1 && data.data && data.data.data) {  //lxc
                        self.child = eval(data.data.data);

                        self.childArr = _.flatten(self.child);
                        self.initScroll(self.childArr.length);
                        self.UILeftMenuSelectWrap();
                        //获取当前，上一个，下一个的具体内容
                        var number = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
                        self.UIContentHead();
                        self.setMaxNavTitleWidth();
                        self.getContentIndex(number);
                        self.getContentIndex(number-1);
                        self.getContentIndex(number+1);
                    } else {
                        self.$navBar.show();
                        setTimeout(function () {
                            self.$navBar.toggleClass('active');
                        }, 0);
                        Notification.show({
                            type: 'error',
                            message: '请求服务器出错~~'
                        });
                    }
                },
                error: function () {
                    self.$navBar.show();
                    setTimeout(function () {
                        self.$navBar.toggleClass('active');
                    }, 0);
                    Notification.show({
                        type: 'error',
                        message: '连接服务器失败，请检查网络状况'
                    });
                }
            });
        };

        //只处理99以内
        cls.changeChapterToChina = function (i) {
            var newChapter = '';
            var num = i + 1;
            var ary = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

            var tenNum = parseInt(num / 10);
            if (tenNum == 1) {
                newChapter = '十';
            } else if (tenNum > 1) {
                newChapter = ary[tenNum] + '十';
            }

            newChapter += ary[num % 10];


            return '第' + newChapter + '章';

        };
        cls.setMaxNavTitleWidth = function(){
            this.$('.bookChapter').css('max-width',this.$('.contentHead').width() - this.$('.bookName').width() - 15 + 'px') 
        }
       //获取二级目录 
        // cls.getAllChildName = function (parrent) {
        //     var self = this;
        //     var length = parrent.length;

        //     //计数函数
        //     this.renderNotes = _.after(length, function () {
        //         self.childArr = _.flatten(self.child);
        //         self.initScroll(this.childArr.length);
        //         self.UILeftMenuSelectWrap();
        //         //获取当前，上一个，下一个的具体内容
        //         var number = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
        //         self.UIContentHead();
        //         self.setMaxNavTitleWidth();
        //         self.getContentIndex(number);
        //         self.getContentIndex(number-1);
        //         self.getContentIndex(number+1);
        //     });
        //     this.child = [];
        //     for (var i = 0; i < length; i++) {
        //         (function (index) {
        //             bfClient.getContentList({ //请求子节点的数据
        //                 data: {
        //                     'catalogId': parrent[index].id
        //                 },
        //                 success: function (data) {
        //                     if (data.code == 0 || data.code == -1) {
        //                         self.child[index] = data.data.data;
        //                         self.renderNotes();
        //                     }
        //                 }
        //             });
        //         })(i)
        //     }

        // }; 

        cls.UIContentHead = function () {
            var number = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
            var $contentHead = this.$('.contentHead');
            $('.bookName', $contentHead).html('《' + this._seriesName + '说明书》');
            var chapterStr = this.changeChapterToChina(number) + '<span>' + (this.childArr && this.childArr[number] && this.childArr[number].subject) + '</span>';
            $('.bookChapter', $contentHead).html(chapterStr);
        };

        // cls.getInfo = function (id, info) {
        //     var self = this;
        //     var number = parseInt((window.localStorage.getItem(bfDataCenter.getToolsCarTypeId() + "activeItem")) || 0);
        //     var sessionStr = 'bookChapter-' + id;
        //     if (self[sessionStr]) {
        //         self.contentDetail = self[sessionStr];
        //         self.UIContentHead(self.contentDetail.subject);
        //         self.viewRender(self.contentDetail);
        //     } else {
        //         bfClient.getItemDetail({
        //             data: {
        //                 'id': id
        //             },
        //             options:{loading:false},
        //             success: function (data) {
        //                 self.contentDetail = eval("(" + data.data + ")");
        //                 self[sessionStr] = self.contentDetail;
        //                 self.UIContentHead(self.contentDetail.subject);
        //                 self.viewRender(self.contentDetail);
        //             },
        //             error: function(){
        //                 self.$('.intrLoading').eq(number).removeClass('success').addClass('error');
        //             }
        //         });
        //     }

        // };
        cls.onLeft = function () {
            bfNaviController.popTo("toolkit/toolkitDetail.html");
        };
        cls.onDeviceBack = function () {
            bfNaviController.popTo("toolkit/toolkitDetail.html");
        };

        cls.viewRender = function (contentDetail,diff,num) {
            var me = this;
            if(!diff){
                diff = 0;
            }
            // me.myScroll.scrollTo(0, 0, 500, null);
            var number = num;
            var chapterStr = this.changeChapterToChina(number+diff) + '<span>' + contentDetail.subject + '</span>';
            this.$("#thelist #thelistHead").eq(number+diff).html('<div id="thelistHeadWarp">' + chapterStr + '</div>');
            this.$("#thelist li").eq(number+diff).html(contentDetail.contentBody);
            this.$('.intrLoading').eq(number+diff).removeClass('error').addClass('success');

            // me.myScroll.refresh();
            this.refreshScrollIndex(number+diff);

            // setTimeout(function () {
            //     me.myScroll.refresh();
            // }, 1000);
        };

        /**
         * 滚动翻页 （自定义实现此方法）
         * myScroll.refresh();      // 数据加载完成后，调用界面更新方法
         */
        // cls.pullUpAction = function () {
        //     var me = this;
        //     me.getElement("#scroll-over").css("display", "block");
        //     me.NextItem("laqu");
        //     setTimeout(function () {
        //         me.getElement("#pullUp").css("display", "none");
        //     }, 1000);
        // };
        /**
         * 初始化iScroll控件
         */
        cls.initScroll = function (length) {
            var me = this;
            if (!me.myScroll0) {
                var temDom = me.$('#introductionInfo-swipe-scroll').html();
                var temTotal = '';
                for(var k = 0; k<length; k++){
                    temTotal += temDom;
                }
                me.$('.swipe-wrap').html(temTotal);
                me.$('.content-list-warrp').height(document.body.offsetHeight - 43);
                for(var i = 0; i<length ;i++){
                    me['myScroll'+i] = new IScroll(me.$(".scroller-wrapper").eq(i)[0], {
                        //useTransition: true,
                        momentum: true,  //惯性
                        probeType: 1,  //滚动检测
                        scrollX: false,
                        scrollY: true,
                        //mouseWheel: true,  //鼠标滚轮
                        // bounce: false    //边框反弹
                    });
                    // me.scrollOnpullDown(me['myScroll'+i]);
                    
                }
                me.initSwipe();
                var num = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
                me.slideSwipeIndex(num);

            }

        };

        // cls.scrollOnpullDown = function(iscroller){
                // var me = this;
                // iscroller.on('scroll', function() {
                //     var $pullup = $(this.wrapper).find('.pullup');
                //     if(this.maxScrollY - this.y>= 40){
                //         $pullup.addClass('flip').find('.label').html('释放立即翻页');
                //         $pullup.css("visibility","visible");
                //     } else if(this.maxScrollY - this.y< 40) {
                //         $pullup.removeClass('flip').find('.label').html('上拉翻页');
                //         $pullup.css("visibility","hidden");
                //     }
                // });
                // iscroller.on('scrollEnd', function() {
                //     //if already flip
                //     if ($(this.wrapper).find('.pullup').hasClass('flip')) {
                //         if(me.swipeIndex == me.mySwipe.getNumSlides()-1){
                //             Notification.show({
                //                 type: 'info',
                //                 message: '当前已是最后一章'
                //             });
                //             return
                //         }
                //         var number = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
                //         window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] = number + 1;
                //         me.slideSwipeIndex(number + 1);
                //     }

                // });
        // }

        cls.refreshScrollIndex = function(i){
            if(this['myScroll'+i]){
                this['myScroll'+i].refresh();
            }
        }

        cls.getContentIndex = function(i){
            if(i < 0 || i == this.childArr.length){
                return
            }
            var id = this.childArr[i].contentId;
            this.setLocalInfo(id,i);
        }

        cls.setLocalInfo = function (id,index) {
            var self = this;
            var num = parseInt(window.localStorage[bfDataCenter.getToolsCarTypeId() + 'activeItem'] || 0);
            var sessionStr = 'bookChapter-' + id;
            // 没有本地缓存才去请求网络
            if (!self[sessionStr]) {
                // 如果请求正在pending，那么不执行
                if(!self[sessionStr+'client'] || self[sessionStr+'client'].state() !== 'pending' ){
                   self[sessionStr+'client'] = bfClient.getItemDetail({
                        data: {
                            'id': id
                        },
                        options:{loading:false},
                        success: function (data) {
                            if(data.code === 0 && data.data ){
                                self[sessionStr] = eval("(" + data.data + ")");
                                self.viewRender(self[sessionStr],index - num,num);
                            } else {
                                self.$('.intrLoading').eq(index).removeClass('success').addClass('error');
                            }
                        },
                        error: function(){
                            self.$('.intrLoading').eq(index).removeClass('success').addClass('error');

                        }
                    }); 
                }
                
            } else {
                self.viewRender(self[sessionStr],index - num,num);
            }

        };
        cls.initLeftMenuSelectScroll = function(){
            var me = this;
            new IScroll(me.$(".LMSCItemWarp")[0], {
                momentum: true,  //惯性
                probeType: 1,  //滚动检测
                scrollX: false,
                scrollY: true,
                bounce: true    //边框反弹
            });
        }
        cls.UILeftMenuSelectWrap = function () {
            var childsTemp;
            var parrentTemp = '';
            var chapter;
            //缓存起
            var length = this.childArr.length;
            var templateStr = this.$('#introductionInfo-leftMenuSelect').html();
            for (var i = 0; i < length; i++) {
                childsTemp = '';
                chapter = this.changeChapterToChina(i);
                childsTemp = _.template(templateStr, {data: this.childArr[i], chapter: chapter, index: i});
                parrentTemp += childsTemp;
            }
            this.$('.LMSContent').html(parrentTemp);
            this.initLeftMenuSelectScroll();

        }  
        //以下三个方法解决swipe和iscroll同时滑动问题
       cls.onTouchStart = function (events) {
            this.swipeIndex = this.mySwipe.getPos();
            this['myScroll'+this.swipeIndex].refresh();
            // this.touchFirst = true;
            this.touchNum = 0;

            if (this.mySwipe) {
                this.mySwipe.pause();
            }
            if (this['myScroll'+this.swipeIndex]) {
                this['myScroll'+this.swipeIndex].enabled = false;
            }

            this.lastX = events.originalEvent.touches[0].clientX;
            this.lastY = events.originalEvent.touches[0].clientY;
            this.endX = 0;

        };
        cls.onTouchMove = function (events) {
            if (this.touchNum !== 3 ) {
                this.touchNum = this.touchNum + 1;
                if(this.touchNum === 1){
                    this.hideHead()
                }
                if(this.touchNum <3){
                    return
                }
                this.clientX = events.originalEvent.touches[0].clientX;
                this.clientY = events.originalEvent.touches[0].clientY;

                var changeX = Math.abs(this.clientX - this.lastX);
                var changeY = Math.abs(this.clientY - this.lastY);
                if(changeY){
                    var tan = changeX  / changeY;
                } else {
                    var tan = 1111;
                }
            } else {
                this.endX = events.originalEvent.touches[0].clientX;
                return
            }
            if(tan < 0.75 || tan === 0.75){//
                this['myScroll'+this.swipeIndex].enabled = true;
                // this.touchNum = 0;
            }else if(tan > 0.75){//左右
                this.mySwipe.resume();
                // this.touchNum = 0;
            }
        };
        cls.onTouchEnd = function (events) {

            delete this.touchNum;
            this['myScroll'+this.swipeIndex].enabled = true;
            var diff = this.endX - this.lastX;
            // this.endY = events.originalEvent.touches[0].clientY;
            if(this.swipeIndex == 0 && diff >= 100){
                Notification.show({
                    type: 'info',
                    message: '当前已是第一章'
                });
            }
            if(this.swipeIndex == this.mySwipe.getNumSlides()-1  && diff <= -100){
                Notification.show({
                    type: 'info',
                    message: '当前已是最后一章'
                });
            }

        };
        return Base.extend(cls);
    }
);
// options参数: {
// 		el(必传,调用页的dom),
// 		onScroll(自定义--滚动时事件),
// 		onScrollEnd(自定义--滚动结束事件),
//      onScrollCallback(自定义--下拉刷新的回调),
//      onAnimationCallback(自定义 下拉恢复动画--结束的回调)
//      onResizePulldown( 自定义 -- 下拉恢复函数)
// 		time(下拉恢复消耗的时间)
// }
// js:
// var me = this;
// if(!me.scrollPullDown){
//     me.$pullDown = me.$('.pulldown');
//     me.scrollPullDown = new ScrollPullDown({
//        el: me.$el,
//        onScrollCallback: function(){
//             me.scrollPullDown.resizePulldown();
//        },
//        onScrollEnd: function(){
//            if (me.$pullDown.hasClass('flip')) {
//                me.$pullDown.addClass('loading');
//                me.$('.pulldown .label').html('正在刷新...');
//                me.scrollPullDown.scrollCallback();
//             }
//            me.scrollPullDown.setUILoadingPer(0);
//        } 
//     })
// } else {
//     me.scrollPullDown.myscroll.refresh();
// }
// html:
// <div id="wrapper">
//     <div id="scroller"></div>
// </div>
// css:
     
define([
        "iscroll"
    ],
    function(iscroll) {

        function ScrollPullDown (options){
            this.init(options);
        }
        	
        ScrollPullDown.prototype = {
            PULLDOWN_Y : 60,
            init: function(options){
                var defaultOptions = {
                    time: 600,
                    bounceTime: 400,
                }
                // 挂载类backbone的$属性
                this.$ = function(selector){ return options.el.find(selector)};
                this.options = _.extend({}, defaultOptions ,options);
                // 初始化iscroll
                this.initScroll();

                return this;
            },
            //下拉刷新
            initScroll: function() {
                var me = this;
                if (!this.myscroll) {
                    this.$iconOne =  this.$('.iconOne');
                    this.$iconTwo =  this.$('.iconTwo');
                    this.$pullDown = me.$('.pulldown');
                    this.$wrapper = this.$('#wrapper');
                    this.$iscroll = this.$('#wrapper > #scroller');
                    //bounceTime 为0，无法触发scrollEnd
                    this.myscroll = new iscroll(this.$wrapper[0], {
                        probeType: 2,
                        scrollX: false,
                        scrollY: true,
                        mouseWheel: true,
                        bounceTime: me.options.bounceTime,
                        preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|DIV)$/ }
                        // bounceEasing: 'quadratic'
                    });
                    this.scrollOnpullDown();  
                } else {
                    this.myscroll.refresh();
                }
            },
            // 挂载scroll事件
            scrollOnpullDown: function(){
                var me = this;
                
                if(me.options.onScroll){
                    // 自定义滚动事件
                    me.myscroll.on('scroll', function() {
                        me.options.onScroll();
                    });
                } else {
                    // 默认事件
                    me.myscroll.on('scroll', function() {
                        if (this.y > 60) {
                          me.myscroll.options.isPullToRefresh = true;
                          me.$pullDown.addClass('flip').find('.label').html('释放立即更新');
                        } else if(this.y < 60 && this.y > 0) {
                          me.myscroll.options.isPullToRefresh = false;
                          me.$pullDown.removeClass('flip').find('.label').html('下拉立即刷新');
                        };
                        if(this.y>-20 && this.y<=me.PULLDOWN_Y+20){
                            me.loadingY = this.y;
                            setTimeout(function(){
                                me.setUILoadingPer(me.loadingY);
                            },0)
                       }
                    });
                }
                // 自定义滚动结束事件
                if(me.options.onScrollEnd){
                    me.myscroll.on('scrollEnd', function() {
                        me.options.onScrollEnd();
                    });
                } else {
                    me.myscroll.on('scrollEnd', function(e) {
                        if (me.$pullDown.hasClass('flip')) {
                            me.$pullDown.addClass('loading');
                            me.$('.pulldown .label').html('正在刷新...');
                            me.scrollCallback();
                        }
                        me.setUILoadingPer(0);
                    });
                }

                this.$iscroll.on('touchend',function(){
                    if(me.options.onTouchend){
                        me.options.onTouchend()
                    } else {
                        if (me.$pullDown.hasClass('flip')) {
                            me.$pullDown.addClass('loading');
                            me.$('.pulldown .label').html('正在刷新...');
                            // me.scrollCallback();
                        }
                        // me.setUILoadingPer(0);
                    }
                })

                
                
            },
            setUILoadingPer: function(value){
                var me = this;
                var diff = 40;
                if(value <= diff){
                    me.$iconTwo.css({clip:'rect(0px,28px,0px,14px)'});
                    me.$iconOne.css({clip:'rect(0px,28px,0px,14px)'});
                } else {
                    if(value > this.PULLDOWN_Y ){
                        value = this.PULLDOWN_Y ;
                    }
                    var per = (value - diff) / (this.PULLDOWN_Y - diff);
                    if(per<=0.5){
                        me.$iconTwo.css({clip:'rect(0px,28px,0px,14px)'});
                        me.$iconOne.css({clip:'rect(0px,28px,' + per*50 + 'px,14px)'});
                    } else {
                        if(per>=0.94){
                            me.$iconOne.css({clip:'rect(0px,28px,28px,14px)'});
                            me.$iconTwo.css({clip:'rect(0px,28px,' + 26 + 'px,14px)'});
                        } else {
                            me.$iconOne.css({clip:'rect(0px,28px,28px,14px)'});
                            me.$iconTwo.css({clip:'rect(0px,28px,' + (per-0.5)*50 + 'px,14px)'});
                        }
                    }
                }        
            },
            scrollCallback: function(){
                if(this.options.onScrollCallback){
                    this.options.onScrollCallback();
                }
                
            },
            resizePulldown: function(){
                if(this.options.onResizePulldown){
                    this.options.onResizePulldown();
                } else {
                    var me = this;
                    var time = me.options.time;
                    if(me.myscroll){ 
                        me.myscroll.disable();
                        if(me.myscroll.options.isPullToRefresh !== false){
                            me.myscroll.options.isPullToRefresh = false;
                            me.myscroll.resetPosition(time);  
                        } else {
                            me.myscroll.enable();
                        }

                    }
                    setTimeout(function(){
                        // if(me.myscroll.options.isPullToRefresh === true ){
                        //     return
                        // }
                        me.$('.pulldown').removeClass('flip');
                        me.$('.pulldown').removeClass('loading');
                        me.$('.pulldown .label').html('下拉立即刷新');
                        me.myscroll.enable();
                        me.animationCallback();
                    },time/2);
                }
                
            },
            animationCallback: function(){
                if(this.options.onAnimationCallback){
                    this.options.onAnimationCallback();
                }
            }
        }
        

        return ScrollPullDown;
    }
);

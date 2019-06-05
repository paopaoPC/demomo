/**
 * list view component
 * 下拉刷新实现方式：如检测到下拉控件，假设为40px，则滚动区top: -40px;
 */
define(['jquery', 'underscore', 'backbone', 'iscroll', './ListViewTemplateItem', 'lazyload'],
    function ($, _, Backbone, IScroll, TItem, lazyload) {

        //固定值，40+20
        var PULLDOWN_Y = 60;
        var time = 1200;

        var options = ['id', 'autoLoad', 'itemTemplate', 'itemClass', 'dataSource', 'pageSize', 'userData', 'isPullToRefresh', 'isLine', 'completeLoadBack'];

        var listview = Backbone.View.extend({

            events: {
                // "click .loadmore": "onLoadMore",
                "click li": "onRowSelect"
            },
            defaults: {
                autoLoad: true,
                editing: false,
                pageSize: 20
            },

            initialize: function () {
                var me = this;
                this.subviews = [];

                //grab params
                _.extend(this, this.defaults, _.pick(arguments[0], options));

                //convert itemTemplate to itemClass
                if (this.itemTemplate) {
                    //this.itemTemplate already compiled
                    this.itemClass = TItem.extend({template: this.itemTemplate});
                }

                me.IScroll = new IScroll(this.el, {
                    probeType: 2,
                    scrollX: false,
                    scrollY: true,
                    mouseWheel: true,
                    isPullToRefresh: this.isPullToRefresh,
                    isLine: this.isLine,
                    bounceTime: 800
                });
                me.$('.pulldown').css('display','inline-block');
                this.$iconOne = me.$('.iconOne');
                this.$iconTwo = me.$('.iconTwo');

                //隐藏pulldown
                if (this.el.querySelector('.pulldown')) {
                    this.el.classList.add('withpulldown');
                }

                //if (this.el.querySelector('.pullup')) {
                //    this.$('.pullup').css("visibility","hidden");
                //};

                var $wrapper = $(me.IScroll.wrapper);
                var $pullDown = this.$pullDown = this.$('.pulldown');
                var $pullUp = this.$pullUp = this.$('.loadmore');

                me.IScroll.on('scroll', function () {
                    var emptyNode = me.$('.message, .message .empty');
                    if (!emptyNode.hasClass('visible')) {
                        if (me.IScroll.options.isLine) {
                            me.$('.line').show();
                            me.$('.line').css("top", -(180 - this.y) + "px")
                        }
                    }
                    if (this.y > 60 && $pullDown.length) {
                        me.IScroll.options.isPullToRefresh = true;
                        $pullDown.addClass('flip').find('.label').html('释放立即更新');
                    } else if (this.y < 60 && this.y > 0 && $pullDown.length) {
                        me.IScroll.options.isPullToRefresh = false;
                        $pullDown.removeClass('flip').find('.label').html('下拉立即刷新');
                    }
                    if (this.y > -20 && this.y <= PULLDOWN_Y + 20) {
                        me.loadingY = this.y;
                        setTimeout(function () {
                            me.setUILoadingPer(me.loadingY);
                        }, 0)
                    }

                    if (this.maxScrollY - this.y > -400 && !me.dataSource.finish) {
                        $pullUp.addClass('flip').find('.label').html('释放立即加载');
                    } else if (this.maxScrollY - this.y > -450 && !me.dataSource.finish) {
                        $pullUp.css("visibility", "visible");
                        $pullUp.find('.label').html('上拉加载更多');
                    } 
                });

                me.IScroll.on('scrollEnd', function () {
                    //if already flip
                    if (me.IScroll.options.isLine) {
                        me.$('.line').hide()
                    }
                    if ($pullDown.hasClass('flip')) {
                        me.$('.pulldown').addClass('loading');
                        me.$('.pulldown .label').html('加载中...');
                        me.onPullDown();
                    }
                    if ($pullUp.hasClass('flip')) {
                        if( $pullUp.hasClass('loading') ){
                            return
                        }
                        $pullUp.removeClass('flip').addClass('loading').find('.label').html('加载中...');
                        if (!me.$pullUp.is(":hidden")) {  //判断数据是否已经加载完毕
                            me.onPullUp();
                        }
                    } else {
                        //$pullUp.css("visibility","hidden");
                    }
                    me.setUILoadingPer(0);
                });
                me.$('.scroller').on('touchend', function () {
                    if ($pullDown.hasClass('flip')) {
                        $pullDown.addClass('loading');
                        $('.pulldown .label').html('正在刷新...');
                    }
                    // me.$('.message, .message .empty').removeClass('visible');
                })

                if (me.$pullDown.hasClass('flip')) {
                    me.$pullDown.addClass('loading');
                    me.$('.pulldown .label').html('正在刷新...');
                    // me.scrollCallback();
                }

                if (this.autoLoad) {
                    var state = this.loadState();
                    if (state) {
                        this.restoreData(state);
                    } else {
                        this.reloadData();
                    }
                }

            },//initialize

            resizePulldown: function () {
                var me = this;
                if (this.IScroll) {
                    this.IScroll.disable();
                    if (this.IScroll.options.isPullToRefresh !== false) {
                        this.IScroll.options.isPullToRefresh = false;
                        this.IScroll.resetPosition(time);
                    } else {
                        this.IScroll.enable();
                    }

                    setTimeout(function () {
                        // if(me.myscroll.options.isPullToRefresh === true ){
                        //     return
                        // }
                        me.$('.pulldown').removeClass('flip');
                        me.$('.pulldown').removeClass('loading');
                        me.$('.pulldown .label').html('下拉立即刷新');
                        me.IScroll.enable();
                    }, time / 3);
                }

            },


            //改成svg 要好些
            setUILoadingPer: function (value) {
                var me = this;
                var diff = 40;
                if (value <= diff) {
                    me.$iconTwo.css({clip: 'rect(0px,28px,0px,14px)'});
                    me.$iconOne.css({clip: 'rect(0px,28px,0px,14px)'});
                } else {
                    if (value > PULLDOWN_Y) {
                        value = PULLDOWN_Y;
                    }
                    var per = (value - diff) / (PULLDOWN_Y - diff);
                    if (per <= 0.5) {
                        me.$iconTwo.css({clip: 'rect(0px,28px,0px,14px)'});
                        me.$iconOne.css({clip: 'rect(0px,28px,' + per * 50 + 'px,14px)'});
                    } else {
                        if (per >= 0.94) {
                            me.$iconOne.css({clip: 'rect(0px,28px,28px,14px)'});
                            me.$iconTwo.css({clip: 'rect(0px,28px,' + 26 + 'px,14px)'});
                        } else {
                            me.$iconOne.css({clip: 'rect(0px,28px,28px,14px)'});
                            me.$iconTwo.css({clip: 'rect(0px,28px,' + (per - 0.5) * 50 + 'px,14px)'});
                        }
                    }
                }

            },

            //刷新
            refresh: function () {
                var me = this;
                setTimeout(function () {
                    me.IScroll.refresh();
                }, 100);
            },

            refreshByState: function (state) {
                var me = this;
                setTimeout(function () {
                    me.IScroll.refresh();
                    me.IScroll.scrollTo(0, state.y);
                }, 50);
            },

            //选择了某一行
            onRowSelect: function (event) {
                var li = event.currentTarget;
                var liCollection = this.el.querySelector('ul').children;
                var index = _.indexOf(liCollection, li);
                var item = this.subviews[index];
                if (!this.editing) {
                    this.trigger('itemSelect', this, item, index, event);
                } else {
                    item.toggleSelect();
                    //监听在编辑状态下被选中的事件
                    this.trigger('editItemSelect', this, item, index, event);
                }
            },

            //下拉的默认行为为重新加载数据
            //可以通过覆盖此方法，实现类似Twitter的加载更多旧数据
            onPullDown: function () {
                this.trigger('listviewPullDown', this);
                this.reloadData();

            },
            onPullUp: function (event) {  //上拉加载更多事件
                var me = this;
                this.dataSource.loadData(this.page + 1, this.pageSize, function (result, finish) {

                    me.page++;
                    //stop loading animate
                    if(!me.dataSource.finish){
                        me.$pullUp.removeClass('flip loading').find('.label').html('上拉加载更多');
                    }else{
                        me.$pullUp.removeClass('flip loading').find('.label').html('没有更多数据');
                    }
                    //loadmore  点击加载更多按钮 不存在
                    //if (finish) {
                    //    setTimeout(function () {
                    //        me.$('.loadmore').css('visibility', 'hidden');
                    //    },1000);
                    //} else {
                    //    setTimeout(function () {
                    //        me.$('.loadmore').css('visibility', 'visible');
                    //    },1000);
                    //}

                    //显示没有更多数据
                    if (finish && result.length == 0) {
                        if (me.IScroll.options.isLine) {
                            me.$('.line').hide()
                        }
                    }
                    //append items
                    if (result && result.length > 0) {
                        //append items
                        var c = me.subviews.length;
                        for (var i = 0; i < result.length; ++i) {
                            var item = new me.itemClass({data: result[i], index: c + i, userData: me.userData});
                            item.setEditing(me.editing);
                            me.addItem(item);
                        }
                        if (me.completeLoadBack) {
                            me.completeLoadBack();
                        }
                    }
                    setTimeout(function () {
                        me.trigger('load', me);
                        me.setScrollerMinHeight();
                    }, 0);
                    me.refresh();
                }, function (error) {
                    me.refresh();
                });
            },
            onLoadMore: function (event) {  //加载更多
                var me = this;
                var loadmoreButton = event.currentTarget;
                //show loading animate
                loadmoreButton.classList.add('loading');

                this.dataSource.loadData(this.page + 1, this.pageSize, function (result, finish) {

                    //increase current page number when success
                    me.page++;

                    //stop loading animate
                    loadmoreButton.classList.remove('loading');

                    //loadmore
                    if (finish) {
                        me.$('.loadmore').removeClass('visible');
                    } else {
                        me.$('.loadmore').addClass('visible');
                    }

                    //显示没有更多数据
                    if (finish && result.length == 0) {
                        me.$('.message, .message .empty').addClass('visible');
                        if (me.IScroll.options.isLine) {
                            me.$('.line').hide()
                        }
                        ;
                    }
                    ;

                    if (result && result.length > 0) {
                        //append items
                        var c = me.subviews.length;
                        for (var i = 0; i < result.length; ++i) {
                            var item = new me.itemClass({data: result[i], index: c + i, userData: me.userData});
                            item.setEditing(me.editing);
                            me.addItem(item);
                        }
                        if (me.completeLoadBack) {
                            me.completeLoadBack();
                        }
                    } else {
                        //show no data

                    }
                    setTimeout(function () {
                        me.trigger('load', me);
                        me.setScrollerMinHeight();
                    }, 0)
                    me.refresh();

                }, function (error) {
                    //stop loading animate
                    loadmoreButton.classList.remove('loading');
                    me.refresh();
                    me.trigger('error', me);
                    // alert('数据加载失败');
                });

            }

        }, {
            //clear listview state by id, this API may be changed later
            clear: function (id) {
                delete window.sessionStorage['ListView:' + id];
            }
        });

        /**
         * Cache
         */
        _.extend(listview.prototype, {

            saveState: function () {
                var state = {
                    y: this.IScroll.y,
                    page: this.page,
                    finish: this.dataSource.finish,
                    items: this.subviews.length
                }
                window.sessionStorage['ListView:' + this.id] = JSON.stringify(state);
            },

            loadState: function () {
                var state = window.sessionStorage['ListView:' + this.id];
                return state ? JSON.parse(state) : state;
            },

            //从缓存中恢复数据
            restoreData: function (state) {
                console.log('ListView.restoreData');
                var me = this;

                this.page = state.page;
                this.finish = state.finish;

                var cache = this.dataSource.loadDataFromCache(0, state.items);
                if (cache && cache.length > 0) {

                    if (cache.length < this[this.dataSource.options.pageSizeParam]) {       //缓存数据小于20条的时候
                        this.finish = true;
                    }

                    //loadmore
                    if (this.finish) {
                        me.$('.loadmore').removeClass('visible');
                    } else {
                        me.$('.loadmore').addClass('visible');
                    }

                    //显示没有更多数据
                    if (this.finish && cache.length == 0) {
                        me.$('.message, .message .empty').addClass('visible');
                        if (me.IScroll.options.isLine) {
                            me.$('.line').hide()
                        }
                        ;
                    } else {
                        me.$('.message, .message .empty').removeClass('visible');
                    }
                    ;

                    //remove all
                    me.deleteAllItems();
                    //append items
                    var c = me.subviews.length;
                    for (var i = 0; i < cache.length; ++i) {
                        //cache.forEach(function(data){
                        var item = new me.itemClass({data: cache[i], index: c + i, userData: me.userData});
                        item.setEditing(me.editing);
                        me.addItem(item);
                    }
                    if (me.completeLoadBack) {
                        me.completeLoadBack();
                    }
                    //});
                    me.refreshByState(state);
                    setTimeout(function () {
                        me.trigger('load', me);
                        me.setScrollerMinHeight();
                    }, 0)

                } else {
                    this.reloadData();
                }
            }
        });

        /**
         * Data Mantance
         */
        _.extend(listview.prototype, {

            setEditing: function (editing) {

                this.subviews.forEach(function (subview) {
                    subview.setEditing(editing);
                });

                this.editing = editing;
            },

            reset: function () {

                //删除所有cell
                this.deleteAllItems();

                //重置页码
                this.page = 0;

                //重置下拉刷新
                this.el.classList.remove('pulleddown');
                this.$pullDown.removeClass('flip loading').find('.label').html('下拉刷新...');
                //reset 上拉加载
                // this.$pullUp.show();
                //reset loadmore button
                this.$('.loadmore').removeClass('visible');

                //reset message area
                this.$('.message, .message > div').removeClass('visible');

                this.refresh();
            },

            reloadData: function () {
                console.log('ListView.reloadData');
                var me = this;

                this.reset();

                this.dataSource.clear();

                if(this.$pullUp.length){
                    this.$pullUp.removeClass('flip loading').find('.label').html('上拉加载更多');
                }

                //启动下拉刷新加载中动画
                // this.el.classList.add('pulleddown');
                this.$pullDown.removeClass('flip').addClass('loading').find('.label').html('加载中...');
                this.dataSource.loadData(this.page, this.pageSize, function (result, finish) {
                    me.resizePulldown();
                    if (result == null || result == "") result = [];
                    //success callback
                    me.el.classList.remove('pulleddown');
                    // me.$pullDown.removeClass('flip loading').find('.label').html('下拉刷新...');

                    //loadmore
                    if (finish) {
                        me.$('.loadmore').removeClass('visible');
                        me.$pullUp.hide();
                    } else {
                        me.$('.loadmore').addClass('visible');
                        me.$pullUp.show();
                    }

                    //显示没有更多数据
                    if (finish && result.length == 0) {
                        me.$('.message, .message .empty').addClass('visible');
                        if (me.IScroll.options.isLine) {
                            me.$('.line').hide()
                        }
                    }

                    //remove all
                    me.deleteAllItems();
                    //append items
                    var c = me.subviews.length;
                    for (var i = 0; i < result.length; ++i)
                        //result.forEach(function(data){
                    {
                        var item = new me.itemClass({data: result[i], index: c + i, userData: me.userData});
                        item.setEditing(me.editing);
                        me.addItem(item);
                    }
                    if (me.completeLoadBack) {
                        me.completeLoadBack();
                    }

                    //});
                    me.refresh();

                    //若数据加载非异步，则load事件会先于用户的listenTo方法执行，使用setTimeout延迟load事件触发时机
                    setTimeout(function () {
                        me.trigger('load', me);
                        me.setScrollerMinHeight();
                    }, 0);

                }, function (error, status, isabort) {
                    me.resizePulldown();
                    me.reset();
                    if (isabort != true) {
                        me.$('.message, .message .error').addClass('visible');
                        if (me.IScroll.options.isLine) {
                            me.$('.line').hide()
                        }
                    }
                    me.$pullUp.hide();
                    me.refresh();
                    setTimeout(function () {
                        me.trigger('error', me);
                        me.setScrollerMinHeight();
                    }, 0);
                });
            },

            addItem: function (item) {
                var me = this;
                this.subviews.push(item);
                this.el.querySelector("ul").appendChild(item.el);
                me.$("img.lazy").lazyload({
                    effect: "fadeIn",
                    event: "sporty",
                    load: function () {
                        if (me.scroller) {
                            setTimeout(function () {
                                me.scroller.refresh();
                            }, 100);
                        }
                        ;
                    }
                });
                this.$("img.lazy").trigger("sporty");
            },

            //删除一个或多个item
            deleteItems: function (array, refresh) {
                //invoke remove
                this.subviews = _.filter(this.subviews, function (each, index) {
                    if (array.indexOf(index) >= 0) each.remove();
                    return array.indexOf(index) < 0;
                });
                if (refresh) this.refresh();
            },
            //删除所有item
            deleteAllItems: function (refresh) {
                _.each(this.subviews, function (subview) {
                    subview.remove();
                });
                this.subviews = [];

                if (refresh) this.refresh();
            },

            selectedItems: function () {
                var me = this;
                return _.filter(this.subviews, function (item) {
                    return item.selected;
                });
            },

            selectedIndexes: function () {
                var items = this.subviews;
                return _.chain(items)
                    .filter(function (item) {
                        return item.selected;
                    })
                    .map(function (item) {
                        return items.indexOf(item);
                    })
                    .value();
            },
            setScrollerMinHeight: function () {
                var me = this;
                var wrapperHeight = this.IScroll.wrapperHeight;
                var withpulldownHeight = $(this.IScroll.scroller).find(".pulldown").outerHeight();
                var withpullupHeight = $(this.IScroll.scroller).find(".pullup").outerHeight();
                var minScrollerHeight = 60;
                this.$el.find(".scroller").css("min-height", minScrollerHeight);
                setTimeout(function () {        //延迟刷新iscroll
                    me.IScroll.refresh();
                }, 100);

            }

        });

        return listview;
    })
;

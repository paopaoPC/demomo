define([
        "common/navView",
        "common/osUtil",
        "shared/js/notification"
    ],
    function (View, osUtil, Notification) {
        var Base = View;
        return Base.extend({
            events: {},
            //接受View之间的传值，name传值过来的页面名称，data表示传过来的值
            onViewPush: function (name, data) {
                this._name = name;
                if(this._name !== 'cartest/testHistory'){
                    this.$('.count').hide();
                    this.$('.look_other').hide();
                }
                this._testId = data.id;//测试报告的ID
                this._words = data.words;
                this._commontForItemId = data.commontForItemId;
            },
            onShow: function () {
                var self = this;
                if (!this._testId) {
                    Notification.show({
                        type: 'error',
                        message: '测试报告的ID未获取到~~'
                    });
                    this.onLeft();
                } else {
                    bfClient.getCarTestInfo({
                        data: {'checkId': this._testId, 'carId': bfDataCenter.getCarId()},
                        success: function (data) {
                            if (data.code != 0) {
                                Notification.show({
                                    type: 'error',
                                    message: 'code出错'
                                });
                            } else {
                                self._testData = data.data;
                                self.tempViewRender();
                            }
                        }
                    });
                }
            },
            getCommontForItemId: function(itemId){
                var me = this;
                 var newData = _.filter(this._commontForItemId, function(item){ return item.itemId == itemId  });
                 return (newData[0] && newData[0].comment) || '';
            },
            tempViewRender: function () {
                var self = this;
                var fault_items = [];
                var danger_items = [];
                var normal_items = [];
                for (var i = 0; i < this._testData.details.length; i++) {
                    // 需求变动，只渲染单个详情
                    if( this._name === 'cartest/testHistory' || this._words === this._testData.details[i].itemName){
                        var status = this._testData.details[i].status;
                        this._testData.details[i].comment = this.getCommontForItemId(this._testData.details[i].itemId);
                        switch (status) {
                            case "normal":
                                normal_items.push(this._testData.details[i]);
                                break;
                            case "risk":
                                danger_items.push(this._testData.details[i]);
                                break;
                            case "fault":
                                fault_items.push(this._testData.details[i]);
                                break;
                        }
                    }
                    
                }
                this.elementHTML('#testData', this._testData.dataTime);
                this.elementHTML('#test_falut', fault_items.length + '');
                this.elementHTML('#test_danger', danger_items.length + '');
                this.elementHTML('#test_normal', normal_items.length + '');
                var fault_temp = '';
                for (var i = 0; i < fault_items.length; i++) {
                    var des = _.template(this.elementHTML('#fault_danger'), {
                        "data": fault_items[i]
                    });
                    var act = '';
                    if (fault_items[i].suggestAction != '-' && fault_items[i].suggestActionUrl != '-') {
                        act = _.template(this.elementHTML('#info_action'), {
                            "actions": fault_items[i].suggestAction.split('-'),
                            "urls": fault_items[i].suggestActionUrl.split('-')
                        });
                    }
                    // var temp = des + act;
                    var temp = des;
                    fault_temp += "<li>" + temp + "</li>";
                }
                for (var i = 0; i < danger_items.length; i++) {
                    var des = _.template(this.elementHTML('#danger_fault'), {
                        "data": danger_items[i]
                    });
                    var act = '';
                    if (danger_items[i].suggestAction != '-' && danger_items[i].suggestActionUrl != '-') {
                        act = _.template(this.elementHTML('#info_action'), {
                            "actions": danger_items[i].suggestAction.split('-'),
                            "urls": danger_items[i].suggestActionUrl.split('-')
                        });
                    }
                    // var temp = des + act;
                    var temp = des;
                    fault_temp += "<li>" + temp + "</li>";
                }
                this.elementHTML('.fault_danger', fault_temp);
                var normal_temp = '';
                for (var i = 0; i < normal_items.length; i++) {
                    var des = _.template(this.elementHTML('#normal_items'), {
                        "data": normal_items[i]
                    });
                    normal_temp += "<li>" + des + "</li>";
                }
                this.elementHTML('.normal_items', normal_temp);
                //锚
                if (this._words) {
                    var faults = this.getElement('.test_error');
                    var dangers = this.getElement('.test_danger');
                    var normals = this.getElement('.test_normal');
                    var tempWords = '';
                    var top;
                    for (var l = 0; l < faults.length; l++) {
                        tempWords = faults.eq(l).attr('data-id');
                        if (tempWords == this._words) {
                            //可以抽离 -start
                            top = faults.eq(l).offset().top - 50;
                            var contentHeight = this.getElement('.content').height();
                            var normalsHeight = this.getElement('.normal_items').height();
                            if ((top + contentHeight) > normalsHeight) {
                                this.getElement('.normal_items').css({'padding-bottom': contentHeight - 350 - normalsHeight + top})
                            }
                            this.getElement('.content').animate({scrollTop: top}, 1);
                            //可以抽离 -end
                            break;
                        }
                    }
                    for (var l = 0; l < dangers.length; l++) {
                        tempWords = dangers.eq(l).attr('data-id');
                        if (tempWords == this._words) {
                            //可以抽离 -start
                            top = dangers.eq(l).offset().top - 50;
                            var contentHeight = this.getElement('.content').height();
                            var normalsHeight = this.getElement('.normal_items').height();
                            if ((top + contentHeight) > normalsHeight) {
                                this.getElement('.normal_items').css({'padding-bottom': contentHeight - 350 - normalsHeight + top})
                            }
                            this.getElement('.content').animate({scrollTop: top}, 1);
                            //可以抽离 -end
                            break;
                        }
                    }
                    for (var l = 0; l < normals.length; l++) {
                        tempWords = normals.eq(l).attr('data-id');
                        if (tempWords == this._words) {
                            //可以抽离 -start
                            top = normals.eq(l).offset().top - 50;
                            var contentHeight = this.getElement('.content').height();
                            var normalsHeight = this.getElement('.normal_items').height();
                            if ((top + contentHeight + 50) > normalsHeight) {
                                this.getElement('.normal_items').css({'padding-bottom': contentHeight - 350 - normalsHeight + top})
                            }
                            this.getElement('.content').animate({scrollTop: top}, 1);
                            //可以抽离 -end
                            break;
                        }
                    }
                }


                //展开收缩正常项
                this._down = true;
                this.getElement('.look_other').on("click", function () {
                    if (self._down) {
                        var me = $(this);
                        if (me.hasClass('down')) {
                            self._down = false;
                            var lokTop = parseInt(self.getElement(".fault_danger").height()) + 100;
                            me.find("span").text("收起正常项目");
                            me.find("#iconImg").attr("src", "../cartest/img/icon_down.png");
                            self.getElement('.normal_items').slideDown(500);
                            setTimeout(function () {
                                self._down = true;
                                me.removeClass('down');
                                self.getElement('.content').animate({scrollTop: lokTop + "px"});
                            }, 500);
                        } else {
                            self._down = false;
                            me.find("span").text("展开正常项目");
                            me.find("#iconImg").attr("src", "../cartest/img/icon_up.png");
                            self.getElement('.normal_items').slideUp(500);
                            setTimeout(function () {
                                self._down = true;
                                me.addClass('down');
                            }, 500);
                        }
                    }
                });
                //展开收缩正常项

                //根据action不同，跳转到不同的页面
                this.getElement('.actions div').on("click", function () {
                    var me = $(this);
                    var url = me.attr('url');//根据连接跳转
                    if (me.html() == '去加油') {
                        //去加油
                        butterfly.navigate('/cartest/map.html');
                    } else if (me.html() == '去维修') {
                        //去维修
                        butterfly.navigate('/applyService/index.html');
                    } else {
                        //跳转到
                    }
                });
                //根据action不同，跳转到不同的页面
            },
            posGenHTML: function () {

            }
            ,
            asyncHTML: function () {
            }
        });

    });

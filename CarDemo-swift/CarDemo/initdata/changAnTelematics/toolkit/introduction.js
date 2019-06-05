define(
    [
        "text!toolkit/introduction.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "shared/js/notification",
        'css!common/css/im.css'
    ],
    function (template, View, Butterfly, ssUtil, Notification) {
        var Base = View;
        var cls =
        {
            events: {
                "click .search-img-btn": "searchBtnClicked"
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {
            this._infoId = pushData.bookId;
        };

        cls.onShow = function () {

            var id = ssUtil.load('intro_id');
            if (id !== null && id !== undefined) {
                ssUtil.clear('intro_id');
                this._id = id;
                this.getTree();
            }
        };
        cls.getTree = function () {  //获取行车说明书的树结构  2015-12-8 lxc
            var self = this;
            self._id = 'f9e8a2d0-a3c6-4320-b140-b4eb309dc4ed';
            bfClient.getIntroductionList({
                data: {
                    'catalogId': self._id
                },
                success: function (data) {
                    var result = eval(data.data);  //lxc
                    if (data.code == '-1') {
                        self._treeMenu = result;
                        self.treeViewRender();
                    } else {
                        Notification.show({
                            type: 'error',
                            message: '请求服务器出错~~'
                        });
                    }
                }
            });
        };

        cls.treeViewRender = function () {
            var self = this;
            this.getElement('.introduction-left ul').children().remove();
            var distributorTemplate = this.elementHTML('#introduction-template');

            _.each(self._treeMenu, function (treeMenu) { //lxc
                var tem = _.template(distributorTemplate, treeMenu);
                self.getElement('.introduction-left ul').append(tem);
            });

            var introductionIcon = this.getElement("#introduction-icon");
            if (introductionIcon) {
                introductionIcon.remove();
            }
            this.getElement('.introduction-left').append("<div id='introduction-icon'></div>");
            this.getElement('.introduction-left ul li').on('click', function () {
                var index = $(this).index();
                if (self._infoId) {
                    var list = $(".introduction-left").find("li");
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].innerText == self._infoId) {
                            index = i;
                        }
                    }
                    self._infoId = null;
                }
                window.localStorage.setItem("activeItem", index);
                var id = $($(".introduction-left").find("li")[index]).attr("data-id");   //lxc
                var top = 40 * index + 'px';


                self.getElement('.introduction-left ul li').eq(index).addClass('active');
                self.getElement('.introduction-left ul .active').removeClass('active');
                self.getElement('.introduction-right ul').children().remove();


                self.getElement('#introduction-icon').stop().animate({'top': top}, 500);
                var currentIndex = self.getElement('.introduction-left ul li.active').index();
                if (index === currentIndex) {
                    return;
                } else {
                    bfClient.getContentList({
                        data: {'catalogId': id},
                        success: function (data) {
                            var result = eval(data.data);  //lxc
                            if (data.code == '-1') {
                                self._childMenu = result;
                                self.onDataLoad(index);
                            } else {
                                Notification.show({
                                    type: 'error',
                                    message: '请求服务器出错~~'
                                });
                            }
                        }
                    });
                }
            });

            this.getElement('.introduction-left ul li').eq(0).trigger('click');
        };

        cls.gotoDetails = function () {

        };

        cls.onDataLoad = function (index) {

            var self = this;
            var childTemplate = this.elementHTML('#child-template');
            _.each(self._childMenu.data, function (childMenu) {   //lxc
                var tem = _.template(childTemplate, childMenu);
                self.getElement('.introduction-right ul').append(tem);
            });

            this.getElement('.introduction-right ul li').on('click', function () {
                var id = $(this).attr('data-id');
                var content = $(this).text();
                /***********************数据处理****************************************/
                var parrent = self._treeMenu;
                var parentArray = new Array();
                for (var i = 0; i < parrent.length; i++) {
                    parentArray.push(parrent[i].id + "," + parrent[i].name);
                }
                var childs = self._childMenu;
                var childArray = new Array();
                for (var i = 0; i < childs.length; i++) {
                    if (childs[i].contentId == id) {
                        window.localStorage.setItem("ActiveChild", i);
                        window.localStorage.setItem("activeChildId", id);
                        window.localStorage.setItem("activeParent", childs[i].catalogName);
                    }
                    childArray.push(childs[i].contentId);
                }
                /************************数据处理完成***********************************/
                ssUtil.save('introductionInfoId', {id: id, title: content});
                ssUtil.save('treeData', {"parentArray": parentArray, "childArray": childArray});
                if (id) {
                    if ($("#introductionInfo")) {
                        $("#introductionInfo").remove();
                    }
                    if ($("#introduction")) {
                        $("#introduction").remove();
                    }
                    butterfly.navigate('/toolkit/introductionInfo.html');
                } else {
                    Notification.show({
                        type: 'error',
                        message: '获取详情标示失败~~'
                    });
                }
            });
        };
        cls.onRight = function () {
            butterfly.navigate("/toolkit/toolkitDetail.html")
        };
        cls.searchBtnClicked = function () {
            var searchString = this.getElement('.search-field').val();

            if (searchString.length == 0) {

                Notification.show({
                    type: 'error',
                    message: '请输入关键字'
                });
                return;
            }
            ;

            bfNaviController.push('/toolkit/introductionSearchResult.html', searchString);
        };
        return Base.extend(cls);
    }
);

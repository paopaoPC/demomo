define(
    [
        "text!Laboratory/mytour.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "iscroll",
        "swipe",
        'shared/js/datasource',
        'listview/ListView',
        'common/osUtil',
        'lazyload'
    ],
    function (template, View, Butterfly, ssUtil, iscroll, swipe, Datasource,ListView, osUtil, Lazyload) {
        var Base = View;
        var tour_Swipe;
        var cls =
        {
            _value: true,
            carData: null,
            events: {
                "click #item0":"showMyPersonTour",
                "click #item1":"showArgumentTour",
                "click #navLeft":"Back",
                "click .icon-add": "showCeng",
                "click .ceng-icon-add, .container-ceng":"hideCeng",
                "click .container-list":"showDetail",
                "click .ceng-icon-edit":"gotoEdit",
                "click .zan-icon":"clickZan",
                "click .world-icon":"comment",
                "click .collect-icon":"collectTours",
                "click .arg-share-icon":"argumentShare",
                "click .share-icon":"myShareTour",
                "click .delet-icon":"deleteTour"
            }
        };
        cls.clickZan = function(){
            var zan = false;
            var zanNode = this.getElement(".zan-icon");
            if (zan) {
                zanNode.css("background","url()")
            }else{

            }
        }
        cls.comment = function(e){
            e.stopPropagation();
            bfNaviController.push("/Laboratory/mytourReview.html");
        }
        cls.collectTours = function(){

        }
        cls.argumentShare = function(){

        }
        cls.myShareTour = function(){

        }
        cls.deleteTour = function(){

        }
        cls.Back = function(){
            this.goBack();
        }
        cls.showDetail = function(){
            //简单的页面跳转，接口出来后再传参
            bfNaviController.push("/Laboratory/myTourImfor.html");
        }
        cls.gotoEdit = function(){
            bfNaviController.push("/Laboratory/mytourEdit.html");
        }
        cls.showCeng = function(){
            var me = this;
            me.getElement(".icon-add").hide();
            me.getElement(".container-ceng").show();
            osUtil.delayCall(function(){
                me.getElement(".ceng-icon-edit").css({bottom:76,right:76});
                me.getElement(".ceng-icon-photo").css({bottom:100,right:29});
            },10);
        }
        cls.hideCeng = function(){
            var me = this;
            this.getElement(".icon-add").show();
            me.getElement(".ceng-icon-edit").css({bottom:28,right:28});
            me.getElement(".ceng-icon-photo").css({bottom:28,right:28});
            osUtil.delayCall(function(){
                me.getElement(".container-ceng").hide();
            },200);
        }
        cls.posGenHTML = function(){
            var me = this;
            this._argumentListView = null;
            this._myListView = null;
            this.mytourListView();
            osUtil.delayCall(function(){
                me.initSwipe();
            },30);
        }
        cls.onShow = function () {
        };
        cls.showMyPersonTour= function(){
            tour_Swipe.prev();
        }
        cls.showArgumentTour = function(){
            tour_Swipe.next();
        };
        cls.mytourListView = function(){
            var me = this;
            this._myDataSource = new Datasource({
                identifier : 'mytour-list',
                url : "../Laboratory/data/mytour.json",
                pageParam : 'pageIndex'
            });

            me.showMyTourListView();
        };
        cls.argumentListView = function(){
            var me = this;
            this._argDataSource = new Datasource({
                identifier : 'argtour-list',
                url : "../Laboratory/data/mytour.json",
                pageParam : 'pageIndex'
            });
            me.showArgumentListView();
        };
        cls.showArgumentListView = function(){
            var me = this;
            template = _.template(this.elementHTML('#argumentsList'));
            this.getElement('#argumentTour_list ul').html('');
            var listEl1 = this.getElement('#argumentTour_list');
            this._argumentListView = new ListView({
                id : "car_listView",
                el : listEl1,
                itemTemplate : template,
                pageSize:10,
                dataSource : me._argDataSource,
                isPullToRefresh: true
            });
        }
        cls.showMyTourListView = function(){
            var me = this;
            template = _.template(this.elementHTML('#myTourList'));
            this.getElement('#mytour_list ul').html('');
            var listEl1 = this.getElement('#mytour_list');
            this._myListView = new ListView({
                id : "car_listView",
                el : listEl1,
                itemTemplate : template,
                pageSize:10,
                dataSource : me._myDataSource,
                isPullToRefresh: true
            });
        }
        cls.initSwipe = function(){
            var me = this;
            tour_Swipe = new Swipe(me.getElement("#slider")[0], {
                continuous: false, 
                closeEndMotion: true,
                callback: function (index) {
                    switch (index) {
                        case 0:
                            me.getElement(".icon-add").show();
                            me.getElement("#item0").addClass("active-bar");
                            me.getElement("#item1").removeClass("active-bar");
                            if (!me._myListView) {
                                me.mytourListView();
                            };
                            break;
                        case 1:
                            me.getElement(".icon-add").hide();
                            me.getElement("#item0").removeClass("active-bar");
                            me.getElement("#item1").addClass("active-bar");
                            if (!me._argumentListView) {
                                me.argumentListView()
                            };
                            break;
                    }
                }
            });
        }
        cls.templateon = function (data) {
            var template = _.template(this.elementHTML('#tourList'), {
                data: data
            });
            $("#contents").append(template);
        };
        cls.Go_detail = function (e) {
            var tour_id = e.target.parentElement.id;
            var tour_name = $(e.target.parentElement).find(".tour_information")[0].children[0].innerText;
            var coverImage = "../Laboratory/images/Tours/gri.jpg";
            var createTime = $(e.target.parentElement).find(".tour_information")[0].children[1].innerText;
            createTime = createTime.substring(0, 19);
            var data = {
                "tourId": tour_id,
                "tourName": tour_name,
                "from": "mytour",
                "coverImage": coverImage,
                "createTime": createTime
            };
            LabClient.getsingletours({
                data: {tourId: tour_id},
                success: function (req) {   //todo  判断游记是否为空
                    if (req.code == 0) {
                        bfNaviController.push("Laboratory/detailTour.html", data);
                    } else {
                        var d = dialog.createDialog({
                            closeBtn: false,
                            buttons: {
                                '取消': function () {
                                    this.close();
                                },
                                '确定': function () {
                                    var data = {
                                        "puton": false,
                                        "from": "index",
                                        "tour_name": tour_name,
                                        "tour_id": tour_id
                                    };
                                    bfNaviController.push("Laboratory/writeTour.html", data);
                                    this.close();
                                }
                            },
                            content: "您还没有添加详情哦,现在前往添加"
                        });
                        d.open();
                    }
                }, error: function () {

                }
            });
        };
        cls.delete_piliang = function () {
            var me = this;
            var checkedItem = $("input:checkbox:checked");
            var String = checkedItem[0].parentElement.id;
            for (var i = 1; i < checkedItem.length; i++) {
                String = String + "," + checkedItem[i].parentElement.id;
            }
            var data = {"tourId": String};
            LabClient.deleteTour({
                data: data, success: function (req) {
                    me.getElement("#DaoHang").addClass("delete_piliang");
                    Notification.show({
                        type: "info",
                        message: "删除游记成功"
                    });
                    me.TourClient();
                    me.manage();
                }, error: function () {

                }
            });
        };
        cls.manage = function () {
            var me = this
            if (me.getElement(".single").length > 0) {
                me.getElement(".Mask").css("display", "none");
                $(".single").append("<input style=" + "'position: absolute;top: 10px;left: 5px;'" + " type=" + "'checkbox'" + "name=" + "'choose'" + "/>");
                $("#DaoHang").removeClass('delete_piliang');
                $(".single").append("<div style=" + "'width: 100%;height: 100%;position: absolute;top: 0px;'" + "></div>");
                $(".single").bind("click", me.change_agin);
            } else {
                Notification.show({
                    type: "info",
                    message: "您还没有游记，赶快创建一个吧"
                });
            }
        };
        cls.change_agin = function () {
            var check = event.target.parentElement.children[3];
            if (check.defaultChecked == true) {
                check.defaultChecked = false;
            } else if (check.defaultChecked == false) {
                check.defaultChecked = true;
            }
        };
        cls.NEW = function () {
            this.getElement(".Mask").css("display", "none");
            var append_string = "<div class=" + "'personal_dialog'" + " style=" + "'position: absolute;width: 100%;height: 100%;'" + ">"
                + "<div class=" + "'revise_box'" + ">"
                + "<p style=" + "'color: black;font-size: 15px;font-family: inherit; margin: 10px;'" + ">新建游记</p>"
                + "<p style=" + "'margin-top: 15px;'" + "><input maxlength='20' style=" + "'width: 100%;border-top-style: none;border-left-style: none;border-right-style: none;text-align: center;'"
                + " type=" + "'text'" + "placeholder=" + "'游记名称'" + "></p>"
                + "<p style=" + "'margin-top: 10px;'" + "><input style=" + "'width: 57px;'" + " class=" + "'cansle my_button_style left_button'" + " value=" + "'取消'" + "type=" + "'button'"
                + "><input style=" + "'width: 57px;'" + " class=" + "'confirm my_button_style right_button'" + " value=" + "'确定'" + " type=" + "'button'" + "></p>"
                + "</div></div>";

            $("#mytour .content").append(append_string);
        };
        cls.dialog_comfirm = function () {
            var name = $($("#mytour .revise_box")[0].children[1].children[0]).val();
            var data1 = {"UserId": window.localStorage.username, "TourName": name};

            LabClient.CreateTour({
                data: data1,
                success: function (req) {
                    $("#mytour .personal_dialog").remove();
                    var data = {"puton": false, "from": "index", "tour_name": name, "tour_id": req};
                    bfNaviController.push("Laboratory/writeTour.html", data);
                }, error: function () {
                    Notification.show({
                        type: "error",
                        message: "创建游记失败"
                    });
                }
            });
        };
        cls.dialog_cansle = function () {
            $("#mytour .personal_dialog").remove();
        };
        cls.moreChoose = function () {
            this.getElement(".Mask").css("display", "block");
        };
        cls.quxiao = function () {
            var me = this;
            me.getElement("#DaoHang").removeClass('delete_piliang');
            $(".single > input").remove();
            $("#DaoHang").addClass('delete_piliang');
            $(".single").unbind("click", me.change_agin);
            var single_conment = $(".single");
            for (var i = 0; i < single_conment.length; i++) {
                single_conment[i].lastChild.remove();
            }
        };
        cls.Mask = function () {
            this.getElement(".Mask").css("display", "none");
        };
        cls.TourClient = function () {
            $("#contents").html("");
            var el = this;
            var data = {UserId: window.localStorage.username};
            LabClient.getTourList({
                data: data,
                success: function (req) {
                    if (req.code == 0) {
                        for (var i = 0; i < req.data.length; i++) {
                            el.templateon(req.data[i]);
                        }
                    } else {
                        Notification.show({
                            type: "error",
                            message: req.msg
                        });
                    }
                }, error: function () {
                    Notification.show({
                        type: "error",
                        message: "获取数据失败"
                    });
                }
            });
        };
        return Base.extend(cls);
    }
);



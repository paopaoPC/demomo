define(
    [
        "text!Laboratory/detailTour.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "iscroll",
        "common/disUtil",
        "shared/js/notification",
        "Laboratory/lab-client"
    ],
    function (template, View, Butterfly, ssUtil, iscroll, disUtil, Notification, LabClient) {
        var downfile = bfDataCenter.getBaseConfig_dssDownLoad()+"?token=1502331&dsshandle=";
        var Base = View;
        var cls =
        {
            _value: true,
            carData: null,
            events: {
                "click .revise": "Revise_name",
                "click .cansle": "dialog_cansle",
                "click .confirm": "dialog_comfirm",
                "click .goto_map": "Goto_map",
                "click .single_tour": "rewirte",
                "click .continue": "continue_write"
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {
            this._from = pushData;
        };
        cls.onShow = function () {
            $("#detailtour").html(" ");
            this.client();
        };
        cls.goBack = function () {
            if (this._from.from == "writeTour") {
                window.history.go(-2);
            } else if (this._from.from == "mytour") {
                window.history.go(-1);
            }
        };
        cls.continue_write = function () {
            var tourId = $(".tour_title")[0].id;
            var tourName = $(".tour_title")[0].innerText;
            var data = {"tour_name": tourName, "tour_id": tourId, "from": "detail_continue"};
            $("#writetour").remove();
            bfNaviController.push("Laboratory/writeTour.html", data);
        };
        cls.rewirte = function () {  //游记修改
            var me = this;
            var current_dom = $(event.target).parents(".single_tour");
            var location = current_dom[0].children[4].innerText;
            var discribe = current_dom[0].children[2].innerText;
            var single_tour_id = current_dom[0].id;  //单条说说的唯一ID
            var time; //出行时间
            for (var i = 0; i < me._tourData.length; i++) {
                if (me._tourData[i].id == single_tour_id) {
                    time = me._tourData[i].travelTime;
                }
            }
            var tour_id = $(".tour_title")[0].id;
            var tour_name = $(".tour_title")[0].innerText;
            var images = current_dom[0].children[3].children[0].src;
            for (var i = 1; i < current_dom[0].children[3].children.length; i++) {
                images = images + ',' + current_dom[0].children[3].children[i].src;
            }
            window.sessionStorage.setItem("single_tour_id", single_tour_id); //将当前修改的单条说说ID保存到sessionStorage中

            var push_data = {
                "puton": true, "time": time, "location": location, "discribe": discribe,
                "images": images, "from": "detailtour", "tour_id": tour_id, "tour_name": tour_name
            };
            $("#writetour").remove();
            bfNaviController.push("Laboratory/writeTour.html", push_data);
        };
        cls.Revise_name = function () {  //修改游记名称
            var append_string = "<div class=" + "'personal_dialog'" + " style=" + "'position: absolute;width: 100%;top: 15%;'" + ">"
                + "<div class=" + "'revise_box'" + ">"
                + "<p style=" + "'color: black;font-size: 15px;font-family: inherit; margin: 10px;'" + ">输入新的游记名称</p>"
                + "<p style=" + "'margin-top: 15px;'" + "><input style=" + "'width: 100%;border-top-style: none;border-left-style: none;border-right-style: none;text-align: center;'"
                + " type=" + "'text'" + "placeholder=" + "'游记名称'" + "></p>"
                + "<p style=" + "'margin-top: 10px;'" + "><input style=" + "'width: 57px;'" + " class=" + "'cansle my_button_style left_button'" + " value=" + "'取消'" + "type=" + "'button'"
                + "><input style=" + "'width: 57px;'" + " class=" + "'confirm my_button_style right_button'" + " value=" + "'确定'" + " type=" + "'button'" + "></p>"
                + "</div></div>";

            $("#detailtour").append(append_string);
            $(".content").css("overflow-y", "hidden");
        };
        cls.Goto_map = function () {
            butterfly.navigate("Laboratory/Tourmap.html");
        };
        cls.dialog_comfirm = function () {
            var me = this;
            var new_name = $($(".revise_box")[0].children[1].children[0]).val();
            var tourId = $(".tour_title")[0].id;
            if (new_name == "") {
                alert("游记名不能为空");
            } else {
                var data = {
                    "tourId": tourId,
                    "TourName": new_name,
                    "userId": window.localStorage.username,
                    "createTime": me._from.createTime,
                    "coverImage": me._from.coverImage
                };
                LabClient.updateTour({
                    data: data, success: function (req) {
                        $(".tour_title")[0].innerText = new_name;
                    }, error: function () {
                        //请求出错处理
                        Notification.show({
                            type: "error",
                            message: "修改名称失败"
                        });
                    }
                });
            }
            $(".personal_dialog").remove();
            $(".content").css("overflow-y", "auto");
        };
        cls.dialog_cansle = function () {
            $(".personal_dialog").remove();
            $(".content").css("overflow-y", "auto");
        };
        cls.templateon = function (source, tem) {
            var template = _.template(this.elementHTML('#' + tem), {
                data: source
            });
            $("#detailtour").append(template);
        };
        cls.client = function () {  //获取游记详情数据
            var el = this;
            var data = {tourId: el._from.tourId};
            LabClient.getsingletours({
                data: data, success: function (req) {   //todo
                    var height = null;
                    if (req.code == 0) {
                        for (var i = 0; i < req.data.length; i++) {
                            el.templateon(req.data[i], 'tour_template');
                            el._tourData = req.data;
                            var src = req.data[i].images.split(',');
                            for (var j = 0; j < src.length; j++) {
                                $(".images:eq(" + i + ")").append("<img style=" + "'margin-top:10px;width: 70%;height: 200px;'" + "src=" + downfile + src[j] + ">");
                            }
                            height = $("#detailtour")[0].offsetHeight;
                            $(".time_line").css("height", height);
                        }
                        if (el._from.from == "writeTour") {
                            $(".continue").css("display", "block");
                        } else if (el._from.from == "mytour") {
                            $(".continue").css("display", "none");
                        }

                        $(".tour_title")[0].innerText = el._from.tourName;
                        $(".tour_title")[0].id = el._from.tourId;
                    } else {
                        Notification.show({
                            type: "error",
                            message: req.msg
                        });
                    }
                }, error: function () {

                }
            });
        };
        return Base.extend(cls);
    }
);



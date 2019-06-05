define(['common/navView',
    'butterfly',
    'shared/js/notification',
    'shared/timePicker/js/date',
    'shared/js/client',
    'shared/plugin_dialog/js/dialog',
    'common/disUtil',
    'map/map-client',
    'main/Plugins',
    "underscore",
    'common/imageCodeInterface',
    'common/countDwonUtil',
    'shared/js/input-bind-offset'
], function (View, Butterfly, Notification, DatePicker, MainClient, dialog, DisUtil, MapClient, Plugin, _, codeInterface, countDwonUtil, InputBindOffset) {

    return View.extend({
        events: {
            "click .close-button": "clearInput",
            "click #registerBackButton11": "registerBack",
            'click .registeBotton': 'onRegiste',
            "click .sexItem": "changeSex",
            "input input": "onInput",
            "click .verifiation-btn": "getVerificationCode",
            "click .image-code": function () {
                this.getImageCode()
            }
        },
        registerBack: function () {
            bfNaviController.pop(1);
        },
        posGenHTML: function () {

        },
        onShow: function () {
            var me = this;
            this.bindDatePicker();
            this.getImageCode();
            InputBindOffset.bind({
                scrollEl: this.$(".content")
            });
        },
        getImageCode: function () {
            var imageNode = this.getElement("#checkImg");
            codeInterface.getImageCode(imageNode);
        },
        bindDatePicker: function () { //绑定日期控件
            var me = this;
            me.dp = DatePicker($);
            me.$el.find('.birthDay').date({
                theme: "date"
            }, function (data) {
                data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
                var today = new Date();
                var month = (today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1);
                today = today.getFullYear() + "-" + month + "-" + today.getDate();
                if (data > today) {
                    Notification.show({
                        type: "error",
                        message: "出生时间应该小于当前时间"
                    });
                    return;
                }
                me.$el.find(".birthDay").find(".inputText").text(data);
                me.$el.find(".birthDay").find(".inputText").text(data).css('color', 'black');
                me.$el.find(".birthDay").find(".hint").hide();
                me.dp.time = data;
            }, function () {
                //取消的回调
            });
        },
        valiPassWord: function (newPassword) {
            var judgeIndex = 0;
            var patt1 = new RegExp('[a-z]');
            var patt2 = new RegExp('[A-Z]');
            var patt3 = new RegExp('[0-9]');
            var patt4 = new RegExp('((?=[\x21-\x7e]+)[^A-Za-z0-9])');

            if (newPassword.length < 6 || newPassword.length > 16) {
                Notification.show({
                    type: "info",
                    message: "请输入6-16位的密码"
                });
                return false;
            } else {
                patt1.test(newPassword) && judgeIndex++;
                patt2.test(newPassword) && judgeIndex++;
                patt3.test(newPassword) && judgeIndex++;
                patt4.test(newPassword) && judgeIndex++;
                if (judgeIndex >= 2) {
                    return true;
                } else {
                    Notification.show({
                        type: "info",
                        message: "密码需大、小写字母、数字、特殊字符中的至少两种"
                    });
                    return false;
                }
            }
        },
        getByteLen: function (val) {
            var len = 0;
            for (var i = 0; i < val.length; i++) {
                var a = val.charAt(i);
                if (a.match(/[^\x00-\xff]/ig) != null) {
                    len += 2;
                }
                else {
                    len += 1;
                }
            }
            return len;
        },
        onRegiste: function () {
            var me = this;
            var registePage = this.$el.find("#registe-page");
            var tel = registePage.find(".telephone").find("input").val(); //电话
            //var name = registePage.find(".name").find("input").val(); //昵称
            var passWord = registePage.find(".password").find("input").val(); //密码
            //var warnMoblie = registePage.find(".warnmoblie").find("input").val(); //紧急联系人
            var authcode = registePage.find(".auth-code").val();
            //var sex = registePage.find(".sexPoint-icon.check").parent().find(".sexText").text(); //性别
            //sex = (sex == '男') ? 'm' : 'f';
            //var birthDay = registePage.find(".birthDay").find(".inputText").text(); //生日
            //birthDay = birthDay == "请输入您的生日" ? "" : birthDay;
            //var email = registePage.find(".email").find("input").val(); //生日
            if (tel !== "") {
                var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/; //手机
                if (!(phoneFilter.test(tel))) {
                    Notification.show({
                        type: "error",
                        message: "请输入正确的手机号码"
                    });
                    return;
                }


                //if (name !== "") {
                //    var usernameFilter = /^[u4E00-u9FA50]||[0-9]||[a-zA-Z]$/;
                //    var length = me.getByteLen(name);
                //    if (!(usernameFilter.test(name)) || length < 3 || length > 15) {
                //        Notification.show({
                //            type: "error",
                //            message: "用户名输入不合法"
                //        });
                //        return;
                //    }

                    if (passWord !== "") {
                        if (!me.valiPassWord(passWord)) {
                            return true;
                        }
                        var data = {};
                        data.mobile = tel;
                        var phone=data.mobile;
                        data.userName = tel;
                        //data.userFullname = name;
                        data.password = passWord;
                        //data.gender = sex;
                        //data.birthday = birthDay;
                        //data.contactsMobile = warnMoblie;
                        data.imgPath = "aa";
                        data.authcode = authcode;
                        //if (email !== "") {
                        //    var mailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                        //    if (mailFilter.test(email)) {
                        //        data.email = email;
                        //    } else {
                        //        Notification.show({
                        //            type: "error",
                        //            message: "邮箱输入不合法"
                        //        });
                        //        return;
                        //    }
                        //    if (!(phoneFilter.test(warnMoblie))) {
                        //        Notification.show({
                        //            type: "error",
                        //            message: "请输入正确的紧急联系人手机"
                        //        });
                        //        return;
                        //    }
                            me.getElement(".registeBotton")[0].disabled = true;
                            bfClient.registe({
                                data: data,
                                beforeSend: function () {
                                    me.uiAddChrysanthemum();
                                },
                                success: function (data) {
                                    if (data.success == true) {
                                        Notification.show({
                                            type: "well",
                                            message: "注册成功"
                                        });
                                        bfClient.UpdateInviteRecords({"phone":phone})
                                        bfAPP.gotoLogin();
                                    } else {
                                        Notification.show({
                                            type: "error",
                                            message: data.msg
                                        });
                                        me.getElement(".registeBotton")[0].disabled = false;
                                        if (me._txt) {
                                            countDwonUtil.stopCountDown(me._txt);
                                        }
                                    }
                                },
                                error: function (err) {
                                    Notification.show({
                                        type: "error",
                                        message: "注册失败"
                                    });
                                    me.uiRemoveChrysanthemum();
                                    me.getElement(".registeBotton")[0].disabled = false;
                                    if (me._txt) {
                                        countDwonUtil.stopCountDown(me._txt);
                                    }
                                },
                                complete: function () {
                                    me.uiRemoveChrysanthemum();
                                }
                            });
                        //} else {
                        //    Notification.show({
                        //        type: "error",
                        //        message: "请输入邮箱"
                        //    })
                        //}
                    } else {
                        Notification.show({
                            type: "error",
                            message: "密码为注册必填项，请填写。"
                        });
                    }
                //} else {
                //    Notification.show({
                //        type: "error",
                //        message: "用户名为注册必填项，请填写。"
                //    });
                //}
            } else {
                Notification.show({
                    type: "error",
                    message: "手机号码为注册必填项，请填写。"
                });
            }
        },
        uiAddChrysanthemum: function () {
            var me = this;
            if (me.$el.find('.chrysanthemum').length === 0) {
                me.$el.append("<div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>加载中...</div></div>");
            }
        },
        uiRemoveChrysanthemum: function () {
            var me = this;
            $('.chrysanthemum').remove();
        },
        changeSex: function (e) {
            var currentTarget = $(e.currentTarget);
            this.$el.find(".sex").find(".sexPoint-icon").removeClass("check");
            currentTarget.find(".sexPoint-icon").addClass("check");
        },
        onInput: function (e) { //输入
            var currentTarget = $(e.currentTarget);
            if (currentTarget.val() != "") {
                currentTarget.parent().find(".close-button").show();
            } else {
                currentTarget.parent().find(".close-button").hide();
            }
        },
        clearInput: function (e) { //清楚输入框
            var currentTarget = $(e.currentTarget);
            if (this._showPage == 'login') {
                currentTarget.siblings("input").val("");
                window.localStorage['password'] = null;
            } else {
                currentTarget.parent().find("input").val("");
            }
            currentTarget.parent().find("input").focus();
            currentTarget.hide();
        },
        getVerificationCode: function () {
            var me = this;
            this._txt = this.getElement(".verifiation-btn");
            var phoneNumber = this.getElement("#phone-number").val();
            var codeNumber = this.getElement(".imageCode").find('input').val();
            codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "register", function () {
                me.getImageCode()
            })
        }
    });
});

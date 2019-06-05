define([
        'common/navView',
        'shared/js/notification',
        'common/countDwonUtil'
    ],
    function (Base, Notification, CountDwon) {
        var Class = {};

        Class.events =
        {
            "click #next": 'onClickNext',
            "touchend #next": 'onClickNextEnd',
            "touchstart #next": 'onClickNextStart',
            "click .check_time": "checkTime",
            "focus input": "onFocus",
            "blur input": "onBlur",
            "click .hint": "OnClickHint"
        };
        Class.onClickNextEnd = function () {
            this.$('#next').removeClass('clickBackground');
        };

        Class.onClickNextStart = function () {
            this.$('#next').addClass('clickBackground');
        };

        Class.onClickNext = function () {

            var me = this;
            var password = this.getElement("#oldPassword").val();
            var newpassword = this.getElement("#newPassword").val();
            var confirmPassword = this.getElement("#confirmPassword").val();
            if (!newpassword && !confirmPassword && !password) {
                Notification.show({
                    type: "error",
                    message: "请输入密码"
                });
                return;
            }
            if (newpassword !== confirmPassword) {
                Notification.show({
                    type: "error",
                    message: "两次输入的密码不一致"
                });
                return;
            }

            if (!me.valiPassWord(newpassword)) {
                return true;
            }
            bfClient.updatePassword(
                newpassword,
                password,
                function (data) {
                    if (data.success && data.code == 0) {
                        Notification.show({
                            type: "well",
                            message: "修改密码成功"
                        });
                        window.localStorage.removeItem("token");
                        window.localStorage.removeItem("password");
                        window.localStorage.removeItem("isLogin");
                        bfAPP.gotoLogin();
                    }
                    else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        });
                    }
                }, function (error) {
                    var eMsg = '发生未知错误';
                    if (typeof(error) === 'string') eMsg = error;
                    if (typeof(error) === 'object') {
                        if (error.status == 0) eMsg = "连接服务器失败，请检查网络状况";
                    }
                    Notification.show({
                        type: "error",
                        message: eMsg
                    });
                })
        };
        Class.valiPassWord = function (newPassword) {
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
        };
        Class.onFocus = function (e) { //输入框聚焦
            var currentTarget = $(e.currentTarget);
            currentTarget.parent().find("label").hide();
        };
        Class.onBlur = function (e) { //失焦
            var currentTarget = $(e.currentTarget);
            var hint = currentTarget.parent().find("label");
            if (currentTarget.val().length > 0) {
                hint.hide();
            } else {
                hint.show();
            }
        };
        Class.OnClickHint = function (e) { //点击提示聚焦
            var currentTarget = $(e.currentTarget);
            currentTarget.parent().find("input").focus();
        };
        Class.checkTime = function () {
            var me = this;
            var time = 60;
            var reslutState = me.getElement(".reslut-state");
            reslutState.css("color", "red");
            reslutState.text("已向你的手机发送验证码");
            var changStatu = this.getElement(".check_time");
            me.sendAuthCode(function () {
                CountDwon.countDwon(changStatu, time)
            });
        };
        Class.sendAuthCode = function (success) {
            var me = this;
            me._contact = bfDataCenter.getUserMobile();
            bfClient.sendAuthcode({
                type: 'post',
                data: {'contact': me._contact, 'usage': "changePwd"},
                success: function (data) {
                    if (data.code == 0) {
                        success();
                    } else {
                        Notification.show({
                            type: "error",
                            message: data.msg
                        })
                    }
                }
            });
        };
        return Base.extend(Class);
    }
);
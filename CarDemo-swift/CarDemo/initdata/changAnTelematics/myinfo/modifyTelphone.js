define([
        "common/navView",
        "common/osUtil",
        "shared/js/client",
        'common/countDwonUtil',
        "shared/js/notification",
        'common/imageCodeInterface'
    ],
    function (View, osUtil, Client, CountDwon, Notification, codeInterface) {
        var Base = View;
        return Base.extend({
            id: "modifyTelphone",
            events: {
                "focus input": "onFocus",
                "blur input": "onBlur",
                "click .hint": "OnClickHint",
                "click .check_time": "getVerificationCode",
                "click .submit_ok": "SubmitInfo",
                "touchstart .submit_ok": "SubmitInfoStart",
                "touchend .submit_ok": "SubmitInfoEnd",
                "click .image-code": function(){this.getImageCode()}
            },
            onShow: function(){
                this.getImageCode();
            },
            getImageCode: function(){
                var imageNode = this.getElement("#checkImg");
                codeInterface.getImageCode(imageNode);
            },
            getVerificationCode: function () {
                var me = this;
                this._txt = this.getElement(".check_time");
                var phoneNumber = this.getElement("#newPhoneNum").val();
                var codeNumber = this.getElement(".imageCode").find('input').val();
                codeInterface.verificationCode(this._txt, phoneNumber, codeNumber, "updatePhone", function(){me.getImageCode()})
            },
            SubmitInfoEnd: function(){
                this.$('.submit_ok').removeClass('clickBackground');
            },
            SubmitInfoStart: function(){
                this.$('.submit_ok').addClass('clickBackground');
            } , 
            onFocus: function (e) { //输入框聚焦
                var currentTarget = $(e.currentTarget);
                currentTarget.parent().find("label").hide();
            },
            onBlur: function (e) { //失焦
                var currentTarget = $(e.currentTarget);
                var hint = currentTarget.parent().find("label");
                if (currentTarget.val().length > 0) {
                    hint.hide();
                } else {
                    hint.show();
                }
            },
            OnClickHint: function (e) { //点击提示聚焦
                var currentTarget = $(e.currentTarget);
                currentTarget.parent().find("input").focus();
            },
            SubmitInfo: function () {
                var me = this;
                var newPhoneNum = me.getElement("#newPhoneNum").val(); //新手机号码
                var checkNum = me.getElement("#checkNum").val();   //手机验证码
                var Password = me.getElement("#userPassword").val();  //用户密码
                var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/; //手机
                if (!(phoneFilter.test(newPhoneNum))) {
                    Notification.show({
                        type: "error",
                        message: "请输入正确的手机号码"
                    });
                    return;
                }
                if (newPhoneNum && checkNum && Password) {
                    var dataUpdate = {"newPhoneNum": newPhoneNum, "checkNum": checkNum, "password": Password};
                    me.getElement(".submit_ok")[0].disabled = true;
                    bfClient.changeUserPhone(
                        dataUpdate,
                        function (req) {
                            if (req.success == true) { //信息校验成功
                                Notification.show({
                                    type: 'info',
                                    message: '手机修改成功'
                                });
                                bfAPP.gotoLogin();
                            } else {
                                Notification.show({
                                    type: 'error',
                                    message: req.msg || '验证码错误,修改失败'
                                });
                                me.getElement(".submit_ok")[0].disabled = false;
                                if (me._txt) {
                                    CountDwon.stopCountDown(me._txt);
                                };
                            }
                        }, function (error) {
                            me.getElement(".submit_ok")[0].disabled = false;
                            if (me._txt) {
                                CountDwon.stopCountDown(me._txt);
                            };
                        })
                } else {
                    Notification.show({
                        type: 'error',
                        message: '请输入正确的信息'
                    });
                }
            }

        });
    });
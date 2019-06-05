define([
        'common/navView',
        'text!myinfo/contactsPhone.html',
        'shared/js/notification'
    ],
    function (View, viewTemplate, Notification) {

        var View = View.extend({
            events: {
                "click .submitName": "submit"
            },
            onViewPush: function (pushFrom, pushData) {

            },
            onShow: function () {
                var inputNode = this.getElement("#editNickname_nickname");
                inputNode[0].focus();
            },
            posGenHTML: function () {
                var contacts = bfDataCenter.getUserSessionValue('contactsMobile');
                if(contacts &&contacts != null && contacts != 'null' && contacts != 'undefined'){
                    this.getElement("#editNickname_nickname").val(contacts.substring(0,4)+'***'+contacts.substring(contacts.length-4,contacts.length));
                }
            },
            submit: function () {
                var self = this;
                var name = this.getElement("#editNickname_nickname").val();
                if (!name) {
                    Notification.show({
                        type: "error",
                        message: "紧急联系人不能为空"
                    });
                    return;
                }
                if(self.RexPhone(name)){
                    this.editNickname(name)
                }
            },
            editNickname: function (name) {
                var self = this;
                bfClient.saveMyinfo({
                    "contactsMobile": name,
                    success: function (data) {
                        if (data.success) {
                            bfDataCenter.setUserSessionValue("contactsMobile", name);
                            Notification.show({
                                "type": "info",
                                "message": "修改成功"
                            });
                            bfDataCenter.setUserSessionValue("contactsMobile",name);
                            bfNaviController.pop();
                        } else {
                            Notification.show({
                                "type": "error",
                                "message": "修改失败"
                            });
                        }
                    },
                    error: function (data) {
                        Notification.show({
                            type: "error",
                            message: "网络开小差"
                        });
                    }
                })
            },
            RexPhone:function(phone){
                var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/; //手机
                if (!(phoneFilter.test(phone))) {
                    Notification.show({
                        type: "error",
                        message: "请输入正确的手机号码"
                    });
                    return false;
                }
                return true;
            }
        });
        return View;

    });
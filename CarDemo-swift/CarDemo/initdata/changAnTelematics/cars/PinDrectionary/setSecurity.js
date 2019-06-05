/**
 * Created by hp on 2017/2/21.
 */
define([
        'text!cars/PinDrectionary/setSecurity.html',
        "common/navView",
        'butterfly',
        "common/osUtil",
        "common/ssUtil",
        "shared/js/notification",
        "common/disUtil",
        'shared/plugin_dialog/js/dialog'
    ],
    function (template, View, Butterfly, osUtil, ssUtil, Notification, disUtil,dialog) {
        var Base = View;
        var cls = {
            events: {
                "click #submit":"submit"
            }
        };
        cls.onViewPush = function (pushFrom, pushData) {
            this._CarId = pushData.carId;
        };
        //onshow事件，初始化element
        cls.posGenHTML = function () {

        };
        cls.onShow = function () {

        };
        cls.submit = function () {
            var me = this;
            var Questions = me.getElement(".input_wrap");
            var userSercretQuestions1,userSercretQuestions2,userSercretQuestions3,userSercretAnswer1,userSercretAnswer2,userSercretAnswer3;
            userSercretQuestions1 = $($(Questions[0]).find("input")[0]).val();
            userSercretAnswer1 = $($(Questions[0]).find("input")[1]).val();
            userSercretQuestions2 = $($(Questions[1]).find("input")[0]).val();
            userSercretAnswer2 = $($(Questions[1]).find("input")[1]).val();
            userSercretQuestions3 = $($(Questions[2]).find("input")[0]).val();
            userSercretAnswer3 = $($(Questions[2]).find("input")[1]).val();
            if(!userSercretQuestions1&&!userSercretQuestions2&&!userSercretQuestions3&&!userSercretAnswer1&&!userSercretAnswer2&&!userSercretAnswer3){
                Notification.show({
                    type:"error",
                    message:"请完整输入密保问题的内容！"
                });
                return;
            }
            bfClient.setSercretQuestion({
                data:{
                    "userSecretQuestions[0].userQuestion":userSercretQuestions1,
                    "userSecretQuestions[0].userAnswer":userSercretAnswer1,
                    "userSecretQuestions[1].userQuestion":userSercretQuestions2,
                    "userSecretQuestions[1].userAnswer":userSercretAnswer2,
                    "userSecretQuestions[2].userQuestion":userSercretQuestions3,
                    "userSecretQuestions[2].userAnswer":userSercretAnswer3
                },
                success: function (data) {
                    if(data.success == true&& data.code ==0){
                        bfNaviController.push('/cars/setPINForCar.html', {
                            carId: me._CarId,
                            type: "setpin"
                        });
                    }else{
                        Notification.show({
                           "type":"error",
                            "message":data.msg
                        });
                    }
                },
                error: function () {
                    Notification.show({
                        "type":"error",
                        "message":"服务器繁忙，请稍后再试"
                    });
                }
            });
        };
        return Base.extend(cls);
    });
/**
 * Created by hp on 2017/2/21.
 */
define([
        'text!cars/PinDrectionary/answerSecurity.html',
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
            this._carId = pushData.carId;
        };
        //onshow事件，初始化element
        cls.posGenHTML = function () {

        };
        cls.onShow = function () {
            var me = this;
            $(this.getElement("input")).val("");
            me.getQuestion();
        };
        cls.submit = function () {
            var me =this;
            var Answers = me.getElement("input");
            var Answers1 =$(Answers[0]).val();
            var Answers2 =$(Answers[1]).val();
            if(!Answers1||Answers1==''||!Answers2||Answers2 == ''){
                Notification.show({
                    type:"error",
                    message:"请完整输入所有问题答案！"
                });
                return;
            }
            var data  = {
                "userSecretQuestions[0].userQuestionAnswerId":me._Questions[0].userQuestionAnswerId,
                "userSecretQuestions[0].userAnswer":Answers1,
                "userSecretQuestions[1].userQuestionAnswerId":me._Questions[1].userQuestionAnswerId,
                "userSecretQuestions[1].userAnswer":Answers2
            };
            bfClient.checkSercretQuestion({
                data:data,
                success: function (req) {
                    if(req.code ==0&&req.success ==true){
                        bfNaviController.push("cars/PinDrectionary/forgetPin.html",{carId:me._carId});
                    }else{
                        Notification.show({
                            "type":"error",
                            "message":req.msg
                        });
                    }
                },
                error: function () {
                    Notification.show({
                        "type":"error",
                        "message":"服务器繁忙，请稍后再试"
                    });
                }
            })
        };
        cls.getQuestion = function () {
            var me = this;
            bfClient.getSercretQuestion({
                data:{},
                success: function (data) {
                    if(data.success == true&& data.code ==0){
                        var questions = me.chooseQusetion(data.data);
                        var Quest = [];
                        for(var i=0;i<questions.length;i++){
                            Quest[i] = data.data[questions[i]];
                        }
                        me.QuestionOn(Quest);
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
        cls.QuestionOn = function (data) {
            var me =this;
            me._Questions = data;
            var QuestionBlank = $(me.getElement(".input_wrap").find(".questionInfo"));
            for(var i=0;i<QuestionBlank.length;i++){
                $(QuestionBlank[i]).html(data[i].userQuestion+"?");
            }
        };
        cls.chooseQusetion= function (source) {
            var sL = source.length;
            var target= [];
            //随机4个数组下标
            for(var i = 0; i < 2; i++){
                var rand = Math.floor( Math.random() * sL );
                if(target.length > 0){
                    detection(target, rand);
                }else{
                    target.push(rand);
                }
            }
            return target;
            //检测num是否存在于arr，存在重新添加，不存在直接添加
            function detection(arr, num){
                var repeatFlag = false;
                for(var j = 0; j < arr.length; j++){
                    if(arr[j] == num){
                        repeatFlag = true;
                    }
                }
                if(repeatFlag){
                    //递归
                    arguments.callee(arr, Math.floor( Math.random() * sL ));
                }else{
                    arr.push(num);
                }
            }
        };
        return Base.extend(cls);
    });
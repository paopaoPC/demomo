define(['common/imView',
    'butterfly',
    'shared/js/notification',
    'shared/timePicker/js/date',
    'shared/js/client',
    'shared/plugin_dialog/js/dialog',
    'common/countDwonUtil',
    'common/disUtil',
    "underscore",
    "main/Plugins",
], function (View, Butterfly, Notification, DatePicker, MainClient, dialog, CountDwon, DisUtil,_,Plugin) {

    return View.extend({
        events: {
            "click .close-button": "clearInput",
            'click .loginBotton': 'onLogin',
            'touchstart .loginBotton': 'onLoginStart',
            'touchend .loginBotton': 'onLoginEnd',
            "keyup": "enterLogin",
            "input input": "onInput",
            "click .fond-password": "fondPassword",
            "click .loginItem": "ItemFocus",
            "click .check-box": "goCheck",
            "click .incall_argument": "goIncallArument",
            'click .registeNow': 'showRegistePage'
        },
        goIncallArument: function () {
            bfNaviController.push("myinfo/incallArgument.html")
        },
        goCheck: function (el) {
            var conNode = $(el.currentTarget);
            var checkNode = this.getElement(".check-icon");
            if (!checkNode.hasClass('active')) {
                checkNode.addClass('active')
            } else {
                checkNode.removeClass('active')
            }
        },
        showRegistePage: function () { //显示注册页面
            bfNaviController.push("login/register.html");
        },
        onLoginStart: function () {
            this.$('.loginBotton').addClass('clickBackground');
        },
        onLoginEnd: function () {
            this.$('.loginBotton').removeClass('clickBackground');
        },
        ItemFocus: function (el) {
            var me = this;
            var elment = $(el.target);
            if (elment.hasClass("loginItem")) {
                if (elment.hasClass("userName")) {
                    me.getElement("#login-userName").focus();
                } else if (elment.hasClass("password")) {
                    me.getElement("#login-password").focus();
                }
            } else {
                elment = $(elment.parents(".loginItem"));
                if (elment.hasClass("userName")) {
                    me.getElement("#login-userName").focus();
                } else if (elment.hasClass("password")) {
                    me.getElement("#login-password").focus();
                }
            }
        },
        render: function () {
            var me = this;
            this.firstBackground = 0;
            View.prototype.render.call(this);
            return this;
        },
        posGenHTML: function () {
            var me = this;
            window.localStorage['bodyHeight'] = document.body.offsetHeight;
            var height = DisUtil.clientHeight;
            me.getElement("#login-page").height(height);
            if (window.keyboard) {
                window.keyboard.init();
            }
        },
        onShow: function () {
            var me = this;
            this.uiSetUserName();
            //window.addEventListener('native.keyboardshow', this.keyboardShowHandler);
            //window.addEventListener('native.keyboardhide', this.keyboardHideHandler);
            //登录页面弄好后，隐藏动画
            if (this.firstBackground === 0) {
                if (navigator.splashscreen) {
                    setTimeout(function () {
                        navigator.splashscreen.hide();
                    }, 1000);
                }
                this.firstBackground = 1;
            }
            me.getBaseUrl();
            if (typeof (cordova) != "undefined") {
                navigator.packaging.catchCrashInfo(function (Info) {
                    if (typeof (Info.hasNoInfo) == "undefined") {
                        SendLogInfo(Info);
                    }
                });
            }
        },
        getBaseUrl: function (phone) {
            var url = bfConfig.server + "/app/api/1.0/server/host?loginName=" + window.localStorage.userMobile;
            if (phone) {
                url = bfConfig.server + "/app/api/1.0/server/host?loginName=" + phone;
            }
            var isNev = window.localStorage['isNev'];
            var setBaseUrl = function (server) {
                bfConfig.server = server;
                if (navigator.packaging) {
                    navigator.packaging.setBaseUrl({
                        baseUrl: bfConfig.server,
                        isNev: isNev
                    }, function () {
                    }, function () {
                    });
                }
            };
            $.ajax({
                url: url,
                type: 'get',
                timeout:6000,
                data: {},
                success: function (data) {
                    if (data.code == "0") {
                        setBaseUrl(data.data.serverHost);
                    } else {
                        console.log(data.msg);
                        setBaseUrl(bfConfig.server);
                    }
                },
                error: function (error) {
                    console.log("请求服务器连接失败");
                    setBaseUrl(bfConfig.server);
                }
            });
        },
        fondPassword: function () {
            bfNaviController.push("login/findPswValidate.html");
        },
        signInDevice: function (loginId) {
            if (navigator.iChanganCommon && navigator.iChanganCommon.getDeviceId) {
                navigator.iChanganCommon.getDeviceId(
                    function (deviceId) {
                        $.ajax({
                            url: "http://m.changan.com.cn/pushModule/ms_plugin/push_api/ms_user_sign",
                            method: 'POST',
                            timeout: 30 * 1000,
                            dataType: 'json',
                            data: {
                                loginId: loginId,
                                loginName: loginId,
                                appKey: 'c8eebf5bb7705a1d9950f53b',
                                masterSecret: '4253012e0dc3916b1d09c985',
                                appName: 'cvim',
                                deviceId: deviceId,
                                deviceOS: window.device.platform,
                                OSType: window.device.platform == "iOS" ? 1 : 2
                            },
                            success: function () {
                            },
                            error: function (e) {
                            }
                        });
                    },
                    function () {
                    }
                );
            }
        },
        uiSetUserName: function () {
            var self =this;
            var username = window.localStorage['userMobile'];
            if (username) {
                var userNameEl = this.$el.find("#login-page").find(".userName");
                userNameEl.find("input").val(username);
                if (userNameEl.find("input").val().length > 0) {
                    userNameEl.find(".hint").hide();
                }
                self.onInput($(userNameEl.find("input")));
            }
        },
        onLogin: function () {
            var me = this;
            var phoneFilter = /^((\+?86)|(\(\+86\)))?1\d{10}$/;
            var loginPage = this.$el.find("#login-page");
            var tel = loginPage.find(".userName").find("input").val().trim(); //电话或者用户名
            var passWord = loginPage.find(".password").find("input").val(); //密码

            //判断用户是否选择用户协议
            var checkNode = this.getElement(".check-icon");
            if (!checkNode.hasClass('active')) {
                Notification.show({
                    type: "info",
                    message: "请选择用户协议"
                });
                return;
            }
            if (tel !== '') {
                if (passWord !== '') {
                    me.getElement(".loginBotton")[0].disabled = true;
                    me.getBaseUrl(tel);
                    bfClient.login({
                        username: tel,
                        password: passWord,
                        beforeSend: function () {
                            me.uiAddChrysanthemum();
                        },
                        success: function (data) {
                            if (data.from && data.from == "autoLogin") {
                                data.code = 0;
                            }
                            if (data && data.success && data.code == "0" && data.data) {
                                // 博拉调用登录增加积分接口
                                // 获取公钥
                                bfClient.getgenerate({},function (key) {
                                    console.log("公钥")
                                    // var tel = "13638381547";
                                    // var passWord = "asd123456";
                                    var generate = key;
                                    passWord = RSAUtils.encryptedString(RSAUtils.getKeyPair(generate.returndata.exponent, '', generate.returndata.modulus), encodeURIComponent(passWord));
                                    bfClient.loginnew({username:tel,password:passWord,modulus:generate.returndata.modulus},function(keyData){
                                        if(keyData.errmsg=="ok"&&keyData.returndata){
                                            console.log(keyData.returndata.token);
                                            console.log("登录增加积分token")
                                            window.localStorage['token'] = keyData.returndata.token;
                                        }else{
                                            Notification.show({
                                                type: "error",
                                                message: keyData.errmsg
                                            });
                                        }
                                    },function (err) {
                                        Notification.show({
                                            type: "error",
                                            message: "增加积分失败"
                                        });
                                    })
                                })

                                //save it
                                window.localStorage['token'] = data.data.token;
                                window.localStorage['userMobile'] = data.data.mobile;
                                window.localStorage['password'] = passWord;
                                window.localStorage['userId'] = data.data.userId;
                                window.localStorage['isLogin'] = 'true';

                                // 会员相关数据 过滤后台的null,undefined
                                var infoJson = {};
                                infoJson["nickname"] = data.data.nickname === null ? '' : (data.data.nickname || '');
                                infoJson["phone"] = data.data.mobile === null ? '' : (data.data.mobile || '');
                                infoJson["sex"] = data.data.sex === null ? '' : (data.data.sex || '');
                                infoJson["email"] = data.data.email === null ? '' : (data.data.email || '');
                                infoJson["birthday"] = data.data.birthday === null ? '' : (data.data.birthday || '');
                                infoJson["cycid"] = data.data.cycid === null ? '' : (data.data.cycid || '');
                                infoJson["sycid"] = data.data.sycid === null ? '' : (data.data.sycid || '');
                                infoJson["sycuid"] = data.data.sycuid === null ? '' : (data.data.sycuid || '');
                                infoJson["cycuid"] = data.data.cycuid === null ? '' : (data.data.cycuid || '');
                                // infoJson["openid"] = data.data.openId === null ? '' : (data.data.openId || '');
                                window.localStorage['user_info_cache_data'] = JSON.stringify(infoJson);
                                /**
                                 * IM 信息
                                 * */
                                if (!data.data.imPassWord || !data.data.imUserId) {
                                    bfClient.getImUser({
                                        data: {},
                                        success: function (req) {
                                            if (req.code == 0 && req.success == true) {
                                                window.localStorage['imPassWord'] = req.data.outerPassword;
                                                window.localStorage['imUserId'] = req.data.uuid;
                                            } else {
                                                Notification.show({
                                                    type: "error",
                                                    message: req.msg
                                                });
                                            }
                                        },
                                        error: function () {
                                            console.log("IM登录失败");
                                        }
                                    });
                                } else {
                                    window.localStorage['imPassWord'] = data.data.imPassWord;
                                    window.localStorage['imUserId'] = data.data.imUserId;
                                }
                                // 设备签到
                                me.signInDevice(data.data.mobile);
                                //获取设备id
                                if (navigator.appInfo) {
                                    navigator.appInfo.getUniqueId(function(data){
                                        console.log(data);
                                        window.localStorage['deviceId'] = data;
                                    }, function(error){

                                    });
                                }

                                // 允许派发推送消息
                                if (data.data.userName) {
                                    bfAPP.gotoMain();
                                } else {
                                    bfNaviController.push('/login/addUserName.html',{passWord:passWord});
                                }
                            } else {
                                var mes;
                                if (data) {
                                    if (data.msg) {
                                        Notification.show({
                                            type: "error",
                                            message: data.msg
                                        });
                                    }
                                    mes = data.msg;
                                } else {
                                    Notification.show({
                                        type: "error",
                                        message: "未知错误"
                                    });
                                    mes = "未知错误";
                                }
                            }
                            me.getElement(".loginBotton")[0].disabled = false;
                        },
                        error: function (error) {
                            var eMsg = '发生未知错误';
                            if (typeof(error) === 'string') eMsg = error;
                            if (typeof(error) === 'object') {
                                if (error.status == 0) eMsg = "网络开小差";
                            }
                            me.uiRemoveChrysanthemum();
                            Notification.show({
                                type: "error",
                                message: eMsg
                            });
                            me.getElement(".loginBotton")[0].disabled = false;
                        },
                        complete: function () {
                            me.uiRemoveChrysanthemum();
                        }
                    });
                } else {
                    Notification.show({
                        type: "error",
                        message: "密码不能为空，请填写"
                    });
                }
            } else {
                Notification.show({
                    type: "error",
                    message: "用户名不能为空，请填写"
                });
            }

        },
        onFocus: function (e) { //输入框聚焦
            var currentTarget = $(e.currentTarget);
            currentTarget.parent().find("label").hide();
            if (this.dp) {
                this.dp.datecancle();
            }
            if (currentTarget.val() != "") {
                currentTarget.parent().find(".close-button").show();
            } else {
                currentTarget.parent().find(".close-button").hide();
            }
        },
        onBlur: function (e) { //失焦
            var currentTarget = $(e.currentTarget);
            var hint = currentTarget.parent().find("label");
            if (currentTarget.val()) {
                hint.hide();
            } else {
                hint.show();
            }
            setTimeout(function () {
                currentTarget.parent().find(".close-button").hide();
            }, 100);

        },
        OnClickHint: function (e) { //点击提示聚焦
            var currentTarget = $(e.currentTarget);
            currentTarget.parent().find("input").focus();
        },
        uiAddChrysanthemum: function () {
            var me = this;
            if (me.$el.find('.chrysanthemum').length === 0) {
                me.$el.append("<div id='chrysanthemumWarp' style='position: absolute;width: 100%;height: 100%'><div class='chrysanthemum active' style='text-align: center;'><div></div><div style='font-size: 16px;color: white;margin-top: 50px;'>登录中...</div></div></div>");
            }
        },
        uiRemoveChrysanthemum: function () {
            var me = this;
            $('#chrysanthemumWarp').remove();
        },
        enterLogin: function (event) { //用回车键响应登录
            var me = this;
            if (event.keyCode == 13) {
                if (this.$el.find("#login-page").css("display") == "block") {
                    me.onLogin();
                    me.$el.find("input").blur();
                } else if (this.$el.find("#registe-page").css("display") == "block") {
                    me.onRegiste();
                    me.$el.find("input").blur();
                }
            }
        },
        onInput: function (e) { //输入
            var currentTarget;
            if(e.currentTarget){
                currentTarget = $(e.currentTarget);
            }else{
                currentTarget = e;
            }
            currentTarget.css({"opacity": "1", "font-size": "0.12799945rem"});
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


        }
    });
});

define(['backbone', 'shared/js/notification', 'common/osUtil', 'butterfly'], function (Backbone, Notification, osUtil, Butterfly) {

    var basePath = null;
    basePath = bfConfig.server;
    return {
        basePath: basePath,
        pageSize: 20,
        path_updateImageCode: basePath + "/api/user/login/updateImageCode",
        request: function (paras) {
            var url = decodeURI(location.href);
            var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
            var returnValue;
            for (i = 0; i < paraString.length; i++) {
                var tempParas = paraString[i].split('=')[0];
                var parasValue = paraString[i].split('=')[1];
                if (tempParas === paras)
                    returnValue = parasValue;
            }

            if (typeof(returnValue) == "undefined") {
                return "";
            } else {
                return returnValue;
            }
        },
        tokenUpdate: function (params) {
            var me = this;
            me.tokenUpdating = true;
            var password = window.localStorage.password;
            // if (typeof cordova != "undefined") {
                password = "";
            // }
            if(window.localStorage['loginModel']){
                this.refreshWxToken()
            } else {
                bfClient.login({
                    username: window.localStorage['userMobile'],
                    password: password,
                    from: 'autoLogin',
                    success: function (data) {
                        if (!data.success) {
                            Notification.show({
                                type: "error",
                                message: "登陆过期,请重新登陆"
                            });
                            bfAPP.gotoLogin();
                            return;
                        }
                        //成功则继续刚才的请求
                        console.log("过期接口API："+params.url);
                        window.localStorage['token'] = data.data.token;
                        window.localStorage.setItem("tokenUpdateTime", new Date().getTime());
                        console.log('token更新成功');
                        for (var i = 0; i < me.requestParams.length; i++) {
                            me.requestParams[i].data['token'] = window.localStorage.token;
                            $.ajax(me.requestParams[i]);
                        }
                        me.requestParams = [];
                        osUtil.delayCall(function () {
                            bfAPP.onTokenUpdate();
                        });
                        me.tokenUpdating = false;
                    },
                    error: function (err) {
                        me.tokenUpdating = false;
                        me.requestParams = [];
                        console.log('token更新失败');
                        console.log(params.url);
                        if (err.responseJSON && err.responseJSON.msg) {
                            err = err.responseJSON.msg
                        }
                        console.log("token更新失败原因："+err);
                        Notification.show({
                            type: "error",
                            message: "登陆过期,请重新登陆"
                        });
                        setTimeout(function () {
                            window.localStorage.removeItem('token');
                            window.localStorage.removeItem('isLogin');
                            bfAPP.gotoLogin();
                        }, 2000);
                    }
                });
            }
            
        },
        refreshWxToken : function(){
            var me = this;
            if(bfConfig._config.runtime == "RELEASE"){
                var domain = 'https://incallapi.changan.com.cn';
            } else {
                var domain = 'https://ssl.mall.changan.com.cn';
            }
            var urlSubFix = "/cac/api/v1/oauth2/refresh_token?client_id=bce34639784c4b159e7ebeda9a5d13bb&refresh_token=" + window.localStorage['refreshToken'];
            var url = domain + urlSubFix;
            $.ajax({
                type: "GET",
                url: url,
                headers: {"Response-Form":"json"},
                success: function(res){
                    if(res && res.status_code == 0){

                        window.localStorage.token = res.access_token;
                        window.localStorage.refreshToken =  res.refresh_token;
                        window.localStorage.setItem("tokenUpdateTime", new Date().getTime());
                        bfClient.login({
                            username: '',
                            password: '',
                            from: 'autoLogin',
                            token: res.access_token,
                            refreshToken: res.access_token,
                            success: function (data) {
                                if (!data.success) {
                                    Notification.show({
                                        type: "error",
                                        message: "登陆过期,请重新登陆"
                                    });
                                    bfAPP.gotoLogin();
                                    return;
                                }
                                //成功则继续刚才的请求
                                window.localStorage['token'] = data.data.token;
                                window.localStorage.setItem("tokenUpdateTime", new Date().getTime());
                                console.log('token更新成功');
                                for (var i = 0; i < me.requestParams.length; i++) {
                                    me.requestParams[i].data['token'] = window.localStorage.token;
                                    $.ajax(me.requestParams[i]);
                                }
                                me.requestParams = [];
                                osUtil.delayCall(function () {
                                    bfAPP.onTokenUpdate();
                                });
                                me.tokenUpdating = false;
                            },
                            error: function (err) {
                                me.tokenUpdating = false;
                                me.requestParams = [];
                                console.log('token更新失败');
                                if (err.responseJSON && err.responseJSON.msg) {
                                    err = err.responseJSON.msg
                                }
                                console.log("token更新失败原因："+err);
                                Notification.show({
                                    type: "error",
                                    message: "登陆过期,请重新登陆"
                                });
                                setTimeout(function () {
                                    window.localStorage.removeItem('token');
                                    window.localStorage.removeItem('isLogin');
                                    bfAPP.gotoLogin();
                                }, 2000);
                            }
                        });
                    } else {
                        me.tokenUpdating = false;
                        me.requestParams = [];
                        console.log('token更新失败');
                        // console.log(params.url);
                        // if (err.responseJSON && err.responseJSON.msg) {
                        //     err = err.responseJSON.msg
                        // }
                        console.log("token更新失败原因");
                        Notification.show({
                            type: "error",
                            message: "登陆过期,请重新登陆"
                        });
                        setTimeout(function () {
                            window.localStorage.removeItem('token');
                            window.localStorage.removeItem('isLogin');
                            bfAPP.gotoLogin();
                        }, 2000);
                    }
                },
                error: function(err){
                    me.tokenUpdating = false;
                    me.requestParams = [];
                    console.log('token更新失败');
                    // console.log(params.url);
                    if (err.responseJSON && err.responseJSON.msg) {
                        err = err.responseJSON.msg
                    }
                    console.log("token更新失败原因："+err);
                    Notification.show({
                        type: "error",
                        message: "登陆过期,请重新登陆"
                    });
                    setTimeout(function () {
                        window.localStorage.removeItem('token');
                        window.localStorage.removeItem('isLogin');
                        bfAPP.gotoLogin();
                    }, 2000);
                }
            })
        },
        ajax: function (params) {
            var me = this;
            var def = new $.Deferred();
            // 改回post
            params.method = "POST";
            var callbacks = _.pick(params, ['success', 'error']);
            var defaults = {
                dataType: "json",
                timeout: 15000,
                error: function () {
                    console.log('Call API error');
                    callbacks.error(arguments);
                }
            };

            //带有默认值
            params = _.extend(defaults, params);
            if (!params.data) {
                params.data = {};
            }
            params.data['isNev'] = window.localStorage.isNev;
            params.data['token'] = window.localStorage['token'];
            // params.data['deviceId'] = window.localStorage['deviceId'];
            if(typeof OSApp !== 'undefined'){
                params.data['deviceId'] = JSON.parse(OSApp.getInfo()).deviceId;
            }
            params.data['mapType'] = window.localStorage['mapType'];
            //代理回调
            var paramsWithProxy = _.extend(params, {
                success: function (response) {
                    //isLogin: 登陆调用此函数时，不尝试更新token，否则会死循环
                    if (!params.isLogin && !response.success && response.code == "2") {
                        //token过期
                        if (!me.requestParams) {
                            me.requestParams = [];
                        }
                        if (window.localStorage.tokenUpdateTime) {
                            //该条件有一个漏洞，当刚更新完token，但是服务器端的token莫名过期，就会一直发起token过期的请求
                            if ((new Date().getTime() - Number(window.localStorage.tokenUpdateTime)) < 10000 && !me.tokenUpdating) {
                                params.data['token'] = window.localStorage.token;
                                params.method = "POST";
                                $.ajax(params);
                                return;
                            }
                        } else {
                            window.localStorage.setItem("tokenUpdateTime", new Date().getTime());
                        }
                        if (!me.tokenUpdating) {
                            me.requestParams.push(params);
                            console.log('token过期，尝试更新');
                            me.tokenUpdate(params);
                        } else {
                            me.requestParams.push(params);
                            console.log("接口堆栈长度："+me.requestParams.length);
                        }
                    } else if (response.code == '1005') {
                        //单点登录
                        Notification.show({
                            type: 'error',
                            message: '进入client的1005入口'
                        });
                        openPage({"page": "logonout"});
                    } else {
                        callbacks.success(response);
                        def.resolve(response);
                    }
                },
                error:function (err) {
                    callbacks.error(err);
                    def.reject(err)
                }
            });
            $.ajax(paramsWithProxy);
            return def;
        },
        //判断是否为空
        isNull: function (data) {
            var def = true;
            if (typeof data == "string") {
                data = data.trim();
            }
            if ((typeof data !== "undefined" && data && data.length !== 0) || typeof data === "function") {
                def = false;
            }
            return def;
        },
        updateImageCode: function (params) {
            $.ajax({
                url: this.path_updateImageCode,
                type: 'post',
                data: params.data,
                success: params.success,
                beforeSend: params.beforeSend,
                error: params.error,
                complete: params.complete
            });
        }
    }
});
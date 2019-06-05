define(["shared/js/notification"],
    /**
     * 调用原生插件的统一入口
     * 例子：
     * callFunc(data:{},success:function(){},error:function(){},Func:"")
     * 参数说明:
     * data 接口访问需要的参数
     * success 接口成功的回调
     * error  接口失败的回调
     * Func  原生方法的方法名
     * */
    function (Notification) {
        var cls = {};
        cls.callFunc = function (params) {
             //1
                //  OSApp.showStatus("success",params); 
            // require("deviceone").print("enter1");
            var me = this;
            params.data.isNev = window.localStorage.isNev;
            params.data.token = window.localStorage.token;
            //   OSApp.showStatus("success","8"); 
//            params.data['deviceId'] = window.localStorage['deviceId'];
            var success = function (returnData) {
                console.log("进入原生调用token统一处理");
                if(params.complete){
                    params.complete();
                }
                if (returnData.code == 2 && (params.Func != "login" || params.Func != "regist" || params.Func != "sendAuthCode" || params.Func != "findPassword")) {
                    console.log("token过期,尝试更新token");
                    me.refreshToken(params);
                } else {
                    console.log("进入success回调");
                    params.success(returnData);
                }
            };
            if(typeof params.error == "undefined"){
                params.error = function (err) {
                    console.log("进入原生调用error回");
                }
            }
            if(params.beforeSend){
                params.beforeSend();
            }
            // if (typeof cordova != "undefined") {
                switch (params.Func) {
                    // case "login":
                    //     me.login({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "regist":
                    //     me.regist({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "sendAuthCode":
                    //     me.sendAuthCode({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "findPassword":
                    //     me.findPassword({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "updatePassword":
                    //     me.updatePassword({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "validatePassword":
                    //     me.validatePassword({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "updatePhone":
                    //     me.updatePhone({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "carCreate":
                    //     me.carCreate({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "addDevice":
                    //     me.addDevice({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "unbind":
                    //     me.unbind({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "unbindCar":
                    //     me.unbindCar({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "setPin":
                    //     me.setPin({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // // case "getControlStatus":
                    // //     me.getControlStatus({
                    // //         data: params.data,
                    // //         success: success,
                    // //         error: params.error
                    // //     });
                    // //     break;
                    // case "carControl":{
                    //     OSApp.showStatus("success","9"); 
                    // 	//    require("deviceone").print("enter2");
                    //     me.carControl({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    // }
                    //     break;
                    // case "getCarControlInfo":
                    //     me.getCarControlInfo({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    // case "getControlInfoByTaskId":
                    //     me.getControlInfoByTaskId({
                    //         data: params.data,
                    //         success: success,
                    //         error: params.error
                    //     });
                    //     break;
                    default :
                        // OSApp.showStatus("error","10");
                        console.log("调用原生方法不存在");
                        break;
                }
            // }
        };
        cls.login = function (params) {  //用户登陆
            navigator.packaging.login(params.data, params.success, params.error);
        };
        cls.regist = function (params) { //用户注册
            navigator.packaging.regist(params.data, params.success, params.error);
        };
        cls.sendAuthCode = function (params) {  //发送验证码
           	navigator.packaging.sendAuthCode(params.data, params.success, params.error);
        };
        cls.findPassword = function (params) {  //忘记密码
            navigator.packaging.findPassword(params.data, params.success, params.error);
        };
        cls.updatePassword = function (params) {  //更新密码
            navigator.packaging.updatePassword(params.data, params.success, params.error);
        };
        cls.validatePassword = function (params) {  //验证密码
            navigator.packaging.validatePassword(params.data, params.success, params.error);
        };
        cls.updatePhone = function (params) {  //更换手机
            navigator.packaging.updatePhone(params.data, params.success, params.error);
        };
        cls.carCreate = function (params) {  //添加车辆
            navigator.packaging.carCreate(params.data, params.success, params.error);
        };
        cls.addDevice = function (params) {  //添加设备
            navigator.packaging.addDevice(params.data, params.success, params.error);
        };
        cls.unbind = function (params) {  //解绑设备
            navigator.packaging.unbind(params.data, params.success, params.error);
        };
        cls.unbindCar = function (params) {  //解绑车辆
            navigator.packaging.unbindCar(params.data, params.success, params.error);
        };
        cls.setPin = function (params) {  //设置Pin码
           	navigator.packaging.setPINForCar(params.data, params.success, params.error);
        };
        cls.getControlStatus = function (params) {  //获取车辆当前状态
            navigator.packaging.getControlStatus(params.data, params.success, params.error);
        };
        cls.carControl = function (params) {  //车辆控制
       	//    require("deviceone").print("enter3");
           // OSApp.showStatus("error",JSON.stringify(params));
           	navigator.packaging.controlCar(params.data, params.success, params.error);
        };
        cls.getCarControlInfo = function (params) { //获取控制结果
           	navigator.packaging.getCarControlInfo(params.data, params.success, params.error);
        };
        cls.getControlInfoByTaskId = function (params) { //获取控制结果2
           	navigator.packaging.getControlInfoByTaskId(params.data, params.success, params.error);
        };
        cls.refreshToken = function (params) {  // 更新token
            var me = this;
            if(window.localStorage['loginModel']){
                me.refreshWxToken(params)
            } else {
                var data = {
                    phone: window.localStorage['userMobile'],
                    password: ""
                };
                navigator.packaging.login(
                    data,
                    function (data) {
                        if (data.code == 0 && data.success == true) {
                            console.log('token更新成功');
                            window.localStorage["token"] = data.data.token;
                            me.callFunc(params);
                        } else {
                            console.log('token更新失败');
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
                    function (err) {
                        console.log('token更新失败'+err);
                        Notification.show({
                            type: "error",
                            message: "登陆过期,请重新登陆"
                        });
                        setTimeout(function () {
                            window.localStorage.removeItem('token');
                            window.localStorage.removeItem('isLogin');
                            bfAPP.gotoLogin();
                        }, 2000);
                });
            }
            
        };
        cls.refreshWxToken = function(params){
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
                       console.log('token更新成功');
                        window.localStorage["token"] = data.data.token;
                        me.callFunc(params);
                   } else {
                       console.log('token更新失败');
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
                   console.log('token更新失败'+err);
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
        }
        return cls;
    }
);
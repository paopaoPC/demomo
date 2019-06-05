define(['shared/js/client'], function (BaseClient) {

    var cls ={

    };
    //获取车辆控制所有可控制的状态
    cls.getControlStatus = function (params) {
        params.api = "/api/car/getControlStatus";
        params.options = {loading: false};
        bfNet.doAPI(params);
    };
    //根据不同的指令操作车的行为5
    cls.controlCar = function (params) {

        // OSApp.showStatus("error","进入controlCar方法了");
        params.api = "/api/car/control";
        if(typeof OSApp !== 'undefined'){
            params.api = "/api/car/secretControl";
            params.data.pin = OSApp.RSA(params.data.pin);
        }
        params.options = {loading: false};
        bfNet.doAPI(params);
    };
    //拉取远程控制是否成功的操作
    cls.getControlInfo = function (params) {
        params.api = "/api/car/getControlInfo";
        params.options = {loading: false};
        bfNet.doAPI(params);
    };
    cls.getCarControlInfo = function (params) {
        params.api = "/api/car/getCarControlInfo";
        params.options = {loading: false};
        bfNet.doAPI(params);
    };
    cls.getControlInfoByTaskId = function(params){
        params.api = "/api/car/getControlInfoByTaskId";
        params.options = {loading: false};
        bfNet.doAPI(params)
    };
    //重置密码
    cls.findPassword = function (params) {
        params.api = "/appserver/api/user/findPassword";
        bfNet.doAPI(params);
    };
    //添加车辆
    cls.addCarInfo = function (params) {
        params.api = "/appserver/api/car/create";
        bfNet.doAPI(params);
    };
    //删除车辆
    cls.deleteCar = function (params) {
        params.api = "/appserver/api/user/unbindCar";
        bfNet.doAPI(params);
    };
    //添加设备
    cls.addDevice = function (params) {
        params.api = "/appserver/api/device/addDevice";
        bfNet.doAPI(params);
    };
    //更换手机
    cls.changeUserPhone = function (data, success,error) {
        bfNet.doAPI({api: "/appserver/api/user/updatePhone", type: "post", data: data, success: success,error:error});
    };
    //解绑设备
    cls.deleteEquipment = function (params) {
        params.api = "/appserver/api/device/unbind";
        bfNet.doAPI(params);
    };
    //设置控车码
    cls.setPINForCar = function (data, success) {
   
        if(data.password){
                // alert('a')
            delete data.idCard;
            bfNet.doAPI({api: "/appserver/api/car/setPin", type: "POST", data: data, success: success});
        } else {
            delete data.password;
            data.pin = OSApp.RSA(data.pin);
                // alert(data.pin)
            bfNet.doAPI({api: "/appserver/api/car/setPinByVerifyCode", type: "POST", data: data, success: success});
        }

    };
    //更新密码
    cls.updatePassword = function (newpassword, password, success) {
        bfNet.doAPI({
            api: "/appserver/api/user/updatePasswordBytoken",
            type: "POST",
            data: {newPassword: newpassword, password: password},
            success: success
        });
    };
    cls.registe = function (params) {
        var url = bfConfig.server + "/appserver/api/user/create";
        $.ajax({
            url: url,
            type: 'post',
            data: params.data,
            success: params.success,
            beforeSend: params.beforeSend,
            error: params.error,
            complete: params.complete
        });
    };
    //login
    cls.login = function (params) {
        var url = bfConfig.server + "/api/user/login";
        BaseClient.ajax({
            isLogin: true,
            url: url,
            type: 'post',
            data: {
                phone: params.username,
                password: params.password,
                checkCode: params.checkCode,
                refreshToken: params.refreshToken
            },
            success: function (data) {
                data.from = params.from;
                params.success(data);
            },
            beforeSend: params.beforeSend,
            error: params.error,
            complete: params.complete
        });
    };
    return cls;
});
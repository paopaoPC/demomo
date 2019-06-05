define(['shared/js/client'], function (BaseClient) {
    return _.extend(BaseClient, {
        path_registerCarList: bfConfig.server + "/api/getCarInfoByToken",
        path_maintainList: bfConfig.server + "/api/getCarMaintainInfoByToken",
        path_getDealerInfoByParams: bfConfig.server + "/api/dealer/browse",
        path_getDealerInfoByCity: bfConfig.server + "/api/dealer/browseByProAndCity",
        path_convenientDistributorList: "service/data/convenientDistributorList.json",
        path_getDealerTreeInfo: bfConfig.server + "/api/getDealerTreeInfo",
        path_getDealerTreeInfoLocal: "../service/data/selectCityData.json",	//本地数据
        path_addCarInfo: bfConfig.server + "/api/addCarInfo",
        path_updateCarMileage: bfConfig.server + '/api/updateCarMileage',


        getRegisterCarList: function (params) { //获取该用户注册过的车辆信息
            this.ajax({
                url: this.path_registerCarList,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getMaintainList: function (params) {
            this.ajax({
                url: this.path_maintainList,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },

        getConvenientDistributorList: function (params) {
            this.ajax({
                url: this.path_convenientDistributorList,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getDealerTreeInfo: function (params) { //获取省份和城市列表
            this.ajax({
                url: this.path_getDealerTreeInfo,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getDealerTreeInfoLocal: function (params) { //获取省份和城市列表(本地数据)
            this.ajax({
                url: this.path_getDealerTreeInfoLocal,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getDealerInfoById: function (params) {
            this.ajax({
                url: this.path_getDealerInfoByParams,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getDealerInfoByAdd: function (params) {
            this.ajax({
                url: this.path_getDealerInfoByParams,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        getDealerInfoByCity: function (params) {
            this.ajax({
                url: this.path_getDealerInfoByCity,
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        addCarInfo: function (params) { //注册车辆信息
            this.ajax({
                url: this.path_addCarInfo,
                type: 'post',
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        },
        updateCarMileage: function (params) {	//更新当前里程数
            this.ajax({
                url: this.path_updateCarMileage,
                type: 'post',
                data: params.data,
                success: params.success,
                error: params.error,
                complete: params.complete,
                beforeSend: params.beforeSend
            });
        }
    });
});
define([], function () {
    var cls = {};
    //获取行程说明书的树形菜单
    cls.getToolsList = function (params) {
        params.api = "/api/ecm/getCatalogListByParent";
        bfNet.doAPI(params);
    }
    //根据ID获取子节点
    cls.getChildList = function (params) {
        cls.getContentList(params);
    }
    //根据ID获取说明详情
    cls.getIntroductionInfoById = function (params) {
        params.api = "/api/ecm/getContent";
        bfNet.doAPI(params);
    }

    //2015-10-30新接口

    //获取父目录
    cls.getIntroductionList = function (params) {
        //params.api = "/api/manual/getContentList";
        params.api = "/ecm/getCatalogListByParent";
        bfNet.doAPI(params);
    }

    //获取文章列表
    cls.getContentList = function (params) {
        params.api = "/ecm/getContentList";
        bfNet.doAPI(params);
    }

    //查看详情接口
    cls.getItemDetail = function (params) {
        params.api = "/ecm/getContent";
        bfNet.doAPI(params);
    }

    //搜索结果接口
    cls.searchIntroduction = function (params) {
        params.api = "/api/manual/search";
        bfNet.doAPI(params);
    }

    cls.getCarStyle = function (params) {
        params.api = "/api/sale/carparts/getCarTypeList";
        bfNet.doAPI(params);
    }

    cls.getCarBookStyle = function (params) {
        params.api = "/ecm/getCarTypeList";
        bfNet.doAPI(params);
    }
    cls.getNewsTabList = function (params) {
        params.api = "/api/canews/getNewsTabList";
        bfNet.doAPI(params);
    }
    cls.getAllManual = function (params) {
        params.api = "/api/manual/getAllManual";
        bfNet.doAPI(params);
    }

    cls.getMyManual = function (params) {
        params.api = "/api/manual/getMyManual";
        bfNet.doAPI(params);
    }
    cls.getRootIdByType = function(params){
        params.api = "/ecm/getRootIdByType";
        bfNet.doAPI(params);
    }


    return cls;
});
define([], function() 
{
  var cls = {};
  //提交违章查询信息
  cls.getCarWarn = function(params)
  {
    params.api = "/api/violation/getCarWarn";
    bfNet.doAPI(params);
  }
  //获取违章查询支持城市列表
  cls.getCityList = function(params)
  {
    params.api = "/api/violation/getCityList";
    bfNet.doAPI(params);
  }

  cls.getCarWarnByAuth = function(params){
    params.api = "/api/violation/getCarWarnByAuth";
    bfNet.doAPI(params);
  }

  return cls;
});
define(
["underscore", "butterfly/extend", "common/lsUtil", "common/ssUtil","common/osUtil", "backbone"],
function(_, extend, lsUtil, ssUtil,osUtil, Backbone)
{
	var USER_DATA = "__im_user_data";
	var CAR_LIST  = "__im_car_list";

	var USER_SESSION_DATA = "__im_user_session_data";

	var DataCenter = function()
	{

	}

	DataCenter.extend = extend;


	var cls = DataCenter.prototype;

	cls.init = function()
	{
		console.info("DataCenter module initialize");
	}
	// 拉取基础配置地址
	cls.getBaseConfig = function(key,type){
		var value = this.getValueByKey(key,type);
		if(!value){
			value = this.getBaseConfigData(key,type);
		}
		return value
	}
	cls.isDrivingHide = function(){
		var isDrivingHide = window.localStorage['isPrivacyDrvingHistory'];
		if(isDrivingHide == '1'){
			return false
		} else {
			return true
		}
	}

	cls.getValueByKey = function(key,type){
		if(type === 'ssesion'){
			value = window.sessionStorage.getItem(key);
		} else if(type === 'local') {
			value = window.localStorage.getItem(key);
		}
		return value;
	}

	cls.getBaseConfigData = function(key,type){
		var a = bfClient.getBaseConfigData({
			async:false
		});
		return this.getValueByKey(key,type);
	}

	cls.getBaseConfig_totalUserNum = function(){
		return this.getBaseConfig( 'totalUserNum','ssesion');
	}

	cls.getBaseConfig_dssDownLoad = function(){
		return this.getBaseConfig( 'dssDownLoad','ssesion');
	}

	cls.getBaseConfig_dssUploadUrl = function(){
		return this.getBaseConfig( 'dssUploadUrl','ssesion');
	}

	cls.getBaseConfig_realname_auth_url = function(){
		return this.getBaseConfig( '_realname_auth_url','local');
	}

	//拉取是否有PIN码
	cls.getPinCode = function(){
		var code = this.getUserValue("pinCode");
		if(code == 'true'){
			return true;
		}else{
			false;
		}
	}
	//设置Pin码
	cls.setPinCode = function(code){
		this.setUserValue('pinCode',code);
	}

	//获取车型下拉列表对应的index
	cls.getToolsCarTypeIndex = function()
	{
		var index = this.getUserValue("carSelectedIndex")
		return index ? index : null;
	}
    cls.getDownLoadUrlForKey = function (ID) {
        return this.getBaseConfig_dssDownLoad() + "&token=" + window.localStorage.token + "&dsshandle=" + ID;
    }
	cls.setToolsCarTypeIndex = function(index)
	{
		this.setUserValue("carSelectedIndex", index);	
	}
	//获取当前车型号的id
	cls.getToolsCarTypeId = function()
	{
		var carType = this.getUserValue("toolsType")
		return carType ? carType : null;
	}

	cls.setToolsCarTypeId = function(type)
	{
		this.setUserValue("toolsType", type);	
	}
	//获得当前车是否是长安车
	cls.getChanganCar = function(){
		var ud= this.getCarData();
		return ud.isCaCar
	}
	//获取当前currentDevice
	cls.getCarDevice = function(deviceType)
	{
		var ud = this.getUserData();

		if(!ud.carDEVICE && deviceType)
		{
			ud.carDEVICE = deviceType;

			this.setUserData(ud);
		}

		return ud.carDEVICE;
	}

	//修改当前currentDevice
	cls.setCarDevice = function(deviceType, noEvent)
	{
		var ud = this.getUserData();

		if(ud.carDEVICE !== deviceType)
		{
			ud.carDEVICE = deviceType;

			this.setUserData(ud);
		}
	}

	cls.setCarData = function (cardata) {
		var me =this;
		var carId = this.getCarId();
		var carList = this.getCarList();
		if (!cardata||!carId||!carList) {
			return false;
		}
		for (var i = 0; i < carList.length; ++i) {
			if (carList[i].carId === carId) {
				carList[i].funCode = cardata.funCode;
				carList[i].currentDeviceType  = cardata.currentDeviceType;
				me.setCarDevice(cardata.currentDeviceType);
				break;
			}
		}
		me.setCarList(carList);
	};
	//获取当前VIN号
	cls.getCarId = function(carId)
	{
		// carId = 'dae01181-b30f-4925-81aa-4627cf4cdf26';
		var ud = this.getUserData();

		if(!ud.carId && carId)
		{
			ud.carId = carId;

			this.setUserData(ud);
		}

		return ud.carId;
	}
	// 根据isNev(常规车0，新能源1，商用车2),返回消息中心的actionType
	cls.getActionType = function(){
		// 没有isNev，默认常规车
		var actionType = 1;
		var isNev = window.localStorage['isNev'];
		switch(isNev){
			case '0':
				actionType = 1;
				break;
			case '1':
				actionType = 2;
				break;
			case '2':
				actionType = 3;
				break;
		}
		return actionType;
	}

	//修改当前VIN号
	cls.setCarId = function(carId, noEvent)
	{
		var ud = this.getUserData();

		if(ud.carId !== carId)
		{
			ud.carId = carId;

			this.setUserData(ud);

			if(!noEvent)
			{
				this.trigger("CURRENT_CARVIN_CHANGED", carId);
			}
		}
	}

	cls.getCarData = function(carId)
	{
		carId = carId || this.getCarId();
		if(!carId)
		{
			return null;
		}

		var carList = this.getCarList();
		if(!carList)
		{
			return null;
		}

		for(var i=0; i<carList.length; ++i)
		{
			if(carList[i].carId == carId)
			{
				return carList[i];
			}
		}

		return null;
	}

	cls.getCarList = function()
	{
		var ret = this.getUserSessionValue(CAR_LIST);

		return ret ? ret : null;
	}

	cls.hasCar = function()
	{
		var carList = this.getCarList();
		return carList ? carList.length > 0 : false;
	}

	cls.setCarList = function(carList)
	{
		// carList = [ {
  //   "carId" : "dae01181-b30f-4925-81aa-4627cf4cdf26",
  //   "vin" : "8808548a-6d0b-482b-bb0a-55b8a71faebf",
  //   "tenantId" : "",
  //   "userId" : "8808548a-6d0b-482b-bb0a-55b8a71faebf",
  //   "carName" : "测试车",
  //   "carType" : "测试车",
  //   "oilType" : null,
  //   "brandId" : "",
  //   "brandCode" : "",
  //   "brandName" : "",
  //   "seriesId" : "",
  //   "seriesCode" : "testSeries",
  //   "seriesName" : "测试车",
  //   "modelId" : "",
  //   "modelCode" : "测试车",
  //   "modelName" : "测试车",
  //   "confId" : "",
  //   "confCode" : "",
  //   "confName" : "",
  //   "img" : "",
  //   "engineNo" : "",
  //   "color" : null,
  //   "purchasedDate" : null,
  //   "factoryDate" : null,
  //   "oemCompanyId" : null,
  //   "capacity" : null,
  //   "plateNumber" : "DEMO车辆",
  //   "pin" : "exist",
  //   "insuranceEndDate" : "0000-00-00",
  //   "registerTime" : "2017-09-13 18:15:25",
  //   "activeTime" : "0000-00-00\n\t\t00:00:00",
  //   "lastCheckTime" : "0000-00-00",
  //   "isCaCar" : false,
  //   "insuranceCompany" : "",
  //   "insurancePhone" : "",
  //   "productTime" : null,
  //   "dealerId" : null,
  //   "materialId" : null,
  //   "tserviceStatus" : null,
  //   "tserviceStarttime" : null,
  //   "tserviceEndtime" : null,
  //   "lastOnlineTime" : null,
  //   "carAuthCode" : null,
  //   "realnameAuthStatus" : "UNAUTH",
  //   "realnameAuthPassTime" : null,
  //   "certifiNo" : null,
  //   "source" : null,
  //   "deleted" : null,
  //   "maintainSpaceMileage" : 5000.0,
  //   "lastMaintainMileage" : 0.0,
  //   "totalOdometer" : null,
  //   "powerPrice" : null,
  //   "issuedate" : null,
  //   "isNev" : 2,
  //   "systemCode" : null,
  //   "isPrivacyDrvingHistory" : 1,
  //   "createAt" : null,
  //   "updateAt" : null,
  //   "createBy" : null,
  //   "updateBy" : null,
  //   "devices" : null,
  //   "imgHandlerId" : null,
  //   "currentDeviceType" : "",
  //   "carUniqueCode" : null,
  //   "funCode" : "",
  //   "bindedJD" : false,
  //   "carNameForCar" : "测试车"
  // } ];
		this.setUserSessionValue(CAR_LIST, carList);
	}

	cls.setUserValue = function(key, value)
	{
		var ud = this.getUserData();
		ud[key] = value;

		this.setUserData(ud);
	}

	cls.getUserValue = function(key, def)
	{
		var ud = this.getUserData();
		var ret = ud[key];
		return ret === undefined || ret === null ? def : ret;
	}

	cls.getUserData = function()
	{
		var userID = this.getUserName();
		if(!userID)
		{
			// alert(1)
			return {};
		}

		var ret = lsUtil.load(userID+USER_DATA);
	
		return ret || {};
	}

	cls.setUserData = function(ud)
	{
		var userID = this.getUserName();
		if(!userID)
		{
			return ;
		}

		if(ud)
		{
			var oud = this.getUserData();
			ud = _.extend(oud, ud);
		}

		lsUtil.save(userID+USER_DATA, ud);
	}
	//当前车辆的保险公司信息
	cls.getInsuranceName = function()
	{
		var insuranceName= this.getCarData() && this.getCarData().insuranceCompany;
		
		return insuranceName ? insuranceName : null;
	}
	cls.getInsurancePhone = function()
	{
		var insurancePhone= this.getCarData() && this.getCarData().insurancePhone;
		
		return insurancePhone ? insurancePhone : null;
	}
	cls.setInsuranceCompany = function(name, telephone){
		var carDatas = this.getCarData();
		carDatas.insuranceCompany = name;
		carDatas.insurancePhone = telephone;
		 var carId = this.getCarId();
		if(!carId)
		{
			return null;
		}
		var carList = this.getCarList();
		if(!carList)
		{
			return null;
		}

		for(var i=0; i<carList.length; ++i)
		{
			if(carList[i].carId == carDatas.carId)
			{
				carList[i] = carDatas;
			}
		}
		this.setCarList(carList);
	}
	cls.setUserSessionValue = function(key, value)
	{
		var usd = this.getUserSessionData();
		usd[key] = value;

		this.setUserSessionData(usd);
	}

	cls.getUserSessionValue = function(key, def)
	{
		var usd = this.getUserSessionData();
		var ret = usd[key];
		return ret === undefined || ret === null ? def : ret;
	}

	cls.setUserSessionData = function(usd)
	{
		if(usd)
		{
			var ousd = this.getUserSessionData();
			usd = _.extend(ousd, usd);
		}
		
		ssUtil.save(USER_SESSION_DATA, usd);
	}


	cls.getUserSessionData = function()
	{
		var ret = ssUtil.load(USER_SESSION_DATA);
		return ret ? ret : {};
	}

	cls.getUserName = function()
	{
		var ret = window.localStorage['userMobile'];
		
		return ret ? ret : null;
	}
	cls.setUserName = function(name)
	{
		var userImfor = this.getUserSessionData();
		userImfor.userFullname = name;
		this.setUserSessionData(userImfor);
	}
	cls.getUserPass   = function()
	{
		var ret = window.localStorage['password'];
		
		return ret ? ret : null;
	}

	cls.getUserMobile = function()
	{
		var usd = this.getUserSessionData();

		return usd.mobile ? usd.mobile : null;
	}
	cls.getUserEamil = function()
	{
		var usd = this.getUserSessionData();

		return usd.email ? usd.email : null;
	}
	//获取用户身份信息
	cls.getUserIdCardType = function(){
		var usd = this.getUserSessionData();
		return usd.idcardType ? usd.idcardType : null
	}
	cls.setUserIdCardType = function(val){
		var userImfor = this.getUserSessionData();
		userImfor.idcardType = val;
		this.setUserSessionData(userImfor);
	}
	cls.getUserIdCard = function(){
		var usd = this.getUserSessionData();
		return usd.idcard ? usd.idcard : null
	}
	cls.setUserIdCard = function(val){
		var userImfor = this.getUserSessionData();
		userImfor.idcard = val;
		this.setUserSessionData(userImfor);
	}
	cls.messageWarning = function(warning, noEvent)
	{
		var ud = this.getUserData();
		if(typeof(warning) === "boolean" && ud.messageWarning !== warning)
		{
			ud.messageWarning = warning;

			this.setUserData(ud);

			if(!noEvent)
			{
				this.trigger("MESSAGE_WARNING_CHANGED", warning);
			}
		}

		return ud.messageWarning ? true : false;
	}
	//判断是否有未读消息,有为true,没有为false 
	cls.getWlTorF = function()
	{
		var wl = this.getWarningList();
		for(var a in wl){
			if(wl[a] > 0){
				return true;
			}
		}
		return false;
	}
	//读取是否有未读消息的对象
	cls.getWarningList = function()
	{
		var ud = this.getUserData();
		
		return ud.messageWarningList || {};
	}
	
	//设置是否有未读消息的对象
	cls.setWarningList = function(wl)
	{
		var ud = this.getUserData();
		ud.messageWarningList = wl;
		
		this.setUserData(ud);
	}
	
	//未读消息存储变化,type是未读消息的属性,count为加减的树目
	cls.addWarning = function(type, count, noEvent)
	{
		//读取内存
		var wl = this.getWarningList();
		
		var c = wl[type] || 0;
		
		if(count <= 0)
		{
			c = 0;
		}
		else
		{
			c += count;
		}
		
		wl[type] = c;
		
		this.setWarningList(wl);
		
		//如果没有传入方法，那么trigger MESSAGE_LIST_WARNING_CHANGED事件
		if(!noEvent)
		{
			this.trigger("MESSAGE_LIST_WARNING_CHANGED");
		}
	}
	//增加控制汽车权限
	cls.setControlPermission = function(permission)
	{
		this.setUserSessionValue("remoteControlPermission", permission);
	}
	//获取汽车权限状态
	cls.getControlPermission = function()
	{
		return this.getUserSessionValue("remoteControlPermission", false);
	}
	cls.onLogout = function()
	{
		this.setUserSessionData(null);
		//window.localStorage['password'] = null;  解决登陆密码 被置null问题
	}
	cls.getCarFuncConfig = function () {
		var me = this;
		var funCode = (me.getCarData() && me.getCarData().funCode) ? me.getCarData().funCode : null;
		try {
		   var result = me.getCarData() ? eval("(" + funCode + ")") : null
		}
		catch(err){
		    var result = null;
		}
		return result;
	}
	_.extend(cls, Backbone.Events);

	return DataCenter;
}
);
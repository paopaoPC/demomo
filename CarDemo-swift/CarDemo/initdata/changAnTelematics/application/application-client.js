define(
function()
{
	var cls = {};

	cls.login = function(datas, success, error)
	{
		var params = 
		{
			api:"/api/login",
			phone:datas.username,
			password:datas.password,
			options:{loading:datas.from !== "background"},
			success:success,
			error:error
		};

		bfNet.doAPI(params);
	};

	cls.testFile = function(success)
	{
		bfNet.doAPI({api:"/api/testFile", success:success});
	};

	cls.getHomeData = function(success)
	{
		bfNet.doAPI({api:"/api/getHomeData", success:success});	
	};

	cls.getBannerCarsInfos = function(success)
	{
		bfNet.doAPI({api:"/api/getBannerCarsInfos", success:success});
	};

	return cls;
}
);
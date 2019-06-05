(function()
{
	define(
	["shared/js/client", "underscore", "butterfly/extend", "common/osUtil", "shared/js/notification", "common/indicator", "config/debugNetConfig"],
	function(Client, _, extend, osUtil, Notification, indicator, debugConfig)
	{
		var DEFAULT_NET_OPTIONS = {loading:"model"};
		var Net  = function()
		{

		}

		Net.extend = extend;

		var Class = Net.prototype;

		

		Class.init = function()
		{
		}

		Class.doAPI = function(params)
		{
			var netParams = this._genNetParams(params);
			// OSApp.showStatus("error", JSON.stringify(params)+'@')
			if(this._tryDebug(netParams))
			{
				return ;
			}

			if(!netParams.url && !netParams.api)
			{
				return ;
			}
			else if(!netParams.url)
			{
				// if(window.sessionStorage.getItem("debugurl")){   //lxc todo debug模式
				// 	netParams.url = window.sessionStorage.getItem("debugurl")+netParams.api;
				// }else{
					netParams.url = bfConfig.server+netParams.api;
				// }
			}

			return Client.ajax(netParams);
		}

		Class._genNetParams = function(params)
		{
			var self = this;
			var netParams = {};

			netParams.api = params.api;
			
			if(params.url)
			{
				netParams.url = params.url;
			}

			if(params.async === false){
				netParams.async = false;
			}


			// if(params.type)
			// {
			// 	netParams.type = params.type;
			// }
			netParams.type = "post";

			if(params.timeout !== null && params.timeout !== undefined)
			{
				netParams.timeout = params.timeout;
			}

			if(params.data)
			{
				netParams.data = params.data;
			}

			if(params.dataType)
			{
				netParams.dataType = params.dataType;
			}

			netParams.options = osUtil.clone(DEFAULT_NET_OPTIONS);

			_.extend(netParams.options, params.options);

			netParams.userdatas = {};
			netParams.oldParams = params;
			netParams.callbacks = _.pick(params, ["success", "complete", "beforeSend", "error"]);

			netParams.success = function(netData)
			{
				self._success(netData, netParams);
			}

			netParams.error = function(error)
			{
				self._error(error, netParams);
			}

			netParams.complete = function()
			{
				self._complete(netParams);
			}

			netParams.beforeSend = function()
			{
				self._beforeSend(netParams);
			}

			return netParams;
		}

		Class._success = function(data, netParams)
		{
			if(!data.success && data.code == 0)
			{
				data.code = -1;
			}
			else if(data.success)
			{
				data.scode = data.code;
				data.code  = 0;
			}
			data.OK = data.code == "0";
			// succeed : code == 0 || OK == true
			//		scode : 成功代码
			// fail    : code != 0 || OK == false
			//		code  : 失败代码
			if(netParams.callbacks.success)
			{
				netParams.callbacks.success(data, netParams);
			}
		}

		Class._error = function(error, netParams)
		{
			if(bfConfig.debugable)
			{
				console.error("API["+netParams.api+"] Error "+error.status+" "+error.statusText);
			}

			if(error.status === 0&&!netParams.callbacks.error)
			{
				Notification.show
				({
					type: "error",
					message: "网络开小差"
				});
			}
			else if(error.status != 0&&!netParams.callbacks.error)
			{
				Notification.show
				({
					type: "error",
					message: "服务器开小差"
				});

			}

			if(netParams.callbacks.error)
			{
				netParams.callbacks.error(error, netParams);
			}
		}

		Class._complete = function(netParams)
		{
			// do post work
			if(netParams.userdatas.indicatorID)
			{
				indicator.stop(netParams.userdatas.indicatorID);
			}

			if(netParams.callbacks.complete)
			{
				netParams.callbacks.complete(netParams);
			}
		}

		Class._beforeSend = function(netParams)
		{
			// do prev work
			var options = netParams.options;
			if(options.loading)
			{
				netParams.userdatas.indicatorID = indicator.show({model:options.loading === "model"});
			}
			if(netParams.callbacks.beforeSend)
			{
				netParams.callbacks.beforeSend(netParams);
			}
		}

		Class._doDebugFunc = function(func, netParams)
		{
			var data = func(netParams);

			this._doDebugData(data, netParams);
		}

		Class._doDebugFile = function(file, netParams)
		{
			var self = this;
			var params = {};
			params.url = file;
			params.dataType = netParams.dataType;
			if(!params.dataType)
			{
				params.dataType = "json";
			}
			
			params.success = function(data)
			{
				self._doDebugData(data, netParams);
			}
			params.error = function(error)
			{
				netParams.error(error);
			}

			$.ajax(params);
		}

		Class._doDebugData = function(data, netParams, error)
		{
			var netData = {code:0, data:osUtil.clone(data, true), success:true};

			netParams.beforeSend();
			osUtil.delayCall(
			function()
			{
				if(error)
				{
					netParams.error(error);
				}
				else
				{
					netParams.success(netData);
				}
				netParams.complete();
			}, 200
			);
		}

		Class._tryDebug = function(netParams)
		{
			if(!debugConfig)
			{
				return false;
			}

			var api = netParams.api;

			var apiDebugConfig = debugConfig[api]; 
			if(!apiDebugConfig)
			{
				return false;
			}
			netParams.userdatas.from = "debug";

			// Check options
			if(apiDebugConfig.options)
			{
				var reqMethod = netParams.type;
				if(!reqMethod && (!apiDebugConfig.options.method || apiDebugConfig.options.method === "GET"))
				{
					// GET
				}
				else if(reqMethod && reqMethod === apiDebugConfig.options.method)
				{

				}
				else if(reqMethod && !apiDebugConfig.options.method)
				{
					console.WARNING("API ["+api+"] method not configed in debugNetConfig");
				}
				else
				{
					this._doDebugData(null, netParams, {status:400, statusText:"Client error"});
					return true;
				}
			}

			var data = apiDebugConfig.data;
			if(typeof(data) === "string")
			{
				if(data.substr(0, 5) === "file!")
				{
					this._doDebugFile(data.substr(5), netParams);		
				}
				else
				{
					this._doDebugData(data, netParams);
				}
			}
			else if(typeof(data) === "function")
			{
				this._doDebugFunc(data, netParams);
			}
			else
			{
				this._doDebugData(data, netParams);
			}

			return true;
		}
		
		return Net;
	});
}
)();


define([
		"underscore", 
		"butterfly/extend",
		"backbone", 	
		"common/net", 
		"common/navigationController", 
		"common/debug/debugManager",
		"client/client"
		], 
	function(_, extend, Backbone, Net, NavigationController, DebugManager,Client)
	{
		var Application = function()
		{

		}

		Application.extend = extend;

		var Class = Application.prototype;

		Class.init = function()
		{
			this._debugManager = new DebugManager();
			this._debugManager.init();

			this._naviController = new NavigationController();
			this._naviController.init();

			this._net = new Net();
			this._net.init();
			this._client = new Client();
			window.changanBackbutton = function()
			{
				console.log("系统返回按键");
				if(!bfAPP)
				{
					return ;
				}

				bfAPP.onDeviceBack();
			};
			document.addEventListener("backbutton", window.changanBackbutton, false);
		}

		Class.onDeviceBack = function()
		{
			if(this._naviController && this._naviController.onDeviceBack())
			{
				return ;
			}
		}

		Class.run = function()
		{
			
		}

		_.extend(Class, Backbone.Events);

		return Application;
	}
);
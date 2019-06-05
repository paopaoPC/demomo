define(
	["backbone", "underscore", "butterfly/extend", 'shared/plugin_dialogOld/js/dialog', "common/osUtil"],
function(Backbone, _, extend, Dialog, osUtil)
{
	var NavigationRouter = Backbone.Router.extend(
	{
		initialize:function(callback)
		{
			Backbone.Router.prototype.initialize.call(this);
			
			this._callbackImpl = callback;
		},
		routes: 
		{
			'*path(?*queryString)': '_callback',
		},
		_callback: function(path, queryString)
		{
			this._callbackImpl(path, queryString);
		}
	});

	var path2name = function(path)
	{
	    if(!path || path === "")
	    {
	       return "";
	    }

      	path = path.replace(/\\/g, '/');
      	var s = path[0] === '/' ? 1 : 0;
      	var e = path.lastIndexOf('.');
      	if(e>=0)
      	{
          	path = path.substring(s, e);
      	}
      	else if(s>0)
      	{
          	path = path.substring(s);
      	}

      	return path;
  	}

  	var queryParams = function(queryString) 
  	{
  		var ret = {_queryString:queryString};
  		if(queryString === undefined || queryString === null || queryString === "")
  		{
  			return ret;
  		}
		
		var pairs = queryString.split("&");
		var k = null;
		var v = null;
		var pair = null;
		for(i = 0; i < pairs.length; ++i) 
		{
			pair = pairs[i].split('=');
			if(pair.length === 2)
			{
				ret[pair[0]] = pair[1];
			}
		}

		return ret;
	}

	var viewKey = function(path, queryString)
	{
		path = path.replace(/\\/g, '/');
      	if(path[0] === '/')
      	{
      		path = path.substring(1);
      	}

		return queryString ? path+'?'+queryString : path;
	} 

	var DEFAULT_IO_EFFECT = "rightIO";

	var effecters = 
	{
		"noIO" :
		[
			// In
			function(curView, preView)
			{
				curView.show();
				preView.hide();
			},
			// Out
			function(curView, preView)
			{
				preView.show();
				curView.hide();
				curView.remove();
			}
		],
		"fadeIO" :
		[
			// In
			function(curView, preView)
			{
				curView.show();
				curView.animateFadeIn(function()
				{
					preView.hide();
					curView.show();
				});
			},
			// Out
			function(curView, preView)
			{
				preView.show();
				curView.animateFadeOut(function()
				{
					curView.hide();
					curView.remove();
					preView.show();
				});
			}
		],
		"rightIO" :
		[
			// In
			function(curView, preView)
			{
				// curView.show();  lxc 页面加载顺序
				curView.animateSlideInRight(function()
				{
					preView.hide();
					curView.show();
					if(typeof TransitOff !="undefined"){
						TransitOff();
					}
				});
			},
			// Out
			function(curView, preView)
			{
				preView.show();
				curView.animateSlideOutRight(function()
				{
					curView.hide();
					curView.remove();
					preView.show();
				});
			}
		],
		"rightILeftO" :
		[
			// In
			function(curView, preView)
			{
				preView.animateSlideOutLeft(function()
				{
					preView.hide();
				});
				curView.show();
				curView.animateSlideInRight(function()
				{
					curView.show();
				});
			},
			// Out
			function(curView, preView)
			{
				preView.show();
				preView.animateSlideInLeft(function()
				{
					preView.show();
				});
				curView.animateSlideOutRight(function()
				{
					curView.hide();
					curView.remove();
				});
			}
		],
		"Down": [
			// In
			function(curView, preView)
			{
				// curView.show();
				curView.animateSlideDown(function()
				{
					curView.show();
					preView.hide();
				});
			},
			// Out
			function(curView, preView)
			{
				curView.animateSlideUp(function()
				{
					preView.show();
					curView.hide();
					curView.remove();
				});
			},
		],
		"Up":[
            function(curView, preView)
            {
                // curView.show();
                curView.animateSlideInUp(function()
                {
                    curView.show();
                    preView.hide();
                });
            },
            // Out
            function(curView, preView)
            {
                preView.show();
                curView.animateSlideOutDown(function()
                {
                    curView.hide();
                    curView.remove();
                    preView.show();
                });
            },
		]
	}

	var NavigationController = function()
	{
      	this._views = [];
	    this._pushData = null;
	    this._popData  = null;
	}

	NavigationController.extend = extend;

	var cls = NavigationController.prototype;

	cls.count = function()
	{
		return this._views.length;
	}

	cls.init = function()
	{
		var self = this;
		this._router = new NavigationRouter(function(path, queryString){self._route(path, queryString)});
		this._container = $("#navigationContainer")[0];

		var pathname = window.location.pathname;
		var rootPath = pathname.substr(0, pathname.lastIndexOf('/'));
		console.info("NAVI: Start history with "+rootPath);
		Backbone.history.start({pushState: false, root: rootPath});

		console.info("NavigationController module initialize");
	}

	cls.popTo = function(name, popData, options)
	{
		name = path2name(name);

		var c = -1;
		var i = this.count()-1;
		for(; i>=0; --i)
		{
			if(this._views[i].name === name)
			{
				c = this.count()-i-1;
				break;
			}
		}

		if(c > 0)
		{
			return this.pop(c, popData, options);
		}

		return false;
	}

    cls.popToRef = function (name, popData, options) {
		options = options ? options :{};
		options.refresh = true;
		this.popTo(name, popData, options)
    }

	// NB. Can't call pop many times once, Because Backbone route only once.  
	cls.pop = function(count, popData, options)
	{
		var now = new Date().getTime();
		if(this._popData && (now - this._popData.time) < 500)	// Too fast, reject
		{
			console.warning("pop too fast");
			
			return false;
		}

		count = count ? count : 1;
		if(this.count() <= count)
		{
			count = this.count()-1;
		}

		count = Math.max(count, 0);

		if(count === 0)
		{
			return false;
		}

		this._popData = {data:popData, options:options, count:count, time:now};
		window.history.go(-count);

		return true;
	}

	// NB. Can't call push many time once, Because async require(Load view) will break the calling order.
	cls.push = function(name, pushData, options)
	{
		var now = new Date().getTime();
		if(this._pushData && (now - this._pushData.time) < 500)	// Too fast, reject
		{
			console.warning("push too fast");
			
			return false;
		}

		options = options || {trigger: true};
		if(options.trigger === undefined)
		{
			options.trigger = true;
		}

		var effecter = null;
		if(options.effect)
		{
			effecter = effecters[options.effect];
			effecter = effecter || effecters["noIO"];
		}
		else
		{
			effecter = effecters[DEFAULT_IO_EFFECT];
		}

		var pos = name.indexOf('?');
		var path = name;
		var queryString = null;
		if(pos >= 0)
		{
			path = name.substring(0, pos);
			queryString = name.substring(pos+1);
		}
		
		path = path.replace(/\\/g, '/');
      	if(path[0] === '/')
      	{
        	path = path.substring(1);
      	}

		this._pushData = {path:path, queryString:queryString, data:pushData, options:options, time:now, effecter:effecter};

		Backbone.history.navigate(name, options); // ==> route

		return true;
	}

	cls.current = function()
	{
		return this._getView(-1);
	}

	cls.getView = function(name)
	{
		var t = typeof(name);
		if(t === 'number')
		{
			return this._getView(name);
		}
		else
		{
			var predicate = null;
			if(t === "function")
			{
				predicate = name;
			}
			else
			{
				var value = path2name(name);
				predicate = function(view)
				{
					return view.name === value;
				};
			}

			var i = this.count()-1;
			for(; i>=0; --i)
			{
				if(predicate(this._views[i]))
				{
					return this._views[i];
				}
			}
		}

		return null;
	}

	cls.startWith = function(view)
	{	
		this._clear();

		this.push(view);
	}

	cls.onDeviceBack = function()
	{
		var curView = this.current();
		if(!curView)
		{
			return false;
		}

		if(curView.view.onDeviceBack && curView.view.onDeviceBack())
		{
			return true;
		}

		var currentViewName = curView.name;
		if(this.count() === 1 || currentViewName === "" || currentViewName === "main/index" || currentViewName === "login/index")
		 {
			 if(window.ExitAppDialog){
				 window.ExitAppDialog.close();
				 window.ExitAppDialog.destroy();
				 delete window.ExitAppDialog;
				 return;
			 }
			 
			//  require("wy")
            //  sm("do_Page").pop_pageCount();
			// OSApp.closeView();
			window.__closeCurentView()
			// window.ExitAppDialog = Dialog.createDialog({
			// 	closeBtn: false,
			// 	buttons: {
			// 		'确定': function() {
			// 			navigator.app.exitApp();
			// 			this.close();
			// 			delete window.ExitAppDialog;
			// 		},
			// 		'取消': function() {
			// 			this.close();
			// 			delete window.ExitAppDialog;
			// 		}
			// 	},
			// 	content: '是否退出程序?'
			// });
		} 
		else 
		{
			this.pop();
		}

		return true;
	}

	cls._clear = function()
	{
		var views = this._views;
        for(var i = views.length-1; i>=0; --i)
        {
        	//console.info("NAVI clear "+views[i].name);
            views[i].view.remove();
        }
        this._views = [];
        this._pushData = null;
        this._popData = null;
    }

    cls._route = function(path, queryString)
	{
		// this.pop
		if(this._popData)
		{
			this._doPop(this._popData);
			this._popData = null;

			return ;
		}

		// this.push
		if(this._pushData)
		{
			this._pushData.queryParams = queryParams(this._pushData.queryString);
			this._pushData.queryString = null;
			
			this._doPush(this._pushData);
			this._pushData = null;

			return ;
		}

		// window.history.go or window.history.back
		if(path)
		{
			var vk  = viewKey(path, queryString);
			var pos = this._views.length-2;

			for(; pos >= 0; --pos)
			{
				if(this._views[pos].key === vk)
				{
					this._doPop({count:this._views.length-pos-1});
					return ;
				}
			} 

		}

		if(path)
		{
			this._doPush({path:path, queryParams:queryParams(queryString), effecter:effecters[DEFAULT_IO_EFFECT]});

			return ;
		}
	}

	cls._getView = function(i)
	{
		var c = this.count();
		if(c <= 0 || i>=c)
		{
			return null;
		}

		if(i < 0)
		{
			i += c; 
			if(i<0)
			{
				return null;
			}
		}

		return this._views[i];
	}

	cls._doPop = function(popData)
	{
		var curView  = this.current();
		this._views.pop();
		//console.info("NAVI pop "+curView.name);

		var nxtView =  this._getView(-popData.count) ;
		//show next
		if(nxtView.view.onViewBack)
		{
			nxtView.view.onViewBack(curView.name, popData.data);
		}

		curView.effecter[1](curView.view, nxtView.view);

        var v = null;
        for(var i=popData.count-1; i>0; --i)
        {
            v = this._views.pop();
            //console.info("NAVI pop "+v.name);
            v.view.hide();
            v.view.remove();
        }
    }

	cls._doPush = function(pushData)
	{
		var self = this;

		// bola使用了 require 这个变量
		var require = PP_require;

		require(['view!' + pushData.path], function(ViewClass)
        {
        	 var newView = new ViewClass({_byBF:true});
	          newView.$el.css({
	            'position': 'absolute',
	            'top': '0px',
	            'bottom': '0px',
	            'width': '100%',
	            'z-index': self.count()+100,
	          });

	          var curView = self.current();
	          if(newView.onViewPush)
	          {
	          	   newView.onViewPush(curView ? curView.name : null, pushData.data, pushData.queryParams);
	          }
	          newView.render();
			  newView.renderHtmlFromHttp($(newView.el)); //服务器配置--处理二级页面
	          self._container.appendChild(newView.el);
	          
	          if(curView)
	          {
                  	document.body.clientHeight;//ios此时页面没有渲染，添加动画并不会生效；因此使用clienHeight强制浏览器优先进行页面渲染
	          		pushData.effecter[0](newView, curView.view);
	          }
	          else
	          {
	          		newView.show();
	          }
	          
	          var item = {key:viewKey(pushData.path, pushData.queryParams._queryString), view: newView, name:path2name(pushData.path), effecter:pushData.effecter};
	          self._views.push(item);
	          //console.info("NAVI push "+item.name);
	        }, function(err)
	        {
	          //TODO: without trigger
	          //window.history.back();
	          //alert('页面加载失败');
	          console.error("NAVI LOAD_ERROR "+err);
	    });
	}

	_.extend(NavigationController.prototype, Backbone.Events);

	return NavigationController;
});
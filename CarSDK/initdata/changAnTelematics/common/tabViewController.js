define
(
	["swipe", "common/osUtil", "underscore", "backbone", "butterfly/extend"],
	function(swipe, osUtil, _, Backbone, extend)
	{
		var TabView = function()
		{

		}

		TabView.extend = extend;
		TabView.EVENT_TAB_CHANGED = "EVENT_TAB_CHANGED";

		var tabViewError = undefined;
		var cls = {};

		cls.setup = function(options)
		{
			var holder = options.holder;
			this._name   = options.name;
			this._tabContainer   = holder.getElement("#"+options.tabContainer);
			this._swipeContainer = holder.getElement("#"+options.swipeContainer);
			this._tabNames       = osUtil.clone(options.items);
			this._tabStates      = options.tabStates;

			var self = this;
			for(var i=0; i<this._tabNames.length; ++i)
			{
				var item = this._tabContainer.find("#"+this._tabNames[i]);
				if(!item)
				{
					tabViewError("Tab item must be set in HTML");
				}

				// deactive all tab items
				this._activeTabItem(i, false);

				// bind click event
				item.on("click", function(e){self._onTabClick(e)});
			}

			var swipeOptions = options.swipeOptions || {};
			var oldCallback = swipeOptions.callback;
			swipeOptions.callback = function(idx){ if(oldCallback){oldCallback(idx)}; self._onSwipeSlide(idx);};
				
			osUtil.delayCall(function()
			{
				self._swipe = Swipe(self._swipeContainer[0], swipeOptions);
				self.showTab(0);
			});
		}

		cls.refreshUI = function()
		{
			if(this._swipe)
			{
				this._swipe.setup();
			}
		}

		cls.getName = function()
		{
			return this._name;
		}

		cls._name2index = function(name)
		{
			for(var i=0; i<this._tabNames.length; ++i)
			{
				if(this._tabNames[i] === name)
				{
					return i;
				}
			}

			tabViewError("Tab item invalid");
		}

		cls._index2name = function(idx)
		{
			return this._tabNames[idx];
		}

		cls._onTabClick = function(e)
		{
			var idx = this._name2index(e.currentTarget.id);

			this._showTab(idx);
		}

		cls._onSwipeSlide = function(idx)
		{
			this._showTab(idx);
		}

		cls.showTab = function(idx, noEvent)
		{
			if(typeof(idx) === "string")
			{
				idx = this._name2index(idx);
			}

			this._showTab(idx, noEvent);
		}

		cls._activeTabItem = function(idx, active)
		{
			var item = this._tabContainer.find("#"+this._index2name(idx));
			item.removeClass(active ? this._tabStates[0] : this._tabStates[1]);
			item.addClass(active ? this._tabStates[1] : this._tabStates[0]);
		}

		cls._showTab = function(idx, noEvent)
		{
			if(this._curTab === idx)
			{
				return ;
			}

			if(typeof(this._curTab) !== "undefined")
			{
				this._activeTabItem(this._curTab, false);
			}

			// Change style	
			this._curTab = idx;
			this._activeTabItem(this._curTab, true);

			// Slide animation
			this._swipe.slide(idx);

			// Trigger event
			if(!noEvent)
			{
				this.trigger(TabView.EVENT_TAB_CHANGED, this, this._curTab, this._index2name(this._curTab));
			}
		} 

		_.extend(TabView.prototype, Backbone.Events);
		_.extend(TabView.prototype, cls);

		return TabView;
	}
)
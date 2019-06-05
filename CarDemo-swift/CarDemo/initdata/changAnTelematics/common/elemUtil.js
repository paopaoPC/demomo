define(
	["jquery"],
	function($)
	{
		var cls = {};

		cls.jsonAttr = function(elem, name)
	    {
	    	var json = elem.attr(name);

	    	return json ? JSON.parse(json) : null;
	    }

        cls.coverBaiduLogo = function(element)
        {
	    var elemCover = $("<div style='z-index:11;position:absolute;bottom:0px;width:100%;height:25px;'></div>");
	    element.append(elemCover);	
        }

    cls.newFragment = function(holder)
	    {
	    	var ret = $(document.createDocumentFragment());
	    	ret._bfDatas = {holder:holder};

	    	ret.setup = function(holder)
	    	{
	    		holder = holder || this._bfDatas.holder;
	    		holder.append(this);
	    	}
	    	ret.empty = function()
	    	{
	    		if(ret._bfDatas.holder)
	    		{
	    			ret._bfDatas.holder.empty();
	    		}
	    	}
	    	ret.holder = function()
	    	{
	    		return ret._bfDatas.holder;
	    	}

	    	return ret;
	    }


	    return cls;
	}
);

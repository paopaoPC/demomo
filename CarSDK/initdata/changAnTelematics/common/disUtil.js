define(
	function()
	{
		var cls = {};

	    cls.remToPx = function(rem){
	    	return parseFloat(document.documentElement.style.fontSize)*rem;
	    };
	    cls.pxToRem = function(px){
	    	return px/parseFloat(document.documentElement.style.fontSize);
	    }
		cls.clientWidth  	 = document.body.offsetWidth;
	    cls.clientHeight     = document.body.offsetHeight;
	    // cls.navHeight        = cls.remToPx(0.38) - 1;
	    cls.navHeight        = 44;
	    cls.navClientHeight  = cls.clientHeight-cls.navHeight;
	    cls.navClientWidth   = cls.clientWidth;
	    cls.textAreaInit = function(areaId,numId,maxNum){
	    	//判断是否中文
	    	// var isChinese = function(str){
	    	// 	var reCH = /[u00-uff]/;
	    	// 	return !reCH.test(str);
	    	// }
	    	numId.text(maxNum+"/"+maxNum);
	    	areaId[0].oninput = function(){
	    		var length = this.value.length;
	    		if(length > maxNum){
	    			length = maxNum;
	    		}
	    		numId.text(maxNum-length+"/"+maxNum);
	    	}
	    }
	    return cls;
	}
);
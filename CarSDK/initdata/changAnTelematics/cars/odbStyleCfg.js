define(['common/osUtil'], function(osUtil) 
{
	var cfg = 
	{
		obdStyle : 
		[
			{value:1, words:"技师盒子"},
			{value:2, words:"车架智能感应器"},
			{value:3, words:"路宝盒子"}
		]
	}

	var cls = {};
	cls.find = function(name)
	{
		var currentCfg = cfg[name];
		if(!currentCfg)
		{
			return '';
		}else{
			return osUtil.clone(currentCfg);
		}
	}
    return cls;
});
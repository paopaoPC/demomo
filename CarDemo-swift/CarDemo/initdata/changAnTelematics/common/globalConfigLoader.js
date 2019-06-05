bfConfig = null;

define(["butterfly", "underscore", "config/globalConfig"],
function(Butterfly, _, appConfig)
{
	var config = 
	{
		name : "Butterfly"
	};

	_.extend(config, appConfig);

	bfConfig = {};

	bfConfig.name = config.name;
	bfConfig.version = config.version;

	config.runtime = window.SERVICEMODEL_pp;
	var runtime = config[config.runtime];

	bfConfig.runtime = runtime;
	bfConfig.debugable = runtime.debug;
	bfConfig.netDebug  = runtime.netDebug;
	bfConfig.server = runtime.server;
	
	bfConfig._config = config;

	return bfConfig;
});
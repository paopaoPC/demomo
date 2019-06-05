define(["jquery", bfConfig._config.application ? bfConfig._config.application : "common/application"],
function($, Application)
{
	var main = function()
	{
		var app = new Application({});
		app.init();
		app.run();

		return app;
	}

	return main;
})
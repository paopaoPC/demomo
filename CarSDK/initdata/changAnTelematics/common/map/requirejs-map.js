
define([], function () 
{
    'use strict';

    var plugin = 
    {
        load: function(name, req, onLoad, config)
        {
              window.mapLoadDone = function()
              {
                  console.info("Map Load Succeed");
                  onLoad(null);
              }

              req(["http://api.map.baidu.com/api?v=1.5&ak=r6xCRD3KfUmiDNoAdE7Ec85f&callback=mapLoadDone"], function()
              {

              },
              function(err)
              {
                  console.info(err);
                  console.info("Map Load Failed");
                  onLoad.error(err)  
              });
        }
    }

    return plugin;
});

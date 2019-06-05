define
(
    ["underscore"],
    function(_)
    {
        var defaultDelay = 5;
        var cls = 
        {
            
        };
        
        cls.delayCall = function(fn, tm)
        {
            tm = tm || defaultDelay;
            
            setTimeout(fn, tm);
        }

        cls.clone = function(obj, deep)
        {
            if(!deep)
            {
                return _.clone(obj);
            }

            if (!_.isObject(obj)) return obj;

            if(_.isArray(obj))
            {
                return obj.slice();
            } 

            var ret = {};
            for(var key in obj)
            {
                ret[key] = cls.clone(obj[key], deep);    
            }

            return ret;
        }

        cls.time = function()
        {
            return cls.date().getTime();
        } 

        cls.date = function()
        {
            return new Date();
        }
        
        return cls;
    }
        
);
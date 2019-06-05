define(
        [
            "butterfly/view",
            "common/osUtil",
            "common/elemUtil" 
        ],
        function (View, osUtil, elemUtil)
        {
            var Base = View;
            var cls =
            {
                id: "IMView",
                // this.el will be fulled with template content in genHTML() if template is set,
                // if the view is created by butterfly, template will be ignored.
                template:null,      
                // for mannually created view, the view's dom will be created in constructor,
                // if the view is created by butterfly, html will be ignored.
                html:null,          
            };

            cls.goBack = function()
            {
                bfNaviController.pop();
            }

            cls.remove = function()
            {
                Base.prototype.remove.call(this);

                this.onRemove();
            }

            cls.constructor = function()
            { 
                var html    = arguments[0];
                var options = arguments[1];

                if(typeof(html) !== "string")
                {
                    options = arguments[0];
                    html = this.html;
                }

                if(options && options._byBF)   // Load by butterfly, butterfly will auto set element by html content
                {
                    this.html = null;
                    this.template = null;

                    Base.prototype.constructor.call(this, options);

                    return ;
                }

                // Backbone initialize will create el (id === cls.id) if !el
                // Backbone initialize is called by Backbone constructor 
                Base.prototype.constructor.call(this, options);

                if(html)
                {
                    this.template = html;

                    bfDebugManager.profileBeg("IMView Constructor Render");
                    this.render();
                    bfDebugManager.profileEnd();
                }
                else if(options && options.template)
                {
                    this.template = options.template;
                }
            }

            cls.render = function ()
            {                
                this.root = $(this.el);
                
                Base.prototype.render.call(this);

                this.preGenHTML();
                bfDebugManager.profileBeg("genHTML");
                this.genHTML();
                bfDebugManager.profileEnd();
                bfDebugManager.profileBeg("posGenHTML");
                this.posGenHTML();
                bfDebugManager.profileEnd();
                

                if(this.asyncHTML)
                {
                    var self = this;

                    osUtil.delayCall(function(){self.asyncHTML();}, 0);
                }

                return this;
            }

            // generate view's dom tree
            cls.genHTML = function()
            {
                if(this.template)
                {
                    this.elementHTML(null, this.template);
                }

                var elemContent = this.getElement(".content");
                if(elemContent)
                {
                    elemContent.css("padding-top", "0px");
                    elemContent.css("top", "0px");
                }
            }

            // do some work before dom tree construction  
            cls.preGenHTML = function()
            {

            }

            // called after genHTML(), do some work after the view's dom tree is done. 
            cls.posGenHTML = function()
            {

            }

            // called after the view's dom tree is added to parent
            cls.onShow = function()
            {
                Base.prototype.onShow.apply(this, arguments);
            }


            // Get the data by foward view. bfNaviController.pop(1, {xxx:xxx})
            cls.onViewBack = function(backFrom, backData)
            {
                //console.info("backFrom "+backFrom);
            }

            cls.onViewPush = function(pushFrom, pushData, queryParams)
            {
                //console.info("pushFrom "+pushFrom);
                //console.info("queryParams");
                //console.info(queryParams);
            }
            
            // called when device back button click (For android)
            cls.onDeviceBack = function()
            {
                return false;
            }

            cls.addView = function(sel, view)
            {
                var node = this.getElement(sel);
                if(node)
                {
                    node.append(view.getRoot());
                    view.show();
                }
            }

            cls.insertViewBefore = function(sel, view)
            {
                var node = view.getRoot();
                var beforeNode = this.getElement(sel);
                if(beforeNode)
                {
                    node.insertBefore(beforeNode);
                    view.show();
                }
            }

            cls.onRemove = function()
            {

            }

            cls.getRoot = function()
            {
                if(!this.root)
                {
                    this.root = $(this.el);
                }

                return this.root;
            }

            cls.getElement = function(sel, fromSel)
            {
                if(!sel && !fromSel)
                {
                    return this.getRoot();
                }

                var from = this.getElement(fromSel);
                if(sel)
                {
                    return from.find(sel);
                }
                else
                {
                    return from;
                }
            }

            cls.elementHTML = function(sel, html)
            {
                var ele = this.getElement(sel);

                if(html !== null && html !== undefined)
                {
                    ele.html(html);
                }
                else
                {
                    return ele.html();
                }
            }

            cls.elementFragment = function(sel, fromSel)
            {
                var elem = this.getElement(sel, fromSel);
                return elem ? elemUtil.newFragment(elem) : null;
            }
            
            return Base.extend(cls);
        }
);



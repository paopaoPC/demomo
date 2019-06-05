define(
        [
            "text!common/defaultNavagation.html",
            "common/imView",
            "common/elemUtil",
            "common/disUtil"
        ],
        function (defaultNavagationTemplate, View, elemUtil, disUtil)
        {
            var Base = View;
            var platform = "iOS";
            var cls =
            {
                elemNaviProto:$(defaultNavagationTemplate),
            }

            cls.genHTML = function ()
            {
                Base.prototype.genHTML.call(this);

                var elemContent = this.getElement(".content");
                if(elemContent)
                {
                    elemContent.css("padding-top", "0px");
                    if(platform=="iOS"){  //iOS添加title20px
                        this.$('input').on('click',function(e){
                            $(e.currentTarget).focus()
                        })
                        elemContent.css("top", (disUtil.navHeight+20)+"px");
                    }else{
                        elemContent.css("top", disUtil.navHeight+"px");
                    }
                }
                
                this._setupNavigationBar();
            }

            cls.onLeft = function()
            {
                this.goBack();
            }
            
            cls.onRight = function()
            {
                
            }
            
            cls.setLeftImage = function(img)
            {
                var elem = this._navLeft;
                if(!elem)
                {
                    return ;
                }
                elem.removeClass("im-nav-left-text");
                elem.addClass('im-nav-left-image');

                elem.text("");
                elem.css("background-image", img);
            }

            cls.setLeftText = function(text)
            {
                var elem = this._navLeft;
                if(!elem)
                {
                    return ;
                }
                
                elem.removeClass("im-nav-left-image");
                elem.addClass('im-nav-left-text');

                elem.text(text);
            }

            cls.setRightImage = function(img)
            {
                var elem = this._navRight;
                if(!elem)
                {
                    return ;
                }
                
                elem.removeClass("im-nav-right-text");
                elem.addClass('im-nav-right-image');

                elem.text("");
                elem.css("background-image", img);
            }
            
            cls.setRightText = function(text)
            {
                var elem = this._navRight;
                if(!elem)
                {
                    return ;
                }
                
                elem.removeClass("im-nav-right-image");
                elem.addClass('im-nav-right-text');

                elem.text(text);
            }
            
            cls.setLeftVisible = function (show)
            {
                var elem = this._navLeft;
                if(!elem)
                {
                    return ;
                }
                
                elem.css("display", show ? "block" : "none");
            }

            cls.setRightVisible = function (show)
            {
                var elem = this._navRight;
                if(!elem)
                {
                    return ;
                }
                
                elem.css("display", show ? "block" : "none");
            }

            cls.setTitle = function (title)
            {
                var elem = this._navTitle;
                if(!elem)
                {
                    return ;
                }
                elem.text(title);
            }

            cls.setTitleVisible = function (show)
            {
                var elem = this._navTitle;
                if(!elem)
                {
                    return ;
                }
                
                elem.css("display", show ? "block" : "none");
            }

            cls._setupNavigationBar = function()
            {
                var self = this;
                // setup navagation
                var navContainer = this.elementFragment("#nav-bar");
                if(!navContainer)
                {
                    return ;
                }

                var elemNavBar = navContainer.holder();

                if(!elemUtil.jsonAttr(elemNavBar, "navCustom"))
                {
                    if(this.navTemplate)
                    {
                        navContainer.append($(this.navTemplate));
                    }
                    else
                    {
                        navContainer.append(cls.elemNaviProto.clone());
                    }
                    var leftConfig   = elemUtil.jsonAttr(elemNavBar, "navLeft");
                    var rightConfig  = elemUtil.jsonAttr(elemNavBar, "navRight");
                    var titleConfig  = elemUtil.jsonAttr(elemNavBar, "navTitle");

                    this._navLeft  = navContainer.find("#navLeft");
                    this._navRight = navContainer.find("#navRight");
                    this._navTitle = navContainer.find("#navTitle");

                    if(platform=="iOS"){  //iOS添加title20px
                        elemNavBar.css("height","64px");
                        navContainer.find(".im-default-nav-bar").css("padding-top", "20px");
                    }

                    if(typeof(titleConfig) === "string")
                    {
                        this.setTitle(titleConfig);
                    }
                    else if(titleConfig)
                    {
                        if(titleConfig.title)
                        {
                            this.setTitle(titleConfig.title);
                        }

                        if(titleConfig.hide)
                        {
                            this.setTitleVisible(false);
                        }
                    }
                    
                    if(leftConfig)
                    {
                        if(leftConfig.image)
                        {
                            this.setLeftImage(leftConfig.image);
                        }
                        else if(leftConfig.text)
                        {
                            this.setLeftText(leftConfig.text);
                        }

                        if(leftConfig.hide)
                        {
                            this.setLeftVisible(false);
                        }
                    }

                    if(rightConfig)
                    {
                        if(rightConfig.image)
                        {
                            this.setRightImage(rightConfig.image);
                        }
                        else if(rightConfig.text)
                        {
                            this.setRightText(rightConfig.text);
                        }

                        if(rightConfig.hide)
                        {
                            this.setRightVisible(false);
                        }
                    }
                    navContainer.setup();
                }
                else
                {
                    this._navLeft  = elemNavBar.find("#navLeft");
                    this._navRight = elemNavBar.find("#navRight");
                    this._navTitle = elemNavBar.find("#navTitle");
                }

                if(this._navLeft)
                {
                    this._navLeft.on("click", function(){self.onLeft()});
                }

                if(this._navRight)
                {
                    this._navRight.on("click", function(){self.onRight()});   
                }
            }
            
            return Base.extend(cls);
        }
);
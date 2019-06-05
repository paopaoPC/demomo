define([
        'butterfly/view',
        'text!whatsnew/whatsnew.html',
        'swipe'
    ],
    function (View, ViewTemplate, Swipe) {
// alert('233')
        //TODO: getversion
        var appVersion = 1;
        var isLogin = window.localStorage['isLogin'];
        var username = window.localStorage['userMobile'];
        return View.extend({
            swipe: null,
            events: {
                "click .image-area0": "onShowLoginPage"
            },
            render: function () {

            },
            onShow: function () {
                var me = this;
                me.getImgs();
            },
            open: function () {
                var me = this;
                this.swipe = this.$el.find('#whatsnew-slider').Swipe({
                    startSlide: 0,
                    speed: 100,
                    auto: false,
                    continuous: false,
                    disableScroll: false,
                    stopPropagation: false,
                    closeEndMotion: true,
                    transitionEnd: function (index, elem) {

                    }
                });
                var time=4000;
                // setTimeout(function(){
                //     me.onShowLoginPage();
                // },4000)

                countdown();
                function countdown(){
                    if(time>=2000) {
                        setTimeout(function () {
                            time-=1000;
                            me.$el.find(".countdown").text(time/1000+"s");
//                            alert(time);
                            countdown();
                        }, 1000)
                    }else{
                        me.onShowLoginPage();
                    }
                }
            },
            getImgs: function () {
                var me = this;
                var Imgs = window.sessionStorage.getItem("LoadingImgs");
                Imgs = JSON.parse(Imgs);
                // if(!Imgs){
                // 	var isLogin = window.localStorage['isLogin'];
                // 	var username = window.localStorage['userMobile'];
                // 	if (isLogin == 'true' && username && username != "null") {
                // 		window.location.href = '../whatsnew/index.html#main/index.html';
                // 	} else {
                // 		window.location.href = '../whatsnew/index.html#login/index.html';
                // 	}
                // }else{
                var imgs = $("img");
                $(imgs[0]).attr("src", Imgs.list[0].url);
                if($(imgs[0]).get(0).complete){
//                   alert("compelte");
                   setTimeout(function () {
                        me.open();
                    }, 100);
                }else{
                    var layout=setTimeout(function(){
                        me.open();
                    },10000)
                   $(imgs[0]).onload = function (){
//                           alert("loadFinish");

                           setTimeout(function () {
                                      me.open();
                                      }, 100);
                             clearTimeout(layout);
                           }
                }
                // }
            },
            close: function () {
                window.localStorage['whatsnew'] = JSON.stringify({
                    version: appVersion
                });
                this.swipe = null;
                this.remove();
                this.trigger("whatsnew_closed");
            },
            onShowLoginPage: function () {	//显示登录页面
                           window.sessionStorage.setItem("ifIndex","1");
                if (isLogin == 'true' && username && username != "null") {
                    window.location.href = '../whatsnew/index.html#main/index.html';
                } else {
                    window.location.href = '../whatsnew/index.html#login/index.html';
                }
                // bfNaviController.push("login/index.html");
                window.localStorage.setItem("HadSeePage", true);
                window.localStorage.setItem("loadingPageVersion", window.loadingPageVersion);
                delete window.loadingPageVersion;
            }
        });
    });

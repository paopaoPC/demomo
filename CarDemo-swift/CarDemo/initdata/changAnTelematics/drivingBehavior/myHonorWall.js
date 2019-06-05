define([
        'common/navView',
        'common/ssUtil',
        "underscore",
        "../shared/js/ShareSDK"
    ],
    function (View, ssUtil, _,share)
    {
        var Base = View;
        return Base.extend({
            id:"myHonorWall",
            onViewPush: function(pushFrom, pushData){
                this._rankData = pushData
            },
            onShow: function(){
                var me = this;
                me.initData();
                $(".share-icon > div").on("click",function(){
                    me.shareTo();
                });
            },
            shareTo:function(){
                var destId=this._rankData;   //目的地ID
                var descripte=escape(window.sessionStorage.getItem("Drivingdescipte")); //获取描述并编码
                navigator.appInfo.shareMyWall({destId:destId,myId:descripte}, function(){}, function(){});
            },
            initData: function(){
                var me=this;
                me.getElement(".medal-img")[0].children[2].innerText=this._rankData;
                var descripte=window.sessionStorage.getItem("Drivingdescipte");
                me.getElement(".img-background")[0].innerText=descripte;
            },
            ShareInit: function () {
                $sharesdk.open("iosv1101", true);
            }
        });
    });
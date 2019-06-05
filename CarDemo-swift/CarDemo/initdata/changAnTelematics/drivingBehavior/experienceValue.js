define([
    'common/navView',
    "underscore",
    "shared/js/notification"
],
    function (View, _, Notification)
    {
        var Base = View;
        return Base.extend({
            events: {

            },
            onShow: function(){
                this.initTempView();
            },
            initTempView: function(){
                var me = this;
                bfClient.getRankList({
                    success: function(data){
                        if (data.code == 0) {
                            me._netData = data.data;
                            me.tempView();
                        }else{
                            me.getElement(".value-evel").css("height","100%");
                            Notification.show({
                                type:'error',
                                message:data.msg || "获取数据失败"
                            })
                        }
                        
                    },
                    error: function(error){
                        me.getElement(".value-evel").css("height","100%");
                        Notification.show({
                            type:'error',
                            message:"获取数据失败"
                        })
                    }
                })
            },
            tempView: function(){
                var container = this.getElement(".value-evel");
                var tem = _.template(this.getElement("#levels-template").html());
                for (var i = 0,len=this._netData.length; i < len; i++) {
                    container.append(tem(this._netData[i]))
                };
                var nodeFirst = this.getElement(".line")[0];
                var nodeLast = this.getElement(".line")[len-1]
                var h1 = $(nodeFirst).height();
                var h2 = $(nodeLast).height();
                $(nodeFirst).css({"margin-top":"0.25599891rem","height":(h1-30)/117.188+"rem"});
                $(nodeLast).css("height",(h2-30)/117.188+"rem")
            }
        });
    });
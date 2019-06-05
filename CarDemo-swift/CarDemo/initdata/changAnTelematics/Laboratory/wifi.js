/**
 * Created by 63471 on 2016/11/25.
 */
define(
    [
        "common/navView",
    ],
    function (View) {
        var Base = View;
        return Base.extend({
            events: {
                'click li': 'goDetail'
            },
            onShow: function () {

            },
            onViewPush : function(pushfrom,pushData){
            this.carId=pushData.carId;
        },
            goDetail: function (el) {
                var me =this;
                var id = $(el.currentTarget).attr('id');
                var path = 'Laboratory/'+id+'.html';
                bfNaviController.push(path,me.carId)
            },
        });
    });

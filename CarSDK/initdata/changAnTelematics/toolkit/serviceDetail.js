define(
    [
        'common/navView',
        'jquery',
        'underscore',
    ],
    function (View,$,_) {
        return View.extend({
            posGenHTML:function () {
                var me=this;
                var data= this._data;
                var template = _.template(me.$('#template').html());
                me.$('#navTitle').text(data.name);
                for(var i=0;i<data.packet.length;i++){
                    data.packet[i].expirationTime = data.packet[i].expirationTime.substr(0,10).replace(/[-]/g,'.');
                    data.packet[i].rem = parseFloat(document.documentElement.style.fontSize);
                    me.$('.content').append(template(data.packet[i]));
                };
            },
            onShow:function (data) {

            },

            onDeviceBack:function () {
                this.onLeft();
            },
            onViewPush:function (backfrom,data) {
                this._data = data;
                // this.$el.insertAfter($('#main-page'));
                // me.animateSlideInRight();
            }
        })
    })
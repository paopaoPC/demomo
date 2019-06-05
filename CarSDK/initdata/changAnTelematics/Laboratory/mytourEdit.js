define(
    [
        "text!Laboratory/mytourEdit.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        'shared/timePicker/js/date',
        'shared/js/notification',
        'moment',
        "common/disUtil",
        "Laboratory/lab-client"
    ],
    function (template, View, Butterfly, ssUtil, DatePicker, Notification, moment, disUtil, LabClient) {
        //params: id   或者  具体参数
        var Base = View;
        return Base.extend({
            events: {
                'click .CBAddButton': 'onAddImage',
            },
            onShow: function () {
                // this.setTitle(this.viewName)
            },
            onViewPush: function(pushFrom, pushData){
                // var me = this;
                // if( pushData && (pushData.type == "edit") ){
                //     me.viewName = "编辑游记"
                // } else {
                //     me.viewName = "新建游记"
                // }
           },
            onRight: function () {
                bfNaviController.pop(1,{refresh: true});
            },
            onAddImage: function(){
                this.AddImage();
            },
            AddImage: function(){
                var $CBAddButton = this.$('.CBAddButton');
                this.$('.contentBodyBottom').prepend('<div class="CBBIcon"></div>');
                var length = this.$('.CBBIcon').length;
                if(length>=9){
                    this.$('.contentBodyBottom').addClass('max');
                    $CBAddButton.remove();
                }
            },
            posGenHTML: function () {
                this.initViewData();
                this.bindDatePicker();
            },
            initViewData: function(){
                this.getElement("#info_date").html(moment().format('YYYY-MM-DD'));
                this.getElement("#info_date_value").val(moment().format('YYYY-MM-DD'));
            },
            bindDatePicker: function() { //绑定日期控件
                window.$ = jQuery;
                var me = this;
                this._today = new Date().format("yyyy-MM-dd");
                var birthHid = this.$(".contentSelect #info_date_value").val();
                me.dp = DatePicker($);
                var initTime = me.$el.find("#info_date").text() !== "" ? me.$el.find("#info_date").text() : moment('1970-01-01', 'YYYY-MM-DD');
                me.$el.find('#date_datapicker').date({
                    theme: "date",
                    time: initTime
                }, function(data) {
                    data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    me.$el.find("#date_datapicker").find("#info_date").text(data);
                    me.dp.time = data;

                }, function() {
                    //取消的回调
                });
            }
        })
    })



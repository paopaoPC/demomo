define(
    [
        "text!Laboratory/mytourReview.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        'shared/js/datasource',
        'listview/ListView',
        'shared/js/notification',
        "common/disUtil",
        "Laboratory/lab-client"
    ],
    function (template, View, Butterfly, ssUtil, DataSource, ListView, Notification, disUtil, LabClient) {
        var Base = View;
        return Base.extend({
            DataSource: DataSource,
            ListView: ListView,
            LabClient: LabClient,
            Notification: Notification,
            events: {
                "click .inputButton": "inputButton",
                "input .textarea": "changeIscrollHeight"
            },
            onShow: function () {
                this._initListView();
            },
            changeIscrollHeight: function(){
                this.$('#mytourReviewList').css( 'bottom',this.$('#contentBottom').css('height') );
                if(this.listview){
                    this.listview.IScroll && this.listview.IScroll.refresh()
                }
            },
            inputButton: function(){
                var textareaVal = this.$("#contentBottom .textarea").html().replace(/(^\s*)|(\s*$)/g,"");
                if(!textareaVal){
                    this.Notification.show({
                        type:"well",
                        message:"请输入内容"
                    })
                    return
                }
                this.sendReview();
                this.changeIscrollHeight();
            },
            sendReview: function(){
                //成功
                this.listview.reloadData();
                this.$("#contentBottom .textarea").html('');
            },
            posGenHTML: function () {
                this.$('[contenteditable]').addClass('needsclick');
            },
            _initListView: function(){
                var me = this;
                me.datasource = new this.DataSource({
                    storage: 'none',
                    identifier: 'identifyDatasource',
                    url: '../Laboratory/mytourReviewList.json',
                    requestParams: {
                    }
                });
                var listEl = me.el.querySelector("#mytourReviewList");
                var template = _.template(me.$el.find("#mytourReviewTemplate").html());
                me.listview = new this.ListView({
                    id: 'identifyListview',
                    el: listEl,
                    autoLoad: true,
                    itemTemplate: template,
                    dataSource: me.datasource,
                    isPullToRefresh: true
                });
                // me.listenTo(me.listview, 'itemSelect', me.onItemSelect);
            }

        })
    })



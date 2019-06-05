define([
        'text!cars/carDetails.html',
        "common/navView",
        'butterfly',
        "common/osUtil",
        "common/ssUtil",
        'shared/timePicker/js/date',
        "underscore"
    ],
    function (template, View, Butterfly, osUtil, ssUtil, DatePicker, _) {

        var Base = View;
        var cls = {
            events: {}
        };

        cls.onViewPush = function(pushFrom, pushData){
            var me = this;
            if(pushData && pushData.objData){
                // this.messageContent = pushData.objData.content && pushData.objData.content.msgContent || '';
                this.messageId = pushData.objData.id;
                this.messageTime = pushData.objData.createdAt;
                this.messageTitle = pushData.objData.title;
                this.infoTypeName = pushData.objData.infoTypeName;
                this.messageContent = pushData.objData.content

            }
       },

        cls.onShow = function () {

            var me = this;

            var getData;
            var url = window.location.href;
            var index = url.indexOf('messageContent.html?');
            this._MessageId = url.substr(index + 20);
            
            if(this.messageContent){
                var messageData = ''+this.messageContent;
                me.viewRender(messageData);
                this.$('#messageContent img').css({
                    width: '100%'
                });
            } else {
                me.elementHTML(".content","<p id='noMessage'>暂无消息详细情况</p>");
            }
        };
        cls.posGenHTML = function () {
            var me = this;
            me._navTitle.html(this.infoTypeName)
        };
       

        cls.viewRender = function (obj) {
            // var date = this.getTimeFromPublisTime(obj.publishTime);
            var text = {
                "time": this.messageTime,
                "messContent": this.messageContent,
                "messTitle": this.messageTitle 
            };
            var template = _.template(this.elementHTML('#tpl_messageContent'), {
                "data": text
            });
            this.elementHTML('.content', template);
        };
        return Base.extend(cls)

    });




define(
        [
            "common/navView",
            'butterfly'
        ],
        function(View, butterfly){
            var Base = View;
            return Base.extend({
                events:{
                    "click #notifyTel": "notifyTel",
                    "click #notifyPassword": "notifyPsw",
                    "click #contactsMobile":"goToContact"
                },
                onShow: function(){
                    var contacts = bfDataCenter.getUserSessionValue('contactsMobile');
                    if(!contacts ||contacts == null || contacts == 'null' || contacts == 'undefined'){
                        this.getElement('.noCantacts3').css("visibility",'visible');
                    }else{
                        this.getElement('.noCantacts3').css("visibility",'hidden');
                    }
                },
                notifyTel: function(){
                    bfNaviController.push("myinfo/modifyTelphone.html");
                },
                notifyPsw: function(){
                    bfNaviController.push("myinfo/modifyPasswordStep1.html");
                },
                goToContact: function () {
                    bfNaviController.push("myinfo/contactsPhone.html");
                }
            })
        });
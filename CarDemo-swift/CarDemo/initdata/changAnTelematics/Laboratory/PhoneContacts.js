define(
    [
        "text!Laboratory/PhoneContacts.html",
        "common/navView",
        'butterfly',
        "common/ssUtil",
        "shared/js/notification",
        "Laboratory/lab-client"
    
    ],
    function (template, View, Butterfly,ssUtil,Notification,LabClient)
    {
        var Base = View;
        var cls =
        {
            _value : true,
            carData : null,
            events: {
                "click .chooseContact":"return_contact"
            }
        };
        cls.onShow = function()
        {
            var me=this;
            if(navigator.contacts){
                var options = new ContactFindOptions();
                options.filter = "";
                options.multiple = true;
                var fields = ["displayName", "name", "phoneNumbers"];
                navigator.contacts.find(fields, me.onSuccess, me.onError, options);
            }else{
                Notification.show({
                    type:"error",
                    message:"调用插件失败"
                });
            }
        };
        cls.onSuccess=function (contacts) {
            var aResult = [];
            var el=this;
            if(contacts.length>0){
                for (var i = 0; contacts[i]; i++) {
                    if (contacts[i].phoneNumbers && contacts[i].phoneNumbers.length) {
                        var contactPhoneList =[];
                        for (var j = 0; contacts[i].phoneNumbers[j]; j++) {
                            contactPhoneList.push(
                                {
                                    'type' :  contacts[i].phoneNumbers[j].type,
                                    'value' : contacts[i].phoneNumbers[j].value
                                });
                        }
                        aResult.push({
                            name:contacts[i].displayName,
                            phone:contactPhoneList
                        });
                    }
                }
                for (var i = 0; aResult[i]; i++) {
                    for (var j = 0 ; aResult[i].phone[j]; j++) {
                        var data={"name":aResult[i].name,"tel":aResult[i].phone[j].value};
                        var template = _.template($("#PhoneContacts_template").html());
                        $(".People_content").append(template(data));
                    }
                }
            }else{
                Notification.show({
                    type:"error",
                    message:"获取手机联系人失败"
                });
            }
        };
        cls.return_contact=function(e){
            var name=e.target.parentElement.children[0].innerText;
            var telphone=e.target.parentElement.children[1].innerText;
            var data={"UserId":window.localStorage.username,"ContactName":name,"ContactPhone":telphone};
            LabClient.insertContact({data:data,success:function(req){
            	window.history.go(-1);
            },error:function(){
            	Notification.show({
                    type: "error",
                    message: "添加失败"
                });
            }});
        };
        cls.onError=function (contactError){
            alert('onError!');
        };
        return Base.extend(cls);
    }
);
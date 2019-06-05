define(
        [
            "text!Laboratory/contacts.html",
            "common/navView",
            'butterfly',
            "common/ssUtil",
            "iscroll",
            "common/disUtil",
            "shared/js/notification",
            "Laboratory/lab-client"
        ],
        function (template, View, Butterfly, ssUtil,iscroll, disUtil,Notification,LabClient)
        {
            var Base = View;
            var cls =
                    {
                        _value : true,
                        carData : null,
                        events: {
                            "click  .write":"changeConnect",
                            "click  #navRight":"addcontact",
                            "click  .delete":"deleteContact"
                        }
                    };
            cls.onShow = function()
            {
                this.ContactsClient();
            };
            cls.changeConnect=function(){   //修改已有联系人
                var current_event = event.target.parentElement;
                var name = current_event.children[1].innerText;
                var tel = current_event.children[2].innerText;
                var id=current_event.children[2].id;
                var data = {"name":name,"tel":tel,"contactid":id};
                bfNaviController.push("L/writecontact.html", data);
            };
            cls.deleteContact=function(e){
                var el=this;
                var contactId= e.target.parentElement.children[2].id;
                var data={"ContactId":contactId};
                LabClient.deleteContact({data:data,success:function(req){
                	el.ContactsClient();
                },error:function(){
                  	Notification.show({
                        type: "error",
                        message: "操作失败"
                    });
                }});
            };
            cls.addcontact=function(){
                var num=$("#people_list")[0].childElementCount;
                if(num<3){
                    bfNaviController.push("Laboratory/PhoneContacts.html");
                }else{
                    Notification.show({
                        type: "error",
                        message: "联系人人数达上限"
                    });
                }
            };
            cls.ContactsClient=function(){  //请求已添加联系人
                var el =this;
                $("#people_list").html("");
                var data={UserId:window.localStorage.username};
                LabClient.getContact({data:data,success:function(req){
                	if(req.data!=null){
                        for(var i=0;i<req.data.length;i++){
                            el.templateon(req.data[i]);
                        }
                        $("#count").html("车辆发生碰撞事故，将短信通知紧急联系人("+req.data.length+"/3)");
                    }
                }});
            };
            cls.templateon=function(Status){ 
                var template = _.template(this.elementHTML('#connect_people'),{
                    data:Status
                });
                $("#people_list").append(template);
            };
        return Base.extend(cls);
        }
);



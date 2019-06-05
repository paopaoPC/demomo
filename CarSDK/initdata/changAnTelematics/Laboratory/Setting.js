define(
    [
        "text!Laboratory/Setting.html",
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
                "click #manage_contacts":"manage_contacts",
                "click  .bottom_change":"select"
            }
        };
        cls.onShow = function()
        {
            var me=this;
            if(window.localStorage['safety_id']==undefined&&window.localStorage['hit_id']==undefined){
            	
            	var postdata={UserId:window.localStorage.username};
            	LabClient.getLabStatus({data:postdata,success:function(req){
            		if(req.code == 0){
                        if(req.data[0].carSafety==1){
                            window.localStorage['safety_id'] = 'true';
                            me.movefun("safe_bottom",1);
                            $('#bottom_box1').addClass('Green');
                        }else{
                            window.localStorage['safety_id'] = 'false';
                        }
                        if(req.data[0].troubleRemoval==1){
                            window.localStorage['hit_id'] = 'true';
                            me.movefun("hit_in",1);
                            $('#bottom_box2').addClass('Green');
                        }else{
                            window.localStorage['hit_id'] = 'false';
                        }
                    }else if(req.code == 3){
                        Notification.show({
                            type:"info",
                            message: "您暂未进行设置"
                        });
                    }else {
                        Notification.show({
                            type:"error",
                            message:req.msg
                        });
                    }
                }
                });
            } else{
                if(window.localStorage['safety_id'] == 'true'){
                    me.movefun("safe_bottom",1);
                    $('#bottom_box1').addClass('Green');
                }
                if(window.localStorage['hit_id'] == 'true'){
                    me.movefun("hit_in",1);
                    $('#bottom_box2').addClass('Green');
                }
            }
        };
        cls.movefun=function(id,num){
            if(num==1){
                var i=0;
                var moveonce=setInterval(function(){
                    $("#"+id).css("left",i+"px");
                    if(i==20){
                        clearInterval(moveonce);
                    }
                    i=i+4;
                },30);
            }else if(num==2){
                var i=20;
                var movebace=setInterval(function(){
                    $("#"+id).css("left",i+"px");
                    if(i==0){
                        clearInterval(movebace);
                    }
                    i=i-4;
                },30);
            }
        };
        cls.manage_contacts=function(){
            butterfly.navigate("Laboratory/contacts.html");
        };
        cls.select=function(e){         //实验室主页的滑动按钮
            var el=this;
            var point_id = $($(e.target)[0].previousElementSibling).attr('id');
            if(point_id == "safe_bottom"){
                var safety_id = window.localStorage['safety_id'];
                if(safety_id == 'false'||safety_id == null){
                    el.movefun("safe_bottom",1);
                    $('#bottom_box1').addClass('Green');
                    window.localStorage['safety_id'] = 'true';
                }else if(safety_id == 'true'){
                    el.movefun("safe_bottom",2);
                    $('#bottom_box1').removeClass('Green');
                    window.localStorage['safety_id'] = 'false';
                }
                el.updateStatus();
            }else if(point_id == "hit_in"){
                var hit_id = window.localStorage['hit_id'];
                if(hit_id == 'false'||hit_id == null){
                    el.movefun("hit_in",1);
                    $('#bottom_box2').addClass('Green');
                    window.localStorage['hit_id'] = 'true';
                    el.updateStatus();
                }else if(hit_id == 'true'){
                    el.movefun("hit_in",2);
                    $('#bottom_box2').removeClass('Green');
                    window.localStorage['hit_id'] = 'false';
                    el.updateStatus();
                }
            }
        };
        cls.updateStatus=function(){   //更新数据库功能开启状态
            var TroubleRemoval;
            var CarSafety;
            if(window.localStorage['hit_id']=="true"){
                TroubleRemoval=1;
            }else{
                TroubleRemoval=0;
            }
            if(window.localStorage['safety_id']=="true"){
                CarSafety=1;
            }else{
                CarSafety=0;
            }
            var data={"UserId":window.localStorage.username,"CarSafety":CarSafety,"TroubleRemoval":TroubleRemoval};
            LabClient.updateLab({data:data,success:function(req){
            }});
        };
        return Base.extend(cls);
    }
);
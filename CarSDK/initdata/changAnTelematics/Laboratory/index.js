define(
        [
            "text!Laboratory/index.html",
            "common/navView",
            'butterfly',
            "common/ssUtil",
            "iscroll",
            "common/disUtil",
            "shared/js/notification",
            "Laboratory/lab-client",
        ],
        function (template, View, Butterfly, ssUtil,iscroll, disUtil,Notification,LabClient)
        {
            var Base = View;
            var cls =
                    {
                        _value : true,
                        carData : null,
                        events: {
                             "click  #GoImage":"Images",  //抓拍图库
                             "click  #Gotroval":"Gotroval", //游记列表
                             "click  #Gofootstep":"Gofootstep", //足迹
                             "click  #Writetour":"Writetour", //打开page2页面 写游记功能
                             "click  #ElectronicFence": "goToFence",
                             "click  #cansle":"cansle", //关闭游记选择页面
                             "click  .goWrite":"goWrite",  //写游记页面
                             "click  .new_tour":"goWrite", //写游记页面
                             "click  #Find_Car ":"findcar",  //拍照寻车页面
                             "click #userSet":"gotoset", //实验室设置页面
                             "click #expansion":"gotoexpansion", //实验室设置页面
                             "click #teamTravel":"gototeamTravel", //组队出行页面
                             "click #member":"goMember", //会员
                            "click #Peripheralimage":"GoPhoto",
                            "click #remote":"goLaboratoryRemote",
                            "click #homeRemote":"goLaboratoryHomeRemote",
                            "click #voiceControl" : "gotoVoiceControl",
                            "click #setWifi": "setWifi",
                            'click #autoPark': 'goAutoPark',
                            'click #camera' : 'goCamera',
                            'click #longSet1' : 'goLongSet',
                        }
                    };

            cls.onShow = function()
            {
                 $('#page2').css("display","none");
            };
            cls.goAutoPark = function () {
                bfNaviController.push('Laboratory/autoPark.html');
            };
            cls.goCamera = function () {
                bfNaviController.push('Laboratory/newPeripheralimage.html');
            };
            cls.goLongSet = function () {
                bfNaviController.push('Laboratory/longSet.html');
            };
            cls.goLaboratoryRemote = function(){
                butterfly.navigate("Laboratory/LaboratoryRemote.html");
            };
            cls.Images=function(){
                butterfly.navigate("Laboratory/Images.html");
            };
            cls.GoPhoto=function () {
                butterfly.navigate("Laboratory/Peripheralimage.html");
            };
            cls.gototeamTravel=function(){
                navigator.appInfo.openTeamTravel();
                // bfNaviController.push("../teamTravel/teamList.html")
            };
            cls.gotoset=function(){
                butterfly.navigate("Laboratory/Setting.html");
            };
            cls.goLaboratoryHomeRemote = function(){
                butterfly.navigate("Laboratory/LaboratoryHomeRemote.html");
            }
            cls.gotoexpansion=function(){
                butterfly.navigate("Laboratory/expansion.html");
            }
            cls.Gotroval=function(){
                 butterfly.navigate("Laboratory/mytour.html");
            };
            cls.goToFence= function(){
                navigator.appInfo.openElectronicFence();
            };
            cls.Gofootstep=function(){
                 butterfly.navigate("Laboratory/footstep.html");
            };
            cls.findcar= function () {
                butterfly.navigate("Laboratory/findCar.html");
            };
            cls.gotoVoiceControl = function(){
                navigator.appInfo.openVoiceControl();
            }
            cls.setWifi = function(){
                butterfly.navigate("Laboratory/setWifi.html")
            }
            cls.Writetour=function(){   //拉取已有的游记数据
                var el =this;
                var data={UserId:window.localStorage.username};
                LabClient.getTourList({data:data,success:function(req){  //todo 测试
                	if(req.code==0){
                		$("#page2").css("display","block");
                        $(".goWrite").remove();
                        el.templateon(req);
                	}else{
                		Notification.show({
                			type:"error",
                			message:req.msg
                		});
                	}
                }});
            };
            cls.goWrite=function(e){
                var click_id= e.target.id;
                var tour_name= e.target.innerText;
                if(tour_name==""){
                    var data1={"UserId":window.localStorage.username,"TourName":"未命名"};
                    LabClient.CreateTour({data:data1,success:function(req){
                    		var data={"puton":false,"from":"index","tour_name":"未命名","tour_id":req};
                            bfNaviController.push("Laboratory/writeTour.html",data);
                    }});
                }else{
                    var data={"puton":false,"from":"index","tour_name":tour_name,"tour_id":click_id};
                    bfNaviController.push("Laboratory/writeTour.html",data);
                }
            };
            cls.cansle=function(){
                $("#page2").css("display","none");
            };
            cls.templateon=function(data){      //已有游记列表控件
                var template = _.template(this.elementHTML('#chose'));
                for(var i=0;i<data.data.length;i++){
                    $(".new_tour").before(template(data.data[i]));
                }
            };
        return Base.extend(cls);
        }
);



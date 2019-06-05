define(
        [
            "text!Laboratory/writeTour.html",
            "common/navView",
            'butterfly',
            "common/ssUtil",
            "iscroll",
            "common/disUtil",
            'shared/timePicker/js/date',
            "shared/js/notification",
            'hammer',
            "Laboratory/fileupload",
            "Laboratory/lab-client"
        ],
        function (template, View, Butterfly, ssUtil,iscroll, disUtil,DatePicker,Notification,Hammer,file,LabClient)
        {
            var Base = View;
            var cls =
                    {
                        events: {
                            "click #add":"add_picture",
                            "click #Place":"choose_place",
                            "click #save_change":"save_change",
                            "click .remove_image":"delete_image",
                            "click #delete_one":"delete_one"
                        }
                    };
            cls.onViewPush=function(pushFrom, pushData){
                this._data = pushData;
            };
            cls.onShow = function()
            {
                var current_place_name=window.localStorage['Current_place_name'];
                var me=this;
                this.bindDatePicker();   //绑定日期时间控件
                if(this._data.puton==true){
                    $("#word > textarea")[0].innerText=me._data.discribe;
                    $("#delete_one").css("display","block");
                    if(current_place_name!=undefined){
                        $("#Place > .inputText").html(current_place_name);
                        window.localStorage.removeItem("Current_place_name");
                    }else{
                        $("#Place>.inputText")[0].innerText=me._data.location;
                    }
                    me.$el.find("#myBirthday").text(me._data.time);
                    if($("#picture >img").length==1) {
                        var images = me._data.images.split(",");
                        for (var index = 0; index < images.length; index++) {
                            var template = _.template($('#add_picture').html(), {
                                data: {'src': images[index]}
                            });
                            $("#add").before(template);
                        }
                    }
                    //为该dom元素指定触屏移动事件
                    var container = $(".added");
                    for(var index=0;index<container.length;index++){
                        var hammertime = Hammer(container[index]);
                        hammertime.get("press").set({time:1000});
                        hammertime.on("press", function(e){
                            var DOM= e.target;
                            var image="<img class="+"'remove_image'"+"style="+"'position: absolute;width: 14px;top: -13px;'"
                                +" src="
                                +"'../Laboratory/images/remove.png'"+"/>";
                            $(DOM).after(image);
                            $(DOM).bind("click",me.delete_image);
                        });
                    }

                    $("#tour_name")[0].innerText="当前所在游记："+ me._data.tour_name;  //设置当前游记名称和id
                    $("#save_change").addClass(me._data.tour_id);
                }else{
                    $("#tour_name")[0].innerText="当前所在游记："+ me._data.tour_name;    //设置当前游记名称和id
                    $("#save_change").addClass(me._data.tour_id);
                    if(current_place_name!=undefined){
                        $("#Place > .inputText").html(current_place_name);
                        window.localStorage.removeItem("Current_place_name");
                    }
                }
            };
            cls.delete_image=function(e){
                var current_dom= e.target;
                if(current_dom.className=="remove_image"){
                    $(e.target.previousSibling).remove();
                    $(e.target).remove();
                }else if(current_dom.className=="added"){
                    $(e.target.nextSibling).remove();
                    $(e.target).remove();
                }
            };
            cls.delete_one=function(){
                var id=window.sessionStorage.getItem("single_tour_id"); //获取到修改的单条说说ID
                var data={"id":id};
                LabClient.delete_singleOne({
                    data:data,
                    success:function(req){
                        //请求成功时处理
                        if(req.code==0){
                            window.history.go(-1);
                            Notification.show({
                                type:"info",
                                message:"删除成功"
                            });
                        }else {
                            Notification.showEmpty({
                                type:"error",
                                message:req.msg
                            });
                        }
                    },error:function(){
                        Notification.show({
                            type: "error",
                            message: "删除失败"
                        });
                    }
                });
            };
            cls.choose_place=function(){   //选择出游地点
                butterfly.navigate("Laboratory/locationList.html"); //使用上面一个手机上跳不过去
            };
            cls.add_picture=function(){      //从手机相册中选择照片
                var me=this;
                if(navigator.camera){
                	pictureSource=navigator.camera.PictureSourceType;
	                destinationType=navigator.camera.DestinationType;
	                me.getPhoto(pictureSource.PHOTOLIBRARY);
                }
            };
            cls.getPhoto=function (source) {
                var el=this;
                navigator.camera.getPicture(el.onPhotoURISuccess, el.onFail, { quality: 50,
                    destinationType: destinationType.FILE_URI,
                    sourceType: source });
            };
            cls.onFail=function (message) {
                alert('Failed because: ' + message);
            };
            cls.onPhotoURISuccess=function (imageURI) {
                var me=this;
                var src = {'src':imageURI};
                var template = _.template($('#add_picture').html(),{
                    data:src
                });
                $("#add").before(template);
                var container = $(".added");
                for(var index=(container.length-1);index<container.length;index++){
                    var hammertime = Hammer(container[index]);
                    hammertime.get("press").set({time:1000});
                    hammertime.on("press", function(e){
                        var DOM= e.target;
                        var image="<img class="+"'remove_image'"+"style="+"'position: absolute;width: 14px;top: -13px;'"
                            +" src="
                            +"'../Laboratory/images/remove.png'"+"/>";
                        $(DOM).after(image);
                        $(DOM).bind("click",me.delete_image);
                    });
                }
            };
            cls.save_change=function(){   //保存提交
                var me=this;
                var this_from=me._data.from; //从哪个页面而来的
                /******************************************************************************************/
                var discribtion =$("textarea")[0].value;
                var travelLocation=$("#Place>.inputText")[0].innerText;
                var travelTime=$("#myBirthday")[0].innerText;
                var singleid=window.sessionStorage.getItem("single_tour_id");
                var images=$(".added");
                var imageString="";
                if(images.length>0){
                    imageString=images[0].src;
                    for(var j=1;j<images.length;j++){
                        imageString=imageString+","+images[j].src;
                    }
                }
                if(discribtion==""||travelLocation==""||travelTime==""||imageString==""){
                    Notification.show({
                        type: "error",
                        message: "游记信息不能为空"
                    });
                }else{
                    var data={"tourId":me._data.tour_id,"tourName":me._data.tour_name,
                        "travelLocation":travelLocation,"travelTime":travelTime,"discribetion":discribtion,"singleId":singleid,"images":imageString};
                   if(this_from=="detailtour"){
                    		file.uploadpicture("updatesingletour",data);
                        setTimeout(function(){
                            window.history.go(-1);
                        },1000);
                    }else if(this_from=="index"){
                        var from ={"from":"writeTour","tourId":me._data.tour_id,"tourName":me._data.tour_name};
                        	file.uploadpicture("addSingletour",data);
                        setTimeout(function(){
                            bfNaviController.push("Laboratory/detailTour.html",from);
                        },1000);
                    }else if(this_from=="detail_continue"){
                        	file.uploadpicture("addSingletour",data);
                        setTimeout(function(){
                            window.history.go(-1);
                        },1000);
                    }
                }
            };
            cls.bindDatePicker=function() { //绑定日期控件
                window.$ = jQuery;
                var me = this;
                var birthHid = $("#writetour #myBirthday").innerText;
                me.dp = DatePicker($);
                var initTime = me.$el.find("#myBirthday").text() !== "" ? me.$el.find("#myBirthday").text() : moment('1970-01-01', 'YYYY-MM-DD');
                me.$el.find('#birth').date({
                    theme: "date",
                    time: initTime
                }, function(data) {
                    data = moment(data, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    me.$el.find("#birth").find(".inputText").text(data);
                    me.dp.time = data;
                }, function() {
                    //取消的回调
                });
            };
        return Base.extend(cls);
        }
);



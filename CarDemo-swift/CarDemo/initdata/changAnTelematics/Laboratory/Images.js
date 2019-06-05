define(
        [
            "text!Laboratory/Images.html",
            "common/navView",
            'butterfly',
            "common/ssUtil",
            "iscroll",
            "common/disUtil",
            "shared/js/notification"
        ],
        function (template, View, Butterfly, ssUtil,iscroll, disUtil,Notification)
        {
            var Base = View;
            var cls =
                    {
                        _value : true,
                        carData : null,
                        events: {
                             "click .myshare":"pi_liang"
                        }
                    };

            cls.onShow = function()
            {
                 cls.ImageClient();
            };
            cls.templateon=function(Images_data){
                var template = _.template($("#One_image").html(),{
                    data : Images_data
                });
                $(".image_list").append(template);
             };
             cls.pi_liang=function(){
                var value = $(".myshare").val();
                 var me=this;
                if(value == "全选"){
                    $(".myshare").val("取消全选");
                    $(".myshare").css("width","77px");
                    $("#Image_manage").removeClass("slidein");
                    $(".download").addClass("slidein");
                    $(".delete").addClass("slidein");
                    $(".preview").before("<input checked="+"'checked'"+" style="+"'position: relative;bottom: 89px;'"+" type="+"'checkbox'"+ "name="+"'vehicle'"+"/>");
                    $(".image_list > li").append("<div style="+"'width: 100%;height: 103px;position: absolute;top: 0px;'"+"></div>");
                    $(".image_list > li").bind("click",me.toogle);
                }else if(value == "取消全选"){
                    $(".myshare").val("全选");
                    $(".myshare").css("width","50px");
                    $("#Image_manage").addClass("slidein");
                    $(".download").removeClass("slidein");
                    $(".delete").removeClass("slidein");
                    $(".image_list > li > input").remove();
                    $(".image_list > li").unbind("click",me.toogle);
                    var remove_node=$(".image_list > li");
                    for(var i=0;i<remove_node.length;i++){
                        remove_node[i].lastChild.remove();
                    }
                }
             };
            cls.toogle=function(){
                var check=event.target.parentElement.children[0];
                if(check.defaultChecked==true){
                    check.defaultChecked=false;
                }else if(check.defaultChecked==false){
                    check.defaultChecked=true;
                }
            };
            cls.ImageClient=function(){
                var el =this;
                $.ajax({
                        url:"../Laboratory/data/Images.json",    //请求的url地址
                        dataType:"json",   //返回格式为json
                        async:true,//请求是否异步，默认为异步，这也是ajax重要特性
                        type:"GET",   //请求方式
                        success:function(req){
                            //请求成功时处理
                            for(var i=0;i<req.length;i++){
                                el.templateon(req[i]);
                            }
                        },
                        complete:function(){
                            //请求完成的处理+
                        },
                        error:function(){
                            //请求出错处理
                        }
                    });
             };
        return Base.extend(cls);
        }
);



define([
    "iscroll",
    "css!shared/slideInPlugin/slideIn.css"
], function (IScroll) {
    var Plugin = {};
    var element;
    Plugin.createSlide = function (params) {
        var title = "选择";
        element = params.element;
        var data = params.data;
        if (params.title) {
            title = params.title;
        }else{
            title="";
        }
        var content = "<div class='ui-slide-content'><div class='data-content'>"
            + "<div class='slide-title'><span class='back'>返回</span><div class='title-text' align='center'>" + title + "</div><span class='close'>关闭</span></div>"
            +"<div  id='wrapper' class='data-li'><ul></ul></div></div></div>";
        $("body").append(content);
        var infoContent = $(".ui-slide-content ul");
        //if(params.level == 1){
            $(".ui-slide-content .back").hide();  //隐藏 返回按钮
        //}
        $(".ui-slide-content .close,.ui-slide-content").click(function (el) {  //关闭按钮事件
            var ment = el.target;
            Plugin.close("close");
        });
        if(params.template){
            Plugin.addItems(infoContent,data,params.template,params.hasTitle);
            if(Plugin.carIScroll){
                Plugin.carIScroll.destroy();
                Plugin.carIScroll = null;
            }
            Plugin.carIScroll = new IScroll($(".ui-slide-content #wrapper")[0], {
                probeType: 2,
                scrollX: false,
                scrollY: true,
                mouseWheel: true
            });
            Plugin.Itemclick(params);
        }
    };
    Plugin.Itemclick = function(params){
        $(".ui-slide-content li").click(function(el){
            if(params.ItemClick){
                params.ItemClick(el);
                $(".ui-slide-content li").unbind("click");
                Plugin.close("next");
            }else{

            }
        });
    };
    Plugin.close = function (from) {
        if(from == "close"){
            //$(".ui-slide-content .data-content").addClass("ui-slide-content-slideOut");
            //setTimeout(function(){
                $(".ui-slide-content").remove();
            //},500);
        }else{
            $(".ui-slide-content").remove();
        }
    };
    Plugin.addItems =function(content,data,Temp,hastitle){
        if(hastitle == false){
            for(var i=0;i<data.length;i++){
                var html = Temp(data[i]);
                html = "<li>"+html+"</li>";
                content.append(html);
            }
        }
    };
    return Plugin;
});
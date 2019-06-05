define(
    [
        "text!Laboratory/Tourmap.html",
        "common/navView",
        'butterfly',
        "shared/js/notification",
        "common/osUtil",
        "swipe",
        'shared/js/baidumap-api-v2.0',
        "Laboratory/lab-client",
        'iscroll'
    ],
    function (template, View, Butterfly,Notification,osUtil,swipe,baidumap,LabClient)
    {
        var Base = View;
        var map;
        var markers = new Array();
        var sContent="<h4 style='margin:0 0 5px 0;padding:0.2em 0'>天安门</h4>" +
            "<img style='float:right;margin:4px' id='imgDemo' src='http://app.baidu.com/map/images/tiananmen.jpg' width='139' height='104' title='天安门'/>" +
            "<p style='margin:0;line-height:1.5;font-size:13px;text-indent:2em'>天安门坐落在中国北京市中心,故宫的南侧,与天安门广场隔长安街相望,是清朝皇城的大门...</p>" +
            "</div>";
        var data_info = [[116.417854,39.921988,"地址：北京市东城区王府井大街88号乐天银泰百货八层"],
            [116.406605,39.921585,"地址：北京市东城区东华门大街"],
            [116.412222,39.912345,"地址：北京市东城区正义路甲5号"]
        ];
        var downfile=bfDataCenter.getBaseConfig_dssDownLoad()+"?token=1502331&dsshandle=";
        var cls =
        {
            _value : true,
            carData : null,
            events: {
                "click .content_item":"rewirte",
                "click #goAdd":"goWrite"
            }
        };
        cls.onViewPush=function(pushFrom, pushData){
            this._from = pushData;
        };
        cls.onShow = function()
        {
            var me=this;
            osUtil.delayCall(function(){
                me.clientcar();
                me.getElement("#scroller").html("");
                me.client();
            });
        };
        cls.goWrite = function(){
            var data={"puton":false,"from":"index","tour_name":this._from.tourName,"tour_id":this._from.tourId};
            bfNaviController.push("Laboratory/writeTour.html",data);
        };
        cls.client=function(){  //获取游记详情数据
            var el =this;
            var data={tourId:el._from.tourId};
            var template = el.getElement("#tour_item").html();
            LabClient.getsingletours({data:data,success:function(req){   //todo
                if(req.code==0){
                    el._tourData= req.data;
                    for(var i=0;i<req.data.length;i++){
                        var templatehtml = _.template(template,{
                            data:req.data[i]
                        });
                        el.getElement("#scroller").append(templatehtml);
                        var src =req.data[i].images.split(',');
                        for(var j=0;j<src.length;j++){
                            $(".images:eq("+i+")").append("<img class="+"'img_item'" +"src="+downfile+src[j]+">");
                        }
                    }
                    $(el.getElement(".content_item")[0]).addClass("selectedItem");
                }else{
                    el.getElement("#NoneTour").css("display","block");
                }
            },error:function(){

            }});
        };
        cls.rewirte=function(){  //游记修改
            var me=this;
            var current_dom=$(event.target).parents(".content_item");
            if(current_dom.length <= 0){
                current_dom = $(current_dom.context);
            }
            var location=current_dom[0].children[2].children[1].innerText;
            var discribe=current_dom[0].children[1].innerText;
            var single_tour_id=current_dom[0].id;  //单条说说的唯一ID
            var time=current_dom[0].children[2].children[3].innerText;; //出行时间
            var tour_id=me._from.tourId;
            var tour_name=me._from.tourName;
            var images=current_dom[0].children[0].children[0].src;
            for(var i=1;i<current_dom[0].children[0].children.length;i++){
                images=images+','+current_dom[0].children[0].children[i].src;
            }
            window.sessionStorage.setItem("single_tour_id", single_tour_id); //将当前修改的单条说说ID保存到sessionStorage中

            var push_data={"puton":true,"time":time,"location":location,"discribe":discribe,
                "images":images,"from":"detailtour","tour_id":tour_id,"tour_name":tour_name};
            bfNaviController.push("Laboratory/writeTour.html",push_data);
        };
        cls.selectedItem=function(el){
            var parentItem = $($(el.target)[0]).parents(".content_item");
            $(this.getElement(".content_item")).removeClass("selectedItem");
            if(parentItem.length>0){
                parentItem.addClass("selectedItem");
                var index = parentItem.attr("data-value");
                var point = new BMap.Point(markers[index].getPosition().lng, markers[index].getPosition().lat);
                var infoWindow = new BMap.InfoWindow(sContent,{enableMessage:false});  // 创建信息窗口对象
                map.openInfoWindow(infoWindow,point); //开启信息窗口
            }else {
                $(parentItem.context).addClass("selectedItem");
                var index = $(parentItem.context).attr("data-value");
                var point = new BMap.Point(markers[index].getPosition().lng, markers[index].getPosition().lat);
                var infoWindow = new BMap.InfoWindow(sContent,{enableMessage:false});  // 创建信息窗口对象
                map.openInfoWindow(infoWindow,point); //开启信息窗口
            }

        };
        cls.clientcar=function(){
            map = new BMap.Map("my_tour_map");
            map.centerAndZoom(new BMap.Point(116.417854,39.921988),13);  //设置地图中心点
            var beijingPosition=new BMap.Point(data_info[0][0],data_info[0][1]),
                hangzhouPosition=new BMap.Point(data_info[1][0],data_info[1][1]),
                taiwanPosition=new BMap.Point(data_info[2][0],data_info[2][1]);
            var polyline = new BMap.Polyline([
                    beijingPosition,
                    hangzhouPosition,
                    taiwanPosition
                ],
                {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5,strokeStyle:'dashed'}
            );
            //map.addOverlay(polyline);  //绘制连线
            this.tourScroll = new IScroll(this.getElement("#wrapper")[0],{
                useTransition: true,
                momentum: true,  //惯性
                probeType: 1,  //滚动检测
                scrollX: false,
                scrollY: true,
                bounce:true    //边框反弹
            });
            for(var i=0;i<data_info.length;i++){
                if(i==0){
                    addmarker("trap.png",i);  //起点
                    openInfo("121",markers[0]);
                }else if(i==data_info.length-1){
                    addmarker("trap.png",i);   //终点
                }else{
                    addmarker("trap.png",i); //过程点
                }
            }
            /*************************************************************************************/
            function addmarker(images,sunxu){
                var point1 = new BMap.Point(data_info[i][0],data_info[i][1]);  // 创建标注
                //设置了图片相对坐标的偏移量矫正位置
                var myIcon1 = new BMap.Icon("../Laboratory/images/"+images,new BMap.Size(32,46),{anchor:new BMap.Size(15, 40)});
                var marker21 = new BMap.Marker(point1,{icon:myIcon1});  // 创建标注
                markers.push(marker21);
                var label = new BMap.Label(sunxu,{offset:new BMap.Size(35,-10)});
                map.addOverlay(marker21);       // 将标注添加到地图中
                marker21.setLabel(label);
            }
            /***************************添加marker**********************************************************/
            function addClickHandler(content,marker){
                marker.addEventListener("click",function(e){
                        openInfo(content,e)}
                );
            }
            function openInfo(content,e){
                var p = e;
                var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                var infoWindow = new BMap.InfoWindow(sContent,{enableMessage:false});  // 创建信息窗口对象
                map.openInfoWindow(infoWindow,point); //开启信息窗口
            }
        };
        return Base.extend(cls);
    }
);
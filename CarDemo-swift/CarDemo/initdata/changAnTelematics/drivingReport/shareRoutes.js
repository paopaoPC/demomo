define([
    'common/navView',
    'butterfly',
    'shared/js/notification',
    "underscore",
    'shared/js/amap'
],
       function(View, Butterfly, Notification, _) {
       var Base = View;
       return Base.extend({
          events: {

          },
          onShow: function(){
            this._starPoint = null;
            if(typeof AMap == 'undefined' || !AMap || !AMap.Map){
                this.reloadAmap();
                return 
            }
            this.initMap();
            
          },
          onViewPush: function(pushFrom, pushData){
            if (pushData.routeId) {
              this._routeId = pushData.routeId
            };
          },
          initMap: function(){
             var me = this;
            // 百度地图API功能
            this._map = new AMap.Map("allmap",{
              resizeEnable: true, 
            });

            setTimeout(function(){
              for (var i = 0, len=me._routeId.length; i < len; i++) {
                me.getOneDrivingRoute(i);
              };
            },100)
            // this._map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);
            // var polyline = new BMap.Polyline([
            //  new BMap.Point(116.399, 39.910),
            //  new BMap.Point(116.405, 39.920),
            //  new BMap.Point(116.423493, 39.907445)
            // ], {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});   //创建折线
            //   map.addOverlay(polyline);   //增加折线
          },
           reloadAmap: function(){
                window.amapUrlCallback = this.onShow.bind(this);
                var head= document.getElementsByTagName('head')[0];  
                var script= document.createElement('script');  
                script.type= 'text/javascript';  
                script.src= window.localStorage['amapUrl']+'&callback=amapUrlCallback';  
                head.appendChild(script); 
            },
          getOneDrivingRoute: function(i){
            var me = this;
            bfClient.getDetailPoints({
              type:"get",
              data:{'drivingHistoryId':me._routeId[i]},
              success:function(data){
                if (data.code == 0) {
                  me.overLayOnMap(data.data)
                }else{
                  Notification.show({
                    type:"error",
                    message:data.msg || "获取数据失败"
                  })
                }
              },
              error: function(data){

              }
            })
          },
          overLayOnMap: function(data){
            var me = this;
            var chage = eval("("+data.addressPoints+")");
            if (!this._starPoint) {
              this._starPoint = [chage[0][0],chage[0][1]];
              // this._map.centerAndZoom(this._starPoint, 9);
              // this._map.setZoomAndCenter(9,this._starPoint );
            }
            var pointsList = [];
            for (var j = 0, le = chage.length; j < le; j++) {
              var p = [chage[j][0], chage[j][1]];
              pointsList.push(p);
            };
            var polyline = new AMap.Polyline({
              map: me._map,
              strokeColor:"blue", 
              strokeWeight:2,
              path: pointsList
            });   //创建折线
            // this._map.addOverlay(polyline);   //增加折线
            // this._map.setViewport(pointsList);

            this._map.setFitView();

          }
        });
   });
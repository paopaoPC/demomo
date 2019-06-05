define([
    "common/navView",
    "common/osUtil",
    "shared/js/notification",
    "shared/js/amap"
    ],
    function (View, osUtil, Notification) {
       var Base = View;
       var cls = {
           id: 'getNovigationFromLink',
           events:{
               "click #confirm_to_add":"sendToCar"
           }
       };

       cls.onViewPush = function(pushFrom, pushData)
       {
          this._pushData = pushData;
       }
       
       cls.posGenHTML = function()
       {
         var self = this;
         var friendId = this._pushData.shareFriendId;
         var destId = this._pushData.shareDestinationId;
         self._updateLocationData(friendId,destId);
       };

       cls._updateLocationData = function(shareFriendId, shareDestinationId){
          var self = this;
          bfClient.getDistinationFromFriends({
                  friendId:shareFriendId,
                  destId:shareDestinationId
              },function(data){self._onLocateBaiduMap(data)});
       };

       cls.reloadAmap = function(){
          window.amapUrlCallback = this.drawMap.bind(this);
          var head= document.getElementsByTagName('head')[0];  
          var script= document.createElement('script');  
          script.type= 'text/javascript';  
          script.src= window.localStorage['amapUrl']+'&callback=amapUrlCallback';  
          head.appendChild(script); 
      }

      cls.drawMap = function(){
        var self = this;
         // 将标注添加到地图中
         var height = parseInt($(window).height())-38 + 'px';
         // 百度地图A
          if(typeof AMap == 'undefined' || !AMap || !AMap.Map){
              this.reloadAmap();
              return 
          }
         var map = new AMap.Map("map_content_from_link");
         // var point = new BMap.Point(lng, lat);
         // map.centerAndZoom(point, 12);
          map.setZoomAndCenter(12, [this.lng, this.lat]);
         //创建小狐狸
         // var pt = new BMap.Point(lng, lat);
         // var myIcon = new BMap.Icon("../home/img/carLocation.png", new BMap.Size(50,50));
         // var marker2 = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
         // map.addOverlay(marker2);

        var icon = new AMap.Icon({
            image: '../home/img/carLocation.png',
            imageSize: new AMap.Size(49, 73),
            size: new AMap.Size(49, 73)
        });
        self.amarker = new AMap.Marker({
            icon: icon,
            position: [this.lng, this.lat],
            offset: new AMap.Pixel(-25,-67),
            zIndex: 101,
            map: map
        });
      }
       
       cls._onLocateBaiduMap = function(data)
       {  
          if(data.OK)
          {
            var lng;
            var lat;
            var position = data.data.position.addrWGS.split(",");
            lng = position[0];
            lat = position[1];
            
            this.lat = lat;
            this.lng = lng;
            this.name = data.data.position.name;


            this.drawMap()
            
           }
           else
           {
              Notification.show({type: "error",message: data.msg});
           }
       };
       
        cls.sendToCar = function () {
            var self = this;
            var token = window.localStorage['token'];
            var destId = this._pushData.shareDestinationId;
            var self = this;
            bfClient.sendToCarRequest({
                  token:token,
                  destId:destId,
                  type:0,
                  active:0,
                  name:self.name,
                  lat:self.lat,
                  lng:self.lng
            }, function(data){self._onSendToCarDetail(data)});
        };
        cls._onSendToCarDetail = function(data){
       
            if(data.OK) {
           
                Notification.show({type: "well",message: "提交成功"});
                window.history.go(-1);
            }else{
              
                Notification.show({type: "error",message: data.msg});
            }
       };
       cls.onLeft = function (){
            window.history.go(-1); 
       };
       return Base.extend(cls);
});
define([
        "text!violation/violationResults/violationResults.html", 
        "common/navView",
        'shared/js/datasource',
        'listview/ListView',
        'butterfly',
        "common/ssUtil", 
        "swipe",
        "listview/ListViewItem",
        "common/osUtil",
        'shared/js/notification',
        "css!violation/violationResults/violationResults.css"
    ],
    function (template,View,DataSource,ListView,Butterfly,ssUtil, swipe,ListItemBase,osUtil, Notification)
    {
        var Base = View;
        var cls =
                {
                    id: "violationResults",
                    events: {
                    },
                };
        var RankListItem = ListItemBase.extend(
            {
                initialize: function(options)
                {
                    ListItemBase.prototype.initialize.call(this, options);
                    var originalItem = options.data;
                    var e = $(options.userData.template(options.data));
                    this.setContent(e);
                    //延迟渲染html，调整布局
                    osUtil.delayCall(function()
                    {   
                    });
                }
            });
        cls.onViewPush = function(pushFrom, pushData){
            if (pushData.volData) {
              this._carNum = pushData.carNum;
              this._volData = pushData.volData;
              this._currentCar = pushData.carInfo
            };
            if (pushData.data) {
              this._currentCar = pushData.data;
              this._carNum = pushData.data.plateNumber;
              this._vin = pushData.data.vin;
              this._engineNo = pushData.data.engineNo
            };
            if (pushFrom == "cars/carList2") {
              this._pageGetData = 1
            };
        };
        cls.onViewBack = function(backFrom, backData){
          if (backData) {
            this._carNum = backData.carNum;
            this._volData = backData.volData;
            this._currentCar = backData.carInfo;
            this._pageGetData = 0
          };
        }
        //onshow事件，初始化element
        cls.posGenHTML = function (){

            var me = this;
            // originalData = ssUtil.load("violationData");
            
        };
        cls.onShow= function(){
          var me = this;

          me.getElement(".car-number").html(this._carNum);
          if (this._pageGetData) {
            this.initData();
          }else{
            if (this._volData) {
              this.initView();
            }else{
              return ;
            }
          }
        }
        cls.initView = function(){
          var me = this;
          if (this._volData.citys.length == 0) {
            return;
          };
          var violationArray = this._volData.citys[0].violationdata;

          var wholeFine = 0;
          var wholePoints = 0;

          if (violationArray&&violationArray.length > 0) {

            for (var i = 0; i < violationArray.length; i++) {
              wholeFine += violationArray[i].pay;
              wholePoints += violationArray[i].score;
            };
            me.getElement("#score").html(wholePoints+" 分");
            me.getElement("#money").html(wholeFine+" 元");
            this._volData = {data:violationArray};
          };
          me.initListView('violationResults');
        }
        cls.initData = function(){
          var self = this;
          //默认查询城市为重庆
          bfClient.getCarWarn({
            data:{"cityid":"500100","platenum":self._carNum,"enginenumber":self._engineNo,"framenumber":self._vin},
            type:"get",
            success: function(data){
              if(data.data.message || data.data.message!= ''){
                Notification.show({
                  type: "error",
                  message: data.data.message
                });
                return;
              } 
              if(data.data.result.citys != undefined){
                if( data.data.result.citys[0].authimage != ""){
                  // self.getElement("#auth").attr("data-carid",data.data.result.carid);
                  // self.getElement("#authcode").show();
                  // self.getElement("#codeimg").attr("src","data:image/gif;base64," +data.data.result.citys[0].authimage);
                  var codeImage = {
                    "carid":data.data.result.carid,
                    "image": data.data.result.citys[0].authimage
                  }
                  bfNaviController.pop(1,{codeData:codeImage,data:self._currentCar})
                } else if(data.data.result.citys[0].violationdata.length == 0) {
                  Notification.show({
                    type: "info",
                    message: "暂无违章信息"
                  });                
                } else {
                  self._volData = data.data.result;
                  self.initView();
                }
              } else {
                Notification.show({
                  type: "info",
                  message: "暂无违章信息"
                });
              }
            },
            error: function(){

            }
          })
        }
        //初始化listview
        cls.initListView = function(type){
          
          var me = this;
          var data = "datasource";
          var list = "listview";

          this[data] = DataSource.extend({
            ajaxLoadData:function(options){
              options.success(me._volData);
            }
          });

          var listEl = this.getElement("#"+type+"-list");//容器的element
          listEl.find("ul").empty();
          var template ;
          var typeA = "#violationResults-temp";
          
          template = _.template(this.elementHTML(typeA));

          this[list] = new ListView({
              id : "listview." + type,
              el : listEl,
              itemClass:RankListItem,
              userData:{template:template},
              dataSource : new this[data]({
                identifier: "violationResults"
              })
          });
          this.listenTo(this[list], 'itemSelect', this.onItemSelect);
      };
      cls.onRight = function(){
        var self = this;
        //判断violation/index.html页面是否存在，存在则返回，不存在则跳转
        var isExits = bfNaviController.getView("violation/index.html");
        if (isExits) {
          bfNaviController.pop(1,{data:self._currentCar});
        }else{
          bfNaviController.push('violation/index.html', {
              data: self._currentCar
          });
        }
      }
      return Base.extend(cls);
    }
);


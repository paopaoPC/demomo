define([    
  "common/navView",
  "common/ssUtil",
  "text!violation/index.html",
  'butterfly',
  'shared/js/client',
  "shared/js/notification"
  ],
  function (View, ssUtil, template, Butterfly, Client, Notification) {
    var Base = View;
    var carId ;
    return Base.extend({
        id: 'violation',
        events:{
          "click #carlocation":"locateCarlocation",
          "click #cityid":"locateCity",
          "click #searchViolation":"searchViolation",
          "click .close-button": "clearInput",
          "focus input": "onFocus",
          "blur input": "onBlur"
        },
        onViewPush:function(pushFrom, pushData){

            var self = this;
            if (pushData) {

              this._carInfo = pushData.data;
              this._str = pushData.data.plateNumber;
              if (this._str) {
                var shortName = this._str.substr(0, 1);
                this.getElement('#short-name-city').find('option[value='+shortName+']').attr("selected", true);
                this.getElement('#platenum').val(this._str.substr(1, this._str.length - 1));
              };
              
              this.getElement('#framenumber').val(pushData.data.vin);
              this.getElement('#enginenumber').val(pushData.data.engineNo);
              carId =pushData.data.carId;
              this.carName = pushData.data.carName;
              this.checkMyCar = 1;

              this._shortCity = pushData.city;
              if (pushData && pushData.codeData) {
                var data = pushData.codeData;
                this.getElement("#auth").attr("data-carid",data.carid);
                this.getElement("#authcode").show();
                this.getElement("#codeimg").attr("src","data:image/gif;base64," +data.image);

              };
            }
        },
        onViewBack: function(backFrom, backData){
            // this._selectedLocation = backData;
            // if(this._selectedLocation){

            //     this.getElement("#carlocation").attr("data-value",this._selectedLocation.code)
            //                                 .html(this._selectedLocation.name);
            //   }
            if (backData && backData.data) {
              this._str = backData.data.plateNumber;
              if (this._str) {
                var shortName = this._str.substr(0, 1);
                this.getElement('#short-name-city').find('option[value='+shortName+']').attr("selected", true);
                this.getElement('#platenum').val(this._str.substr(1, this._str.length - 1));
              };
              
              this.getElement('#framenumber').val(backData.data.vin);
              this.getElement('#enginenumber').val(backData.data.engineNo);
              carId =backData.data.carId;
              this.carName = backData.data.carName;
            };
        },
        onLeft: function(){
          bfNaviController.pop(1,{volData:null, carInfo:this._carInfo})
        },
        onShow: function(){
          var me = this;
          
          //标记该页面是否存在,1是已经存在了

          this._isViewExist = bfNaviController.getView("violation/violationResults/violationResults.html");
          //已选城市
          var selectedCity = window.localStorage.getItem("selectedCity");
          selectedCity=eval("("+selectedCity+")");
          if (selectedCity) {
            me.getElement("#cityid").html(selectedCity.name)
                                    .attr("city-id", selectedCity.code)
                                    .attr("data-parentid", selectedCity.parentid)
          }
        },
        posGenHTML:function(){
          var self = this;
          self.getElement("#authcode").hide();
          this._isViewExist = 0;
          //已选区域
          // if (self._shortCity) {
          //   self.getElement("#short-name-city option[value='"+self._shortCity.name+"']").attr("selected", true);
          // }
        },
        locateCarlocation:function(){

          var self = this;
          var selectedLocationID = self.getElement("#carlocation").attr("data-value");
          bfNaviController.push("violation/location.html",selectedLocationID);
        },
        locateCity:function(){
          var self = this;
          var selectedCityId = self.getElement("#cityid").attr("city-id");
          var selectedCityParentID = self.getElement("#cityid").attr("data-parentid");
          var data={city:selectedCityId,parentid:selectedCityParentID};
          data=JSON.stringify(data);
          window.localStorage.setItem("selectedCity",data);
          butterfly.navigate("violation/city.html");
        },
        onFocus: function(e) { //输入框聚焦
          var currentTarget = $(e.currentTarget);
          if (currentTarget.val() != "") {
            currentTarget.parent().find(".close-button").show();
          } else {
            currentTarget.parent().find(".close-button").hide();
          }
        },
        onBlur: function(e) { //失焦
          var currentTarget = $(e.currentTarget);
          setTimeout(function() {
            currentTarget.parent().find(".close-button").hide();
          }, 100);

        },
        clearInput: function(e) { //清楚输入框
          var currentTarget = $(e.currentTarget);
          currentTarget.parent().find("input").val("");
          currentTarget.parent().find("input").focus();
          currentTarget.hide();
        },
        searchViolation:function(){
          var self = this;
          //车辆识别代码验证
          self.framenumber = self.getElement("#framenumber").val();
          self.enginenumber = self.getElement("#enginenumber").val();

          self.selectedCityId = self.getElement("#cityid").attr("city-id");
          self.platenum = self.getElement("#short-name-city").val() + self.getElement("#platenum").val();

          if (self.framenumber.length == 0||self.enginenumber.length == 0||self.platenum.length == 0) {
          };
          var carInfo = {
            "plateNumber":self.platenum,
            "vin":self.framenumber,
            "engineNo":self.enginenumber
          }
          if(self.getElement("#authcode").css('display') == 'none'){
            bfClient.getCarWarn({
              data: {"cityid":self.selectedCityId,"platenum":self.platenum,"enginenumber":self.enginenumber,"framenumber":self.framenumber},
              type: "get",
              success : function(data){

                if(data.data.message || data.data.message!= ''){
                  self.getElement("#authcode").hide();
                  Notification.show({
                    type: "error",
                    message: data.data.message
                  });
                  return;
                } 
                if(data.data.result.citys != undefined){
                  if( data.data.result.citys[0].authimage != ""){
                    self.getElement("#auth").attr("data-carid",data.data.result.carid);
                    self.getElement("#authcode").show();
                    self.getElement("#codeimg").attr("src","data:image/gif;base64," +data.data.result.citys[0].authimage);
                  } else if(data.data.result.citys[0].violationdata.length == 0) {
                    Notification.show({
                      type: "info",
                      message: "暂无违章信息"
                    });                
                  } else {
                    self.getElement("#authcode").hide();
                    // ssUtil.save("violationData",data.data.result);
                    if (self._isViewExist) {
                      bfNaviController.pop(1,{carNum:self.platenum,volData:data.data.result, carInfo: carInfo})
                    }else{
                      bfNaviController.push("/violation/violationResults/violationResults.html",{carNum:self.platenum,volData:data.data.result, carInfo: carInfo});
                    }
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
          } else {
            var carid = self.getElement("#auth").attr("data-carid");
            var authcode = self.getElement("#auth").val();
            bfClient.getCarWarnByAuth({
              data: {"cityid":self.selectedCityId,"carid":carid,"authcode":authcode},
              type: "get",
              success : function(data){
                if(data.data.message != ""){
                  self.getElement("#authcode").hide();
                  Notification.show({
                    type: "error",
                    message: data.data.message
                  });
                } else {
                  if (data.data.result != undefined && data.data.result.citys != undefined) {
                      if(data.data.result.citys[0].authimage != "") {
                        self.getElement("#auth").attr("data-carid",data.data.result.carid);
                        self.getElement("#authcode").show();
                        self.getElement("#codeimg").attr("src","data:image/gif;base64," +data.data.result.citys[0].authimage);
                      } else if(data.data.result.citys[0].violationdata.length == 0) {
                        Notification.show({
                          type: "info",
                          message: "暂无违章信息"
                        });                
                      } else {
                        self.getElement("#authcode").hide();
                        // ssUtil.save("violationData",data.data.result);
                        bfNaviController.push("/violation/violationResults/violationResults.html",{carNum:self.platenum,volData:data.data.result, carInfo:carInfo});
                      }
                  } else {
                    Notification.show({
                          type: "info",
                          message: "暂无违章信息"
                        });
                  }
                }

              }
            })
          }          
        }
    })
  }
)

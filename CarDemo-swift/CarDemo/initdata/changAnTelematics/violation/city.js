define([
  "common/navView",
  "common/ssUtil",
  "text!violation/city.html",
  'butterfly',
  'shared/js/client',
  "shared/js/notification"
  ],
  function (View, ssUtil, template, Butterfly, Client, Notification) {
    var Base = View;
    return Base.extend({
        id: 'violation',
        onShow:function(){
          var self = this;
          //字母选择时效果
          var alphabet = self.getElement("#beeantPinying")[0];
          alphabet.addEventListener("touchstart", function(e){
            var selectedLetter = e.srcElement.innerHTML;
            //页面中部提示选中字母
            self.getElement(".pyDiv").fadeIn("fast").html(selectedLetter).fadeOut("slow");

            //设置当前选中省份样式
            var selectedProvince = self.getElement("#" + selectedLetter);

            //当选中字母无对应省市时， 跳过
            if(typeof(selectedProvince[0]) == "undefined") return;

            self.getElement(".activeProvince").removeClass("activeProvince");
            selectedProvince.addClass("activeProvince");
            //置顶当前选中省份
            var topHeight = selectedProvince[0].offsetTop;
            self.getElement("#province").scrollTop(topHeight);

            self.appendCitylist(selectedProvince[0].dataset.index);

          },false);

        },
        asyncHTML:function(){
          var self = this;
          //若已缓存不重新获取城市列表数据
            self.genCityList();
        },
        genCityList:function(){
          var self = this;
          bfClient.getCityList({
            type: "get",
            dataType: "json",
            success:function(data){
              if (data.success) {
                var citylist = data.data.result.items;
                ssUtil.save("citylist",citylist);
                self.citylist = citylist;
                self.appendProvincelist();
              } else {
                Notification.show({
                    type: "error",
                    message: "数据获取失败"
                  });
              }
            }
          });
        },
        appendProvincelist:function(){
          var self = this;
          var citylistLength = Object.keys(self.citylist).length;
          var cityHtml = [];
          var provinceHtml = [];
          var item = '';
          var citycode = [];
          var provinceList = [];

          /*
            循环构建省市，城市结构
           */
          var provinceList = [];
          var isGetFirstProvince = false;
          var preProvince = '';
          var provinceListIdx = 0;
          for(var iCity = 0; iCity < citylistLength; iCity++){
            var city = self.citylist[iCity];

            currentProvince = city.provincename;
            if(currentProvince != preProvince){
              provinceInfo = {};
              provinceInfo.code = city.parentid;
              provinceInfo.name = city.provincename;
              provinceInfo.firstletter = city.firstletter;
              provinceInfo.city = [];
              provinceList.push(provinceInfo);
              provinceListIdx = Object.keys(provinceList).length - 1;
            }
            preProvince = city.provincename;

            var cityinfo = {name:city.cityname,code:city.cityid,parentid:city.parentid};
            provinceList[provinceListIdx].city.push(cityinfo);

          }
          self.provinceList = provinceList;

          //添加省市到页面
          var provinceHtml = [];
          for(var iProvince = 0; iProvince < Object.keys(provinceList).length; iProvince++){
            item = '<li class="province table-view-cell" id="' + provinceList[iProvince].firstletter + '" data-index="' + iProvince + '" data-code="' + provinceList[iProvince].code + '">' + provinceList[iProvince].name + '</li>';
            provinceHtml.push(item);
          }
          self.getElement("#provincelist").html(provinceHtml);

          //省市点击事件
          self.getElement(".province").on("click",function(){
            var selectedIdx = $(this).attr("data-index");
            var selectedName = $(this).html();
            //移除所有省市选中样式
            self.getElement(".activeProvince").removeClass("activeProvince");
            //添加当前选中样式
            $(this).addClass("activeProvince");
            self.appendCitylist(selectedIdx);
          });

          //已选城市列表
          //var selectedCity = ssUtil.load("selectedCity");  lxc
          var selectedCity = window.localStorage.getItem("selectedCity");
          selectedCity=eval("("+selectedCity+")");
          //如果暂未选择，设置默认值
          if(typeof(selectedCity.parentid) == "undefined"){
            selectedCity = {parentid:"500100", code: "500000"};
          }

          if(selectedCity){
            var provinceList = self.provinceList;
            for(var iProvince = 0; iProvince < Object.keys(provinceList).length; iProvince++){
              if(parseInt(selectedCity.parentid) == provinceList[iProvince].code) {
                //获取选中省市下级城市
                self.appendCitylist(iProvince);
                //获取选中省市离页面高度
                var selectedProvince = self.getElement("#provincelist").children("li").eq(iProvince);
                var topHeight = selectedProvince[0].offsetTop;
                //添加省市选中样式
                selectedProvince.addClass("activeProvince");
                //置顶选中
                self.getElement("#province").scrollTop(topHeight);

                break;
              }
            }
            //添加城市选中样式
            self.getElement("#" + selectedCity.city).addClass("active");
          }

        },
        appendCitylist:function(provinceIdx){
          var self = this;
          var me = this;
          var citys = self.provinceList[provinceIdx].city;

          //没有城市信息时显示提示内容
          if(Object.keys(citys).length == 0){
            self.getElement("#notice").html("暂不支持该省市的违章查询！");
            return;
          }

          var cityHtml = [];
          for(var iCity = 0; iCity < Object.keys(citys).length; iCity++){
            item = '<li class="city table-view-cell" id="' + citys[iCity].code + '" data-parentid="' + citys[iCity].parentid + '">' + citys[iCity].name + '</li>';
            cityHtml.push(item);
          }

          self.getElement("#citylist").html(cityHtml);
          self.getElement(".city").on("click",function(){
            var selectedID = $(this).attr("id");
            var selectedName = $(this).html();
            var parentid = $(this).attr("data-parentid");

            var data={code:selectedID,name:selectedName,parentid:parentid};   //todo 将用户选择的城市缓存
            data=JSON.stringify(data);
            window.localStorage.setItem("selectedCity",data);
            // window.history.go(-1);
            bfNaviController.pop()
          });

          var selectedCity = window.localStorage.getItem("selectedCity");
          selectedCity=eval("("+selectedCity+")");
          if(selectedCity != null){
            self.getElement("#" +selectedCity.city).addClass("active");
          }
        }
    })
  }
)

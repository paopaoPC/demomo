define(["common/navView","shared/js/notification","underscore"],function(t,e,n){var i=t;return i.extend({events:{"click .content-item":"gotoDetail"},onViewPush:function(t,e){e&&(this._carId=e.carId)},posGenHTML:function(){},onShow:function(){var t=this;t.getFenceList()},getFenceList:function(){var t=this;bfClient.getFencelist(this._carId,function(n){0==n.code?(t._data=n.data,t.tempView()):e.show({type:"error",message:n.msg})},function(t){})},tempView:function(){var t=this.elementFragment(".content");t.empty();for(var e=this.elementHTML("#fenceList"),i=n.template(e),a=0,o=this._data.length;a<o;a++)this._data[a].index=a,this._data[a].type=!0,t.append(i(this._data[a]));t.setup()},gotoDetail:function(t){var e=$(t.currentTarget),n=e.attr("data-id");bfNaviController.push("connetJD/fenceDetail.html",{data:this._data[n]})}})});
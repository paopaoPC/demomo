/**
 * Created by hp on 2015/11/13.
 */
define(["shared/js/notification","Laboratory/lab-client"], function (Notification,LabClient) {
    return{
        uploadpicture:function (url,data){
            var imageupload=bfDataCenter.getBaseConfig_dssUploadUrl()+"?token=1502331&dsssysid=ecm&dsspath=laboratory";
            var imagestring="";
            var urs="";
            var ft;
            if(navigator.camera){
                ft = new FileTransfer();
            }
            var massageString="";
            var i=0;
            function updata(data1){
                LabClient.update_singleOne({
                    api:"/api/Laboratory/"+url,
                    data:data1,
                    success:function(req){
                        if(req.code==0){
                            Notification.show({
                                type: "info",
                                message: "游记编辑成功"
                            });
                        }
                    },
                    error:function(){

                    }
                });
            }

            function updatesingletour(){
                imagestring=data.images;
                urs=imagestring.split(",");
                while(i<urs.length){
                    if(urs[i].indexOf("http://")==0){
                        if(massageString==""){
                            var string=urs[i].split("=");
                            massageString= string[string.length-1];
                        }else{
                            var string=urs[i].split("=");
                            massageString=massageString+","+string[string.length-1];
                        }
                        i++;
                        if(!(i<urs.length)){
                            var imformationdata={"tourName":data.tourName,"discribetion":data.discribetion,"travel_time":data.travelTime,
                                "travel_location":data.travelLocation,"tourid":data.tourId,"singleid":data.singleId,"imagepath":massageString};
                            updata(imformationdata);
                        }
                        continue;
                    }else{
                        var  imageURI=urs[i];
                        ft.upload(imageURI, imageupload, success, fail);  //调用图片上传方法
                        break;
                    }
                }
            }

            switch (url){
                case "addSingletour":
                    imagestring=data.images;
                    urs=imagestring.split(",");
                    if(ft){
                        ft.upload(urs[i],imageupload, success, fail);  //调用图片上传方法
                    }
                    break;
                case "updatesingletour":
                    updatesingletour();
                    break;
                default:
                    break;
            }
            function fail(error)  //图片上传失败
            {
                Notification.show({
                    type: "error",
                    message: "游记编辑失败"
                });
            }
            function success(r){  //图片上传成功
                if(massageString==""){
                    massageString=eval(r.response)[0].result;
                }else{
                    massageString=massageString+","+ eval(r.response)[0].result;
                }
                i++;
                if(i<urs.length){
                    while(i<urs.length){
                        if(urs[i].indexOf("http://")==0){
                            if(massageString==""){
                                var string=urs[i].split("=");
                                massageString= string[string.length-1];
                            }else{
                                var string=urs[i].split("=");
                                massageString=massageString+","+string[string.length-1];
                            }
                            i++;
                            if(!(i<urs.length)){
                                var imformationdata={"tourName":data.tourName,"discribetion":data.discribetion,"travel_time":data.travelTime,
                                    "travel_location":data.travelLocation,"tourid":data.tourId,"singleid":data.singleId,"imagepath":massageString};
                                updata(imformationdata);
                            }
                            continue;
                        }else{
                            ft.upload(urs[i], imageupload, success, fail);  //调用图片上传方法
                            break;
                        }
                    }
                }else{
                    var imformationdata={"tourName":data.tourName,"discribetion":data.discribetion,"travel_time":data.travelTime,
                        "travel_location":data.travelLocation,"tourid":data.tourId,"singleid":data.singleId,"imagepath":massageString};
                    updata(imformationdata);
                }
            }
        }
    }
});

/**
 *code by lixc
 *2016/08/02
 */
define(['shared/js/notification'],
    function (Notification) {
        return {
            /**
              *下载一张图片
              *URL 下载地址
              *success 成功回调
              *error  失败回调
              */
            downLoadFile:function(url,success,error){
                var fileTransfer = new FileTransfer();
                var uri = encodeURI(url);
                var fileURL = cordova.file.applicationDirectory +"imageCache/";  //返回asset的路径
                fileTransfer.download(
                    uri,
                    fileURL,
                    function(entry) {
                        console.log("download complete: " + entry.toURL());
                        success();
                    },
                    function(error) {
                        console.log("download error source " + error.source);
                        console.log("download error target " + error.target);
                        console.log("download error code" + error.code);
                        error();
                    },
                    false,null);
            },
            /**
              *上传多张图片
              *
              *URL 上传地址
              *success 成功回调
              *Images 图片地址数组
              */
            uploadMoreFile:function(url,images,success,fail){
                var ft = new FileTransfer();
                var ImgIndex=0;
                var ImageIdString;
                var op = new FileUploadOptions();
                op.chunkedMode = false;
                op.headers = {
                  Connection: "close"
                };
                console.log(">>>>>>>开始上传");
                ft.onprogress = function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                        var percent=(progressEvent.loaded / progressEvent.total)*100; //文件上传进度
                    } else {

                    }
                };
                function filefail(error)
                {
                    Notification.show({
                        type: "error",
                        message: "问题图片上传失败"
                    });
                    if(fail){
                        fail();
                    }
                }
                function filesuccess(r) {
                    var imageId=eval(r.response)[0].result;
                    console.log(">>>>>>>上传成功");
                    console.log(">>>>>>>"+imageId);
                    if(ImgIndex==0){
                        ImageIdString = imageId;
                    }else{
                        ImageIdString = ImageIdString+","+imageId;
                    }
                    ImgIndex++;
                    if(ImgIndex >= images.length){
                        success(ImageIdString);
                    }
                    ft.upload(images[ImgIndex],url, filesuccess, filefail);
                }
                console.log(">>>>>>>>"+images[ImgIndex]);
                ft.upload(images[ImgIndex],url, filesuccess, filefail,op);
            },
            /**
              *上传一张图片
              */
            uploadFile:function(url,imageURI,success,errorfunc){
                var ft = new FileTransfer();
                var op = new FileUploadOptions();
                op.chunkedMode = false;
                op.headers = {
                  Connection: "close"
                };
                ft.onprogress = function(progressEvent) {    //文件进度监听
                    if (progressEvent.lengthComputable) {
                        var percent=(progressEvent.loaded / progressEvent.total)*100; //文件上传进度
                    } else {}
                };
                ft.upload(imageURI,url, success, function(error){
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                    console.log("upload error code" + error.code);
                    errorfunc();
                },op);
            }
        };
    });
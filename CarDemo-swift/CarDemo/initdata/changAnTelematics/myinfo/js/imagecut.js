/**
 * Created by hp on 2015/11/13.
 */
define(["shared/js/notification","main/main-client"], function (Notification,MainClient) {
    return{
        uploaduerinfo:function (imageURI){
            var imageupload=bfDataCenter.getBaseConfig_dssUploadUrl()+ "?token=1502331&dsssysid=ecm&dsspath=UserHead"; //文件上传地址
            /*****************************************************************/
            var ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {    //文件进度监听
                if (progressEvent.lengthComputable) {
                    var percent=(progressEvent.loaded / progressEvent.total)*100; //文件上传进度
                } else {

                }
            };
            /****************************************************************************/
            ft.upload(imageURI,imageupload, filesuccess, filefail);  //调用图片上传方法

            function filefail(error)
            {
                Notification.show({
                    type: "error",
                    message: "头像上传失败"
                });
            }
            function filesuccess(r) {
                console.log(r);
                var imageId=eval(r.response)[0].result;

                $("#changeHead")[0].src=bfDataCenter.getBaseConfig_dssDownLoad()+"?token=1502331&dsshandle="+imageId;
                MainClient.saveMyinfo({
                    imgPath: imageId,
                    success: function(data) {
                        console.log(data.data);
                        Notification.show({
                            type: "info",
                            message: "头像更新成功"
                        });
                    },
                    error: function(error) {
                        var eMsg = '发生未知错误';
                        if (typeof(error) === 'string') eMsg = error;
                        if (typeof(error) === 'object') {
                            if (error.status == 0) eMsg = "连接服务器失败，请检查网络状况";
                        }
                        Notification.show({
                            type: "error",
                            message: eMsg
                        });
                        console.log(error);
                    }
                });
            }
        }
    }
});

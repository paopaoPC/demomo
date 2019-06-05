define([
        'common/navView',
        'shared/js/notification',
        'common/countDwonUtil'
    ],
    function(Base, Notification)
    {
        var Class = {};
        Class.events = 
        {
            "click .addUserNameButton":'onAddUserName',
        };
        Class.onAddUserName = function(){
            var userName = this.$('#userNameInput').val();
            var password = this.passWord || '';
            if(!userName){
                Notification.show({
                    type: "info",
                    message: '用户名为空'
                })
            } else {
                if( this.cheeckUserNameLength(userName) ){
                    this.addUserName(userName,password);
                } else {
                    Notification.show({
                        type: "info",
                        message: '用户名为3-15个字符，中文代表两个字符'
                    })
                }
            }
        }
        Class.onViewPush =function (pushFrom,pushData) {
            if(pushData.passWord){
                this.passWord = pushData.passWord;
            }
        }
        Class.cheeckUserNameLength = function(userName){
            var length = userName.length;
            _.each(userName, function(item){
                (item.charCodeAt(0) > 10000) && length++
            })
            if(length >=3 && length <= 15){
                return true;
            } else {
                return false;
            }
        }
        Class.addUserName = function(userName,password){
            bfClient.addUserName({
                type: 'post',
                data: {'userName': userName, 'password': password},
                success: function (data) {
                    if (data && data.code == 0) {
                        bfAPP.gotoMain();
                    } else {
                        if(data){
                            Notification.show({
                                type: "error",
                                message: data.msg
                            })
                        } else {
                            Notification.show({
                                type: "error",
                                message: '获取数据失败'
                            })

                        }
                         
                    }
                },
                error: function(){
                     Notification.show({
                        "type":"error",
                         message: '连接服务器失败，请检查网络状况'
                    });
                }
            });
            
        };  
        return Base.extend(Class);
    }
 );   
//
//  BTKeyOperation.h
//  libSmartKey
//
//  Created by cds on 2018/7/4.
//  Copyright © 2018年 cds. All rights reserved.
//version:2.7版本

#import <Foundation/Foundation.h>
#import "ErrorResponse.h"
#import "BLEDefine.h"
#import <CoreBluetooth/CoreBluetooth.h>


@interface BLEMagager : NSObject

//蓝牙状态代理
@property (nonatomic,assign) id<BTStateDelegate>btStateDelegate;



//蓝牙状态
@property (nonatomic,readonly) BlueToothState blueToothState;

+(instancetype)shareInstance;

/**
 *  此接口初始化蓝牙相关数据
 **/
-(void)startWithAppId:(NSString *)appid secretKey:(NSString *)secretkey;



/**
 *  登录
 *  phone:用户手机号
 *  checkcode:用户短信验证码,可以不填，不填时使用缓存的验证码，如果验证码已经过期会报错ErrorCode_CheckCodeInvalidate或者ErrorCode_NoActivity
 **/
-(void)sdkLoginWithPhone:(NSString *)phone vin:(NSString *)vin checkCode:(NSString *)checkcode withSuccess:(void (^)(NSString *vin,NSString *passcode))successBlock faild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  登出
 **/
-(void)logOut;


/**
 *  解除车辆蓝牙绑定
 **/
-(void)unBindBleWithVin:(NSString *)vin withSuccess:(void (^)(void))successBlock  withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  刷新车辆列表数据，如果后台重新绑定了设备，而又没有重新登录，就需要刷新一次列表数据，以更新缓存
 **/
-(void)refreshVehicleData:(NSString *)vin withSuccess:(void (^)(void))successBlock  withFaild:(void (^)(ErrorResponse *error))faildblock;
/**
 *  获取配对码，根据车架号返回对应车辆的蓝牙配对码
 **/
-(NSString *)getPassCodeWithVin:(NSString *)vin;

/**
 *  设置默认车辆
 *  设置默认车辆成功，返回车辆配对码
 **/
-(void)setDefaultVehicle:(NSString *)vin withSuccess:(void (^)(NSString *vin,NSString *passcode,BOOL isLearned))successBlock faild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  指定VIN连接车辆蓝牙，
 *  vin:指定车辆的车架号
 *  reConnectTimes：自动重试次数，考虑到用户需要配对的情况，因为目前无法获取用户配对状态，建议尝试3次后提示用户
 *  timeoutSeconds：超时时间，该参数需要和自动重试次数配合使用，建议大于10秒以上
 **/
-(void)connectToBlewithVin:(NSString *)vin reConnectTimes:(NSInteger)times timeOut:(int)timeoutSeconds  connected:(void (^)(void))connectedblock disconnectBlock:(void (^)(ErrorResponse *error))disconnectblock failBlock:(void (^)(ErrorResponse *error))faildblock;


/**
 *  授权用户
 *  config:授权人账户信息
 *  otheruserPhone:被授权人手机号
 *  nickName:被授权人昵称
 *  vin:需要授权的车架号
 *  startTime:授权开始时间,授权开始时间，从1970-01-01 00:00:00.000到 开始时间的毫秒数，北京时间,请注意，一定要为北京时间
 *  expireTime:授权结束时间 过期时间，从1970-01-01 00:00:00.000到 结束时间的毫秒数，北京时间
 **/
-(void)grantPermissionWithOtherUserphone:(NSString *)otheruserPhone nickName:(NSString *)nickName vin:(NSString *)vin startTime:(unsigned long)startTime  expireTime:(unsigned long)expireTime withSuccess:(void (^)(void))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  解除用户授权
 *  vin：被授权车辆
 *  userPhone：被授权人的手机号
 **/
-(void)revokePermissionWithVin:(NSString *)vin userPhone:(NSString *)userPhone withSuccess:(void (^)(void))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  查询被授权列表
 *  grantarray 数组中的每一项是个字典，字典中字段分别为：phone，nickName，startTime，expireTime，userType,可以针对自己关心的字段进行处理
 *  每个字典是这样的结构：
 *        {
 *        expireTime = 1526553000000;
 *        nickName = "\U5c0f\U767d";
 *        phone = 13167157158;
 *        startTime = 1523961000000;
 *        userType = USER;
 *        }
 **/
-(void)getGrantListwithVin:(NSString *)vin WithSuccess:(void(^)(NSArray *grantarray))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  查询车辆被授权列表，此接口需要网络.
 *  phone : 被授权人手机号，
 *  checkcode:checkcode验证码
 *  return:vehicleArray 里面返回 Catitem对象的列表
 *
 **/
-(void)getVehicleListWithPhone:(NSString *)phone withCheckcode:(NSString *)checkcode Success:(void(^)(NSArray *vehicleArray))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  取消扫描状态
 **/
-(void)cancelBTScan;

/**
 * 取消并且断开连接
 **/
-(void)cancelConnect;

/**
 *  检查连接状态，在非主动断开连接过程中，如果发送指令时连接已经断开，会缓存起来然后尝试连接，连接好之后再次发送，以下几个操作指令类同
 **/
-(BOOL)connectStatus;

/**
 *  上锁,如果本来就是上锁状态，执行上锁命令会立即返回成功，如果原本是解锁状态，会等待can数据返回，超时时间3秒
 **/
-(void)actionLock;


/**
 *  解锁，如果本来就是解锁状态，执行解锁命令会立即返回成功，如果原本是上锁状态，会等待can数据返回，超时时间3秒
 **/
-(void)actionUnlock;



/**
 *  长按上锁，遥控升窗
 **/
-(void)actionLongLock;

/**
 *  长按解锁，遥控降窗
 **/
-(void)actionLongUnlock;

/**
 *  打开左侧侧滑门
 **/
-(void)actionLeftSlidingDoor;

/**
 *  打开右侧侧滑门
 **/
-(void)actionRightSlidingDoor;

/**
 *  打开后备箱，无关闭功能
 **/
-(void)actionOpenTrunk;
/**
 *  启动
 **/
-(void)actionStartEngine;
/**
 *  熄火
 **/
-(void)actionStopEngine;
/**
 *  寻车
 **/
-(void)actionSearchVeicle;

@end

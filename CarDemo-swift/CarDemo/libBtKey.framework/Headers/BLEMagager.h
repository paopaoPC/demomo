//
//  BTKeyOperation.h
//  libSmartKey
//
//  Created by cds on 2018/7/4.
//  Copyright © 2018年 cds. All rights reserved.
//version:2.97版本
/******v2.97版本更新逻辑说明：
1，因为加入了指令调用的次数限制，所以侧滑门打开指令不能重复调用，每一次调用都会记录一次使用次数
2，获取剩余使用次数和到期时间接口返回数据说明：如果程序判断本地缓存已过期则会删除本地数据会导致获取到的剩余次数为0，过期时间为0或者为实际到期时间，转化成DATE类型为1970年1月1日；
3，离线数据是从离线后第一次使用开始计时，如果缓存数据从未在离线使用过，则始终返回最大可使用数量和当前时间开始的最大可使用时间（最大离线时间后台可控0-255小时）；
4，如果离线数据次数或者时间过期都会导致PE/PS无效，发送的位置参数为0；
5，如果连接时蓝牙学习失败，会返回连接失败，提示用户重连
6，只要联网使用一次蓝牙指令或者重新登录，都会重新缓存蓝牙钥匙，登录时只会强制刷新登录时指定VIN的缓存数据；
7，因为离线缓存数据可能过期被删除的问题，调用设置默认车辆接口离线切换车辆时可能会存在切换车辆失败的情况，需要处理失败情况。
 *****/

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
 *  只要联网使用一次蓝牙指令或者重新登录，都会重新缓存蓝牙钥匙，登录时只会强制刷新登录时指定VIN的缓存数据；
 *  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
 *  需要处理 BTErrorCode_AESFail 错误码，代表checkcode错误，需要更新checkcode后重试
 *  错误码ErrorCode_CarOwnerInvalid = 505,//车主已失效或者已更换
 *  错误码ErrorCode_BLEChanged = 506,//已经更换蓝牙设备，需要车主重新连接一次车辆已重新启用蓝牙功能
 *  错误码ErrorCode_GrantInvalid = 507,//授权已失效
 **/
-(void)sdkLoginWithPhone:(NSString *)phone vin:(NSString *)vin checkCode:(NSString *)checkcode  withCAToken:(NSString *)catoken withSuccess:(void (^)(NSString *vin,NSString *passcode))successBlock faild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  登出
 **/
-(void)logOut;


/**
 *  解除车辆蓝牙绑定
 *  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
 **/
-(void)unBindBleWithVin:(NSString *)vin withSuccess:(void (^)(void))successBlock  withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  刷新车辆列表数据，如果后台重新绑定了设备，而又没有重新登录，就需要刷新一次列表数据，以更新缓存
 *  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
 **/
-(void)refreshVehicleData:(NSString *)vin withSuccess:(void (^)(void))successBlock  withFaild:(void (^)(ErrorResponse *error))faildblock;
/**
 *  获取配对码，根据车架号返回对应车辆的蓝牙配对码
 **/
-(NSString *)getPassCodeWithVin:(NSString *)vin;

/**
 *  设置默认车辆
 *  设置默认车辆成功，返回车辆配对码
 *  因为离线缓存数据可能过期被删除的问题，调用设置默认车辆接口离线切换车辆时可能会存在切换车辆失败的情况，需要处理失败情况。
 *  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
 **/
-(void)setDefaultVehicle:(NSString *)vin withSuccess:(void (^)(NSString *vin,NSString *passcode,BOOL isLearned))successBlock faild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  指定VIN连接车辆蓝牙，
 *  vin:指定车辆的车架号
 *  reConnectTimes：自动重试次数，考虑到用户需要配对的情况，因为目前无法获取用户配对状态，建议尝试3次后提示用户
 *  timeoutSeconds：超时时间，该参数需要和自动重试次数配合使用，建议大于10秒以上
 *  如果连接时蓝牙学习失败，会返回连接失败，提示用户重连
 *  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
 *  需要处理 BTErrorCode_AESFail 错误码，代表checkcode错误，需要更新checkcode后重试
 *  需要处理ErrorCode_BLEUnlearned错误码，此错误码是学习失败，需要提示用户联网后重试一次。
 *  需要处理ErrorCode_passcodeError 错误码，代表输入的配对码错误，需要重新输入配对码
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
*  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
 **/
-(void)grantPermissionWithOtherUserphone:(NSString *)otheruserPhone nickName:(NSString *)nickName vin:(NSString *)vin startTime:(unsigned long)startTime  expireTime:(unsigned long)expireTime caToken:(NSString *)caToken withSuccess:(void (^)(void))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  修改授权时间
 *  otheruserPhone:被授权人的手机号
 *  vin：车架号
 *  startTime:授权开始时间,授权开始时间，从1970-01-01 00:00:00.000到 开始时间的毫秒数，北京时间,请注意，一定要为北京时间
 *  expireTime:授权结束时间 过期时间，从1970-01-01 00:00:00.000到 结束时间的毫秒数，北京时间
 *  caToken：长安token
 **/
-(void)modifyPermissionWithOtherPhone:(NSString *)otheruserPhone vin:(NSString *)vin nickName:(NSString *)nickName startTime:(unsigned long)startTime  expireTime:(unsigned long)expireTime caToken:(NSString *)caToken withSuccess:(void (^)(void))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;

/**
 *  解除用户授权
 *  vin：被授权车辆
 *  userPhone：被授权人的手机号
 *  需要判断 ErrorCode_TokenExpired 错误码，如果登录失效需要重新登录
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
 *  checkcode:必传参数
 *  catoken：必传参数
 *  return:vehicleArray 里面返回 Catitem对象的列表
 *  已经支持离线调用，但是数据是在登录时才缓存的，此接口本身不缓存任何数据，同时每次调用此接口时都会先尝试从服务器获取数据，如果获取失败再查询缓存
 **/
-(void)getVehicleListWithPhone:(NSString *)phone withCheckcode:(NSString *)checkcode withCAToken:(NSString *)catoken Success:(void(^)(NSArray *vehicleArray))successBlock withFaild:(void (^)(ErrorResponse *error))faildblock;


/**
 *  获取离线剩余使用到期时间，返回到期时间从1970年到现在的长整形，精确到秒
 *  如果本地没有缓存数据，返回0
 *  如果离线数据从未使用过，返回从现在开始到加上的最大允许离线使用时间；
 *  如果使用过，则为实际离线使用到期时间；
 */
-(long)getOfflineExpiryTime;

/**
 * 获取剩余指令离线可使用次数
 *  获取剩余使用次数和到期时间接口返回数据说明：如果程序判断本地缓存已过期则会删除本地数据会导致获取到的剩余次数为0，过期时间为0或者为实际到期时间，转化成DATE类型为1970年1月1日；
 *  离线数据是从离线后第一次使用开始计时，如果缓存数据从未在离线使用过，则始终返回最大可使用数量和当前时间开始的最大可使用时间（最大离线时间后台可控0-255小时）；
 *  如果离线数据次数或者时间过期都会导致PE/PS无效，发送的位置参数为0；
 */
-(int)getOfflineRemainingTimes;

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
 *  上锁操作
 *  因为加入了指令调用的次数限制，所有指令不能重复调用，每一次调用都会记录一次使用次数
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionLock:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;


/**
 *  解锁操作指令
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionUnlock:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;



/**
 *  关天窗
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionSunroofClose:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  开天窗
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionSunroofOpen:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  打开左侧侧滑门
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionLeftSlidingDoor:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  打开右侧侧滑门
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionRightSlidingDoor:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  打开后备箱，无关闭功能
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionOpenTrunk:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  启动
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionStartEngine:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  熄火
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionStopEngine:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

/**
 *  寻车
 *  type :寻车类型，1：灯光，2：灯+声音，0：无效，3：错误
 *  offlineTimes：返回的剩余可离线使用次数
 *  response：需要处理ErrorCode_NoActivity和ErrorCode_TokenExpired错误码，代表被踢下线或者在其他地方登录过，无法正常使用
 **/
-(void)actionSearchVeicle:(int)type success:(void(^)(int offlineTimes))successBlock timeout:(void(^)(ErrorResponse *response))faild;

@end

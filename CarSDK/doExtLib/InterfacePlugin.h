

#import <Foundation/Foundation.h>

@interface InterfacePlugin : NSObject
/// 单利方法
+(InterfacePlugin *)shared;

/// 登录
- (void)loginandgetdata_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 刷新
- (void)reflash_blueTooth;

/// 连接蓝牙
- (void)connectbt_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 设置默认车辆
- (void)setdefaultvehicle_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 锁车指令
- (void)actionLock_blueTooth:(NSString *)callback;

/// 解锁指令
- (void)actionUnlock_blueTooth:(NSString *)callback;

/// 寻车
-(void)actionSearchVeicle_blueTooth:(NSString *)callback;

/// 熄火
-(void)actionStopEngine_blueTooth:(NSString *)callback;

/// 启动引擎
-(void)actionStartEngine_blueTooth:(NSString *)callback;

/// 打开后备箱
-(void)actionOpenTrunk_blueTooth:(NSString *)callback;

/// 打开右侧滑门
-(void)actionRightSlidingDoor_blueTooth:(NSString *)callback;

/// 打开左侧滑门
-(void)actionLeftSlidingDoor_blueTooth:(NSString *)callback;

/// 车窗自动降窗
-(void)actionLongUnlock_blueTooth:(NSString *)callback;

/// 车窗自动升起
-(void)actionLongLock_blueTooth:(NSString *)callback;

/// 获取配对码
- (void)getpasscode_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 对用户授权
- (void)grantUser_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 取消用户授权
- (void)revokePermissionbtn_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 获取授权列表
- (void)grantList_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 获取分享给我的列表
- (void)getVehicleListWithPhone_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 获取蓝牙开关状态
-(void)getBlueToothStatus_blueTooth:(NSString *)callback;

/// 获取蓝牙连接状态
- (void)getConnectStatus_blueTooth:(NSString *)callback;

/// 解除绑定
- (void)unBind_blueTooth:(NSString *)jsonString :(NSString *)callback;

/// 断开蓝牙连接
- (void)cancelConnect_blueTooth;

/// 蓝牙闪灯
- (void)whistle0_blueTooth:(NSString *)callback;

/// 蓝牙闪灯鸣笛
- (void)whistle1_blueTooth:(NSString *)callback;

/// 天窗自动升窗
- (void)actionSunroofClose:(NSString *)callback;

/// 天窗自动降窗
- (void)actionSunroofOpen:(NSString *)callback;

///获取离线剩余使用到期时间，返回到期时间从1970年到现在的长整形，精确到秒
- (long)getOfflineExpiryTime;

///获取剩余指令离线可使用次数
- (int)getOfflineRemainingTimes;

/// 修改蓝牙授权信息
- (void)modifyPermissionWithOtherPhone_blueTooth:(NSString *)jsonString :(NSString *)callback;

@end

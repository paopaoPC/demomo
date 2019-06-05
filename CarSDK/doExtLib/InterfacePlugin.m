

#import "InterfacePlugin.h"

#import <CommonCrypto/CommonDigest.h>
#import "RSA.h"
#import "SVProgressHUD.h"
#import "CLLocationManager+Extension.h"
#import "NSString+Extension.h"
#import "PinAuth.h"
#import <libBtKey/BLEMagager.h>
#import "DoEventManager.h"
#import "MJExtension.h"


#define weakSelf(self) __weak typeof(self) wself = self;

@interface InterfacePlugin ()<BTStateDelegate>
/// 最后一次车辆状态
@property (strong, nonatomic) NSString *lastStatus;

@end

@implementation InterfacePlugin

static InterfacePlugin *manager;
static dispatch_once_t once;

+(InterfacePlugin *)shared {
    dispatch_once(&once, ^{
        manager = [[InterfacePlugin alloc] init];
        [manager defaultBLEMagager];
    });
    return manager;
}

#pragma mark -- 初始化
-(void)defaultBLEMagager {
    NSLog(@"defaultBLEMagager----------");
    BLEMagager *blemanager = [BLEMagager shareInstance];
    blemanager.btStateDelegate = self;
    [blemanager startWithAppId:@"201810271701740102" secretKey:@"AEKAUNDTEDSJGTQ3BCQS8E0VYM719AIC2BALZEBTY04A26ENUTUY8PFY56G2YA11"];
}

#pragma mark -- BLEMagager Delegate --
- (void)blueToothStateUpdate:(BlueToothState)btstate {
    NSLog(@"蓝牙状态------------:%d",btstate);
    NSString *jsstr = [NSString stringWithFormat:@"window.__blueToothStateUpdate && window.__blueToothStateUpdate(%d)",btstate];
    [[DoEventManager shared] javaScriptCallMethod:jsstr];
}

-(void)onBCMDoorStatus:(CarDoorStatus *)doorstatus {
    NSString *jsstr = [NSString stringWithFormat:@"window.__getBlueToothState && window.__getBlueToothState(%@)",[doorstatus mj_JSONString]];
    if (![jsstr isEqualToString:self.lastStatus]) {
        NSLog(@"模型更新------------1");
        [[DoEventManager shared] javaScriptCallMethod:jsstr];
    }
    self.lastStatus = jsstr;
}

-(NSString *)dataToJson:(id)param
{
    NSData *data = [NSJSONSerialization dataWithJSONObject:param options:NSJSONWritingPrettyPrinted error:nil];
    NSString *JSON = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    return JSON;
}

// 发起js回调
- (void)callBack:(NSDictionary *)params :(NSString *)callback
{
    NSString *json = [self dataToJson:params];
    NSString *jsstr = [NSString stringWithFormat:@"%@(%@)",callback,json];
    [[DoEventManager shared] javaScriptCallMethod:jsstr];
}

// 登录
- (void)loginandgetdata_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *phone = [data objectForKey:@"phone"];
    NSString *vin = [data objectForKey:@"vin"];
    NSString *checkCode = [data objectForKey:@"checkCode"];
    NSString *token = [data valueForKey:@"token"];
    if (token == nil || token == NULL) { token = @""; }
    weakSelf(self)
    [[BLEMagager shareInstance] sdkLoginWithPhone:phone vin:vin checkCode:checkCode withCAToken:token withSuccess:^(NSString *vin, NSString *passcode) {
        NSLog(@"😢😢😢😢--------------登录成功--------------😢😢😢😢");
        [wself successCallBack:callback];
    } faild:^(ErrorResponse *error) {
        [wself errorWithDataCallBack:error :callback];
        NSLog(@"😢😢😢😢--------------登录失败（%d）--------------😢😢😢😢",error.errorCode);
    }];
}

// 刷新
- (void)reflash_blueTooth {
    [[BLEMagager shareInstance] refreshVehicleData:@"11111222223333333" withSuccess:^{
        NSLog(@"刷新数据成功");
    } withFaild:^(ErrorResponse *error) {
        NSLog(@"刷新缓存数据失败");
    }];
}

-(void)getBlueToothStatus_blueTooth:(NSString *)callback {
    weakSelf(self)
    if([BLEMagager shareInstance].blueToothState == BTStatePoweredOn){
        NSDictionary *param = @{@"code" : @"200",
                                @"data" : @"true"};
        [wself callBack:param :callback];
    } else {
        NSDictionary *param = @{@"code" : @"200",
                                @"data" : @"false"};
        [wself callBack:param :callback];
    }
}

// 连接蓝牙
- (void)connectbt_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    if ([BLEMagager shareInstance].blueToothState == BTStatePoweredOn) {
        //如果蓝牙权限正常打开才能连接
        weakSelf(self)
        [[BLEMagager shareInstance] connectToBlewithVin:vin reConnectTimes:-1 timeOut:15 connected:^{
            NSDictionary *param = @{@"code" : @"200",
                                    @"data" : @"true"};
            [wself callBack:param :callback];
        } disconnectBlock:^(ErrorResponse *error) {
            [wself errorCallBack:callback];
        } failBlock:^(ErrorResponse *error) {
            [wself errorWithOutDataCallBack:error :callback];
        }];
    } else {
        [self errorCallBack:callback];
    }
}

// 设置默认车辆
- (void)setdefaultvehicle_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    weakSelf(self)
    [[BLEMagager shareInstance] setDefaultVehicle:vin withSuccess:^(NSString *vin, NSString *passcode, BOOL isLearned) {
        [wself successCallBack:callback];
    } faild:^(ErrorResponse *error) {
        [wself errorWithOutDataCallBack:error :callback];
    }];
}

- (void)getConnectStatus_blueTooth:(NSString *)callback {
    NSString *connectStatus = [NSString stringWithFormat:@"%d",[[BLEMagager shareInstance] connectStatus]];
    NSDictionary *param = @{@"data" : connectStatus};
    [self callBack:param :callback];
}

// 锁车指令
- (void)actionLock_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionLock:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}
// 解锁指令
- (void)actionUnlock_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    weakSelf(self)
    [[BLEMagager shareInstance] actionUnlock:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

//车窗自动升起
-(void)actionLongLock_blueTooth:(NSString *)callback {
    
    [self errorCallBack:callback];
    
    //    if (![[BLEMagager shareInstance] connectStatus]) {
    //        [self callBack:@{@"code": @"400"} :callback];
    //        return;
    //    }
    //    [[BLEMagager shareInstance] actionLongLock];
    //    [self callBack:@{
    //                     @"code": @"200"
    //                     } :callback];
}

//车窗自动降窗
-(void)actionLongUnlock_blueTooth:(NSString *)callback {
    
    [self errorCallBack:callback];
    
    //    if (![[BLEMagager shareInstance] connectStatus]) {
    //        [self callBack:@{
    //                         @"code": @"400"
    //                         } :callback];
    //        return;
    //    }
    //    [[BLEMagager shareInstance] actionLongUnlock];
    //    [self callBack:@{
    //                     @"code": @"200"
    //                     } :callback];
}

//打开左侧滑门
-(void)actionLeftSlidingDoor_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    weakSelf(self)
    [[BLEMagager shareInstance] actionLeftSlidingDoor:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

//打开右侧滑门
-(void)actionRightSlidingDoor_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionRightSlidingDoor:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

//打开后备箱
-(void)actionOpenTrunk_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionOpenTrunk:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

//启动引擎
-(void)actionStartEngine_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionStartEngine:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

//熄火
-(void)actionStopEngine_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionStopEngine:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

//寻车
-(void)actionSearchVeicle_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionSearchVeicle:2 success:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}


// 获取配对码
- (void)getpasscode_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    NSString *passcode = [[BLEMagager shareInstance] getPassCodeWithVin:vin];
    if([passcode length] == 0){
        [self callBack:@{
                         @"code": @"200",
                         @"data": @""
                         } :callback];
    } else {
        [self callBack:@{
                         @"code": @"200",
                         @"data": passcode
                         } :callback];
    }
    
}

// 对用户授权
- (void)grantUser_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *phone = [data objectForKey:@"phone"];
    NSString *vin = [data objectForKey:@"vin"];
    NSString *token = [data objectForKey:@"token"];
    NSNumber *startTime = [data objectForKey:@"startTime"];
    NSNumber *expireTime = [data objectForKey:@"expireTime"];
    NSString *nickName = [data objectForKey:@"nickName"];
    if (token == nil || token == NULL) { token = @""; }
    if (nickName == nil || nickName == NULL) { nickName = @""; }
    weakSelf(self)
    [[BLEMagager shareInstance] grantPermissionWithOtherUserphone:phone nickName:nickName vin:vin startTime:startTime.longValue expireTime:expireTime.longValue caToken:token withSuccess:^{
        [wself callBack:@{
                          @"code": @"200",
                          @"msg": @"授权成功"
                          } :callback];
    } withFaild:^(ErrorResponse *error) {
        [wself errorWithDataCallBack:error :callback];
    }];
}

// 取消用户授权
- (void)revokePermissionbtn_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    NSString *phone = [data objectForKey:@"phone"];
    weakSelf(self)
    [[BLEMagager shareInstance] revokePermissionWithVin:vin userPhone:phone withSuccess:^{
        [wself callBack:@{
                          @"code": @"200",
                          @"msg": @"取消授权成功"
                          } :callback];
    } withFaild:^(ErrorResponse *error) {
        [wself errorWithDataCallBack:error :callback];
    }];
}

// 获取授权列表
- (void)grantList_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    weakSelf(self)
    [[BLEMagager shareInstance] getGrantListwithVin:vin WithSuccess:^(NSArray *grantarray) {
        if([grantarray count] == 0){
            [wself callBack:@{
                              @"code": @"200",
                              @"data": @[]
                              } :callback];
        } else {
            [wself callBack:@{
                              @"code": @"200",
                              @"data": grantarray
                              } :callback];
        }
        
    } withFaild:^(ErrorResponse *error) {
        [wself errorWithDataCallBack:error :callback];
    }];
}

- (void)getVehicleListWithPhone_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *phone = [data objectForKey:@"phone"];
    NSString *token = [data objectForKey:@"token"];
    NSString *checkcode = [data objectForKey:@"checkCode"];
    if (token == nil || token == NULL) { token = @""; }
    weakSelf(self)
    [[BLEMagager shareInstance] getVehicleListWithPhone:phone withCheckcode:checkcode withCAToken:token Success:^(NSArray *vehicleArray) {
        if([vehicleArray count] == 0){
            [wself callBack:@{
                              @"code": @"200",
                              @"data": @[]
                              } :callback];
        } else {
            NSArray *param = [CarItem mj_keyValuesArrayWithObjectArray:vehicleArray];
            [wself callBack:@{
                              @"code": @"200",
                              @"data": param
                              } :callback];
        }
    } withFaild:^(ErrorResponse *error) {
        [wself callBack:@{
                         @"code": [NSString stringWithFormat:@"%d",error.errorCode],
                         @"msg": error.errorMessage
                         } :callback];
    }];
}


// 解除绑定
- (void)unBind_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    weakSelf(self)
    [[BLEMagager shareInstance] unBindBleWithVin:vin withSuccess:^{
        [wself successCallBack:callback];
    } withFaild:^(ErrorResponse *error) {
        [wself errorWithDataCallBack:error :callback];
    }];
}

// 修改蓝牙
- (void)modifyPermissionWithOtherPhone_blueTooth:(NSString *)jsonString :(NSString *)callback {
    NSDictionary *data = [jsonString stringToJson];
    NSString *vin = [data objectForKey:@"vin"];
    NSString *phone = [data objectForKey:@"phone"];
    long startTime = [[data objectForKey:@"startTime"] longValue];
    long expireTime = [[data objectForKey:@"expireTime"] longValue];
    NSString *nickName = [data objectForKey:@"nickName"];
    NSString *token = [data objectForKey:@"token"];
    if (token == nil || token == NULL) { token = @""; }
    if (nickName == nil || nickName == NULL) { nickName = @""; }
    weakSelf(self)
    [[BLEMagager shareInstance] modifyPermissionWithOtherPhone:phone vin:vin nickName:nickName startTime:startTime expireTime:expireTime caToken:token withSuccess:^{
        [wself successCallBack:callback];
    } withFaild:^(ErrorResponse *error) {
        [wself errorCallBack:callback];
    }];
}

-(void)whistle0_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionSearchVeicle:1 success:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
    
}

-(void)whistle1_blueTooth:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionSearchVeicle:2 success:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

// 天窗窗自动升起
-(void)actionSunroofClose:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionSunroofClose:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

// 天窗自动降窗
-(void)actionSunroofOpen:(NSString *)callback {
    if (![[BLEMagager shareInstance] connectStatus]) {
        [self errorCallBack:callback];
        return;
    }
    
    weakSelf(self)
    [[BLEMagager shareInstance] actionSunroofOpen:^(int offlineTimes) {
        [wself successCallBack:callback];
    } timeout:^(ErrorResponse *response) {
        [wself errorWithOutCallBack:response];
    }];
}

// 断开蓝牙连接
-(void)cancelConnect_blueTooth {
    [[BLEMagager shareInstance] cancelConnect];
}

-(long)getOfflineExpiryTime {
    return [[BLEMagager shareInstance] getOfflineExpiryTime];
}

-(int)getOfflineRemainingTimes {
    return [[BLEMagager shareInstance] getOfflineRemainingTimes];
}

/// 200 成功回调
-(void)successCallBack:(NSString *)callback {
    [self callBack:@{
                     @"code": @"200"
                     } :callback];
}

/// 400 错误回调
-(void)errorCallBack:(NSString *)callback {
    [self callBack:@{
                     @"code" : @"400"
                     } :callback];
}

- (void)errorWithOutCallBack:(ErrorResponse *)error {
    if (error.errorCode == ErrorCode_TokenExpired || error.errorCode == ErrorCode_NoActivity) {
        [self cancelConnect_blueTooth];
        [[DoEventManager shared] loginOutCarControl];
    }
}

- (void)errorWithOutDataCallBack:(ErrorResponse *)error :(NSString *)callback {
    if (error.errorCode == ErrorCode_TokenExpired || error.errorCode == ErrorCode_NoActivity) {
        [self cancelConnect_blueTooth];
        [[DoEventManager shared] loginOutCarControl];
    } else {
        [self errorCallBack:callback];
    }
}

- (void)errorWithDataCallBack:(ErrorResponse *)error :(NSString *)callback {
    if (error.errorCode == ErrorCode_TokenExpired || error.errorCode == ErrorCode_NoActivity) {
        [self cancelConnect_blueTooth];
        [[DoEventManager shared] loginOutCarControl];
    } else {
        [self callBack:@{
                         @"code": [NSString stringWithFormat:@"%d",error.errorCode],
                         @"msg": error.errorMessage
                         } :callback];
    }
}

@end

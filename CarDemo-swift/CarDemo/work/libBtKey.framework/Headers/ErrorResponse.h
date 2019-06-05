//
//  BLEResponse.h
//  libSmartKey
//
//  Created by cds on 2018/7/9.
//  Copyright © 2018年 cds. All rights reserved.
//

#import <Foundation/Foundation.h>



typedef enum NSInteger{
    // 业务正常处理
    ErrorCode_OK = 200,
    /// 服务异常
    ErrorCode_InternalServerError = 500,// 服务异常
    ///参数异常
    ErrorCode_ParameterError = 501,//参数异常
    /// 接口对应的服务未部署或者业务异常
    ErrorCode_BadGateway = 502,//业务异常
    ///解密失败
    ErrorCode_NoActivity = 503,//未激活,代表checkcode失效，需要传入新的checkcode,并且重新登录
    ///Token过期
    ErrorCode_TokenExpired = 504,//Token过期,代表登录失效，需要重新登录，
    
    ErrorCode_Uninitialized = 510,//appid未初始化
    
    ErrorCode_UnRegister = 511,//用户未注册，请先注册后使用
    
    ErrorCode_BLEUnlearned = 512,//蓝牙未学习
    
    ErrorCode_NetworkException = 1000,//网络异常
    
    ErrorCode_NoToken = 1010,//没有token，登录失败，获取token异常
    
    ErrorCode_NOAnyVehicle = 1011,//此用户未绑定任何车辆
    
    ErrorCode_BTAdressInvalidate = 1012,//蓝牙地址不正确
    
    ErrorCode_BleInfoInvalidate = 1013,//蓝牙模块读取的VIN跟绑定的的VIN不匹配，无法绑定
    
    ErrorCode_BleSNInvalidate = 1014,//蓝牙SN不正确，请输入正确的SN
    
    ErrorCode_VinInvalidate = 1015,//指定的VIN格式不正確或者未找到此车辆
    
    ErrorCode_PhoneInvalidate = 1016,//指定phone参数不正确
    
    ErrorCode_CheckCodeInvalidate = 1017,//checkcode参数不正确
    
    ErrorCode_BleNotInPowerON = 2000,//蓝牙未打开
    
    ErrorCode_ScanBleTimeout = 2001,//扫描连接蓝牙超时
    
    ErrorCode_getBtInfoError = 2002,//蓝牙通讯失败
    
    ErrorCode_UnbindBld = 2003,//未绑定蓝牙，请先绑定蓝牙
    
    ErrorCode_LimitedOperation = 2004,//离线操作受限，一般是网络不畅导致，需要联网操作一遍
    
    ErrorCode_passcodeError = 2005,//配对码错误，暂时无法判断，此错误码暂时不会返回，
    
    ErrorCode_noAuthority = 2006,//授权失败，您无权限授权此车辆
    
    ErrorCode_mobileError = 2007,//授权和解除授权时输入的手机号码格式不正确，请输入正确的手机号
    
    ErrorCode_checkCodeError = 2008,//checkCode参数异常
    
    ErrorCode_NeedDebugMode = 2009,//需要插入诊断仪让蓝牙模块进入诊断模式才能进行绑定操作
    
}BleErrorCode;



@interface ErrorResponse : NSObject

@property (nonatomic,assign)BleErrorCode errorCode;
@property (nonatomic,strong) NSString *errorMessage;

+(instancetype)errorwithCode:(NSInteger)errorcode withErrorMessage:(NSString *)message;

@end

//
//  BLEDefine.h
//  libSmartKey
//
//  Created by cds on 2018/7/10.
//  Copyright © 2018年 cds. All rights reserved.
//

#import <Foundation/Foundation.h>
//#import "BTCarInfo.h"
#import "CarBCMEvent.h"
#import "CarDoorSatus.h"
#import "CarItem.h"
//#import "BTTireSystem.h"




typedef enum: int{
    MessageType_Register,//注册发送短信
    MessageType_Active,//激活发送短信
}MessageType;

typedef enum: int{
    LockAlarm_leftFrontDoorOpen = 1,//左前车门开
    LockAlarm_rightFrontDoorOpen = 2,//右前车门开
    LockAlarm_leftBackDoorOpen = 3,//左后车门开
    LockAlarm_rightBackDoorOpen = 4,//右后车门开
    LockAlarm_TrunkOpen = 5,//后备箱门打开
    LockAlarm_HoodOpen = 6,//前舱门开
    LockAlarm_PowerNotOFF = 7,//111电源不工作于OFF,未熄火
    LockAlarm_TimeOut = 10,//指令超时，一般是发生连接问题
    LockAlarm_needNetWork = 11,//需要网络，离线操作受限
}DoorlockAlarm;


//*<<<<<<<<<非法闯入模式：在设防模式下，出现四门两盖或点火开关被打开，会触发非法闯入模式，BCM将该状态反馈给蓝牙模块。在未解除警报源的前提下，按手机上遥控解锁按键，解除报警同时所有门锁解锁，先进入解除非法闯入模式，再进入解防模式；*/
///*<<<<<<<<<按遥控设防键（先进入解除非法闯入模式），再进入设防失效模式，再进入非法闯入模式。若解除警报源，按手机上的遥控设防按键，先进入解除非法闯入模式，再进入设防模式。*/
///*<<<<<<<<<ArmingFaultMode：在解防模式下，四门两盖未能完全关上，或点火开关打开，按下遥控设防按键，设防失效，BCM发送该事件数据帧反馈给蓝牙模块。解除设防失效原因后，按手机上的遥控设防按键，方可进入设防模式*/
typedef enum: NSUInteger{
    Car_LockMode_UnlockMode = 0,//解防模式
    Car_LockMode_LockMode = 1,//设防模式
    Car_LockMode_IntrusionMode = 2,//非法闯入模式
    Car_LockMode_DisableIntrusionMode = 3,//解除非法闯入模式
    Car_LockMode_ArmingFaultMode = 4,//设防失效模式
    Car_LockMode_TrunkReleaseMode = 5,//后备箱释放模式
    Car_LockMode_StartupOrDefault = 0B110,//
    Car_LockMode_Invalid = 0B111,//（无效）
}Car_LockMode;//设防模式

typedef enum NSUInteger{
    UserType_ADMIN = 1,//高级用户，还能再被授权
    UserType_USER = 2,//普通用户，不能再次给别人授权
}UserType;

/*********************蓝牙权限状态更新回调***********************************/
typedef enum : int {
    BTStateUnsupported = 0,//此设备不支持蓝牙功能
    BTStateUnauthorized ,//该设备蓝牙未授权
    BTStatePoweredOff,//该设备尚未打开蓝牙
    BTStatePoweredOn,//正常打开，可以扫描
    BTStateUnknown,//未知蓝牙状态
    BTStateResetting,//蓝牙状态重置
} BlueToothState;

typedef enum :int{
    EngineStatus_Stop = 0x0,//发动机熄火状态
    EngineStatus_Crank = 0x1,//启动中
    EngineStatus_Running = 0x2,//发动机启动状态
    EngineStatus_Invalid = 0x3,//无效
}EngineStatus;


@protocol BTStateDelegate <NSObject>

@optional
/**
 *  蓝牙设备状态更新，参照 BTStateDelegate 定义
 *  必须实现此代理，提示用户
 *
 **/
- (void)blueToothStateUpdate:(BlueToothState )btstate;

/**
 * 蓝牙信号值RSSI的更新，之后调用了 scanBlueToothDeviceWithMac 或者连接成功后才会更新，只调用扫描，未连接，大概100毫秒更新一次，如果连接成功了，大概1秒一次回调
 *  信号值为负值，数值越大信号越强
 **/
-(void)onRSSIUpdate:(NSInteger)rssi;


/**
 *
 *  车身告警事件反馈，事件类型
 */
-(void)onBCMEvent:(CarBCMEvent *)event;

/**
 *  车身状态反馈，循环反馈
 */
-(void)onBCMDoorStatus:(CarDoorSatus *)doorstatus;


-(void)onEngineStatus:(EngineStatus)engineStatus;


@end

@interface BLEDefine : NSObject


@end

//
//  CarBCMEvent.h
//  libBtKey
//
//  Created by cds on 2018/9/6.
//  Copyright © 2018年 cds. All rights reserved.
//

#import <Foundation/Foundation.h>


typedef enum: int{
    EngineStart_NOFeedback = 0x0,//:无反馈；
    EngineStart_startSuccess = 0x1,//:启动成功；
    EngineStart_tooManyTimes = 0x2,//:连续启动次数过多；
    EngineStart_BatteryLow = 0x3,//:整车电量不足；
    EngineStart_DoorIsOpen = 0x4,//:车门或引擎盖或行李箱未关闭；
    EngineStart_KeyInCar = 0x5,//:遥控钥匙在车内；
    EngineStart_AntitheftActivate =0x6,//:防盗激活；
    EngineStart_EmergencyAlarmActivaty = 0x7,//:紧急报警灯光激活；
    EngineStart_ShiftNotInP = 0x8,//:整车不在P档；
    EngineStart_SpeedNotzero = 0x9,//:车速不为0；
    EngineStart_EngineRuning = 0xA,//:发动机已运行；
    EngineStart_HandBrakeClosed = 0xB,//:电子手刹未夹紧；
    EngineStart_LowOil = 0xC,//:油量不足；
    EngineStart_StartSystemError = 0xD,//:启动系统故障；
    EngineStart_LowOilPressure = 0xE,//:发动机机油压力过低；
    EngineStart_HighTemperature = 0xF,//:发动机冷却液温度过高；
    EngineStart_EFI_SystemFailure = 0x10,//:电喷系统故障；
    EngineStart_StopWithTimeout = 0x11,//:运行10分钟正常熄火；
    EngineStart_LowTemperature = 0x12,//:环境温度过低；
    EngineStart_Unsafe = 0x13,//:周边防盗未处于“设防状态”
    //EngineStart_Reserved = 0x14,//:Reserved
    //EngineStart_Reserved = 0x1F,//:Reserved
}Engine_RemoteStartFeedback;

typedef enum: int{
    StartupSignal_OFF = 0x0,// = OFF;
    StartupSignal_ON = 0x1,// = ON;
    StartupSignal_Error = 0x2,// = Error;
    StartupSignal_Reserved =0x3,// = 不可用;
}StartupButtonSignal;

@interface CarBCMEvent : NSObject

@property (nonatomic,assign) Engine_RemoteStartFeedback remoteStartFeedback;//遥控及远程启动反馈

@property (nonatomic,assign) StartupButtonSignal startupButtonSignal;//启动按钮信号

@end

//
//  CarBcmData.h
//  libBtKey
//
//  Created by cds on 2018/9/5.
//  Copyright © 2018年 cds. All rights reserved.
//

#import <Foundation/Foundation.h>




typedef enum : Byte {
    DoorLock_LOCK = 0x00,
    DoorLock_UNLOCK = 0x01,
    DoorLock_NOTUSER = 0x02,
    DoorLock_ERROR = 0x03//
} DoorLockState;

typedef enum : Byte {
    AlarmStatus_Disarmed = 0x0,
    AlarmStatus_Prearmed = 0x1,
    AlarmStatus_Armed= 0x2,
    AlarmStatus_Activated = 0x3,

}AlarmStatus;


@interface CarDoorSatus : NSObject

@property (nonatomic,assign) BOOL driverDoorStatus;//左前门是否打开
@property (nonatomic,assign) BOOL passengerDoorStatus;//右前门是否打开
@property (nonatomic,assign) BOOL leftRearDoorStatus;//左后门
@property (nonatomic,assign) BOOL rightRearDoorStatus;//左后门
@property (nonatomic,assign) BOOL hoodStatus;//发动机舱盖
@property (nonatomic,assign) BOOL trunkStatus ;//后备箱门
@property (nonatomic,assign) BOOL sunroofStatus;//天窗状态

@property (nonatomic,assign) DoorLockState driverDoorLockStatus;//驾驶侧门锁状态信号
@property (nonatomic,assign) AlarmStatus keyAlarmStatus;//警戒状态信息


@property (nonatomic,assign) float driverWindowStatus;//左前窗户位置 %
@property (nonatomic,assign) float passengerWindowStatus;//右前车窗玻璃位置 %
@property (nonatomic,assign) float leftRearWindowStatus;//左后窗玻璃位置 %
@property (nonatomic,assign) float rightRearWindowStatus;//右后窗玻璃位置 %
@end

//
//  M0038_CarNetMap_ISM.h
//
//  Created by @AppWorker on @2018/4/11.
//  Copyright (c) 2018年 AppWorker. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol M0038_CarNetMap_ISM <NSObject>

//实现同步或异步方法，parms中包含了所需用的属性
@required
#pragma mark - 同步方法
- (void)openCarLocationView:(NSString *)parms;
- (void)showCarLocationViewLoading;
- (void)stopCarLocationViewLoading;
- (void)getCarError;
- (void)updateImageCode:(NSString *)parms;
- (void)refreshLocation:(NSString *)parms;
- (void)showPinInput:(NSString *)parms;
- (void)showAuthCodeView;
- (void)updateCarState:(NSString *)parms;
- (void)getEfenceList:(NSString *)parms;
- (void)getAuthCode;
- (void)fenceFirstSaved:(NSString *)parms;
- (void)showStatus:(NSString *)status :(NSString *)text;
- (void)getEfenceDataModel:(NSString *)parms;
- (void)openDrivingTrajectory:(NSString *)parms;
- (void)oneTrajectoryData:(NSString *)parms;
- (void)setAMapKey;
- (NSString *)RSA:(NSString *)parms;
- (void)startCuntDown:(NSArray *)parms;
- (NSDictionary *)getVersion;
- (NSDictionary *)getInfo;
- (NSString *)getCpuInfo;
- (NSString *)getMemory;
- (void)setAMapKey:(NSString *)apikey;


#pragma mark - 异步方法



@end

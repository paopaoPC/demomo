//
//  M0038_CarNetMap_SM.h
//
//  Created by @AppWorker on @2018/4/11.
//  Copyright (c) 2018年 AppWorker. All rights reserved.
//

#import "M0038_CarNetMap_ISM.h"
#import "M0038_CarNetMap_App.h"

@interface M0038_CarNetMap_SM : NSObject<M0038_CarNetMap_ISM>

/// 单利方法
+(M0038_CarNetMap_SM *)shared;

@end

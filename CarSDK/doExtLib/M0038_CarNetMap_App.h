//
//  M0038_CarNetMap_App.h
//
//  Created by @AppWorker on @2018/4/11.
//  Copyright (c) 2018年 AppWorker. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "DoEventManager.h"

@interface M0038_CarNetMap_App : NSObject
+(M0038_CarNetMap_App *) Instance;
@property(nonatomic,weak) UIApplication *M0038_CarNetMapApplication;
@property(nonatomic,copy) NSDictionary *M0038_CarNetMapNSDictionary;
@property(nonatomic,weak) NSData *deviceToken;
@end

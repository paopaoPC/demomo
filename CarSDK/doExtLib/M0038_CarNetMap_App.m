//
//  M0038_CarNetMap_App.m
//
//  Created by @AppWorker on @2018/4/11.
//  Copyright (c) 2018年 AppWorker. All rights reserved.
//

#import <objc/message.h>
#import "M0038_CarNetMap_App.h"
#import "NSObject+wyhook.h"
#import "UIImage+wyhook.h"

static M0038_CarNetMap_App* instance;
@implementation M0038_CarNetMap_App

+(id) Instance
{
    if(instance==nil){
        instance = [[M0038_CarNetMap_App alloc]init];
//        Method responds =
//        class_getClassMethod(UIImage.class, @selector(imageNamed:));
//        //获取替换后的类方法
//        Method responds1 =
//        class_getClassMethod(UIImage.class, @selector(hookImageNamed:));
//        //然后交换类方法
//        method_exchangeImplementations(responds, responds1);
    }
    return instance;
}



- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(nonnull NSData *)deviceToken{
    NSString *token = [[[[deviceToken description] stringByReplacingOccurrencesOfString:@"<" withString:@""] stringByReplacingOccurrencesOfString:@">" withString:@""] stringByReplacingOccurrencesOfString:@" " withString:@""];
    _deviceToken = deviceToken;
}


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions{
    
    _M0038_CarNetMapApplication = application;
    _M0038_CarNetMapNSDictionary = launchOptions;
    return YES;
}


@end

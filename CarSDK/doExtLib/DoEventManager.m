//
//  DoEventManager.m
//  CarSDK
//
//  Created by shifangyuan on 2018/9/29.
//  Copyright © 2018年 石方圆. All rights reserved.
//

#import "DoEventManager.h"
#import <UIKit/UIKit.h>

@implementation DoEventManager

static DoEventManager *manager;
static dispatch_once_t once;

+(DoEventManager *)shared {
    dispatch_once(&once, ^{
        manager = [[DoEventManager alloc] init];
    });
    return manager;
}

- (void)javaScriptCallMethod:(NSString *)jsname {
    if ([jsname rangeOfString:@"("].location == NSNotFound && [jsname rangeOfString:@")"].location == NSNotFound) {
        jsname = [jsname stringByAppendingString:@"()"];
    }
    
    if (self.delegate && [self.delegate respondsToSelector:@selector(javaScriptCallBack:)]) {
        [self.delegate javaScriptCallBack:jsname];
    }
    
//    if (manager.javaScriptCallBlock) {
//        manager.javaScriptCallBlock(jsname);
//    }
}

- (void)loginOutCarControl {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"温馨提示" message:@"您已在其他设备上进行连接控制，此设备已退出" preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *doneAction = [UIAlertAction actionWithTitle:@"知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        if (self.delegate && [self.delegate respondsToSelector:@selector(loginOutCarControlEvent)]) {
            [self.delegate loginOutCarControlEvent];
        }
    }];
    [alert addAction:doneAction];
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:alert animated:YES completion:nil];
}

@end

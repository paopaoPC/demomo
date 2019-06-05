//
//  BundleTools.h
//  doExtLib
//
//  Created by bolaa on 2018/7/12.
//
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

#define BUNDLE_NAME @"M0038_CarNetMap"

@interface BundleTools : NSObject


+ (NSString *)getBundlePath: (NSString *) assetName;
+ (NSBundle *)getBundle;
+ (UIImage *)imageNamed:(NSString *)image;
@end

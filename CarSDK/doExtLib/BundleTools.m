//
//  BundleTools.m
//  doExtLib
//
//  Created by bolaa on 2018/7/12.
//

#import "BundleTools.h"

@implementation BundleTools


+ (NSBundle *)getBundle{
    
    return [NSBundle bundleWithPath: [[NSBundle mainBundle] pathForResource: BUNDLE_NAME ofType: @"bundle"]];
}

+(UIImage *)imageNamed:(NSString *)image{
    return [UIImage imageNamed:image inBundle:[BundleTools getBundle] compatibleWithTraitCollection:nil];
}

+ (NSString *)getBundlePath: (NSString *) assetName{
    
    NSBundle *myBundle = [BundleTools getBundle];
    
    if (myBundle && assetName) {
        
        return [[myBundle resourcePath] stringByAppendingPathComponent: assetName];
    }
    
    return nil;
}

@end

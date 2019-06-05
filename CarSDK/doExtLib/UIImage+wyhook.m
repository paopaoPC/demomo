
//
//  UIimage+wyhook.m
//  doExtLib
//
//  Created by bolaa on 2018/8/13.
//

#import "UIImage+wyhook.h"

@implementation UIImage (wyhook)

+(UIImage *)hookImageNamed:(NSString *)name{
    if ([name containsString:@"mainpage_bg"]) {
        return [self hookImageNamed:@"homeBg.png"];
    }else{
        return [self hookImageNamed:name];
    }
}

@end

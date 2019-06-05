//
//  UILabel+Extension.m
//  YTS
//
//  Created by 傅祚鹏 on 16/2/4.
//  Copyright © 2016年 Rusted. All rights reserved.
//

#import "UILabel+Extension.h"

@implementation UILabel (Extension)

+ (CGSize)sizeWithText:(NSString *)text font:(UIFont *)font maxW:(CGFloat)maxW
{
    NSMutableDictionary *attrs = [NSMutableDictionary dictionary];
    attrs[NSFontAttributeName] = font;
    CGSize maxSize = CGSizeMake(maxW, MAXFLOAT);
    return [text boundingRectWithSize:maxSize options:NSStringDrawingUsesLineFragmentOrigin attributes:attrs context:nil].size;
}

+ (CGSize)sizeWithText:(NSString *)text font:(UIFont *)font
{
    return [self sizeWithText:text font:font maxW:MAXFLOAT];
}

- (void)autoSize{
    CGSize maximumLabelSize = CGSizeMake(MAXFLOAT, self.font.pointSize);
    CGSize expectSize = [self sizeThatFits:maximumLabelSize];
    CGRect frame = self.frame;
    frame.size.width = expectSize.width;
    frame.size.height = expectSize.height;
    self.frame = frame;
}

- (void)resizeWidthUpTo:(CGFloat)max{
    CGSize maximumLabelSize = CGSizeMake(MAXFLOAT, self.font.pointSize);
    CGSize expectSize = [self sizeThatFits:maximumLabelSize];
    CGRect frame = self.frame;
    frame.size.width = expectSize.width > max ? max : expectSize.width;
    self.frame = frame;
}
@end

//
//  NSObject+wyhook.m
//  doExtLib
//
//  Created by bolaa on 2018/8/2.
//
#import "NSObject+wyhook.h"
#import <objc/message.h>
@implementation NSObject (wyhook)

- (CGFloat)hookTableView:(UITableView *)tableView estimatedHeightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return [(id <UITableViewDelegate>)self tableView:tableView heightForRowAtIndexPath:indexPath];
}
@end

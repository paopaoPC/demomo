//
//  NSObject+wyhook.h
//  doExtLib
//
//  Created by bolaa on 2018/8/2.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface NSObject (wyhook)
- (CGFloat)hookTableView:(UITableView *)tableView estimatedHeightForRowAtIndexPath:(NSIndexPath *)indexPath;
@end

//
//  DrivingRouteViewController.h
//  chameleon
//
//  Created by Checker on 16/2/24.
//
//

#import <UIKit/UIKit.h>
#import "DotCDictionaryWrapper.h"

@interface DrivingRouteViewController : UIViewController

- (instancetype) initWithData:(DotCDictionaryWrapper*)data;
- (void) updateItemData:(DotCDictionaryWrapper*)data at:(int)index;
@property (copy, nonatomic)NSString *carDevice;
@end

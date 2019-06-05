//
//  NaviRoutesViewController.h
//  chameleon
//
//  Created by Checker on 16/2/16.
//
//

#import <UIKit/UIKit.h>

#import <CoreLocation/CoreLocation.h>
@interface NaviRoutesViewController : UIViewController

- (instancetype)initWithSrc:(CLLocationCoordinate2D)src dst:(CLLocationCoordinate2D) dst addr:(NSString*)addr;

@end

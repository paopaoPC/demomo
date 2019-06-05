//
//  DrivingRouteItemViewController.h
//  chameleon
//
//  Created by Checker on 16/2/24.
//
//

#import <UIKit/UIKit.h>

#import "DotCDictionaryWrapper.h"

typedef struct
{
    float lat;
    float lng;
} SCoordLocation;

@interface DrivingRouteItemViewController : UIViewController
@property (weak, nonatomic) IBOutlet UILabel *pageCountLabel;
- (instancetype) initWithRouteID:(NSString*)routeID;
- (void) setDrivingData:(DotCDictionaryWrapper*)data;
- (DotCDictionaryWrapper*) drivingData;
- (NSString*) routeID;
- (SCoordLocation*) coordLocations;
- (int) coordLocationCount;
- (NSArray*)speedUpPoints;
- (NSArray*)speedDownPoints;
- (NSArray*)sharpTurnPoints;
- (int) speedUpCount;
- (int) speedDownCount;
- (int) sharpTurnCount;
@end

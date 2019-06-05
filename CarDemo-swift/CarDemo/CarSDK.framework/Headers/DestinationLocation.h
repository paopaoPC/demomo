//
//  DestinationLocation.h
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/26.
//
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
@interface DestinationLocation : NSObject<NSCoding>

@property (nonatomic, copy)NSString *name;
@property (nonatomic, copy)NSString *address;
@property (nonatomic, assign)CLLocationCoordinate2D coordinate;
@property (nonatomic, assign ,getter=isSaved)BOOL saved;

@end

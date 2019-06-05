//
//  DestinationLocation.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/26.
//
//

#import "DestinationLocation.h"

@implementation DestinationLocation

- (void)encodeWithCoder:(NSCoder *)aCoder{
    [aCoder encodeObject:_name forKey:@"name"];
    [aCoder encodeObject:_address forKey:@"address"];
    [aCoder encodeObject:[NSNumber numberWithFloat:_coordinate.latitude] forKey:@"latitude"];
    [aCoder encodeObject:[NSNumber numberWithFloat:_coordinate.longitude] forKey:@"longitude"];
}


- (instancetype)initWithCoder:(NSCoder *)aDecoder{
    self = [super init];
    if (self) {
        self.name = [aDecoder decodeObjectForKey:@"name"];
        self.address = [aDecoder decodeObjectForKey:@"address"];
        CLLocationCoordinate2D location;
        location.latitude = [[aDecoder decodeObjectForKey:@"latitude"] floatValue];
        location.longitude = [[aDecoder decodeObjectForKey:@"longitude"] floatValue];
        self.coordinate = location;
    }
    return self;
}

@end

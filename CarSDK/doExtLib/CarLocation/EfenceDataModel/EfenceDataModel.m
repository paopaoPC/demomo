//
//  EfenceDataModel.m
//  chameleon
//
//  Created by Foreveross on 16/3/30.
//
//

#import "EfenceDataModel.h"
//#import "AppDelegate.h"
#import "M0038_CarNetMap_App.h"
#import "CLLocationManager+Extension.h"
@implementation EfenceDataModel

+ (EfenceDataModel *)generateDataModelWithData:(NSDictionary *)data{
    EfenceDataModel *dataModel = [[EfenceDataModel alloc]init];
//    DEBUG_LOG(@"%@",data);
    
    NSString *point = [data objectForKey:@"point"];
    
    NSArray * temp = [point componentsSeparatedByString:@","];
    
    if (temp.count > 1 && ![temp[0] isEqualToString:@""] ) {
        dataModel.distance = [NSString stringWithFormat:@"%@",[data objectForKey:@"distance"]];
        
        
        CLLocationCoordinate2D originGPS = CLLocationCoordinate2DMake([temp[1] floatValue], [temp[0] floatValue]);
        dataModel.point = [CLLocationManager tranferGPSToAMap:originGPS];
        
//        dataModel.point = CLLocationCoordinate2DMake([temp[1] floatValue], [temp[0] floatValue]);
        dataModel.notifyType = [data objectForKey:@"notifyType"];
        dataModel.isDefaultData = NO;
        if ([data objectForKey:@"status"] && ![[data objectForKey:@"status"] isKindOfClass:[NSNull class]]) {
            NSString *status = (NSString *)[data objectForKey:@"status"];
            ([status isEqualToString:@"ACTIVE"]) ? (dataModel.isActivated = YES ) : (dataModel.isActivated = NO);
        }
        if ([[data objectForKey:@"fenceName"] isKindOfClass:[NSString class]]) {
            dataModel.name = [data objectForKey:@"fenceName"];
        }else{
            dataModel.name = @"我的围栏";
        }
        dataModel.fenceId = [data objectForKey:@"fenceId"];
        dataModel.notifyPhone = [NSString stringWithFormat:@"%@",[data objectForKey:@"notifyPhone"]];
    }else{//数据不存在，初始化数据
        dataModel.distance = @"5000";
        dataModel.point = CLLocationCoordinate2DMake(0.0, 0.0);
        dataModel.notifyType = @"outwarn";
        dataModel.isDefaultData = YES;
        dataModel.isActivated = YES;
        dataModel.name = @"我的围栏";
        dataModel.fenceId = @"";
        dataModel.notifyPhone = [[NSUserDefaults standardUserDefaults] stringForKey:@"phone"];;
    }
    return dataModel;
}

+ (void)updateFenceData:(EfenceDataModel *)dataModel{
    NSString *name = dataModel.name;
    NSString *fenceId = dataModel.fenceId;
    NSString *distance = dataModel.distance;
    
    CLLocationCoordinate2D amap = CLLocationCoordinate2DMake(dataModel.point.latitude,dataModel.point.longitude);
    CLLocationCoordinate2D gps = [CLLocationManager convertAMapToGPS:amap];
    NSString *lng = [NSString stringWithFormat:@"%lf",gps.longitude];
    NSString *lat = [NSString stringWithFormat:@"%lf",gps.latitude];
    
    NSString *notifyPhone = dataModel.notifyPhone;
    NSString *notifyType = dataModel.notifyType;
    NSString *status = dataModel.isActivated ? @"ACTIVE" : @"INACTIVE";
    NSString *jsStr = [NSString stringWithFormat:@"setElectFenceDatas('%@','%@','%@','%@','%@','%@','%@','%@')",name,fenceId,distance,lng,lat,notifyPhone,notifyType,status];
    [[DoEventManager shared] javaScriptCallMethod:jsStr];
}


+ (void)clearFenceData:(NSString *)fenceId{
    NSString *js = [NSString stringWithFormat:@"cancelFence('%@')",fenceId];
    [[DoEventManager shared] javaScriptCallMethod:js];
}


- (NSString *)adaptRadiusContent{
    NSInteger rad = [self.distance integerValue];
    if (rad >= 1000) {
        return [NSString stringWithFormat:@"%ld公里",rad/1000];
    }else{
        return [NSString stringWithFormat:@"%ld米",(long)rad];
    }
}

#pragma mark -- NSMutableCopying


- (id)mutableCopyWithZone:(NSZone *)zone{
    EfenceDataModel *model = [[EfenceDataModel allocWithZone:zone]init];
    model.point = self.point;
    model.distance = self.distance;
    model.notifyType = self.notifyType;
    model.notifyPhone = self.notifyPhone;
    model.isActivated = self.isActivated;
    model.isDefaultData = self.isDefaultData;
    return model;
}

@end

//
//  RoutePlanBlockView.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/26.
//
//

#import "RoutePlanBlockView.h"
#import "UIView+Extension.h"
#import "DestinationLocation.h"
#import "SVProgressHUD.h"
#import "NaviPointAnnotation.h"
#import "CHXColor.h"
#import "BundleTools.h"
#define BorderColor [UIColor colorWithRed:236/255.f green:236/255.f blue:236/255.f alpha:1]
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface RoutePlanSegment : UIView
@end

@protocol RoutePlanSegmentDelegate <NSObject>

@optional

- (void)didSelectSegment:(RoutePlanSegment*)routePlanSegment;

@end

@interface RoutePlanSegment()
@property (assign, nonatomic)id<RoutePlanSegmentDelegate>delegate;
@property (weak, nonatomic) IBOutlet UILabel *planName;
@property (weak, nonatomic) IBOutlet UILabel *timeCost;
@property (weak, nonatomic) IBOutlet UILabel *distance;
@property (assign,nonatomic,getter=isSelected)BOOL selected;

@end
@implementation RoutePlanSegment

- (instancetype)initWithDelegate:(id<RoutePlanSegmentDelegate>)delegate{
    self = [[[BundleTools getBundle] loadNibNamed:@"RoutePlanSegment" owner:nil options:nil] firstObject];
    if (self) {
        self.delegate = delegate;
        [self resetFont];
    }
    return self;
}

- (void)resetFont{
    self.planName.font = [UIFont systemFontOfSize:self.planName.font.pointSize*factor_h];
    self.timeCost.font = [UIFont systemFontOfSize:self.timeCost.font.pointSize*factor_h];
    self.distance.font = [UIFont systemFontOfSize:self.distance.font.pointSize*factor_h];
}

- (void)setSelected:(BOOL)selected{
    _selected = selected;
    if (selected) {
  
        _planName.textColor = _timeCost.textColor = _distance.textColor =       [UIColor colorWithRed:9/255.f green:170/255.f blue:236/255.f alpha:1];
    }else{
        _planName.textColor = _timeCost.textColor = _distance.textColor =       [UIColor colorWithRed:102/255.f green:102/255.f blue:102/255.f alpha:1];
    }
}

- (IBAction)segmentSelected:(UIButton *)sender {
    if (self.delegate && [self.delegate respondsToSelector:@selector(didSelectSegment:)]) {
        [self.delegate didSelectSegment:self];
    }
}

@end

@interface RoutePlanBlockView()<AMapNaviDriveManagerDelegate,RoutePlanSegmentDelegate>

@property (weak, nonatomic) IBOutlet UIView *segmentContainer;

@property (weak, nonatomic)RoutePlanSegment *currentSelectedSegment;

@property (strong, nonatomic)NSArray *allSegments;

@property (weak, nonatomic)UIView *selecetIndicator;

@property (assign, nonatomic)CLLocationCoordinate2D startCoordinate;
@property (assign, nonatomic)CLLocationCoordinate2D destinationCoordinate;
@property (strong, nonatomic)NSArray *wayPoints;

@property (weak, nonatomic) IBOutlet UIButton *retryBtn;


@end


@implementation RoutePlanBlockView

#pragma mark --- Init Methods

- (instancetype)initWithDelegate:(id<RoutePlanBlockViewDelegate>)delegate{
    self = [[[BundleTools getBundle] loadNibNamed:@"RoutePlanBlockView" owner:nil options:nil] firstObject];
    if (self) {
        self.delegate = delegate;
        self.driveManager = [[AMapNaviDriveManager alloc]init];
        self.driveManager.delegate = self;
        self.width = SCREEN_W;
        self.height *= factor_h;
        self.x = 0;
        self.y = SCREEN_H - self.height;
        [self setShadowForColor:[UIColor grayColor] offset:CGSizeMake(0, 0) opacity:0.1 radius:2];
    }
    return self;
}

- (void)initSegmentsForCount:(NSInteger)count{
    
    // 解决视图重合现象
    for (UIView *segment in self.allSegments) {
        [segment removeFromSuperview];
    }
    
    NSMutableArray *arr = [NSMutableArray new];
    for (int i = 0;i < count; i ++) {
        RoutePlanSegment *segment = [self createSegmentWithName:[NSString stringWithFormat:@"方案%d",i+1] tag:i];
        [_segmentContainer addSubview:segment];
        [arr addObject:segment];
    }
    self.allSegments = [NSArray arrayWithArray:arr];
    
    for (int i = 0; i < _allSegments.count; i ++) {
        RoutePlanSegment *seg = _allSegments[i];
        seg.width = self.segmentContainer.width / _allSegments.count;
        seg.x = i * seg.width;
        if (i == 0) {
            seg.selected = YES;
            _currentSelectedSegment = seg;
        }
    }
    UIView *indicator = [[UIView alloc]initWithFrame:CGRectMake(0, 0, _segmentContainer.width/_allSegments.count, 2.5*factor_h)];
    [_segmentContainer addSubview:indicator];
    _selecetIndicator = indicator;
   
    _selecetIndicator.backgroundColor = [UIColor colorWithRed:9/255.f green:170/255.f blue:236/255.f alpha:1];
    _selecetIndicator.layer.cornerRadius = _selecetIndicator.height/2;
}

- (RoutePlanSegment *)createSegmentWithName:(NSString *)name tag:(NSInteger)tag{
    RoutePlanSegment *segment = [[RoutePlanSegment alloc]initWithDelegate:self];
    segment.planName.text = name;
    segment.tag = tag;
    segment.height = self.segmentContainer.height;
    segment.y = 0;
    return segment;
}

#pragma mark --- Public Methods

- (void)resetSegment{
    for (RoutePlanSegment *segment in _allSegments) {
        segment.distance.text = @"--公里";
        segment.timeCost.text = @"--分钟";
    }
    _currentSelectedSegment.selected = NO;
    _currentSelectedSegment = _allSegments[0];
    _currentSelectedSegment.selected = YES;
    [self indicatorMoveToSegment:_currentSelectedSegment];
}

#pragma mark --- Private Methods

- (void)indicatorMoveToSegment:(RoutePlanSegment*)segment{
    [UIView animateWithDuration:0.3 animations:^{
        _selecetIndicator.x = segment.x;
    }];
}


- (void)searchDrivingRouteWithAnnotaions:(NSArray *)nodes{
    NaviPointAnnotation *start = [nodes firstObject];
    NaviPointAnnotation *end = [nodes lastObject];
    
    NSMutableArray *waypoints = [NSMutableArray array];
    for (int i = 1; i < nodes.count - 1; i ++) {
        NaviPointAnnotation *way = nodes[i];
        [waypoints addObject:way];
    }
    [self searchDrivingRouteWithStart:start.coordinate end:end.coordinate waypoints:waypoints];
}


- (void)searchDrivingRouteWithStart:(CLLocationCoordinate2D)start end:(CLLocationCoordinate2D)end waypoints:(NSArray *)waypoints{
    _startCoordinate = start;
    _destinationCoordinate = end;
    _wayPoints = waypoints.count > 0 ? waypoints : nil;
    [self resetSegment];
    AMapNaviPoint *from = [AMapNaviPoint locationWithLatitude:start.latitude longitude:start.longitude];
    AMapNaviPoint *to = [AMapNaviPoint locationWithLatitude:end.latitude longitude:end.longitude];
    NSMutableArray *tempArr = [NSMutableArray new];
    if (waypoints && waypoints.count > 0) {
        for (DestinationLocation *waypoint in waypoints) {
            AMapNaviPoint *node = [AMapNaviPoint locationWithLatitude:waypoint.coordinate.latitude longitude:waypoint.coordinate.longitude];;
            [tempArr addObject:node];
        }
    }
    [_driveManager calculateDriveRouteWithStartPoints:@[from] endPoints:@[to] wayPoints:tempArr drivingStrategy:AMapNaviDrivingStrategyMultipleAvoidCongestion];
}

#pragma mark --- Events

- (IBAction)retryBtn:(UIButton *)sender {
    [sender setTitle:@"正在查找路线..." forState:UIControlStateNormal];
    [SVProgressHUD showWithMaskType:SVProgressHUDMaskTypeBlack];
    [self searchDrivingRouteWithStart:_startCoordinate end:_destinationCoordinate waypoints:_wayPoints];
}


- (IBAction)startNavi:(UIButton *)sender {
    if (!_allSegments || _allSegments.count == 0) {
        return;
    }
    if (self.delegate && [self.delegate respondsToSelector:@selector(didClickStartNavigateBtn:)]) {
        [self.delegate didClickStartNavigateBtn:self];
    }
}

#pragma mark --- RoutePlanSegmentDelegate

- (void)didSelectSegment:(RoutePlanSegment *)routePlanSegment{
    if ([routePlanSegment.distance.text isEqualToString:@"--公里"]) {
        return;
    }
    if (_currentSelectedSegment.tag == routePlanSegment.tag) {
        return;
    }else{
        _currentSelectedSegment.selected = NO;
        routePlanSegment.selected = YES;
        _currentSelectedSegment = routePlanSegment;
        [self indicatorMoveToSegment:_currentSelectedSegment];
        if (self.delegate && [self.delegate respondsToSelector:@selector(routePlanBlockView:didSelectSegment:)]) {
            [_delegate routePlanBlockView:self didSelectSegment:routePlanSegment.tag];
        }
    }
}

#pragma mark --- AMapNaviDriveManagerDelegate

- (void)driveManager:(AMapNaviDriveManager *)driveManager error:(NSError *)error
{
    NSLog(@"error:{%ld - %@}", (long)error.code, error.localizedDescription);
}

- (void)driveManagerOnCalculateRouteSuccess:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"onCalculateRouteSuccess");
    if ([self.driveManager.naviRoutes count] <= 0)
    {
        return;
    }
    [_retryBtn setHidden:YES];
    NSMutableArray *naviRoutes = [NSMutableArray array];
    NSArray *keys = [self.driveManager.naviRoutes allKeys];
//    NSInteger count = keys.count <= 3 ? keys.count : 3;
    [self initSegmentsForCount:keys.count];
    for (NSInteger i = 0; i < keys.count; i ++) {
        NSNumber *aRouteID = keys[i];
        RoutePlanSegment *segment = _allSegments[i];
        AMapNaviRoute *aRoute = [[self.driveManager naviRoutes] objectForKey:aRouteID];
        [naviRoutes addObject:aRoute];
        NSInteger lightNum = aRoute.routeTrafficLightCount;      //红绿灯个数
        NSInteger  distance = aRoute.routeLength;                 //总距离，单位米
        NSInteger  totalTime = aRoute.routeTime;                    //秒
        
        NSInteger hours = totalTime / 3600;
        
        NSString *timeCost;
        if (hours > 24) {
            timeCost = [NSString stringWithFormat:@"%ld天%ld小时",hours/24,hours%24];
        }
        
        if (hours < 24 && hours > 0 ) {
            
            if (totalTime % 3600/ 60 == 0) {
                timeCost = [NSString stringWithFormat:@"%ld小时",hours];
            }else{
                timeCost = [NSString stringWithFormat:@"%ld小时%ld分钟",hours,totalTime % 3600/ 60];
            }
        }
        
        if (hours == 0) {
            timeCost = [NSString stringWithFormat:@"%ld分钟",totalTime / 60];
        }
        
        if (totalTime < 60) {
            timeCost = [NSString stringWithFormat:@"少于一分钟"];
        }
        
        
        segment.timeCost.text = timeCost;
        
        if (distance < 1000) {
            segment.distance.text = [NSString stringWithFormat:@"%ld米",(long)distance];
        }else{
            segment.distance.text = [NSString stringWithFormat:@"%ld公里",distance/1000];
        }

    }
    if (self.delegate && [self.delegate respondsToSelector:@selector(onGetDrivingSearchResult:naviRouts:)]) {
        [self.delegate onGetDrivingSearchResult:self naviRouts:self.driveManager.naviRoutes];
    }
}

- (void)driveManager:(AMapNaviDriveManager *)driveManager onCalculateRouteFailure:(NSError *)error
{
    NSLog(@"onCalculateRouteFailure:{%ld - %@}", (long)error.code, error.localizedDescription);
    [SVProgressHUD dismiss];
    [_retryBtn setTitle:@"查找路线失败，点击重试" forState:UIControlStateNormal];
    [_retryBtn setHidden:NO];
}

- (void)driveManager:(AMapNaviDriveManager *)driveManager didStartNavi:(AMapNaviMode)naviMode
{
    NSLog(@"didStartNavi");
}

- (void)driveManagerNeedRecalculateRouteForYaw:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"needRecalculateRouteForYaw");
}

- (void)driveManagerNeedRecalculateRouteForTrafficJam:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"needRecalculateRouteForTrafficJam");
}

- (void)driveManager:(AMapNaviDriveManager *)driveManager onArrivedWayPoint:(int)wayPointIndex
{
    NSLog(@"onArrivedWayPoint:%d", wayPointIndex);
}

- (void)driveManager:(AMapNaviDriveManager *)driveManager playNaviSoundString:(NSString *)soundString soundStringType:(AMapNaviSoundType)soundStringType
{
    NSLog(@"playNaviSoundString:{%ld:%@}", (long)soundStringType, soundString);
    if (self.delegate && [self.delegate respondsToSelector:@selector(routePlanBlockView:playNaviSoundString:)]) {
        [self.delegate routePlanBlockView:self playNaviSoundString:soundString];
    }
}

- (void)driveManagerDidEndEmulatorNavi:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"didEndEmulatorNavi");
}

- (void)driveManagerOnArrivedDestination:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"onArrivedDestination");
}

@end

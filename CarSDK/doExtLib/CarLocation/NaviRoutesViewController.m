//
//  NaviRoutesViewController.m
//  chameleon
//
//  Created by Checker on 16/2/16.
//
//
#import "BundleTools.h"
#import "NaviRoutesViewController.h"
#import "SVProgressHUD.h"
#import "UIImage+Rotate.h"
#import "UIView+Extension.h"
#import "NaviPointAnnotation.h"
#import "SpeechSynthesizer.h"
#import <AMapNaviKit/AMapNaviKit.h>
#import "BundleTools.h"
#import <AMapSearchKit/AMapSearchKit.h>
@interface NaviRoutesViewController ()<MAMapViewDelegate,AMapNaviDriveManagerDelegate,AMapNaviDriveViewDelegate,AMapSearchDelegate>
{
    CLLocationCoordinate2D  _src;
    CLLocationCoordinate2D  _dst;
    NSString*               _addr;
    
    AMapNaviPoint*          _startPoint;
    AMapNaviPoint*          _endPoint;
    AMapNaviDrivingStrategy _drivingPlan;
    MAMapView*              _mapView;
    AMapNaviDriveManager*   _driveManager;
    AMapNaviDriveView*      _driveView;
    AMapSearchAPI*          _search;
}
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn1;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *backIma;
@property (weak, nonatomic) IBOutlet UILabel *carAddrView;
@property (weak, nonatomic) IBOutlet UILabel *carTimeView;
@property (weak, nonatomic) IBOutlet UIView *naviOperBlockView;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn2;

@end

@implementation NaviRoutesViewController
- (instancetype)init
{
    self = [super initWithNibName:NSStringFromClass(self.class) bundle:[BundleTools getBundle]];
    if (self) {
        
    }
    return self;
}
- (instancetype)initWithSrc:(CLLocationCoordinate2D)src dst:(CLLocationCoordinate2D) dst addr:(NSString*)addr
{
    if(!(self = [self init]))
    {
        return nil;
    }
    self.backIma.image = [BundleTools imageNamed:@"back.png"];
    [self.btn1 setImage:[BundleTools imageNamed:@"路况关闭"] forState:0];
    [self.btn1 setImage:[BundleTools imageNamed:@"路况"] forState:UIControlStateSelected];
    [self.btn2 setImage:[UIImage imageNamed:@"开始导航"] forState:0];
    _src = src;
    _dst = dst;
    if (addr && ![addr isEqualToString:@""]) {
        _search = [[AMapSearchAPI alloc]init];
        _search.delegate = self;
    }
    _addr = addr;
    
    return self;
}
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    // Do any additional setup after loading the view from its nib.
    
    float deviceSystem = [[[UIDevice currentDevice] systemVersion] floatValue];
    if (deviceSystem <= 7.0)
    {
        UIView* statusBar = [self.view viewWithTag:1];
        statusBar.hidden  = true;
        UIView* content   = [self.view viewWithTag:2];
        content.frame     = self.view.frame;
    }
    
    self.view.width = [UIScreen mainScreen].bounds.size.width;
    self.view.height = [UIScreen mainScreen].bounds.size.height;
    
    UIView* mapContainer = [self.view viewWithTag:3];
    
    CGRect frame = mapContainer.frame;
    frame.origin.x = 0;
    frame.origin.y = 0;
    _mapView = [[MAMapView alloc]initWithFrame:frame];
    [mapContainer addSubview:_mapView];
    _mapView.delegate = self;
    _mapView.showsScale = NO;
    _mapView.showsCompass = NO;
    MACoordinateRegion region;
    region.center.longitude = (_src.longitude+_dst.longitude)*0.5;
    region.center.latitude  = (_src.latitude+_dst.latitude)*0.5;
    region.span.latitudeDelta = fabs(_src.latitude-region.center.latitude)*3;
    region.span.longitudeDelta = fabs(_src.longitude-region.center.longitude)*3;
    [_mapView setRegion:region];
    _drivingPlan = 0;
    _startPoint = [[AMapNaviPoint alloc]init];
    _endPoint = [[AMapNaviPoint alloc]init];
    _startPoint.latitude = _src.latitude;
    _startPoint.longitude = _src.longitude;
    _endPoint.longitude = _dst.longitude;
    _endPoint.latitude = _dst.latitude;
    _driveManager = [[AMapNaviDriveManager alloc]init];
    _driveManager.delegate = self;
    
    _driveView = [[AMapNaviDriveView alloc] initWithFrame:self.view.bounds];
    _driveView.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    [_driveView setDelegate:self];
    [self.view addSubview:_driveView];
    _driveView.hidden = YES;
    [_driveManager addDataRepresentative:_driveView];
    
    if (_addr == nil || [_addr isEqualToString:@""]) {
        _carAddrView.text = @"";
        AMapReGeocodeSearchRequest *regeo = [[AMapReGeocodeSearchRequest alloc] init];
        
        regeo.location                    = [AMapGeoPoint locationWithLatitude:_src.latitude longitude:_src.longitude];
        regeo.requireExtension            = YES;
        
        [_search AMapReGoecodeSearch:regeo];
    }else{
        _carAddrView.text = _addr;
    }

    [self startRoutePlan];
    
    _mapView.showTraffic = NO;
    
    _naviOperBlockView.alpha = 0.95;
}

- (void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
    NaviPointAnnotation *start = [[NaviPointAnnotation alloc]init];
    start.title = @"起点";
    start.navPointType = NaviPointAnnotationStart;
    start.coordinate = _src;
    NaviPointAnnotation *end = [[NaviPointAnnotation alloc]init];
    end.title = @"终点";
    end.navPointType = NaviPointAnnotationEnd;
    end.coordinate = _dst;
    [_mapView addAnnotations:@[start,end]];
}

- (void) startRoutePlan
{
    [_driveManager calculateDriveRouteWithStartPoints:@[_startPoint] endPoints:@[_endPoint] wayPoints:nil drivingStrategy:_drivingPlan];
}


- (IBAction)onBack:(UIButton *)sender
{
    [self.navigationController popViewControllerAnimated:true];
}

- (IBAction)onSwitchTraffic:(UIButton *)sender
{
    _mapView.showTraffic = !_mapView.showTraffic;
    
    sender.selected = _mapView.showTraffic;
}

- (IBAction)onNavi:(id)sender
{
    [_driveManager startGPSNavi];
    _driveView.hidden = NO;
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
}


- (IBAction)onPolicyChanged:(UISegmentedControl *)sender
{
    self.carTimeView.text = @"正在绘制路线";
    if (sender.selectedSegmentIndex == 0) {
        _drivingPlan = AMapNaviDrivingStrategySingleDefault;
    }else if (sender.selectedSegmentIndex == 1){
        _drivingPlan = AMapNaviDrivingStrategySinglePrioritiseDistance;
    }else if (sender.selectedSegmentIndex == 2){
        _drivingPlan = AMapNaviDrivingStrategySingleAvoidHighway;
    }
    [self startRoutePlan];
}

- (void)routePlanDidFailedWithError:(NSError *)error andUserInfo:(NSDictionary*)userInfo;
{
    [SVProgressHUD showErrorWithStatus:@"导航失败"];
}

#pragma mark - Private methods
/**
 *  通过百度地图计算的路线，获得距离和时间，并根据内容选择展示内容
 *  @return 计算好后返回字符串用于显示
 */
- (NSString *)calculateDistanceAndDuration:(AMapNaviRoute *)aRoute{
    long time = (long)aRoute.routeTime;
    long distance = (long)aRoute.routeLength;
    NSString *distanceText;
    NSString *durationText;
    if (distance < 1000) {
        distanceText = [NSString stringWithFormat:@"距您%ld米",distance];
    }else if (distance == 1000){
        distanceText = @"距您1公里";
    }else{
        distanceText = [NSString stringWithFormat:@"距您%.2lf公里",(float)distance/1000];
    }
    
    if (time < 3600) {
        
        durationText = [NSString stringWithFormat:@"%@",[NSString stringWithFormat:@"%ld分钟",time/60]];
        
    }else{
        long hour = time / 3600;
        long min = time % 3600 / 60;
        durationText = [NSString stringWithFormat:@"%@",[NSString stringWithFormat:@"%ld小时%ld分钟",hour,min]];
    }
    
    return [NSString stringWithFormat:@"%@   %@",distanceText,durationText];
}

- (void)showNaviRoutes{
    if ([_driveManager.naviRoutes count] <= 0)
    {
        return;
    }
    [_mapView removeOverlays:_mapView.overlays];
    
    //将路径显示到地图上
    for (NSNumber *aRouteID in [_driveManager.naviRoutes allKeys])
    {
        AMapNaviRoute *aRoute = [[_driveManager naviRoutes] objectForKey:aRouteID];
        int count = (int)[[aRoute routeCoordinates] count];
        self.carTimeView.text = [self calculateDistanceAndDuration:aRoute];
        //添加路径Polyline
        CLLocationCoordinate2D *coords = (CLLocationCoordinate2D *)malloc(count * sizeof(CLLocationCoordinate2D));
        for (int i = 0; i < count; i++)
        {
            AMapNaviPoint *coordinate = [[aRoute routeCoordinates] objectAtIndex:i];
            coords[i].latitude = [coordinate latitude];
            coords[i].longitude = [coordinate longitude];
        }
        
        MAPolyline *polyline = [MAPolyline polylineWithCoordinates:coords count:count];
        [_mapView addOverlay:polyline];
        free(coords);
        
    }
}

#pragma mark --- MAMapViewDelegate

- (MAOverlayRenderer *)mapView:(MAMapView *)mapView rendererForOverlay:(id<MAOverlay>)overlay{
    if ([overlay isKindOfClass:[MAPolyline class]]) {
        MAPolylineRenderer *polylineRenderer = [[MAPolylineRenderer alloc]initWithPolyline:overlay];
        polylineRenderer.lineWidth = 8.0f;
//        polylineRenderer.strokeColor = [UIColor colorWithRed:0.035 green:0.667 blue:0.925 alpha:1.000];
////        polylineRenderer.fillColor = [UIColor colorWithRed:0.035 green:0.667 blue:0.925 alpha:1.000];
        [polylineRenderer loadStrokeTextureImage:[BundleTools imageNamed:@"arrowTexture0"]];
        return polylineRenderer;
    }
    return nil;
}

- (MAAnnotationView *)mapView:(MAMapView *)mapView viewForAnnotation:(id<MAAnnotation>)annotation{
    if ([annotation isKindOfClass:[NaviPointAnnotation class]]) {
        NSString *annotationIdentifier = @"NaviPointAnnotationIdentifier";
        MAPinAnnotationView *pointAnnotationView = (MAPinAnnotationView*)[_mapView dequeueReusableAnnotationViewWithIdentifier:annotationIdentifier];
        if (pointAnnotationView == nil)
        {
            pointAnnotationView = [[MAPinAnnotationView alloc] initWithAnnotation:annotation
                                                                  reuseIdentifier:annotationIdentifier];
        }
        
        pointAnnotationView.animatesDrop   = NO;
        pointAnnotationView.canShowCallout = YES;
        pointAnnotationView.draggable      = NO;
        
        NaviPointAnnotation *navAnnotation = (NaviPointAnnotation *)annotation;
        
        if (navAnnotation.navPointType == NaviPointAnnotationStart)
        {
            pointAnnotationView.image = [BundleTools imageNamed:@"起"];
        }
        else if (navAnnotation.navPointType == NaviPointAnnotationEnd)
        {
            pointAnnotationView.image = [BundleTools imageNamed:@"终"];
        }
        
        return pointAnnotationView;

    }
    return nil;
}
#pragma mark --- AMapNaviDriveManagerDelegate

- (void)driveManager:(AMapNaviDriveManager *)driveManager error:(NSError *)error
{
    NSLog(@"error:{%ld - %@}", (long)error.code, error.localizedDescription);
}

- (void)driveManagerOnCalculateRouteSuccess:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"onCalculateRouteSuccess");
    //算路成功后显示路径
    [self showNaviRoutes];
}

- (void)driveManager:(AMapNaviDriveManager *)driveManager onCalculateRouteFailure:(NSError *)error
{
    NSLog(@"onCalculateRouteFailure:{%ld - %@}", (long)error.code, error.localizedDescription);
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
    [[SpeechSynthesizer sharedSpeechSynthesizer] speakString:soundString];
}

- (void)driveManagerDidEndEmulatorNavi:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"didEndEmulatorNavi");
}

- (void)driveManagerOnArrivedDestination:(AMapNaviDriveManager *)driveManager
{
    NSLog(@"onArrivedDestination");
}

#pragma mark --- AMapNaviDriveViewDelegate

- (void)driveViewCloseButtonClicked:(AMapNaviDriveView *)driveView
{
    //停止导航
    [_driveManager stopNavi];
    
    //停止语音
    [[SpeechSynthesizer sharedSpeechSynthesizer] stopSpeak];
    
    _driveView.hidden = YES;
    [[UIApplication sharedApplication] setStatusBarHidden:NO];
}

#pragma mark --- AMapSearchDelegate

- (void)onReGeocodeSearchDone:(AMapReGeocodeSearchRequest *)request response:(AMapReGeocodeSearchResponse *)response{
    if (response.regeocode != nil)
    {
        _carAddrView.text = response.regeocode.formattedAddress;
    }
}

@end

//
//  BaiduMapViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/21.
//
//

#import "BaiduMapViewController.h"
#import "UIView+Extension.h"
#import "DestinationBlockView.h"
#import "CLLocationManager+Extension.h"
#import "DestinationLocation.h"
#import "WayPointBlockView.h"
#import "RTSearchViewController.h"
#import "SVProgressHUD.h"
#import "NaviPointAnnotation.h"
#import "UIImage+Rotate.h"
//#import "AppDelegate.h"
#import "BundleTools.h"
#import "RoutePlanViewController.h"
#import "NSString+Extension.h"
#import "PinAuth.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
//#import "NSDictionary+JSONSerialization.h"
static UIView *currentDislpayedBlock;  //当前正在显示的视图

@interface BaiduMapViewController ()<DestinationBlockViewDelegate,WayPointBlockViewDelegate,MAMapViewDelegate>
@property (weak, nonatomic) IBOutlet UIButton *backBtn;
@property (weak, nonatomic) IBOutlet UIButton *waypointBtn;
@property (weak, nonatomic) IBOutlet UIButton *searchWayPoint;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn1;

@property (weak,nonatomic)id<BaiduMapViewControllerDelegate> delegate;
@property (weak, nonatomic) IBOutlet MAMapView *mapView;
@property (weak, nonatomic)DestinationBlockView *destinationView;
@property (weak, nonatomic)WayPointBlockView *wayPointView;

@property (strong, nonatomic)NaviPointAnnotation *startAnno; //起点标注
@property (strong, nonatomic)NaviPointAnnotation *endAnno;   //终点标注

@property (strong, nonatomic)NSMutableArray *wayPointAnnos; //途径点标注数组，元素为RouteAnnotation

@end

@implementation BaiduMapViewController

#pragma mark --- Init Methods

- (instancetype)initWithDelegate:(id<BaiduMapViewControllerDelegate>)delegate{
    self = [super initWithNibName:NSStringFromClass(self.class) bundle:[BundleTools getBundle]];
    if (self) {
        self.delegate = delegate;
        [self addDestinationView];
        [self addWayPointView];
        [self showDestinationView];
        [self.backBtn setImage:[BundleTools imageNamed:@"car_loc_brak.png"] forState:0];
        [self.btn1 setImage:[BundleTools imageNamed:@"路况关闭"] forState:0];
        [self.btn1 setImage:[BundleTools imageNamed:@"路况"] forState:UIControlStateSelected];
        self.mapView.delegate = self;
        self.mapView.rotateEnabled = NO;
        self.mapView.rotateCameraEnabled = NO;
        self.mapView.showsCompass = NO;
        self.mapView.showsScale = NO;
        [self.view insertSubview:self.mapView atIndex:0];
        [self.mapView setCenterCoordinate:[CLLocationManager tranferGPSToAMap:[CLLocationManager lastUserLocation]]];
    }
    return self;
}


- (void)addDestinationView{
    DestinationBlockView *destinationView = [[DestinationBlockView alloc]initWithDelegate:self];
    [self.view addSubview:destinationView];
    _destinationView = destinationView;
}

- (void)addWayPointView{
    WayPointBlockView *waypointview = [[WayPointBlockView alloc]initWithDelegate:self];
    [self.view addSubview:waypointview];
    _wayPointView = waypointview;
}

#pragma mark --- Lazy Loads

- (void)setDestination:(DestinationLocation *)destination{
    if (self.isSettingWayPointMode) {
        [_wayPointView setWayPointWithLocation:destination];
        [_mapView setCenterCoordinate:destination.coordinate animated:YES];
        return;
    }
    _destination = destination;
    [_destinationView setDisplayedName:destination.name];
    [_destinationView setDisplayedAddress:destination.address];
    [self showRegionWithStartAndEnd];
    
    self.startAnno.coordinate = [CLLocationManager lastCarLocaiton];
//    NSLog(@"start %f - %f",self.startAnno.coordinate.latitude,self.startAnno.coordinate.longitude)
    self.endAnno.coordinate = destination.coordinate;
    self.endAnno.address = destination.address;
    self.endAnno.name = destination.name;
    [self.mapView addAnnotations:@[_startAnno,_endAnno]];
}

- (void)setIsFavorite:(BOOL)isFavorite{
    [_destinationView setDisplayedIsFavorite:isFavorite];
}

- (NaviPointAnnotation *)startAnno{
    if (!_startAnno) {
        _startAnno = [[NaviPointAnnotation alloc]init];
        _startAnno.navPointType = NaviPointAnnotationStart;
    }
    return _startAnno;
}

- (NaviPointAnnotation *)endAnno{
    if (!_endAnno) {
        _endAnno = [[NaviPointAnnotation alloc]init];
        _endAnno.navPointType = NaviPointAnnotationEnd;
    }
    return _endAnno;
}

- (NSMutableArray *)wayPointAnnos{
    if (!_wayPointAnnos) {
        _wayPointAnnos = [NSMutableArray new];
    }
    return _wayPointAnnos;
}

- (void)setSettingWayPointMode:(BOOL)settingWayPointMode{
    _settingWayPointMode = settingWayPointMode;
    if (!_settingWayPointMode) {
        [self showDestinationView];
        [_wayPointView cancelChooseWaypoint];
    }
}

#pragma mark --- ViewController




- (void)viewDidLoad {
    [super viewDidLoad];
 
    
}
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}

- (void)dealloc{
    NSLog(@"%@ is released",self.description);
    _mapView.delegate = nil;
}

#pragma mark --- Public Methods

- (void)replaceLogo{
    CGPoint center =  _mapView.logoCenter;
    center.y = _mapView.height - currentDislpayedBlock.height - _mapView.logoSize.height/2;
    _mapView.logoCenter = center;
}

/**
 显示目的地视图
 */
- (void)showDestinationView{
    _wayPointView.hidden = YES;
    _destinationView.hidden = NO;
    _waypointBtn.hidden = NO;
    _searchWayPoint.hidden = NO;
    _settingWayPointMode = NO;
    currentDislpayedBlock = _destinationView;
    [self replaceLogo];
}

/**
 显示途径点选择视图
 */
- (void)showWaypointView{
    _wayPointView.hidden = NO;
    _destinationView.hidden = YES;
    _waypointBtn.hidden = YES;
    _searchWayPoint.hidden = YES;
    _settingWayPointMode = !_wayPointView.deleteMode;
    currentDislpayedBlock = _wayPointView;
    [self replaceLogo];
}

#pragma mark --- Private Methods

//发送到车网络请求
- (void)sendToCarRequestWithPin:(NSString *)pinCoed{
    if (pinCoed == nil) {
        pinCoed = @"";
    }
    NSString *endLat = [NSString stringWithFormat:@"%f",_endAnno.coordinate.latitude];
    NSString *endLng = [NSString stringWithFormat:@"%f",_endAnno.coordinate.longitude];
    
    NSMutableDictionary *paramters = [NSMutableDictionary new];
    paramters[@"cmd"] = @"SendToCar";
    paramters[@"notifyTuType"] = @"1";
    paramters[@"endPoiName"] = _endAnno.name;
    /*
    if (_wayPointAnnos && _wayPointAnnos.count != 0) {
        for (int i = 0; i < _wayPointAnnos.count; i ++) {
            NaviPointAnnotation *anno = _wayPointAnnos[i];
            NSString *lat = [NSString stringWithFormat:@"%f",anno.coordinate.latitude];
            NSString *lng = [NSString stringWithFormat:@"%f",anno.coordinate.longitude];
            
            [paramters setObject:lat forKey:[NSString stringWithFormat:@"listPoi[%d].lat",i]];
            [paramters setObject:lng forKey:[NSString stringWithFormat:@"listPoi[%d].lng",i]];
        }
        
        [paramters setObject:endLat forKey:[NSString stringWithFormat:@"listPoi[%lu].lat",(unsigned long)_wayPointAnnos.count]];
        [paramters setObject:endLng forKey:[NSString stringWithFormat:@"listPoi[%lu].lng",(unsigned long)_wayPointAnnos.count]];
        
    }else{
        paramters[@"listPoi[0].lat"] = endLat;
        paramters[@"listPoi[0].lng"] = endLng;
    }
    */
    paramters[@"lat"] = endLat;
    paramters[@"lng"] = endLng;
    
    paramters[@"pin"] = pinCoed;
    
    [PinAuth startPinAuthentication:paramters];
}

/**
 地图显示起点终点区域
 */
- (void)showRegionWithStartAndEnd{
    CLLocationCoordinate2D start = [CLLocationManager lastCarLocaiton];
    CLLocationCoordinate2D end = _destination.coordinate;
    MACoordinateRegion region;
    region.center.longitude = (start.longitude+end.longitude)*0.5;
    region.center.latitude  = (start.latitude+end.latitude)*0.5;
    region.span.latitudeDelta = fabs(start.latitude-region.center.latitude)*3;
    region.span.longitudeDelta = fabs(start.longitude-region.center.longitude)*3;
    [_mapView setRegion:region animated:YES];
}

/**
 地图显示包含所有点的区域
 */
- (void)showRegionWithAllPoints{
    
}

#pragma mark --- Events

- (IBAction)backBtnClicked:(UIButton *)sender {
    if (currentDislpayedBlock == _destinationView) {
        if (self.delegate && [self.delegate respondsToSelector:@selector(didClickedBackBtn:)]) {
            [self.delegate didClickedBackBtn:self];
        }
        [_mapView removeAnnotations:_wayPointAnnos];
        [_wayPointAnnos removeAllObjects];
    }
    if (currentDislpayedBlock == _wayPointView) {
        [self showDestinationView];
        [_wayPointView cancelChooseWaypoint];
    }
}

/**
 点击路况按钮
 */
- (IBAction)trafficStatusBtn:(UIButton *)sender {
    _mapView.showTraffic = !_mapView.showTraffic;
    
    sender.selected = _mapView.showTraffic ;
}

/**
 点击途经点按钮
 */
- (IBAction)setWayPointBtn:(UIButton *)sender {
    if (_wayPointAnnos.count == 3) {
        [SVProgressHUD showErrorWithStatus:@"最多添加三个途径点"];
        return;
        
    }
    _wayPointView.deleteMode = NO;
    _wayPointView.associatedAnno = nil;
    [self showWaypointView];
    [_wayPointView locateSelectedwaypoint:_mapView.centerCoordinate];
}

- (IBAction)searhWaypoint:(UIButton *)sender {
    if (_wayPointAnnos.count == 3) {
        [SVProgressHUD showErrorWithStatus:@"最多添加三个途径点"];
        return;
    }
    _wayPointView.deleteMode = NO;
    _wayPointView.associatedAnno = nil;
    [self showWaypointView];
    NSArray* arr = self.parentViewController.childViewControllers;
    for (UIViewController *vc in arr) {
        if ([vc isKindOfClass:[RTSearchViewController class]]) {
            [(RTSearchViewController *)vc showSearchView];
        }
    }
}


#pragma mark --- DestinationBlockViewDelegate

- (void)didClickedFavoriteBtn:(DestinationBlockView *)destinationBlockView{
    if (self.delegate && [self.delegate respondsToSelector:@selector(BaiduMapVC:didClickSaveLocation:)]) {
        [self.delegate BaiduMapVC:self didClickSaveLocation:_destination];
    }
}

- (void)didRemoveFavoriteLocation:(DestinationBlockView *)destinationBlockView{
    if (self.delegate && [self.delegate respondsToSelector:@selector(baiduMapVC:didRemoveFavoriteLocation:)]) {
        [self.delegate baiduMapVC:self didRemoveFavoriteLocation:_destination];
    }
}

- (void)didClickedGoToThereBtn:(DestinationBlockView *)destinationBlockView{
    NSMutableArray *temp = [NSMutableArray arrayWithArray:_wayPointAnnos];
    [temp insertObject:_startAnno atIndex:0];
    [temp addObject:_endAnno];
    RoutePlanViewController *routePlanVC = [[RoutePlanViewController alloc]initWithRouteNodes:temp];
    [self.navigationController pushViewController:routePlanVC animated:YES];
}

- (void)didClickedSendToCarBtn:(DestinationBlockView *)destinationBlockView{
    
    [self sendToCarRequestWithPin:@""];
}

#pragma mark --- WayPointBlockViewDelegate

- (void)didClickComfirmBtn:(WayPointBlockView *)wayPointView info:(NSDictionary *)info{
    NaviPointAnnotation *wayPointAnno = [[NaviPointAnnotation alloc]init];
    wayPointAnno.navPointType = NaviPointAnnotationWay;
    wayPointAnno.coordinate = _mapView.centerCoordinate;
    wayPointAnno.index = self.wayPointAnnos.count + 1;
    wayPointAnno.address = [info objectForKey:@"detail"];
    wayPointAnno.name = [info objectForKey:@"address"];
    [_mapView addAnnotation:wayPointAnno];
    [self.wayPointAnnos addObject:wayPointAnno];
    self.settingWayPointMode = NO;
    [self showDestinationView];
}

- (void)didClickDeleteBtn:(WayPointBlockView *)wayPointView annotation:(NaviPointAnnotation *)annotation{
    [_mapView removeAnnotations:_wayPointAnnos];
    [_wayPointAnnos removeObject:annotation];
    for (NSInteger i = 0; i < _wayPointAnnos.count; i ++) {
        NaviPointAnnotation *anno = _wayPointAnnos[i];
        anno.index = i + 1;
    }
    [_mapView addAnnotations:_wayPointAnnos];
    [self showDestinationView];
}

- (void)didClickCancelBtn:(WayPointBlockView *)wayPointView{
    self.settingWayPointMode = NO;
    [self showDestinationView];
    [_mapView deselectAnnotation:_wayPointView.associatedAnno animated:NO];
}


#pragma mark --- MAMapViewDelegate

- (void)mapView:(MAMapView *)mapView regionWillChangeAnimated:(BOOL)animated{
    if (self.isSettingWayPointMode) {
        NSLog(@"地图开始移动");
    }
}

- (void)mapView:(MAMapView *)mapView regionDidChangeAnimated:(BOOL)animated{
    if (self.isSettingWayPointMode) {
        NSLog(@"地图停止移动");
        [_wayPointView locateSelectedwaypoint:_mapView.centerCoordinate];
    }
}

- (void)mapView:(MAMapView *)mapView didSelectAnnotationView:(MAAnnotationView *)view{
    if ([view.annotation isKindOfClass:[NaviPointAnnotation class]]) {
        NaviPointAnnotation *anno = (NaviPointAnnotation *)view.annotation;
        switch (anno.navPointType) {
            case NaviPointAnnotationWay:{
                _wayPointView.deleteMode = YES;
                _wayPointView.associatedAnno = view.annotation;
                [self showWaypointView];
            }
                break;
            default:
                break;
        }
    }
}

- (MAAnnotationView *)mapView:(MAMapView *)mapView viewForAnnotation:(id<MAAnnotation>)annotation{
    if ([annotation isKindOfClass:[NaviPointAnnotation class]]) {
        NaviPointAnnotation *anno = (NaviPointAnnotation *)annotation;
        MAAnnotationView *annoView = [[MAAnnotationView alloc]initWithAnnotation:annotation reuseIdentifier:@"annotation"];
        switch (anno.navPointType) {
            case NaviPointAnnotationStart:
                annoView.image = [BundleTools imageNamed:@"起"];
                break;
            case NaviPointAnnotationEnd:
                annoView.image = [BundleTools imageNamed:@"终"];
                break;
            case NaviPointAnnotationWay:{
                annoView.image = [BundleTools imageNamed:@"way_point"];
                UILabel *label;
                for (id obj in [annoView subviews]) {
                    if ([obj isKindOfClass:[UILabel class]]) {
                        label = (UILabel *)obj;
                        break;
                    }
                }
                if (!label) {
                    label = [[UILabel alloc]init];
                    label.textAlignment = NSTextAlignmentCenter;
                    label.font = [UIFont systemFontOfSize:13*factor_h];
                    label.textColor = [UIColor whiteColor];
                    label.width = label.height = annoView.width;
                    label.x = label.y = 0;
                    [annoView addSubview:label];
                }
                label.text = [NSString stringWithFormat:@"%ld",anno.index];
            }
                break;
            default:
                break;
        }
        annoView.centerOffset = CGPointMake(0, -32/2);
        return annoView;
    }
    return nil;
}

@end

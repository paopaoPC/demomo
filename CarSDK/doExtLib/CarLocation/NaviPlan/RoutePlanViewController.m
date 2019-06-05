//
//  RoutePlanViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2017/1/11.
//
//

#import "RoutePlanViewController.h"
#import "UIView+Extension.h"
#import "CLLocationManager+Extension.h"
#import "RoutePlanBlockView.h"
#import "SVProgressHUD.h"
#import "NaviPointAnnotation.h"
#import "SelectableOverlay.h"
#import "SpeechSynthesizer.h"
#import "UIImage+Rotate.h"
#import "BundleTools.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface RoutePlanViewController ()<MAMapViewDelegate,RoutePlanBlockViewDelegate,AMapNaviDriveViewDelegate>

@property (weak, nonatomic) IBOutlet MAMapView *mapView;
@property (nonatomic, weak)AMapNaviDriveView *naviView;
@property (weak, nonatomic)RoutePlanBlockView *routePlanView;
@property (nonatomic, strong)NSArray *routeNodes;
@property (strong, nonatomic)NSMutableArray *routeLines;    //包含所有路线数组

@property (unsafe_unretained, nonatomic) IBOutlet UIButton *back;
@property (weak, nonatomic)SelectableOverlay *selectedRoute; //当前选中的路线
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn1;

@end

@implementation RoutePlanViewController

#pragma mark --- Init Methods

- (instancetype)initWithRouteNodes:(NSArray *)nodes{
    self = [self init];
    if (self) {
        self.routeNodes = nodes;
        [self addRoutePlanView];
    }
    return self;
}
- (instancetype)init
{
    self = [super initWithNibName:NSStringFromClass(self.class) bundle:[BundleTools getBundle]];
    if (self) {
        
    }
    return self;
}
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
- (AMapNaviDriveView *)naviView{
    if (!_naviView) {
        AMapNaviDriveView *naviView = [[AMapNaviDriveView alloc]initWithFrame:_mapView.frame];
        [self.view addSubview:naviView];
        _naviView = naviView;
        _naviView.delegate = self;
    }
    return _naviView;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.back setImage:[BundleTools imageNamed:@"car_loc_brak.png"] forState:0];
    [self.btn1 setImage:[BundleTools imageNamed:@"路况关闭"] forState:0];
    [self.btn1 setImage:[BundleTools imageNamed:@"路况"] forState:UIControlStateSelected];
    // Do any additional setup after loading the view from its nib.
    [self addMapView];
    
}

- (void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
    if (_routeNodes && _routeNodes.count > 1) {
        [SVProgressHUD showWithStatus:@"正在规划路线" maskType:SVProgressHUDMaskTypeBlack];
        [_routePlanView searchDrivingRouteWithAnnotaions:_routeNodes];
        [_mapView addAnnotations:_routeNodes];
    }else{
        [SVProgressHUD showErrorWithStatus:@"路线规划失败"];
    }
//    [MobClick beginLogPageView:@"导航规划"];
}

- (void)viewDidDisappear:(BOOL)animated{
    [super viewDidDisappear:animated];
//    [MobClick endLogPageView:@"导航规划"];
}

- (void)addMapView{
    _mapView.delegate = self;
    _mapView.rotateEnabled = NO;
    _mapView.rotateCameraEnabled = NO;
    _mapView.showsScale = NO;
    _mapView.showsCompass = NO;
    [self.mapView setCenterCoordinate:[CLLocationManager tranferGPSToAMap:[CLLocationManager lastUserLocation]]];
    CGPoint center = _mapView.logoCenter;
    center.y -= _routePlanView.height;
    _mapView.logoCenter = center;
}

- (void)addRoutePlanView{
    RoutePlanBlockView *routePlanView = [[RoutePlanBlockView alloc]initWithDelegate:self];
    [self.view addSubview:routePlanView];
    _routePlanView = routePlanView;
}

- (NSMutableArray *)routeLines{
    if (!_routeLines) {
        _routeLines = [NSMutableArray new];
    }
    return _routeLines;
}
#pragma mark --- ViewController


- (void)dealloc{
    NSLog(@"%@ is released",self.description);
}

#pragma mark --- Public Methods

#pragma mark --- Private Methods

/**
 根据索引显示路线
 */
- (void)displayRouteByIndex:(NSInteger)index{
    [_mapView.overlays enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj isKindOfClass:[SelectableOverlay class]]) {
            SelectableOverlay *selectableOverlay = (SelectableOverlay *)obj;
             /* 获取overlay对应的renderer. */
            MAPolylineRenderer *overlayRenderer = (MAPolylineRenderer *)[self.mapView rendererForOverlay:selectableOverlay];
            if (selectableOverlay.index == index) {
                /* 设置选中状态. */
                selectableOverlay.selected = YES;
                _selectedRoute = selectableOverlay;
                /* 修改renderer选中颜色. */
                overlayRenderer.fillColor   = selectableOverlay.selectedColor;
                overlayRenderer.strokeColor = selectableOverlay.selectedColor;
                [overlayRenderer loadStrokeTextureImage:selectableOverlay.selectedTexture];
                /* 修改overlay覆盖的顺序. */
                [self.mapView exchangeOverlayAtIndex:idx withOverlayAtIndex:self.mapView.overlays.count - 1];
                [self.mapView showOverlays:@[selectableOverlay] edgePadding:UIEdgeInsetsMake(10, 10, _routePlanView.height, 10) animated:YES];
            }else{
                /* 设置选中状态. */
                selectableOverlay.selected = NO;
                
                /* 修改renderer选中颜色. */
                overlayRenderer.fillColor   = selectableOverlay.regularColor;
                overlayRenderer.strokeColor = selectableOverlay.regularColor;
                [overlayRenderer loadStrokeTextureImage:nil];
            }
            [overlayRenderer glRender];
        }
    }];
}

/**
 移除所有路线和节点标注
 */
- (void)removeAllRoutesAndNodes{
    for (NSDictionary *dict in _routeLines) {
        [_mapView removeAnnotations:[dict objectForKey:@"node"]];
        [_mapView removeOverlay:[dict objectForKey:@"line"]];
    }
}


#pragma mark --- Events

- (IBAction)trafficBtn:(UIButton *)sender {
    _mapView.showTraffic = !_mapView.showTraffic;
    
    sender.selected = _mapView.showTraffic ;
    
}

#pragma mark --- MAMapViewDelegate

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
- (MAOverlayRenderer *)mapView:(MAMapView *)mapView rendererForOverlay:(id<MAOverlay>)overlay{
    if ([overlay isKindOfClass:[SelectableOverlay class]])
    {
        SelectableOverlay * selectableOverlay = (SelectableOverlay *)overlay;
        id<MAOverlay> actualOverlay = selectableOverlay.overlay;
        
        MAPolylineRenderer *polylineRenderer = [[MAPolylineRenderer alloc] initWithPolyline:actualOverlay];
        
        polylineRenderer.lineWidth = 8.f;
        polylineRenderer.strokeColor = selectableOverlay.isSelected ? selectableOverlay.selectedColor : selectableOverlay.regularColor;
        
        return polylineRenderer;
    }
    
    return nil;
}

- (IBAction)back:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark --- RoutePlanBlockViewDelegate

- (void)onGetDrivingSearchResult:(RoutePlanBlockView *)routePlanBlockView naviRouts:(NSDictionary<NSNumber *,AMapNaviRoute *> *)naviRoutes{
    [SVProgressHUD dismiss];
    NSArray *allKeys = [naviRoutes allKeys];
    for (int i = 0; i < allKeys.count; i ++) {
        NSNumber *aRouteId = allKeys[i];
        AMapNaviRoute *aRoute = [naviRoutes objectForKey:aRouteId];
        NSInteger count = aRoute.routeCoordinates.count;
        //添加路径Polyline
        CLLocationCoordinate2D *coords = (CLLocationCoordinate2D *)malloc(count * sizeof(CLLocationCoordinate2D));
        for (int j = 0; j < count; j ++) {
            AMapNaviPoint *coordinate = aRoute.routeCoordinates[j];
            coords[j].latitude = coordinate.latitude;
            coords[j].longitude = coordinate.longitude;
        }
        
        MAPolyline *polyline = [MAPolyline polylineWithCoordinates:coords count:count];
        SelectableOverlay *selectablePolyline = [[SelectableOverlay alloc]initWithOverlay:polyline];
        [selectablePolyline setRouteID:[aRouteId integerValue]];
        [selectablePolyline setIndex:i];
        [_mapView addOverlay:selectablePolyline];
        free(coords);
    }
    [self displayRouteByIndex:0];
}

/**
 选中一个segment
 */
- (void)routePlanBlockView:(RoutePlanBlockView *)routePlanBlockView didSelectSegment:(NSInteger)segmentIndex{
    [self displayRouteByIndex:segmentIndex];
}

/**
 点击了‘开始导航’按钮
 */
- (void)didClickStartNavigateBtn:(RoutePlanBlockView *)routePlanBlockView{
    if ([_routePlanView.driveManager selectNaviRouteWithRouteID:_selectedRoute.routeID]) {
        
        [_routePlanView.driveManager addDataRepresentative:self.naviView];
        [_routePlanView.driveManager startGPSNavi];
        [[UIApplication sharedApplication] setStatusBarHidden:YES];
    }else{
        [SVProgressHUD showErrorWithStatus:@"选择路径失败"];
    }

}

- (void)routePlanBlockView:(RoutePlanBlockView *)routePlanBlockView playNaviSoundString:(NSString *)soundStr{
    [[SpeechSynthesizer sharedSpeechSynthesizer] speakString:soundStr];
}
#pragma mark --- AMapNaviDriveViewDelegate

- (void)driveViewCloseButtonClicked:(AMapNaviDriveView *)driveView{
    [_routePlanView.driveManager stopNavi];
    [[SpeechSynthesizer sharedSpeechSynthesizer] stopSpeak];
    [driveView removeFromSuperview];
    [_routePlanView.driveManager removeDataRepresentative:driveView];
    [[UIApplication sharedApplication] setStatusBarHidden:NO];
}



@end

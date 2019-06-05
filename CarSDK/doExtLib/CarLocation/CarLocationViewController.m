//
//  CarLocationViewController.m
//  chameleon
//
//  Created by Checker on 16/1/27.
//
//

#import "CarLocationViewController.h"
#import "SVProgressHUD.h"
#import "NaviRoutesViewController.h"
#import "EFenceSettingViewController.h"
#import "UIView+Extension.h"
#import "EfenceDataModel.h"
#import "UIView+Extension.h"
#import "CLLocationManager+Extension.h"
#import "PinView.h"
#import "AuthCodeView.h"
#import "EfenceListViewController.h"
#import "DealersListViewController.h"
#import "NaviRouteViewController.h"
#import "UILabel+Extension.h"
#import <MAMapKit/MAMapKit.h>
#import "BundleTools.h"
#import "DoEventManager.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface CarLocationViewController ()<MAMapViewDelegate,EFenceSettingViewDelegate,UITextFieldDelegate,PinViewDelegate,AuthCodeViewDelegate,EfenceListVCDelegate>
{
    MAPointAnnotation*     _carAnnotation;
}

@property (strong, nonatomic) NSDictionary *carData;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img1;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn6;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn5;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn4;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn2;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *btn1;
@property (weak, nonatomic) IBOutlet MAMapView *mapview;

@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *loadingView;
@property (weak, nonatomic) IBOutlet UILabel *carAddrView;
@property (weak, nonatomic) IBOutlet UILabel *refreshTimeLabel;   //更新时间

@property (weak, nonatomic) IBOutlet UIView *naviOperBlockView;
@property (assign, nonatomic) CLLocationCoordinate2D carlocation;
@property (assign ,nonatomic)BOOL isFirstGetCarError;   //第一次获取汽车位置是否失败
@property (assign, nonatomic)BOOL firstRefreshed; //Used to check if it's the first time to refresh car-location
@property (assign, nonatomic)BOOL isEfenceEditMode;
@property (strong, nonatomic) EFenceSettingViewController *EFenceVC;
@property (weak, nonatomic) IBOutlet UIButton *EfenceBtn;
@property (strong, nonatomic) MAPointAnnotation *eFenceCenterAnnotation;//电子围栏中心点
@property (strong, nonatomic) CALayer *centerPinLayer;
@property (strong, nonatomic) MACircle *eFenceArea;//电子围栏范围
@property (strong, nonatomic) MAPolyline *radiusLine;//半径线段
@property (strong, nonatomic) MAPointAnnotation *radiusLabel; //半径标签
@property (weak, nonatomic)CALayer *tipLayer;

@property (nonatomic,strong)AuthCodeView *auth;

@property (weak, nonatomic) IBOutlet UIView *fakeSearchBar;


@end

@implementation CarLocationViewController

#pragma mark - Lazy loads

- (instancetype)init
{
    NSBundle *myBundle = [BundleTools getBundle];
    
    //self = [super initWithNibName: @"ViewController1" bundle: nil];
    //从bundle中获取界面文件
    self = [super initWithNibName: [NSString stringWithUTF8String: object_getClassName(self)] bundle: myBundle];
    if (self) {
        // Custom initialization
    }
    
    return self;
}

- (CALayer *)centerPinLayer{
    if (!_centerPinLayer) {
        UIImageView *pinView = [[UIImageView alloc]initWithImage:[BundleTools imageNamed:@"fence_center_icon"]];
        pinView.width = 46;
        pinView.height = 72;
        pinView.center = CGPointMake(_mapview.bounds.size.width/2, _mapview.bounds.size.height/2);
        _centerPinLayer = pinView.layer;
    }
    return _centerPinLayer;
}

- (MAPointAnnotation *)radiusLabel{
    if (!_radiusLabel) {
        _radiusLabel = [[MAPointAnnotation alloc]init];
    }
    return _radiusLabel;
}

- (MAPointAnnotation *)eFenceCenterAnnotation{
    if (!_eFenceCenterAnnotation) {
        _eFenceCenterAnnotation = [[MAPointAnnotation alloc]init];
    }
    return _eFenceCenterAnnotation;
}

- (MACircle *)eFenceArea{
    if (!_eFenceArea) {
        double radius = [_EFenceVC.efenceData.distance doubleValue];
        _eFenceArea = [MACircle circleWithCenterCoordinate:_EFenceVC.efenceData.point radius:radius];
    }
    return _eFenceArea;
}

- (EFenceSettingViewController *)EFenceVC{
    if (!_EFenceVC) {
        EFenceSettingViewController *EFenceVC = [[EFenceSettingViewController alloc]init];
        _EFenceVC = EFenceVC;
        _EFenceVC.delegate = self;
        __weak CarLocationViewController *weakself = self;
        EFenceSettingBlock block = ^(BOOL isEdit){
            weakself.isEfenceEditMode = isEdit;
        };
        _EFenceVC.HitConfigBlock = block;
        [self addChildViewController:_EFenceVC];
    }
    return _EFenceVC;
}

#pragma mark - ViewController

- (instancetype)initWithData:(NSDictionary*)data
{
    self = [self init];
    
    if ([data isKindOfClass:[NSDictionary class]]) { self.carData = data; }
    
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    [self.EfenceBtn setImage:[BundleTools imageNamed:@"fence_off"] forState:0];
    [self.btn1 setImage:[BundleTools imageNamed:@"定位车"] forState:0];
    [self.btn2 setImage:[BundleTools imageNamed:@"fence_off"] forState:0];
    [self.btn4 setImage:[BundleTools imageNamed:@"agency_icon"] forState:0];
    [self.btn5 setImage:[BundleTools imageNamed:@"定位人"] forState:0];
    [self.btn6 setImage:[BundleTools imageNamed:@"路况关闭"] forState:0];
    [self.btn6 setImage:[BundleTools imageNamed:@"路况"] forState:UIControlStateSelected];
    [self.img1 setImage:[BundleTools imageNamed:@"backward_gray"]];
    [_mapview setCenterCoordinate:[CLLocationManager tranferGPSToAMap:[CLLocationManager lastUserLocation]]];
    [self.view insertSubview:_mapview atIndex:0];
    
//    NSLog(@"rect-view:%@",NSStringFromCGRect(self.view.frame))
//    NSLog(@"rect-map:%@",NSStringFromCGRect(_mapview.frame))
    _mapview.delegate = self;
    _mapview.rotateEnabled = NO;
    _mapview.rotateCameraEnabled = NO;
    _mapview.showsCompass = NO;
    _mapview.showsScale = NO;
    _carlocation.longitude = 0.0;
    _carAnnotation = [[MAPointAnnotation alloc]init];

//    NSString* showControl = (NSString*)[self.carData objectForKey:@"showControl"];
//    UIView* controlView   = [self.view viewWithTag:4];
//    controlView.hidden    = !showControl || ![showControl.lowercaseString isEqualToString:@"true"];
//    _controlButton.hidden = ![showControl.lowercaseString isEqualToString:@"true"];
    
     if (_carAnnotation.coordinate.latitude == 0) {
         MACoordinateRegion region;
         region.center = _carAnnotation.coordinate;
         region.span.latitudeDelta = 0.005;
         region.span.longitudeDelta = 0.005;
         [_mapview setRegion:region animated:NO];
    }
    
    [self refreshLocation:self.carData];

    
    
    [_loadingView startAnimating];
    _loadingView.hidden = true;
    _mapview.showTraffic = NO;
    _naviOperBlockView.alpha = 0.95;
    CGPoint center = _mapview.logoCenter;
    center.y -= _naviOperBlockView.height;
    _mapview.logoCenter = center;

    [_fakeSearchBar setShadowForColor:[UIColor grayColor] offset:CGSizeMake(0, 0) opacity:0.5 radius:3];
    _fakeSearchBar.layer.cornerRadius = 3;
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
}

-(void) viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
    _mapview.delegate = self;
    [[DoEventManager shared] javaScriptCallMethod:@"startUpdatingCarState"];
}

- (void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
    [CLLocationManager checkLocationServiceStatusWithAlert];
    _mapview.frame = self.view.bounds;
//    [MobClick beginLogPageView:@"找车页面"];
}

- (void)viewDidDisappear:(BOOL)animated{
    [super viewDidDisappear:animated];
//    [MobClick endLogPageView:@"找车页面"];
}

- (void)dealloc{
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
    [SVProgressHUD dismiss];
    [[DoEventManager shared] javaScriptCallMethod:@"stopUpdatingCarState"];
}


# pragma mark - Events methods
- (IBAction)showBoth:(UIButton *)sender {
    [self showBothAnno:_carAnnotation.coordinate userLoc:_mapview.userLocation.location.coordinate];
}

/**
 点击搜索栏
 */
- (IBAction)startSearchPage:(UIButton *)sender {
    NaviRouteViewController *naviVC = [[NaviRouteViewController alloc]init];
    [self.navigationController pushViewController:naviVC animated:NO];
}

/**
 *  点击返回
 *
 */
- (IBAction)onBack:(UIButton *)sender
{
    [self.navigationController dismissViewControllerAnimated:YES completion:nil];
}

/**
 *  点击刷新汽车位置
 *
 */
- (IBAction)onRefreshCarLocation:(UIButton *)sender
{
//    [[AppDelegate instance] execJS:@"refreshCarLocation('car')"];
    if (_carAnnotation.coordinate.latitude == 0) {
//        [SVProgressHUD showErrorWithStatus:@"获取车辆位置失败"];
        return;
    }
    [self showSingleAnno:_carAnnotation.coordinate];
}

/**
 *  点击刷新用户位置
 *
 */
- (IBAction)onRefreshCurLocation:(UIButton *)sender
{
    if (![CLLocationManager checkLocationServiceStatusWithAlert]) {
        return;
    }
    [self locateUser];
//    [[AppDelegate instance] execJS:@"refreshCarLocation('cur')"];
}
/**
 *  点击电子围栏按钮
 *
 */
- (IBAction)ClickedOnE_fence:(UIButton *)sender {
    if (_carlocation.latitude == 0) {
        [SVProgressHUD showErrorWithStatus:@"车辆离线，暂不可用"];
        return;
    }
    if (sender.isSelected) {
        //显示导航
        [_naviOperBlockView setHidden:NO];
        //移除电子围栏设置菜单并销毁
        [_EFenceVC dismissMenuView];
        _EFenceVC = nil;
        if (_centerPinLayer) {
            [_centerPinLayer removeFromSuperlayer];
        }
        //从地图上移除围栏
        [self removeTip];
        [self removeEverythingAboutTheFence];
        self.isEfenceEditMode = NO;
        [sender setSelected:NO];
    }else{
        //隐藏导航
//        [_naviOperBlockView setHidden:YES];
        //获取围栏数据
        [self getFencedatas];
        //在地图上显示围栏
//        [self showElectronicFence];
//        [sender setSelected:YES];
    }
}
/**
 *  点击车辆追踪
 *
 */
- (IBAction)onControl:(UIButton*)sender
{
    [[DoEventManager shared] javaScriptCallMethod:@"controlCarLocation"];
    [SVProgressHUD showWithMaskType:SVProgressHUDMaskTypeClear];
}
/**
 *  点击导航按钮
 *
 */
- (IBAction)onNavi:(id)sender
{
    if (_carAnnotation.coordinate.latitude == 0) {
        [SVProgressHUD showErrorWithStatus:@"车辆离线，无法导航"];
        return;
    }

    if ( _mapview.userLocation.location.coordinate.latitude == 0) {
        BOOL gpsEnabled = [CLLocationManager checkLocationServiceStatusWithAlert];
        
        gpsEnabled ? [SVProgressHUD showErrorWithStatus:@"无法定位您的位置"] : nil;
        
        return;
    }
    
    UIViewController* viewController = [[NaviRoutesViewController alloc] initWithSrc:_mapview.userLocation.location.coordinate dst:_carAnnotation.coordinate addr:_carAddrView.text];
    [self.navigationController pushViewController:viewController animated:YES];
}
/**
 *  点击查看路况
 *
 */
- (IBAction)onSwitchTraffic:(UIButton *)sender
{
    _mapview.showTraffic = !_mapview.showTraffic;
    sender.selected = _mapview.showTraffic;
}

/**
 *  确认密码
 *
 */
- (void)onConfirmPassword:(NSString *)authCode;
{
    NSString *js = [NSString stringWithFormat:@"onConfirmCarLocation('%@','RemoteLocation')",authCode];
    [[DoEventManager shared] javaScriptCallMethod:js];
    NSString *js1 = [NSString stringWithFormat:@"checkCarControlPass('%@')",authCode];
    [[DoEventManager shared] javaScriptCallMethod:js1];
    [SVProgressHUD showWithStatus:@"正在验证控车码"];
}

#pragma mark - Private methods

- (void)showSingleAnno:(CLLocationCoordinate2D)coordinate{
    MACoordinateRegion region;
    region.center = coordinate;
    region.span.latitudeDelta = 0.005;
    region.span.longitudeDelta = 0.005;
    [_mapview setRegion:region animated:YES];
}

- (void)showBothAnno:(CLLocationCoordinate2D)carCoor userLoc:(CLLocationCoordinate2D)userCoor{
    
    if (carCoor.latitude == 0 && userCoor.latitude == 0) {
        return;
    }
    if (carCoor.latitude == 0 || userCoor.latitude == 0) {
        [self showSingleAnno:carCoor.latitude != 0 ? carCoor : userCoor];
        return;
    }
    MACoordinateRegion region;
    region.center.longitude = (carCoor.longitude+userCoor.longitude)*0.5;
    region.center.latitude  = (carCoor.latitude+userCoor.latitude)*0.5;
    region.span.latitudeDelta = fabs(carCoor.latitude-region.center.latitude)*3;
    region.span.longitudeDelta = fabs(carCoor.longitude-region.center.longitude)*3;
    [_mapview setRegion:region animated:YES];
}

/**
 重新计算大小
 */
- (void)resizeAddressBlock{
    CGSize size = [UILabel sizeWithText:_carAddrView.text font:_carAddrView.font maxW:_carAddrView.width];
    _carAddrView.height = size.height;
    _naviOperBlockView.height = CGRectGetMaxY(_carAddrView.frame) + 8;
    _naviOperBlockView.y = SCREEN_H - _naviOperBlockView.height;
    _carAddrView.y = _naviOperBlockView.height - 8 - _carAddrView.height;
}

/**
 点击经销商按钮
 */
- (IBAction)dealersBtnClicked:(id)sender {
    [self.navigationController pushViewController:[[DealersListViewController alloc]init] animated:YES];
}


/**
 显示更新时间
 */
- (void)showUpdateTime:(NSString *)obj{
    NSString *time;
    if (obj == nil || [obj isKindOfClass:[NSNull class]] || [(NSString *)obj isEqualToString:@""] || [(NSString *)obj isEqualToString:@"null"] ) {
        time = [NSString stringWithFormat:@"(更新时间:--)"];
    }else{
        NSArray *temp = [(NSString *)obj componentsSeparatedByString:@"."];
        time = [NSString stringWithFormat:@"(更新时间:%@)",temp[0]];
    }
    self.refreshTimeLabel.text = time;
}

/**
 *  若无围栏数据，显示默认围栏，中心点为汽车位置
 */
- (void)setDefaultEfence{
        [_EFenceVC showMenu];
        [_EFenceVC enableSaveBtn];
        _EFenceVC.efenceData.point = [CLLocationManager lastUserLocation];
        [self showTip];
        [self showElectronicFence];
        [self displayFullFenceAreaOnMap];
        self.isEfenceEditMode = YES;
}

- (void)fenceFirstSaved:(NSString *)fenceId{
    if ([_EFenceVC.efenceData.fenceId isEqualToString:@""]) {
        _EFenceVC.efenceData.fenceId = fenceId;
    }
}

/**
 *  弹出验证码输入框,并发送申请一次验证码
 */
- (void)showAuthCodeInputView{
    [SVProgressHUD dismiss];
    if (_auth != nil) {
        _auth.center = CGPointMake(SCREEN_W/2, SCREEN_H*3/4);
        [[UIApplication sharedApplication].keyWindow addSubview:_auth];
        [_auth startInputAuthViewCode];
        _auth.delegete = self;
        return;
    }
    
    __weak typeof(self) wself = self;
    _auth = [[AuthCodeView alloc]initWithRequestImageAuthCodeHandler:^{
        [[DoEventManager shared] javaScriptCallMethod:@"getImageCode"];
        
    }];
    _auth.center = CGPointMake(SCREEN_W/2, SCREEN_H/2);
    [[UIApplication sharedApplication].keyWindow addSubview:_auth];
    [_auth startInputAuthViewCode];
    _auth.delegete = self;
}


- (void)updateImageCode:(NSDictionary *)data{
    NSString *imageId = data[@"imageId"];
    NSString *imageCode = data[@"imageCode"];
    
    NSData *imageData = [[NSData alloc]initWithBase64EncodedString:imageCode options:NSDataBase64DecodingIgnoreUnknownCharacters];
    
    UIImage *image = [UIImage imageWithData:imageData];
    
    [_auth setAuthCodeImage:image forImageId:imageId];
    
}

/**
 *  验证码申请成功
 */
- (void)getAuthCode{
    [_auth startCountDown];
}
/**
 *  显示PIN码输入对话框
 */
- (void) showPinInput
{
    [SVProgressHUD dismiss];
    PinView *pin = [[PinView alloc]init];
    pin.center = CGPointMake(SCREEN_W/2, SCREEN_H*3/4);
    [[UIApplication sharedApplication].keyWindow addSubview:pin];
    [pin startInputPinCode];
    pin.delegete = self;

}

- (void) showLoading
{
    _loadingView.hidden = false;
}

- (void) stopLoading
{
    [[DoEventManager shared] javaScriptCallMethod:@"refreshCarLocation('car')"];
    _loadingView.hidden = true;
}

- (void)getCarError{
    _isFirstGetCarError = YES;
//    [SVProgressHUD showErrorWithStatus:@"获取车辆位置失败"];
    _carAddrView.text =@"获取车辆位置失败";
    [self resizeAddressBlock];
    [self getUserLocation];
}

- (void) refreshLocation:(NSDictionary*) location
{
    self.carData = location;
    [_mapview removeAnnotation:_carAnnotation];
//        [_mapview removeAnnotation:_curAnnotation];
    
    NSDictionary* carLocation = [self.carData objectForKey:@"carLocation"];
    CLLocationCoordinate2D carCoor;
    if(carLocation)
    {
        carCoor.latitude  = ((NSString*)[carLocation objectForKey:@"lat"]).floatValue;
        carCoor.longitude = ((NSString*)[carLocation objectForKey:@"lng"]).floatValue;
        
        _carAnnotation.coordinate = carCoor;
        [CLLocationManager saveLatestCarLocation:_carAnnotation.coordinate];
        _carlocation = carCoor;
        NSString* addr = [carLocation objectForKey:@"addr"];
        if (![addr isKindOfClass:[NSNull class]] && ![addr isEqualToString:@""] ) {
            _carAddrView.text = addr;
        }else{
            _carAddrView.text = @"无名路";
        }
        [self resizeAddressBlock];
        [_mapview addAnnotation:_carAnnotation];
//        if (!_firstRefreshed) {
//            [self getUserLocation];
//            [self locateUser];
//        }
//        if ([[carLocation objectForKey:@"centered"] intValue]) {
            [_mapview setCenterCoordinate:_carAnnotation.coordinate animated:YES];
//        }
    }else{
        if (!_firstRefreshed) {
//            _carAddrView.text =@"获取车辆位置失败";
        }
    }
    NSString *obj = [carLocation objectForKey:@"gpsTime"];
    [self showUpdateTime:obj];
}

- (void) updateCarState:(NSDictionary*) location
{
    self.carData = location;
    
    [_mapview removeAnnotation:_carAnnotation];
    
    NSDictionary* carLocation = [self.carData objectForKey:@"carLocation"];
    CLLocationCoordinate2D carCoor;
    carCoor.latitude  = ((NSString*)[carLocation objectForKey:@"lat"]).floatValue;
    carCoor.longitude = ((NSString*)[carLocation objectForKey:@"lng"]).floatValue;
    _carAnnotation.coordinate = carCoor;
    _carAddrView.text = [carLocation objectForKey:@"addr"];
    [self resizeAddressBlock];
    [_mapview addAnnotation:_carAnnotation];
    
}
/**
 *  根据传入的坐标点放置半径标示标签
 *
 *  @param point 坐标
 */
- (void)showRadiusLabel:(CLLocationCoordinate2D)point{
    if (!_radiusLabel) {
        [_mapview removeAnnotation:_radiusLabel];
    }
    self.radiusLabel.coordinate = CLLocationCoordinate2DMake(point.latitude, point.longitude);
    
    [_mapview addAnnotation:_radiusLabel];
}

/**
 *  在围栏上显示半径标示线条和标签
 *
 *  @param from 线条起点
 *  @param to   线条终点
 */
- (void)showRadiusLine{
    //移除之前的线
    if (_radiusLine) {
        [_mapview removeOverlay:_radiusLine];
    }
    //计算半径标示线起始点与结束点
    CLLocationCoordinate2D from = self.eFenceArea.coordinate;
    CLLocationCoordinate2D to = CLLocationCoordinate2DMake(self.eFenceArea.coordinate.latitude, self.eFenceArea.coordinate.longitude +[self getMapRegion].span.longitudeDelta / 2);
    //根据指定坐标点生成折线
    CLLocationCoordinate2D coords[2];
    coords[0] = from;
    coords[1] = to;
    
    _radiusLine = [MAPolyline polylineWithCoordinates:coords count:2];
    [_mapview addOverlay:_radiusLine];
    //计算radiusLabel坐标经纬度
    CLLocationCoordinate2D RadiusLabelLocation = CLLocationCoordinate2DMake(from.latitude, to.longitude - (to.longitude - from.longitude)/2);
    [self showRadiusLabel:RadiusLabelLocation];
    
}
/**
 *  计算围栏区域
 */
- (MACoordinateRegion)getMapRegion{
    return MACoordinateRegionForMapRect(self.eFenceArea.boundingMapRect);
}
/**
 *  在地图上完全显示围栏范围
 */
- (void)displayFullFenceAreaOnMap{
    if (_EFenceVC.efenceData.point.latitude == 0.0) {
        return;
    }
    [_mapview setRegion:[self getMapRegion] animated:YES];
}
/**
 *  获取围栏数据
 */
- (void)getFencedatas
{
    [SVProgressHUD showWithMaskType:SVProgressHUDMaskTypeNone];
    [[DoEventManager shared] javaScriptCallMethod:@"getFencelist"];
}
/**
 *  获取数据模型 ，此方法在AppInfo.m中取得此控制器后调用
 */
- (void)getEfenceDataModel:(NSDictionary *)data{
    [SVProgressHUD dismiss];
    EfenceDataModel *fenceData = [EfenceDataModel generateDataModelWithData:data];
    EfenceListViewController *vc = [[EfenceListViewController alloc]initWithFenceArray:@[fenceData] delegate:self];
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)getEfenceList:(NSArray *)fences{
    [SVProgressHUD dismiss];
//    EfenceDataModel *fenceData = [EfenceDataModel generateDataModelWithData:data];
    EfenceListViewController *vc = [[EfenceListViewController alloc]initWithFenceArray:fences delegate:self];
    [self.navigationController pushViewController:vc animated:YES];
}

/**
 *  无数据时显示提示按钮
 */
- (void)showTip{
    UIImageView *imageView = [[UIImageView alloc]initWithImage:[BundleTools imageNamed:@"click_icon.png"]];
    imageView.width = (278 / 2) * factor_w;
    imageView.height = (284 / 2) * factor_h;
    
    imageView.center = self.view.center;
    self.tipLayer = imageView.layer;
    [self.view.layer insertSublayer:_tipLayer below:self.EFenceVC.view.layer];
}

/**
 *  点击“点击地图设置围栏地址”按钮，按钮消失
 */
- (void)removeTip{
    if (_tipLayer) {
        [_tipLayer removeFromSuperlayer];
        _tipLayer = nil;
    }
}

/**
 *  显示电子围栏图形
 *
 *  @param coordinate 中心点坐标
 *  @param radius     围栏半径
 */
- (void)showElectronicFence{
    //先移除之前显示的围栏
    [self removeEverythingAboutTheFence];
    //如果有中心点坐标不为0
    if (_EFenceVC.efenceData.point.latitude) {
        //放置中心点,显示围栏范围
        self.eFenceArea.coordinate = _EFenceVC.efenceData.point;
        _eFenceArea.radius = [_EFenceVC.efenceData.distance doubleValue];
        [_mapview addOverlay:_eFenceArea];
        
        self.eFenceCenterAnnotation.coordinate = _EFenceVC.efenceData.point;
        _eFenceCenterAnnotation.title = @"电子围栏中心点";
        [_mapview addAnnotation:_eFenceCenterAnnotation];
        _EFenceVC.cancelBtn.alpha = 1;
        _EFenceVC.cancelBtn.userInteractionEnabled = YES;//放置中心点的同时启用取消按钮交互
        //添加半径显示文字
        [_mapview addAnnotation:self.radiusLabel];
        //在地图上完全显示半径线段
        [self showRadiusLine];
    }

}
/**
 *  标签根据内容自适应宽度
 */
- (void)lableAutoFit:(UILabel *)label{
    CGSize maximumLabelSize = CGSizeMake(20, MAXFLOAT);
    CGSize expectSize = [label sizeThatFits:maximumLabelSize];
    CGRect frame = label.frame;
    frame.size.width = expectSize.width;
    label.frame = frame;
}


/**
 *  移除一切有关围栏的标注和覆盖物
 */
- (void)removeEverythingAboutTheFence{
    if (_eFenceCenterAnnotation) {
        [_mapview removeAnnotation:_eFenceCenterAnnotation];
    }
    if (_eFenceArea) {
        [_mapview removeOverlay:_eFenceArea];
    }
    if (_radiusLabel) {
        [_mapview removeAnnotation:_radiusLabel];
        _radiusLabel = nil;
    }
    if (_radiusLine) {
        [_mapview removeOverlay:_radiusLine];
    }
}

/**
 *  定位用户
 */
- (void)locateUser{
    NSLog(@"%f,%f",_mapview.userLocation.location.coordinate.latitude,_mapview.userLocation.location.coordinate.longitude);
    [self getUserLocation];
    if (_mapview.userLocation.location.coordinate.latitude == 0) {
        [_mapview setCenterCoordinate:[CLLocationManager tranferGPSToAMap:[CLLocationManager lastUserLocation]]];
        return;
    }
    [self showSingleAnno:_mapview.userLocation.location.coordinate];
}

///**
// *  自定义精度圈
// *
// *  @param imagename 人员位置图标名称，该图片必须放在mapapi.bundle中
// */
//- (void)customLocationAccuracyCircle:(NSString*)imagename {
//    BMKLocationViewDisplayParam *param = [[BMKLocationViewDisplayParam alloc] init];
//    param.isAccuracyCircleShow = YES;
//    param.accuracyCircleFillColor = [UIColor colorWithRed:0.008 green:0.416 blue:0.871 alpha:0.100];
//    param.accuracyCircleStrokeColor = [UIColor clearColor];
//    param.isRotateAngleValid = NO;
//    param.locationViewImgName = imagename;
//    [_BMView updateLocationViewWithParam:param];
//}
/**
 *  开始定位用户
 */
- (void)getUserLocation{
    _mapview.showsUserLocation = NO;
}

#pragma mark --- MAMapViewDelegate

- (void)mapView:(MAMapView *)mapView didUpdateUserLocation:(MAUserLocation *)userLocation updatingLocation:(BOOL)updatingLocation{
    NSLog(@"userLocation -- %f,%f",userLocation.location.coordinate.latitude,userLocation.location.coordinate.longitude);
    if (_isFirstGetCarError) {
        [SVProgressHUD showErrorWithStatus:@"获取车辆位置失败"];
        [self locateUser];
        _isFirstGetCarError = NO;
        _firstRefreshed = YES;
        return;
    }
    if (_firstRefreshed) {
        return;
    }
    // If this is not the first update, don't excecute the code below
    [SVProgressHUD dismiss];
    [self showBothAnno:_carAnnotation.coordinate userLoc:_mapview.userLocation.location.coordinate];
    _firstRefreshed = YES;
}

- (void)mapView:(MAMapView *)mapView didFailToLocateUserWithError:(NSError *)error{
    NSLog(@"%@",error);
    [SVProgressHUD dismiss];
    _carAnnotation.coordinate.latitude != 0 ? [_mapview setCenterCoordinate:_carAnnotation.coordinate animated:YES] : nil;
    
    _firstRefreshed = YES;
}

- (MAAnnotationView *)mapView:(MAMapView *)mapView viewForAnnotation:(id<MAAnnotation>)annotation{
    
    /* 自定义userLocation对应的annotationView. */
    if ([annotation isKindOfClass:[MAUserLocation class]])
    {
//        static NSString *userLocationStyleReuseIndetifier = @"userLocationStyleReuseIndetifier";
//        MAAnnotationView *annotationView = [mapView dequeueReusableAnnotationViewWithIdentifier:userLocationStyleReuseIndetifier];
//        if (annotationView == nil)
//        {
//            annotationView = [[MAPinAnnotationView alloc] initWithAnnotation:annotation
//                                                             reuseIdentifier:userLocationStyleReuseIndetifier];
//        }
//        
//        annotationView.image = [BundleTools imageNamed:@"人员定位"];
//        return annotationView;
        return nil;
    }

    MAAnnotationView *annoView = [[MAAnnotationView alloc]initWithAnnotation:annotation reuseIdentifier:@"lAnnotation"];
    annoView.draggable = NO;
    UIImage *image = nil;
    if (annotation == _carAnnotation) {
        NSString* carState = [self.carData objectForKey:@"carState"];
        image = [BundleTools imageNamed: ([carState isEqual:@"on"] ? @"行驶中汽车ICO" : @"停止汽车ICO")];
        UIImageView *car = [[UIImageView alloc]initWithImage:image];
        car.center = CGPointMake(0, 0);
        [annoView addSubview:car];
        float angel = ((NSString *)self.carData[@"carLocation"][@"heading"]).floatValue;
        float radian = M_PI / 180 * angel;
        car.transform = CGAffineTransformMakeRotation(radian - M_PI / 180 * 90);
    }else if (annotation == _eFenceCenterAnnotation){
        image = [BundleTools imageNamed:@"fence_center_icon"];
        annoView.image = image;
    }else if (annotation == _radiusLabel){
        UILabel *radiusLabel = [[UILabel alloc]init];
        radiusLabel.height = 20;
        radiusLabel.text = [_EFenceVC.efenceData adaptRadiusContent];
        radiusLabel.textColor = [UIColor colorWithRed:0.035 green:0.667 blue:0.925 alpha:1.000];
        [self lableAutoFit:radiusLabel];
        radiusLabel.center = CGPointMake(0, - radiusLabel.height / 2);
        [annoView addSubview:radiusLabel];
    }
    return annoView;
}

- (void)mapView:(MAMapView *)mapView regionWillChangeAnimated:(BOOL)animated{
    if (_isEfenceEditMode) {
//        NSLog(@"地图开始移动")
        [self removeEverythingAboutTheFence];
        [_mapview.layer addSublayer:self.centerPinLayer];
        [self removeTip];
    }
}

- (void)mapView:(MAMapView *)mapView regionDidChangeAnimated:(BOOL)animated{
    if (_isEfenceEditMode) {
//         NSLog(@"地图停止移动")
        //移除大头针图片
        if (_centerPinLayer) {
            [_centerPinLayer removeFromSuperlayer];
        }
        
        _EFenceVC.efenceData.point = [_mapview convertRect:_mapview.bounds toRegionFromView:_mapview].center;
        [_EFenceVC enableSaveBtn];
        [self showElectronicFence];
    }
}

- (MAOverlayRenderer *)mapView:(MAMapView *)mapView rendererForOverlay:(id<MAOverlay>)overlay{
    if ([overlay isKindOfClass:[MACircle class]]) {
        MACircleRenderer *range = [[MACircleRenderer alloc]initWithCircle:overlay];
        range.fillColor = [[UIColor alloc]initWithRed:0.035 green:0.667 blue:0.925 alpha:0.2];
        range.strokeColor =[[UIColor alloc]initWithRed:0.035 green:0.667 blue:0.925 alpha:1];
        range.lineWidth = 1;
        return range;
    }else if ([overlay isKindOfClass:[MAPolyline class]]){
        MAPolylineRenderer *radiusLineView = [[MAPolylineRenderer alloc]initWithPolyline:overlay];
        
        radiusLineView.strokeColor = [[UIColor alloc]initWithRed:0 green:0.667 blue:0.925 alpha:1];
        radiusLineView.lineWidth = 1;
        return radiusLineView;
    }
    return nil;
}

#pragma mark - EFenceSettingViewDelegate
/**
 *  电子围栏数据被更改
 */
- (void)dataChanged{
    //重新画圆
    [self showElectronicFence];
    [self displayFullFenceAreaOnMap];
    [_centerPinLayer removeFromSuperlayer];
}
/**
 *  电子围栏被删除
 */
- (void)efenceDeleted{
    [_naviOperBlockView setHidden:NO];
    [_EfenceBtn setSelected:NO];
    //清空数据
    [EfenceDataModel clearFenceData:_EFenceVC.efenceData.fenceId];
    //从地图上移除围栏
    [self removeEverythingAboutTheFence];
    _EFenceVC = nil;
    if (_centerPinLayer) {
        [_centerPinLayer removeFromSuperlayer];
    }
}
/**
 *  保存电子围栏数据
 */
- (void)efenceSaved{
    [EfenceDataModel updateFenceData:_EFenceVC.efenceData];
    [_EFenceVC disableSaveBtn];
    [self removeTip];
    if (_centerPinLayer) {
        [_centerPinLayer removeFromSuperlayer];
    }
    _isEfenceEditMode = NO;
    [self displayFullFenceAreaOnMap];
    [SVProgressHUD showWithStatus:@"正在保存..."];
}

- (void)cancelInitializeFence{
    [_naviOperBlockView setHidden:NO];
    [_EfenceBtn setSelected:NO];
    _isEfenceEditMode = NO;
    [_centerPinLayer removeFromSuperlayer];
    //从地图上移除围栏
    [self removeEverythingAboutTheFence];
    [self removeTip];
    _EFenceVC = nil;
}

#pragma mark - UITextFieldDelegate

- (BOOL)textField:(UITextField *) textField shouldChangeCharactersInRange:(NSRange)range replacementString:
    (NSString *)string {
    if(range.length + range.location > textField.text.length)
    {
        return false;
    }
    
    NSUInteger newLength = [textField.text length] + [string length] - range.length;
    return newLength <= 6;
}



#pragma mark - PinViewDelegate

- (void)didClickConfirmOnPinView:(PinView *)pinView inputPinCode:(NSString *)PinCode{
    if (PinCode.length < 6) {
        [SVProgressHUD showErrorWithStatus:@"请输入六位控车码"];
        return;
    }
    [self onConfirmPassword:PinCode];
    [pinView dismiss];
}

#pragma mark - AuthCodeViewDelegate

- (void)didClickConfirmOnAuthCodeView:(AuthCodeView *)authCodeView inputAuthCode:(NSString *)code{
    if(code.length < 6)
    {
        [SVProgressHUD showErrorWithStatus:@"请输入6位验证码"];
    }
    else
    {
        NSString *jsmethod = [NSString stringWithFormat:@"controlAuthMethod('%@')",code];
        [[DoEventManager shared] javaScriptCallMethod:jsmethod];
        [SVProgressHUD showWithStatus:@"正在验证"];
        [authCodeView dismiss];
    }
}


- (void)didClickGetAuthCode:(AuthCodeView *)authCodeView inputedImageAuthCode:(NSString *)code imageId:(NSString *)imageId{
    if (code && ![code isEqualToString:@""]) {
        //传递参数 code和imageId，调用JS向手机发送验证码，等待发送回调
        NSString *jsmethod = [NSString stringWithFormat:@"sentCode('%@','%@')",code,imageId];
        [[DoEventManager shared] javaScriptCallMethod:jsmethod];
    }else{
        [SVProgressHUD showErrorWithStatus:@"请先输入图片验证码"];
    }
}

#pragma mark --- EfenceListVCDelegate


- (void)clickAddNewFenceBtn:(EfenceListViewController *)efenceListVC{
    NSDictionary *data;
    self.EFenceVC.efenceData = [EfenceDataModel generateDataModelWithData:data];
    [self.EFenceVC showMenuViewOn:self.view];
    //如果没有中心点坐标则未设置围栏，出现提示按钮，禁用删除围栏按钮交互
    if (_EFenceVC.efenceData.point.latitude == 0.0) {
        _EFenceVC.cancelBtn.alpha = 0.4;
        _EFenceVC.cancelBtn.userInteractionEnabled = NO;
        [self setDefaultEfence];
    }
    //隐藏导航
    [_naviOperBlockView setHidden:YES];
    [_EfenceBtn setSelected:YES];
}

- (void)EfenceListVC:(EfenceListViewController *)efenceListVC didSelectEfence:(EfenceDataModel *)fenceData{
    self.EFenceVC.efenceData = fenceData;
    [self.EFenceVC showMenuViewOn:self.view];
    //如果没有中心点坐标则未设置围栏，出现提示按钮，禁用删除围栏按钮交互
    if (_EFenceVC.efenceData.point.latitude == 0.0) {
        _EFenceVC.cancelBtn.alpha = 0.4;
        _EFenceVC.cancelBtn.userInteractionEnabled = NO;
        [self setDefaultEfence];
    }
    
    //隐藏导航
    [_naviOperBlockView setHidden:YES];
    [_EfenceBtn setSelected:YES];
    
}
@end

//
//  DrivingRouteViewController.m
//  chameleon
//
//  Created by Checker on 16/2/24.
//
//
#import "DrivingRouteViewController.h"
#import "DrivingRouteItemViewController.h"
#import "M0038_CarNetMap_App.h"
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
#import "UIImage+Rotate.h"
#import "UIView+Extension.h"
#import "CLLocationManager+Extension.h"
#import "NaviPointAnnotation.h"
#import <MAMapKit/MAMapKit.h>
#import <MAMapKit/MATraceManager.h>
#import "BundleTools.h"
@interface DrivingRouteViewController () <UIScrollViewDelegate,MAMapViewDelegate>
{
    DotCDictionaryWrapper*  _data;
    NSMutableArray*         _routeItemViewControllers;
    int                     _curItem;
    MAMapView*              _mapView;
}
@property (weak, nonatomic) IBOutlet UIImageView *back;
@property (weak, nonatomic) IBOutlet UIScrollView *itemContainerView;
@property (weak, nonatomic) IBOutlet UILabel *mileView;
@property (weak, nonatomic) IBOutlet UILabel *speedView;
@property (weak, nonatomic) IBOutlet UILabel *timeView;
@property (weak, nonatomic) IBOutlet UILabel *oilView;
@property (weak, nonatomic) IBOutlet UIView *mapContainerView;
//@property (weak, nonatomic) UIActivityIndicatorView *indicator;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *indicator;

@end

@implementation DrivingRouteViewController


- (instancetype) initWithData:(DotCDictionaryWrapper*)data
{
    if(!(self = [self init]))
    {
        return self;
    }
    
    _data    = data;
    _curItem = -1;
    NSLog(@"----initWithData----");
    return self;
}
- (id)init{
    
    NSBundle *myBundle = [BundleTools getBundle];
    
    //self = [super initWithNibName: @"ViewController1" bundle: nil];
    //从bundle中获取界面文件
    self = [super initWithNibName: [NSString stringWithUTF8String: object_getClassName(self)] bundle: myBundle];
    if (self) {
        // Custom initialization
    }
    return self;
}



- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    NSLog(@"----initWithData----");
    
    
    float deviceSystem = [[[UIDevice currentDevice] systemVersion] floatValue];
    if (deviceSystem <= 7.0)
    {
        UIView* statusBar = [self.view viewWithTag:1];
        statusBar.hidden  = true;
        UIView* content   = [self.view viewWithTag:2];
        content.frame     = self.view.frame;
    }
    self.back.image = [BundleTools imageNamed:@"back"];
    self.view.clipsToBounds = YES;
    _itemContainerView.clipsToBounds = NO;
    [_indicator setHidesWhenStopped:YES];
    [_indicator stopAnimating];
    _mapContainerView.frame = [UIScreen mainScreen].bounds;
    CGRect frame = self.mapContainerView.frame;
    frame.origin.x = 0;
    frame.origin.y = 0;
    
    _mapView = [[MAMapView alloc]initWithFrame:frame];
//    _mapView.showsCompass = NO;
    _mapView.showsScale = NO;
    [_mapView setCenterCoordinate:[CLLocationManager tranferGPSToAMap:[CLLocationManager lastUserLocation]]];
    [self.mapContainerView addSubview:_mapView];
    _mapView.delegate = self;
    
    NSArray* list = [_data getArray:@"list"];
    _routeItemViewControllers = [[NSMutableArray alloc] initWithCapacity:list.count];
    self.itemContainerView.width = SCREEN_W - 18 - 18;
    float w = self.itemContainerView.frame.size.width;
    float h = self.itemContainerView.frame.size.height;
    
    [self.itemContainerView setContentSize:CGSizeMake(w*list.count, h)];
    
    DrivingRouteItemViewController* item = nil;
    CGRect f;
    f.size.width  = w;
//    f.size.height = h;
    f.origin.y = 0;
    f.origin.x = 0;
    for(int i=0,i_sz=(int)list.count; i<i_sz; ++i)
    {
        item = [[DrivingRouteItemViewController alloc] initWithRouteID:list[i]];
        f.origin.y = (h - item.view.frame.size.height) / 2;
        f.size.height = h > item.view.frame.size.height ? item.view.frame.size.height : h;
        item.view.frame = f;
        [self.itemContainerView addSubview:item.view];
        item.view.layer.borderWidth = 0.5;
        item.view.layer.borderColor = [UIColor colorWithWhite:0.675 alpha:1.000].CGColor;
        [_routeItemViewControllers addObject:item];
        f.origin.x += w ;
    }
    
    
    [self showRouteItem:[_data getInt:@"cur"]];
    NSArray *subs = self.itemContainerView.subviews;
    CGFloat horrizen = self.itemContainerView.bounds.size.width / 2;
    CGFloat contentOffsetX = self.itemContainerView.contentOffset.x;
    for (UIView *sub in subs) {
        CGFloat centerX = sub.center.x;
        CGFloat scale = 1 - ABS(horrizen + contentOffsetX - centerX) * 0.1 / horrizen;
        CGFloat x = MAX(0.95, MIN(scale, 1));
        sub.transform = CGAffineTransformMakeScale(x, x);
    }
}
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
- (void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
//    [MobClick beginLogPageView:@"行车轨迹"];
}

- (void)viewDidDisappear:(BOOL)animated{
    [super viewDidDisappear:animated];
//    [MobClick endLogPageView:@"行车轨迹"];
}

- (IBAction)onBack:(UIButton *)sender
{
    [self.navigationController dismissViewControllerAnimated:YES completion:nil];
}

- (void)showRouteItem:(int) index
{
    if(_curItem == index)
    {
        return ;
    }
    _curItem = index;
    
    [self.itemContainerView setContentOffset:CGPointMake(self.itemContainerView.frame.size.width*_curItem, 0)];
    DrivingRouteItemViewController* item = _routeItemViewControllers[_curItem];
    
    //显示当前页数和总页数
    NSString *pageCount = [NSString stringWithFormat:@"%d/%lu",index+1,(unsigned long)_routeItemViewControllers.count];
    
    item.pageCountLabel.attributedText = [self attributePageCountWithString:pageCount];
    
    DotCDictionaryWrapper* itemData = item.drivingData;
    if(!itemData) // Get data from server
    {
        NSString* js = [NSString stringWithFormat:@"getOneTrajectoryData('%d', '%@')", _curItem, item.routeID];
        [[DoEventManager shared] javaScriptCallMethod:js];
        [self.indicator startAnimating];
        return ;
    }
    
    [self updateMapInfo:item];
}

- (void) updateMapInfo:(DrivingRouteItemViewController*)item
{
    [self.indicator stopAnimating];
    DotCDictionaryWrapper* itemData = item.drivingData;
    float kilometers = [[itemData getString:@"mileage"] floatValue];
    self.mileView.text = [NSString stringWithFormat:@" 里程：%.2f km ",kilometers];
    [self lableAutoFit:_mileView];
    self.timeView.text =[NSString stringWithFormat:@" 耗时：%@ ",[self changeTimeFormat:[itemData getString:@"spendTime"]]];
    [self lableAutoFit:_timeView];
    self.speedView.text = [NSString stringWithFormat:@" 时速：%@ km/h ",[itemData getString:@"avrgSpeed"]];
    [self lableAutoFit:_speedView];
//    self.oilView.text = [NSString stringWithFormat:@" 耗油：%@ L ",[itemData getString:@"oil"]];
//    [self lableAutoFit:_oilView];
    
    NSArray* array = [NSArray arrayWithArray:_mapView.annotations];
    [_mapView removeAnnotations:array];
    
    array = [NSArray arrayWithArray:_mapView.overlays];
    [_mapView removeOverlays:array];
    
    SCoordLocation* coordLocations = item.coordLocations;
    int coordLocationCount = item.coordLocationCount;
    if(coordLocationCount == 0)
    {
        return ;
    }
    
    // Start and Stop
    CLLocationCoordinate2D start = CLLocationCoordinate2DMake(coordLocations[0].lat, coordLocations[0].lng);
    CLLocationCoordinate2D stop = CLLocationCoordinate2DMake(coordLocations[coordLocationCount-1].lat, coordLocations[coordLocationCount-1].lng);
    NaviPointAnnotation* anno = [[NaviPointAnnotation alloc]init];
    anno.navPointType = NaviPointAnnotationStart;
    anno.coordinate = start;
    anno.title = @"起点";
    [_mapView addAnnotation:anno];
    
    
    
    anno = [[NaviPointAnnotation alloc]init];
    anno.navPointType = NaviPointAnnotationEnd;
    anno.coordinate = stop;
    anno.title = @"终点";
    [_mapView addAnnotation:anno];
    
    // Route
    CLLocationCoordinate2D *coords = (CLLocationCoordinate2D *)malloc(coordLocationCount * sizeof(CLLocationCoordinate2D));
    NSMutableArray *tempArr = [NSMutableArray new];
    for (int i = 0; i < coordLocationCount; i++)
    {
//        coords[i].latitude = coordLocations[i].lat;
//        coords[i].longitude = coordLocations[i].lng;
        
        CLLocationCoordinate2D tempcoords = CLLocationCoordinate2DMake(coordLocations[i].lat, coordLocations[i].lng);
        
        coords[i].latitude = tempcoords.latitude;
        coords[i].longitude = tempcoords.longitude;
        
        
        MATraceLocation *location = [[MATraceLocation alloc]init];
        location.loc = CLLocationCoordinate2DMake(coords[i].latitude, coords[i].longitude);
        [tempArr addObject:location];
    }
    
//    MATraceManager *temp = [[MATraceManager alloc] init];
//    
//    [temp queryProcessedTraceWith:tempArr type:0 processingCallback:^(int index, NSArray<MATracePoint *> *points) {
//        DEBUG_LOG(@"-- Processing --")
//    } finishCallback:^(NSArray<MATracePoint *> *points, double distance) {
//        DEBUG_LOG(@"-- finish --")
//        MAPolyline* polyLine = [self makePolyLineWith:points];
//        [_mapView addOverlay:polyLine];
//        free(coords);
//    } failedCallback:^(int errorCode, NSString *errorDesc) {
//        DEBUG_LOG(@"-- failed --")
//        MAPolyline* polyLine = [MAPolyline polylineWithCoordinates:coords count:coordLocationCount];
//        [_mapView addOverlay:polyLine];
//        free(coords);
//    }];
    
    MAPolyline* polyLine = [MAPolyline polylineWithCoordinates:coords count:coordLocationCount];
    [_mapView addOverlay:polyLine];
    free(coords);
    
    //急加速、急减速、急转弯
//    if (item.speedUpCount) {
//        NSArray* speedUpPoints = item.speedUpPoints;
//        for (int i = 0; i < item.speedUpCount; i ++) {
//            NaviPointAnnotation* anno = [[NaviPointAnnotation alloc]init];
//            float lng = [speedUpPoints[i][0] floatValue];
//            float lat = [speedUpPoints[i][1] floatValue];
//            CLLocationCoordinate2D point = CLLocationCoordinate2DMake(lat, lng);
//            anno.coordinate = point;
//            anno.title = @"急加速";
//            anno.navPointType = NaviPointAnnotationSpeedUp;
//            [_mapView addAnnotation:anno];
//        }
//    }
//    if (item.speedDownCount) {
//        NSArray* speedDownPoints = item.speedDownPoints;
//        for (int i = 0; i < item.speedDownCount; i ++) {
//            NaviPointAnnotation* anno = [[NaviPointAnnotation alloc]init];
//            float lng = [speedDownPoints[i][0] floatValue];
//            float lat = [speedDownPoints[i][1] floatValue];
//            CLLocationCoordinate2D point = CLLocationCoordinate2DMake(lat, lng);
//            anno.coordinate = point;
//            anno.title = @"急减速";
//            anno.navPointType = NaviPointAnnotationSpeedDown;
//            [_mapView addAnnotation:anno];
//        }
//    }
//    if (item.sharpTurnCount) {
//        NSArray* sharpTurnPoints = item.sharpTurnPoints;
//        for (int i = 0; i < item.sharpTurnCount; i ++) {
//            NaviPointAnnotation* anno = [[NaviPointAnnotation alloc]init];
//            float lng = [sharpTurnPoints[i][0] floatValue];
//            float lat = [sharpTurnPoints[i][1] floatValue];
//            CLLocationCoordinate2D point = CLLocationCoordinate2DMake(lat, lng);
//            anno.coordinate = point;
//            anno.title = @"急转弯";
//            anno.navPointType = NaviPointAnnotationRapidTurn;
//            [_mapView addAnnotation:anno];
//        }
//    }
    
    //显示区域
    
    [_mapView showOverlays:@[polyLine] edgePadding:UIEdgeInsetsMake(15, 15, _itemContainerView.height + 15, 15) animated:YES];
}

- (void) updateItemData:(DotCDictionaryWrapper*)data at:(int)index
{
    DrivingRouteItemViewController* item = _routeItemViewControllers[index];
    item.drivingData = data;
//    //tbox车不显示油耗
//    if ([self.carDevice isEqualToString:@"tbox"]) {
//        _oilView.hidden = YES;
//    }
    if(index == _curItem)
    {
        [self updateMapInfo:item];
    }
}

- (MAMultiPolyline *)makePolyLineWith:(NSArray<MATracePoint*> *)tracePoints {
    if(tracePoints.count == 0) {
        return nil;
    }
    
    CLLocationCoordinate2D *pCoords = malloc(sizeof(CLLocationCoordinate2D) * tracePoints.count);
    if(!pCoords) {
        return nil;
    }
    
    for(int i = 0; i < tracePoints.count; ++i) {
        MATracePoint *p = [tracePoints objectAtIndex:i];
        CLLocationCoordinate2D *pCur = pCoords + i;
        pCur->latitude = p.latitude;
        pCur->longitude = p.longitude;
    }
    
    MAMultiPolyline *polyline = [MAMultiPolyline polylineWithCoordinates:pCoords count:tracePoints.count drawStyleIndexes:@[@10, @60]];
    
    if(pCoords) {
        free(pCoords);
    }
    
    return polyline;
}


#pragma mark - UIScrollViewDelegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView{
    NSArray *subs = scrollView.subviews;
    CGFloat horrizen = scrollView.bounds.size.width / 2;
    CGFloat contentOffsetX = scrollView.contentOffset.x;
    for (UIView *sub in subs) {
        CGFloat centerX = sub.center.x;
        CGFloat scale = 1 - ABS(horrizen + contentOffsetX - centerX) * 0.1 / horrizen;
        CGFloat x = MAX(0.95, MIN(scale, 1));
        sub.transform = CGAffineTransformMakeScale(x, x);
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView
{
    [self showRouteItem:(int)(scrollView.contentOffset.x/scrollView.frame.size.width)];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSString *)changeTimeFormat:(NSString *)time{
    int t = [time intValue];
    int totalMinutes = t;
    int minutes = totalMinutes % 60;
    int hours = (totalMinutes / 60) % 60;
//    int days = totalMinutes / 1440;
    if (hours == 0) {
        return [NSString stringWithFormat:@"%d分钟",minutes];
    }else{
        return [NSString stringWithFormat:@"%d小时%d分钟",hours,minutes];
    }

}

- (void)lableAutoFit:(UILabel *)label{
    label.backgroundColor = [UIColor colorWithRed:0.098 green:0.094 blue:0.129 alpha:0.700];
    CGSize maximumLabelSize = CGSizeMake(21, MAXFLOAT);
    CGSize expectSize = [label sizeThatFits:maximumLabelSize];
    CGRect frame = label.frame;
    frame.size.width = expectSize.width;
    label.frame = frame;
}

/**
 *  以富文本的形式显示页数
 *
 *  @param pageCount 普通字符串
 *
 *  @return 属性化字符串
 */
- (NSMutableAttributedString *)attributePageCountWithString:(NSString *)pageCount{
    NSRange range = [pageCount rangeOfString:@"/"];
    
    NSRange curruntPageRange = NSMakeRange(0, range.location);
    
    NSRange leftRange = NSMakeRange(curruntPageRange.location + 1, pageCount.length - curruntPageRange.length);
    
    NSMutableAttributedString *attributedText = [[NSMutableAttributedString alloc]initWithString:pageCount];
    [attributedText addAttribute:NSFontAttributeName value:[UIFont systemFontOfSize:12] range:curruntPageRange];
    [attributedText addAttribute:NSFontAttributeName value:[UIFont systemFontOfSize:9] range:leftRange];
    return attributedText;
}

#pragma mark --- MAMapViewDelegate

- (MAAnnotationView *)mapView:(MAMapView *)mapView viewForAnnotation:(id<MAAnnotation>)annotation{
    NaviPointAnnotation *anno = (NaviPointAnnotation *)annotation;
    MAAnnotationView *annoView = [[MAAnnotationView alloc]initWithAnnotation:annotation reuseIdentifier:@"NaviPoints"];
    UIImage *annoImage = nil;
    switch (anno.navPointType) {
        case NaviPointAnnotationStart:
            annoImage = [BundleTools imageNamed:@"起"];
            break;
        case NaviPointAnnotationEnd:
            annoImage = [BundleTools imageNamed:@"终"];
            break;
        case NaviPointAnnotationSpeedUp:
            annoImage = [BundleTools imageNamed:@"急加速"];
            break;
        case NaviPointAnnotationSpeedDown:
            annoImage = [BundleTools imageNamed:@"急减速"];
            break;
        case NaviPointAnnotationRapidTurn:
            annoImage = [BundleTools imageNamed:@"急转弯"];
            break;
        default:
            break;
    }
    annoView.image = annoImage;
    return annoView;
}

- (MAOverlayRenderer *)mapView:(MAMapView *)mapView rendererForOverlay:(id<MAOverlay>)overlay{
    if ([overlay isKindOfClass:[MAPolyline class]]) {
        MAPolylineRenderer *polylineView = [[MAPolylineRenderer alloc] initWithPolyline:overlay];
        polylineView.lineWidth   = 8.f;
        [polylineView loadStrokeTextureImage:[BundleTools imageNamed:@"arrowTexture0"]];
        return polylineView;
    }
    return nil;
}

@end

//
//  DrivingRouteItemViewController.m
//  chameleon
//
//  Created by Checker on 16/2/24.
//
//

#import "DrivingRouteItemViewController.h"
#import "BundleTools.h"
//RGB颜色
#define RTColor(r, g, b) [UIColor colorWithRed:(r)/255.0 green:(g)/255.0 blue:(b)/255.0 alpha:1.0]

@interface DrivingRouteItemViewController ()
{
    NSString*                _routeID;
    DotCDictionaryWrapper*   _drivingData;
    SCoordLocation*          _coordLocations;
    
    NSMutableArray*          _speedUpPoints;
    NSMutableArray*          _speedDownPoints;
    NSMutableArray*          _sharpTurnPoints;
    
    int                      _coordLocationCount;
    int                      _speedUpCount;
    int                      _speedDownCount;
    int                      _sharpTurnCount;
}

@property (weak, nonatomic) IBOutlet UILabel *startAddrView;
@property (weak, nonatomic) IBOutlet UILabel *stopAddrView;
@property (weak, nonatomic) IBOutlet UILabel *speedUpView;
@property (weak, nonatomic) IBOutlet UILabel *speedDownView;
@property (weak, nonatomic) IBOutlet UILabel *turnView;
@property (weak, nonatomic) IBOutlet UILabel *scoreView;
@property (weak, nonatomic) IBOutlet UILabel *levelView;
@property (weak, nonatomic) IBOutlet UILabel *startTime;
@property (weak, nonatomic) IBOutlet UILabel *stopTime;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img1;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img2;
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img3;

@end

@implementation DrivingRouteItemViewController


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
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}

- (instancetype) initWithRouteID:(NSString*)routeID
{
    if(!(self = [self init]))
    {
        return self;
    }
    
    _routeID = routeID;
    _coordLocations = NULL;
    _coordLocationCount = 0;
    _speedUpCount = 0;
    _speedDownCount = 0;
    _sharpTurnCount = 0;
    
    _speedUpPoints = [NSMutableArray new];
    _speedDownPoints = [NSMutableArray new];
    _sharpTurnPoints = [NSMutableArray new];
    
    return self;
}

- (void)dealloc
{
    if(_coordLocations)
    {
        free(_coordLocations);
        _coordLocations = NULL;
        _coordLocationCount = 0;
        _speedUpCount = 0;
        _speedDownCount = 0;
        _sharpTurnCount = 0;
    }
}

- (SCoordLocation*) coordLocations
{
    return _coordLocations;
}

- (int) coordLocationCount
{
    return _coordLocationCount;
}

- (void) setDrivingData:(DotCDictionaryWrapper*)data
{
    _drivingData = data;
    
    if(_coordLocations)
    {
        free(_coordLocations);
        _coordLocations = NULL;
        _coordLocationCount = 0;
        _speedUpCount = 0;
        _speedDownCount = 0;
        _sharpTurnCount = 0;
    }
    
    NSData *jsonData = [[data getString:@"addressPoints"] dataUsingEncoding:NSUTF8StringEncoding];
    
    NSArray* pts = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:nil];
    
    if(pts && pts.count > 0)
    {
        _coordLocationCount = (int)pts.count;
        _coordLocations = malloc(pts.count*sizeof(SCoordLocation));
        
        for(int i=0,i_sz=(int)pts.count; i<i_sz; ++i)
        {
            //val = (NSArray*)pts[i];
            //rg = [val rangeOfString:@","];
            //_coordLocations[i].lng = [val substringToIndex:rg.location].floatValue;
            //_coordLocations[i].lat = [val substringFromIndex:rg.location+1].floatValue;
			_coordLocations[i].lng = [pts[i][0] floatValue];
            _coordLocations[i].lat = [pts[i][1] floatValue];
            
//            DEBUG_LOG(@"%@",[pts[i][6] class]);
            NSString *lng = [NSString stringWithFormat:@"%f",_coordLocations[i].lng];
            NSString *lat = [NSString stringWithFormat:@"%f",_coordLocations[i].lat];
            
            
            if (![pts[i][6] isKindOfClass:[NSNull class]] && [pts[i][6] intValue]){
                //该点急加速
                NSArray *point = [NSArray arrayWithObjects:lng, lat, nil];
                [_speedUpPoints addObject:point];
                _speedUpCount++;
            }else if (![pts[i][7] isKindOfClass:[NSNull class]] && [pts[i][7] intValue]){
                //该点急减速
                NSArray *point = [NSArray arrayWithObjects:lng, lat, nil];
                [_speedDownPoints addObject:point];
                _speedDownCount++;
            }else if (![pts[i][8] isKindOfClass:[NSNull class]] && [pts[i][8] intValue]){
                //该点急转弯
                NSArray *point = [NSArray arrayWithObjects:lng, lat, nil];
                [_sharpTurnPoints addObject:point];
                _sharpTurnCount++;
            }
        }
    }
    
    [self update];
}

- (NSString*) routeID
{
    return _routeID;
}

- (DotCDictionaryWrapper*) drivingData
{
    return _drivingData;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    [self.img1 setImage:[BundleTools imageNamed:@"急加速_icon"]];
    [self.img2 setImage:[BundleTools imageNamed:@"急减速_icon"]];
    [self.img3 setImage:[BundleTools imageNamed:@"急转弯_icon"]];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void) update
{
    self.startAddrView.text = [_drivingData getString:@"startAddressName"];
    self.stopAddrView.text = [_drivingData getString:@"endAddressName"];
    
    self.startTime.text = [self simplifyTime:[_drivingData getString:@"startTime"]];
    self.stopTime.text = [self simplifyTime:[_drivingData getString:@"endTime"]];
    
    self.speedUpView.text = [NSString stringWithFormat:@"%d",_speedUpCount];
    self.speedDownView.text = [NSString stringWithFormat:@"%d",_speedDownCount];;
    self.turnView.text = [NSString stringWithFormat:@"%d",_sharpTurnCount];
    
    self.scoreView.text = [_drivingData getString:@"score"];
    self.levelView.text = [_drivingData getString:@"scoreLevel"];
    
    NSString* lvlColor = [_drivingData getString:@"scoreColor"];
    UIColor* clr = nil;
    if([lvlColor isEqualToString:@"green"])
    {
        clr = [UIColor colorWithRed:0.125 green:0.769 blue:0.506 alpha:1.000];
    }
    else if([lvlColor isEqualToString:@"red"])
    {
        clr = [UIColor redColor];
    }
    else if([lvlColor isEqualToString:@"yellow"])
    {
        clr = [UIColor yellowColor];
    }
    
    if(clr)
    {
        self.levelView.textColor = clr;
    }
    
}

- (NSString* )simplifyTime:(NSString*)originalTime{
    NSInteger length = originalTime.length;
    NSRange rang = NSMakeRange(length-8, 5);
    NSString *simplifiedTime = [originalTime substringWithRange:rang];
    return simplifiedTime;
}

- (NSArray*)speedUpPoints{
    return _speedUpPoints;
}
- (NSArray*)speedDownPoints{
    return _speedDownPoints;
}
- (NSArray*)sharpTurnPoints{
    return _sharpTurnPoints;
}

- (int) speedUpCount{
    return _speedUpCount;
}
- (int) speedDownCount{
    return _speedDownCount;
}
- (int) sharpTurnCount{
    return _sharpTurnCount;
}
/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end

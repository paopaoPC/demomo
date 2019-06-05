//
//  WayPointBlockView.m
//  chameleon
//
//  Created by 傅祚鹏 on 2017/1/3.
//
//
#import "BundleTools.h"
#import "WayPointBlockView.h"
#import "UIView+Extension.h"
#import "DestinationLocation.h"
#import "NaviPointAnnotation.h"
//#import <MAMapKit/MAMapKit.h>
#import <AMapSearchKit/AMapSearchKit.h>
static CALayer *centtralAnnotaion;
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375 
@interface WayPointBlockView()<AMapSearchDelegate>
@property (assign, nonatomic)id<WayPointBlockViewDelegate>delegate;
@property (weak, nonatomic) IBOutlet UILabel *addressLabel;

@property (weak, nonatomic) IBOutlet UILabel *detailLabel;
@property (weak, nonatomic) IBOutlet UIButton *comfirmBtn;
@property (weak, nonatomic) IBOutlet UIButton *cancelBtn;


@property (strong, nonatomic)AMapSearchAPI *geoSearch;
@end


@implementation WayPointBlockView

#pragma mark --- Init Methods

- (instancetype)initWithDelegate:(id<WayPointBlockViewDelegate>)delegate{
    self = [[[BundleTools getBundle] loadNibNamed:@"WayPointBlockView" owner:nil options:nil] firstObject];
    if (self) {
        self.width = SCREEN_W;
        self.height *= factor_h;
        self.x = 0;
        self.y = SCREEN_H - self.height;
        self.delegate = delegate;
        self.detailLabel.font = [UIFont systemFontOfSize:self.detailLabel.font.pointSize*factor_h];
        self.addressLabel.font = [UIFont systemFontOfSize:self.addressLabel.font.pointSize*factor_h];
        self.comfirmBtn.titleLabel.font = [UIFont systemFontOfSize:self.comfirmBtn.titleLabel.font.pointSize*factor_h];
        self.cancelBtn.titleLabel.font = [UIFont systemFontOfSize:self.cancelBtn.titleLabel.font.pointSize*factor_h];
        self.geoSearch = [[AMapSearchAPI alloc]init];
        self.geoSearch.delegate = self;
    }
    return self;
}


- (void)setDeleteMode:(BOOL)deleteMode{
    _deleteMode = deleteMode;
    if (_deleteMode) {
        [_comfirmBtn setTitle:@"删除" forState:UIControlStateNormal];
    }else{
        [_comfirmBtn setTitle:@"确定" forState:UIControlStateNormal];
    }
}

- (void)setAssociatedAnno:(NaviPointAnnotation *)associatedAnno{
    _associatedAnno = associatedAnno;
    _addressLabel.text = _associatedAnno.address;
    _detailLabel.text = _associatedAnno.name;
}

#pragma mark --- Public Methods

- (void)locateSelectedwaypoint:(CLLocationCoordinate2D)coordinate{
    [self showCentralAnnotation];
    AMapReGeocodeSearchRequest *request = [[AMapReGeocodeSearchRequest alloc]init];
    request.location = [AMapGeoPoint locationWithLatitude:coordinate.latitude longitude:coordinate.longitude];
    request.requireExtension = YES;
    [_geoSearch AMapReGoecodeSearch:request];
    _addressLabel.text = @"定位中...";
    _detailLabel.text = @"";
    _comfirmBtn.userInteractionEnabled = NO;
}

- (void)setWayPointWithLocation:(DestinationLocation *)location{
    [self showCentralAnnotation];
    _addressLabel.text = location.name;
    _detailLabel.text = location.address;
}

- (void)cancelChooseWaypoint{
    [centtralAnnotaion removeFromSuperlayer];
    centtralAnnotaion = nil;
}


#pragma mark --- Private Methods

- (void)showCentralAnnotation{
    if (!centtralAnnotaion) {
        UIImageView *imageView = [[UIImageView alloc]initWithImage:[BundleTools imageNamed:@"way_point"]];
        imageView.width*=factor_w;
        imageView.height*=factor_h;
        imageView.center = CGPointMake(SCREEN_W/2, self.height -  SCREEN_H/2 - imageView.height/2);
        [self.layer addSublayer:imageView.layer];
        centtralAnnotaion = imageView.layer;
    }
}

#pragma mark --- Events

- (IBAction)confirm:(UIButton *)sender {
    if (_deleteMode) {
        if (self.delegate && [self.delegate respondsToSelector:@selector(didClickDeleteBtn:annotation:)]) {
            [self.delegate didClickDeleteBtn:self annotation:_associatedAnno];
        }
    }else{
        if (self.delegate && [self.delegate respondsToSelector:@selector(didClickComfirmBtn:info:)]) {
            NSDictionary *dict = @{@"detail":_addressLabel.text,@"address":_detailLabel.text};
            [self.delegate didClickComfirmBtn:self info:dict];
        }
    }
    [centtralAnnotaion removeFromSuperlayer];
    centtralAnnotaion = nil;
}

- (IBAction)cancel:(id)sender {
    if (self.delegate && [self.delegate respondsToSelector:@selector(didClickCancelBtn:)]) {
        [self.delegate didClickCancelBtn:self];
    }
    [centtralAnnotaion removeFromSuperlayer];
    centtralAnnotaion = nil;
    [self cancelChooseWaypoint];
}

#pragma mark --- AMapSearchDelegate


- (void)onReGeocodeSearchDone:(AMapReGeocodeSearchRequest *)request response:(AMapReGeocodeSearchResponse *)response{
    if (response.regeocode != nil) {
        NSString *address = response.regeocode.formattedAddress;
        if (response.regeocode.aois.count != 0) {
            AMapAOI *aoi = response.regeocode.aois[0];
            _addressLabel.text = [NSString stringWithFormat:@"%@附近",aoi.name];
        }else{
            _addressLabel.text = @"无名路";
        }
        _detailLabel.text = address;
        _comfirmBtn.userInteractionEnabled = YES;
    }else{
        _addressLabel.text = @"未找到该地点信息";
    }
}

@end

//
//  NaviRouteViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/21.
//
//

#import "NaviRouteViewController.h"
#import "BaiduMapViewController.h"
#import "RTSearchViewController.h"
#import "SVProgressHUD.h"
@interface NaviRouteViewController ()<RTSearchViewControllerDelegate,BaiduMapViewControllerDelegate>

@property (nonatomic, strong)RTSearchViewController *searchVC;

@property (nonatomic, strong)BaiduMapViewController *mapVC;

@end

@implementation NaviRouteViewController

#pragma mark --- Lazy Loads

- (RTSearchViewController *)searchVC{
    if (!_searchVC) {
        _searchVC = [[RTSearchViewController alloc]initWithDelegate:self];
       
        [self addChildViewController:_searchVC];
         _searchVC.view.frame = [UIScreen mainScreen].bounds;
        [_searchVC didMoveToParentViewController:self];
    }
    return _searchVC;
}

- (BaiduMapViewController *)mapVC{
    if (!_mapVC) {
        _mapVC = [[BaiduMapViewController alloc]initWithDelegate:self];
    
        [self addChildViewController:_mapVC];
            _mapVC.view.frame = [UIScreen mainScreen].bounds;
        [_mapVC didMoveToParentViewController:self];
    }
    return _mapVC;
}

#pragma mark --- ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    [self.view addSubview:self.searchVC.view];
    [self.view insertSubview:self.mapVC.view atIndex:0];
}
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
- (void)dealloc{
    NSLog(@"%@ is released",self.description);
}
#pragma mark --- Public Methods


#pragma mark --- Private Methods


#pragma mark --- Events


#pragma mark --- SearchViewControllerDelegate

- (void)didClickedBackBtnSearchVC:(RTSearchViewController *)searchVC{
    if (_mapVC.isSettingWayPointMode) {
        _mapVC.settingWayPointMode = NO;
        [_searchVC switchToMapView];
        return;
    }
    [self.searchVC removeFromParentViewController];
    [self.mapVC removeFromParentViewController];
    _searchVC = nil;
    _mapVC = nil;
    [self.navigationController popViewControllerAnimated:NO];
}

- (void)searchVC:(RTSearchViewController *)searchVC didSelectOneDestination:(DestinationLocation *)destination{
    self.mapVC.destination = destination;
}

- (void)searchVC:(RTSearchViewController *)searchVC isFavorite:(BOOL)isFavorite{
    self.mapVC.isFavorite = isFavorite;
}

#pragma mark --- BaiduMapViewControllerDelegate

- (void)didClickedBackBtn:(BaiduMapViewController *)BaiduMapViewController{
    [self.searchVC showSearchView];
}

- (void)BaiduMapVC:(BaiduMapViewController *)BaiduMapViewController didClickSaveLocation:(DestinationLocation *)location{
    if ([self.searchVC saveOneDestinationLocation:location]) {
        self.mapVC.isFavorite = YES;
        [SVProgressHUD showSuccessWithStatus:@"收藏成功"];
    }else{
        [self.searchVC removeOneSavedLocation:location];
        self.mapVC.isFavorite = NO;
        [SVProgressHUD showSuccessWithStatus:@"取消收藏"];
    }
}

- (void)baiduMapVC:(BaiduMapViewController *)baiduMapViewController didRemoveFavoriteLocation:(DestinationLocation *)location{
    [self.searchVC removeOneSavedLocation:location];
}

@end

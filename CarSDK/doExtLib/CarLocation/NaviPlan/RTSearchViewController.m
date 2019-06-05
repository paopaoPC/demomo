//
//  SearchViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/21.
//
//
#import "BundleTools.h"
#import "RTSearchViewController.h"
#import "UIView+Extension.h"
#import "CLLocationManager+Extension.h"
#import "SVProgressHUD.h"
#import "DestinationListTableViewCell.h"
#import "DestinationLocation.h"
#define cell_identifier @"DestinationCell"
#import "AMapSearchKit/AMapSearchKit.h"
#define ArchivePath [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0] stringByAppendingString:@"/Locations.archive"]
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
typedef enum{
    HistoryList = 0,    //历史记录列表
    FavoriteList,       //收藏列表
    SearchLish,         //搜索列表
}ListType;

static NSString *currentCity;          //当前城市

@interface RTSearchViewController ()<UITextFieldDelegate,UITableViewDelegate,UITableViewDataSource,AMapSearchDelegate>
@property (unsafe_unretained, nonatomic) IBOutlet UIImageView *img1;
@property (unsafe_unretained, nonatomic) IBOutlet UIButton *backbtn;
@property (assign, nonatomic)id<RTSearchViewControllerDelegate> delegate;
@property (weak, nonatomic) IBOutlet UIView *naviBarView;
@property (weak, nonatomic) IBOutlet UITextField *searchBar;
@property (nonatomic, strong)AMapSearchAPI *searcher;

@property (weak, nonatomic)UIView *listContainer;
@property (weak, nonatomic)UIView *segmentContainer;
@property (weak, nonatomic)UIButton *historyBtn;
@property (weak, nonatomic)UIButton *favoriteBtn;
@property (weak, nonatomic)UIView *selectIndicator;
@property (weak, nonatomic)UITableView *listView;
@property (weak, nonatomic)UIButton *clearBtn;
@property (assign,nonatomic)ListType currentDisplayedList; //当前正在显示的列表类型

@property (strong, nonatomic)NSArray *searchResults;
@property (strong, nonatomic)NSMutableArray *historyResults;
@property (strong, nonatomic)NSMutableArray *favoriteResults;

@end

@implementation RTSearchViewController

#pragma mark --- Init Methods
- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
- (void)setCurrentDisplayedList:(ListType)currentDisplayedList{
    _currentDisplayedList = currentDisplayedList;
    [self changeDisplayedListForType:_currentDisplayedList];
}

- (NSMutableArray *)historyResults{
    if (!_historyResults) {
        _historyResults = [NSMutableArray new];
    }
    return _historyResults;
}

- (NSMutableArray *)favoriteResults{
    if (!_favoriteResults) {
        _favoriteResults = [NSMutableArray new];
    }
    return _favoriteResults;
}

- (AMapSearchAPI *)searcher{
    if (!_searcher) {
        _searcher = [[AMapSearchAPI alloc]init];
        _searcher.delegate = self;
    }
    return _searcher;
}

- (instancetype)initWithDelegate:(id<RTSearchViewControllerDelegate>)delegate{
    self = [self init];
    if (self) {
        self.delegate = delegate;
        //解档历史记录和收藏
        [self unarchiveLocation];
    }
    return self;
}

- (void)initSearchBar{
    _searchBar.delegate = self;
    _searchBar.backgroundColor = [UIColor whiteColor];
    _searchBar.layer.borderWidth = 0.5;
    
    _searchBar.layer.borderColor = [UIColor colorWithRed:244/255.f green:244/255.f blue:244/255.f alpha:1].CGColor;
    _searchBar.layer.cornerRadius = 2;
    _searchBar.placeholder = @"搜索";
    UIView *leftView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, _searchBar.height, _searchBar.height)];
    UIImageView *leftImg = [[UIImageView alloc]initWithImage:[BundleTools imageNamed:@"icon_search"]];
    leftImg.width /= 2;
    leftImg.height /= 2;
    leftImg.width *= factor_w;
    leftImg.height *= factor_h;
    leftImg.center = CGPointMake(leftView.width/2, leftView.height/2);
    [leftView addSubview:leftImg];
    _searchBar.leftView = leftView;
    _searchBar.leftViewMode = UITextFieldViewModeAlways;
    _searchBar.delegate = self;
    [_searchBar addTarget:self action:@selector(textFieldDidChange:) forControlEvents:UIControlEventEditingChanged];
    [_searchBar becomeFirstResponder];
}

- (void)initListView{
    UIView *listContainer = [[UIView alloc]initWithFrame:CGRectMake(0, CGRectGetMaxY(self.naviBarView.frame), SCREEN_W, SCREEN_H - self.naviBarView.height)];
    listContainer.backgroundColor = [UIColor greenColor];
    [self.view addSubview:listContainer];
    _listContainer = listContainer;
    
    [self initSegmentView];
    
    [self initTableView];
    
    self.currentDisplayedList = HistoryList;
}

- (void)initSegmentView{
    UIView *segmentContainer = [[UIView alloc]initWithFrame:CGRectMake(0, 0, SCREEN_W, 40 * factor_h)];
//    segmentContainer.backgroundColor = [UIColor orangeColor];
    [_listContainer addSubview:segmentContainer];
    _segmentContainer = segmentContainer;
    
    UIButton *history = [[UIButton alloc]initWithFrame:CGRectMake(0, 0, SCREEN_W/2,_segmentContainer.height)];
    [history setTitle:@"历史记录" forState:UIControlStateNormal];
    UIButton *favorite = [[UIButton alloc]initWithFrame:CGRectMake(SCREEN_W/2, 0, SCREEN_W/2, _segmentContainer.height)];
    [favorite setTitle:@"我的收藏" forState:UIControlStateNormal];
    history.titleLabel.font =  favorite.titleLabel.font = [UIFont systemFontOfSize:16*factor_h];
    
    [history setTitleColor:[UIColor colorWithRed:51/255.f green:51/255.f blue:51/255.f alpha:1] forState:UIControlStateNormal];
    [favorite setTitleColor:[UIColor colorWithRed:51/255.f green:51/255.f blue:51/255.f alpha:1] forState:UIControlStateNormal];
    history.backgroundColor = favorite.backgroundColor = [UIColor whiteColor];
    [_segmentContainer addSubview:history];
    [_segmentContainer addSubview:favorite];
    _historyBtn = history;
    _favoriteBtn = favorite;
    [_historyBtn addTarget:self action:@selector(segmentSelected:) forControlEvents:UIControlEventTouchUpInside];
    [_favoriteBtn addTarget:self action:@selector(segmentSelected:) forControlEvents:UIControlEventTouchUpInside];
    _historyBtn.selected = YES;
    
    UIView *seperator = [[UIView alloc]init];
    seperator.backgroundColor = [UIColor colorWithRed:244/255.f green:244/255.f blue:244/255.f alpha:1];
    seperator.x = 0;
    seperator.width = SCREEN_W;
    seperator.height = 0.5;
    segmentContainer.height += seperator.height;
    seperator.y = segmentContainer.height - seperator.height;
    [segmentContainer addSubview:seperator];
    segmentContainer.clipsToBounds = YES;
    
    UIView *selectIndicator = [[UIView alloc]initWithFrame:CGRectMake(0, 0, SCREEN_W/2, 2 * factor_h)];
    selectIndicator.layer.cornerRadius = selectIndicator.height/2;
    selectIndicator.backgroundColor =   [UIColor colorWithRed:9/255.f green:170/255.f blue:236/255.f alpha:1]
;
    selectIndicator.y = _segmentContainer.height - selectIndicator.height;
    [_segmentContainer addSubview:selectIndicator];
    _selectIndicator = selectIndicator;
}

- (void)initTableView{
    UITableView *list = [[UITableView alloc]init];
//    list.backgroundColor= [UIColor orangeColor];
    list.delegate = self;
    list.dataSource = self;
    [_listContainer addSubview:list];
    _listView = list;
    _listView.x = 0;
    _listView.y = _segmentContainer.height;
    _listView.width = _listContainer.width;
    _listView.height = _listContainer.height - _listView.y;
    [_listView registerNib:[UINib nibWithNibName:@"DestinationListTableViewCell" bundle:[BundleTools getBundle]] forCellReuseIdentifier:cell_identifier];
    UIButton *clearBtn = [[UIButton alloc]initWithFrame:CGRectMake(0, 0, SCREEN_W, 44 * factor_h)];
    [clearBtn setTitle:@"清除历史记录" forState:UIControlStateNormal];
    clearBtn.titleLabel.textAlignment = NSTextAlignmentCenter;
    clearBtn.titleLabel.font = [UIFont systemFontOfSize:14*factor_h];
    

    [clearBtn setTitleColor:[UIColor colorWithRed:102/255.f green:102/255.f blue:102/255.f alpha:1] forState:UIControlStateNormal];
    _listView.tableFooterView = clearBtn;
    [clearBtn addTarget:self action:@selector(clearSearchHistory) forControlEvents:UIControlEventTouchUpInside];
    _clearBtn = clearBtn;
    
    UIView *seperator = [[UIView alloc]initWithFrame:CGRectMake(0, 0, _clearBtn.width, 1)];
    seperator.backgroundColor = [UIColor colorWithRed:227/255.f green:227/255.f blue:229/255.f alpha:1];
    [_clearBtn addSubview:seperator];
//    [self registerForKeyboardNotifications];
}

- (void)registerForKeyboardNotifications{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardDidShow:) name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHide:) name:UIKeyboardWillHideNotification object:nil];
}

- (void)resignForKeyboardNotifications{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillHideNotification object:nil];
}
#pragma mark --- ViewController

- (instancetype)init
{
    self = [super initWithNibName:NSStringFromClass(self.class) bundle:[BundleTools getBundle]];
    if (self) {
        
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
//    [self.backbtn setImage:[BundleTools imageNamed:@"backward_gray"] forState:0];
    [self.img1 setImage:[BundleTools imageNamed:@"backward_gray"]];
    [self initSearchBar];
    [self initListView];
    
    self.view.backgroundColor = [UIColor clearColor];
    CLLocationCoordinate2D location = [CLLocationManager lastUserLocation];
    if (location.latitude == 0) {
        currentCity = @"重庆";
    }else{
        CLLocationCoordinate2D loc = [CLLocationManager tranferGPSToAMap:location];
        AMapReGeocodeSearchRequest *request = [[AMapReGeocodeSearchRequest alloc]init];
        request.location = [AMapGeoPoint locationWithLatitude:loc.latitude longitude:loc.longitude];
        request.requireExtension = YES;
        [self.searcher AMapReGoecodeSearch:request];
    }
}

- (void)dealloc{
    //重新归档
    NSLog(@"%@ is released",self.description);
    _searcher.delegate = nil;
//    [self resignForKeyboardNotifications];
}
#pragma mark --- Public Methods

- (void)showSearchView{
    self.view.hidden = NO;
    [UIView animateWithDuration:0.3 delay:0 options:UIViewAnimationOptionCurveEaseIn animations:^{
        _naviBarView.y = 0;
        _listContainer.y = _naviBarView.height;
    } completion:^(BOOL finished) {
        [self.searchBar becomeFirstResponder];
    }];

}

- (BOOL)saveOneDestinationLocation:(DestinationLocation *)location{
    for (DestinationLocation *loc in _favoriteResults) {
        if ([loc.name isEqualToString:location.name] && [loc.address isEqualToString:location.address]) {
            return NO;
        }
    }
    [self.favoriteResults insertObject:location atIndex:0];
    [self.listView reloadData];
    return YES;
}

- (void)removeOneSavedLocation:(DestinationLocation *)destination{
    for (int i = 0; i < _favoriteResults.count; i ++) {
        DestinationLocation *savedLocation = _favoriteResults[i];
        if ([savedLocation.name isEqualToString:destination.name] && [savedLocation.address isEqualToString:destination.address]) {
            [self deleteOneSavedDestinationLocation:savedLocation];
            continue;
        }
    }
    [self.listView reloadData];
}

- (void)switchToMapView{
    [self.view endEditing:YES];
    [UIView animateWithDuration:0.5 delay:0 options:UIViewAnimationOptionCurveEaseOut animations:^{
        _naviBarView.y -= _naviBarView.height;
        _listContainer.y = SCREEN_H;
    } completion:^(BOOL finished) {
        self.view.hidden = YES;
    }];
}

#pragma mark --- Private Methods

/**
 归档历史记录和收藏
 */
- (void)archiveLocations{
    NSMutableData *data = [NSMutableData data];
    NSKeyedArchiver *archiver = [[NSKeyedArchiver alloc] initForWritingWithMutableData:data];
    [archiver encodeObject:_historyResults forKey:@"history"];
    [archiver encodeObject:_favoriteResults forKey:@"favorite"];
    [archiver finishEncoding];
    if ([data writeToFile:ArchivePath atomically:YES]) {
        NSLog(@"-----归档成功-----");
    }else{
        NSLog(@"-----归档失败-----");
    }
}

/**
 解档历史记录和收藏
 */
- (void)unarchiveLocation{
    
    NSData *data = [[NSData alloc]initWithContentsOfFile:ArchivePath];
    NSKeyedUnarchiver *unarchiver = [[NSKeyedUnarchiver alloc]initForReadingWithData:data];
    if (!data) {
        [self historyResults];
        [self favoriteResults];
    }else{
        _historyResults = [unarchiver decodeObjectForKey:@"history"];
        _favoriteResults = [unarchiver decodeObjectForKey:@"favorite"];
    }
}

/**
 删除一个收藏的地点
 */
- (void)deleteOneSavedDestinationLocation:(DestinationLocation *)location{
    [_favoriteResults removeObject:location];
    [_listView reloadData];
}

/**
 增加一个历史地点
 */
- (void)addOneHistoryLocation:(DestinationLocation *)location{
    //查看历史记录中是否有该地点
    if (_historyResults.count == 0) {
        [self.historyResults insertObject:location atIndex:0];
    }else{
        
        for (int i = 0; i < _historyResults.count; i++) {
            DestinationLocation *delocation = _historyResults[i];
            if ([delocation.name isEqualToString:location.name] && [delocation.address isEqualToString:location.address]) {//已有该地点,移至首位
                [_historyResults removeObject:delocation];
                [_historyResults insertObject:location atIndex:0];
                [_listView reloadData];
                return;
            }
        }
        //无该地点，插入至首位
        [self.historyResults insertObject:location atIndex:0];
    }
}

- (void)changeDisplayedListForType:(ListType)type{
    
    switch (type) {
        case HistoryList:
            _listView.y = _segmentContainer.height;
            _clearBtn.hidden = NO;
            if (_historyResults.count > 0) {
                [_clearBtn setTitle:@"清除历史记录" forState:UIControlStateNormal];
                _clearBtn.userInteractionEnabled = YES;
            }else{
                [_clearBtn setTitle:@"无历史记录" forState:UIControlStateNormal];
                _clearBtn.userInteractionEnabled = NO;
            }
            break;
        case FavoriteList:
            _listView.y = _segmentContainer.height;
            _clearBtn.hidden = YES;
            break;
        case SearchLish:
            _listView.y = 0;
            _clearBtn.hidden = YES;
            break;
    }
    _listView.height = _listContainer.height - _listView.y;
    [_listView reloadData];
    
}

- (void)selectIndicatorMToLeft{
    [UIView animateWithDuration:0.2 animations:^{
        _selectIndicator.x = 0;
    }];
}

- (void)selectIndicatorMToRight{
    [UIView animateWithDuration:0.2 animations:^{
        _selectIndicator.x = SCREEN_W/2;
    }];
}

- (void)keyboardDidShow:(NSNotification*)aNotification{
//    NSDictionary* info = [aNotification userInfo];
//    CGSize kbSize = [[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue].size;
//    CGFloat kbHeight = kbSize.height;
//    _listView.height -= kbHeight;
}

- (void)keyboardWillHide:(NSNotification*)aNotification{
//    _listView.height = _listContainer.height - _segmentContainer.height;
}

#pragma mark --- Events
- (IBAction)popBack:(UIButton *)sender {
    [self archiveLocations];
    [self.view endEditing:YES];
    if (self.delegate && [self.delegate respondsToSelector:@selector(didClickedBackBtnSearchVC:)]) {
        [self.delegate didClickedBackBtnSearchVC:self];
    }
}

- (void)segmentSelected:(UIButton *)sender{
    if (sender.isSelected) {
        return;
    }else{
        if ([sender isEqual:_historyBtn]) {
            _favoriteBtn.selected = NO;
            _historyBtn.selected = YES;
            [self selectIndicatorMToLeft];
            self.currentDisplayedList = HistoryList;
        }else{
            _favoriteBtn.selected = YES;
            _historyBtn.selected = NO;
            [self selectIndicatorMToRight];
            self.currentDisplayedList = FavoriteList;
        }
    }
}

- (void)clearSearchHistory{
    [_historyResults removeAllObjects];
    [_clearBtn setTitle:@"无历史记录" forState:UIControlStateNormal];
    _clearBtn.userInteractionEnabled = NO;
    [_listView reloadData];
}
#pragma mark --- UITextFieldDelegate

- (void)textFieldDidChange:(UITextField *)sender{
    if (sender.text.length > 0) {
        self.currentDisplayedList = SearchLish;
        
        AMapInputTipsSearchRequest *request = [[AMapInputTipsSearchRequest alloc]init];
        request.city = currentCity;
        request.keywords = _searchBar.text;
        
        [self.searcher AMapInputTipsSearch:request];
    }else{
        self.currentDisplayedList = HistoryList;
        _historyBtn.selected = YES;
        _favoriteBtn.selected = NO;
        [self selectIndicatorMToLeft];
    }
}

#pragma mark --- UITableViewDelegate,UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    switch (_currentDisplayedList) {
        case HistoryList:
            return _historyResults.count;
            break;
        case FavoriteList:
            return _favoriteResults.count;
            break;
        case SearchLish:
            return _searchResults.count;
            break;
    }
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    DestinationListTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cell_identifier];
    if (!cell) {
        cell = [[DestinationListTableViewCell alloc]init];
    }
    DestinationLocation *location;
    switch (_currentDisplayedList) {
        case HistoryList:
            location = _historyResults[indexPath.row];
            break;
        case FavoriteList:
            location = _favoriteResults[indexPath.row];
            break;
        case SearchLish:
            location = _searchResults[indexPath.row];
            break;
    }
    cell.location = location;
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return 64 * factor_h;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    [self switchToMapView];
    DestinationListTableViewCell *selectedCell = [tableView cellForRowAtIndexPath:indexPath];
    //检查该地点是否被收藏
    if (_currentDisplayedList == FavoriteList) {
        selectedCell.location.saved = YES;
    }else{
        BOOL flag = NO;
        for (DestinationLocation *location in _favoriteResults) {
            if ([location.name isEqualToString:selectedCell.location.name] && [location.address isEqualToString:selectedCell.location.address]) {
                selectedCell.location.saved = YES;
                flag = YES;
                continue;
            }
        }
        selectedCell.location.saved =  flag ? YES : NO;
    }
    
    if (self.delegate && [self.delegate respondsToSelector:@selector(searchVC:didSelectOneDestination:)]) {
        BOOL isFavorite = NO;
        for (int i = 0; i < _favoriteResults.count; i ++) {
            DestinationLocation *tempLocation = _favoriteResults[i];
            if ([tempLocation.name isEqualToString:selectedCell.location.name] && [tempLocation.address isEqualToString:selectedCell.location.address]) {
                isFavorite = YES;
                break;
            }
        }
        [self.delegate searchVC:self isFavorite:isFavorite];
        [self.delegate searchVC:self didSelectOneDestination:selectedCell.location];
        
    }
    [self addOneHistoryLocation:selectedCell.location];
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath{
    if (_currentDisplayedList == FavoriteList) {
        return YES;
    }else{
        return NO;
    }
}

- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath{
    return UITableViewCellEditingStyleDelete;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath{
    [_favoriteResults removeObjectAtIndex:indexPath.row];
    [tableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationFade];
}

- (NSString *)tableView:(UITableView *)tableView titleForDeleteConfirmationButtonForRowAtIndexPath:(NSIndexPath *)indexPath{
    return @"删除";
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView{
    [_searchBar resignFirstResponder];
}

#pragma mark --- AMapSearchDelegate

- (void)onInputTipsSearchDone:(AMapInputTipsSearchRequest *)request response:(AMapInputTipsSearchResponse *)response{
    if (response.count == 0)
    {
        return;
    }
    NSMutableArray *tempArr = [NSMutableArray new];
    for (int i = 0; i < response.tips.count; i ++) {
        AMapTip *tip = response.tips[i];
        if (tip.location.latitude == 0 || tip.location.longitude == 0) {
            continue;
        }else{
            DestinationLocation *location = [[DestinationLocation alloc]init];
            location.name = tip.name;
            location.address = tip.address;
            location.coordinate = CLLocationCoordinate2DMake(tip.location.latitude, tip.location.longitude);
            [tempArr addObject:location];
        }
    }
    self.searchResults = tempArr;
    [_listView reloadData];
    
}

- (void)onReGeocodeSearchDone:(AMapReGeocodeSearchRequest *)request response:(AMapReGeocodeSearchResponse *)response{
    if (response.regeocode != nil) {
        currentCity = response.regeocode.addressComponent.city;
    }
}

- (void)AMapSearchRequest:(id)request didFailWithError:(NSError *)error{
    NSLog(@"searchError - %@",error);
}
@end

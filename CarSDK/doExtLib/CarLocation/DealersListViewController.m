//
//  DealersListViewController.m
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/15.
//
//
#import "BundleTools.h"
#import "DealersListViewController.h"
#import "NaviBarView.h"
#import "DealersTableViewCell.h"
#import "UIView+Extension.h"
#import "DealerDetailViewController.h"
static NSString *cellIdentifier = @"DealerCell";
#define SCREEN_W [UIScreen mainScreen].bounds.size.width
#define SCREEN_H [UIScreen mainScreen].bounds.size.height
#define factor_h SCREEN_H / 667
#define factor_w SCREEN_W / 375
@interface DealersListViewController ()<UITableViewDelegate,UITableViewDataSource>

@property (nonatomic,strong)NaviBarView *naviBar;
@property (nonatomic,strong)UITableViewController *listVC;


@end

@implementation DealersListViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.view.backgroundColor = [UIColor whiteColor];
    [self setNaviBar];
    [self setDealersList];
}

- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}
#pragma mark --- Public Methods


#pragma mark --- Private Methods

/**
 设置导航栏
 */
- (void)setNaviBar{
    self.naviBar = [NaviBarView creatNaviBarView];
    _naviBar.title = @"经销商";
    [_naviBar.backBtn addTarget:self action:@selector(back) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_naviBar];
}

/**
 设置经销商列表
 */
- (void)setDealersList{
    self.listVC = [[UITableViewController alloc]initWithStyle:UITableViewStylePlain];
    _listVC.tableView.delegate = self;
    _listVC.tableView.dataSource = self;
    _listVC.tableView.frame = self.view.frame;
    _listVC.tableView.backgroundColor = [UIColor colorWithRed:244/255.f green:244/255.f blue:244/255.f alpha:1] ;
    _listVC.tableView.y = _naviBar.height;
    _listVC.tableView.height = SCREEN_H - _naviBar.height;
    [_listVC.tableView registerNib:[UINib nibWithNibName:@"DealersTableViewCell" bundle:[BundleTools getBundle]] forCellReuseIdentifier:cellIdentifier];
    UIView *footer = [[UIView alloc]init];
    _listVC.tableView.tableFooterView = footer;
    _listVC.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    [self.view addSubview:_listVC.tableView];
}

- (void)back{
    [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark --- UITableViewDelegate,UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return 3;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    DealersTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    if (!cell) {
        cell = [[DealersTableViewCell alloc]init];
    }
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return 88 * factor_h;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{

    [self.navigationController pushViewController:[[DealerDetailViewController alloc]init] animated:YES];
    
}
@end

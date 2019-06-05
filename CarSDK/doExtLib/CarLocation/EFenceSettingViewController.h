//
//  EFenceSettingViewController.h
//  chameleon
//
//  Created by Foreveross on 16/3/29.
//
//

#import <UIKit/UIKit.h>
#import "EfenceDataModel.h"
typedef void(^EFenceSettingBlock)(BOOL);
@protocol EFenceSettingViewDelegate <NSObject>

@required
/**
 *  电子围栏数据发生改变
 */
- (void)dataChanged;
/**
 *  电子围栏被删除
 */
- (void)efenceDeleted;
/**
 *  电子围栏被保存
 */
- (void)efenceSaved;
/**
 *  取消初始化围栏
 */
- (void)cancelInitializeFence;

@end

@interface EFenceSettingViewController : UIViewController

@property (strong, nonatomic) EfenceDataModel *efenceData;
@property (assign, nonatomic, readonly) BOOL isEditing;
@property (weak, nonatomic) IBOutlet UIButton *cancelBtn;//删除围栏按钮
@property (copy, nonatomic) EFenceSettingBlock HitConfigBlock;
@property (assign, nonatomic) id<EFenceSettingViewDelegate> delegate;
/**
 *  显示菜单
 */
- (void)showMenuViewOn:(UIView *)view;
- (void)showMenu;
/**
 *  移除菜单
 */
- (void)dismissMenuView;
/**
 *  启用保存按钮
 */
- (void)enableSaveBtn;
/**
 *  禁用保存按钮
 */
- (void)disableSaveBtn;
@end

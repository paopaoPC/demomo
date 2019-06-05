//
//  EfenceListViewController.h
//  chameleon
//
//  Created by 傅祚鹏 on 2017/1/12.
//
//

#import <UIKit/UIKit.h>
@class EfenceListViewController;
@class EfenceDataModel;
@protocol EfenceListVCDelegate <NSObject>

@optional

- (void)clickAddNewFenceBtn:(EfenceListViewController *)efenceListVC;

- (void)EfenceListVC:(EfenceListViewController *)efenceListVC didSelectEfence:(EfenceDataModel *)fenceData;


@end

@interface EfenceListViewController : UIViewController

- (instancetype)initWithFenceArray:(NSArray *)fences delegate:(id<EfenceListVCDelegate>)delegate;


@end

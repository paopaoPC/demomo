//
//  DestinationBlockView.h
//  chameleon
//
//  Created by 傅祚鹏 on 2016/12/25.
//
//

#import <UIKit/UIKit.h>
@class DestinationBlockView;
@protocol DestinationBlockViewDelegate <NSObject>

@optional

/**
 点击收藏
 */
- (void)didClickedFavoriteBtn:(DestinationBlockView *)destinationBlockView;

/**
 取消收藏
 */
- (void)didRemoveFavoriteLocation:(DestinationBlockView *)destinationBlockView;

/**
 点击去这里
 */
- (void)didClickedGoToThereBtn:(DestinationBlockView *)destinationBlockView;

/**
 点击发送到车
 */
- (void)didClickedSendToCarBtn:(DestinationBlockView *)destinationBlockView;

@end


@interface DestinationBlockView : UIView

- (instancetype)initWithDelegate:(id<DestinationBlockViewDelegate>)delegate;

/**
 设置展示地名
 */
- (void)setDisplayedName:(NSString *)name;

/**
 设置展示地址
 */
- (void)setDisplayedAddress:(NSString *)address;

/**
 设置收藏状态
 */
- (void)setDisplayedIsFavorite:(BOOL)isFavorite;

@end

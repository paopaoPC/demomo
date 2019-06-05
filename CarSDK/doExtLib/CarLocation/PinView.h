//
//  PinView.h
//  chameleon
//
//  Created by mac on 16/10/18.
//
//

#import <UIKit/UIKit.h>
@class PinView;
@protocol PinViewDelegate <NSObject>

@optional

- (void)didClickConfirmOnPinView:(PinView *)pinView inputPinCode:(NSString *)PinCode;

- (void)didClickCancelOnPinView:(PinView *)pinView;

@end

@interface PinView : UIView

@property (nonatomic,assign)id<PinViewDelegate> delegete;

- (void)startInputPinCode;

- (void)dismiss;

@end

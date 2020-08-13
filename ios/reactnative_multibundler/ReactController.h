//
//  ReactController.h
//  reactnative_multibundler
//
//  Created by smallnew on 2019/12/27.
//

#import <UIKit/UIKit.h>

#import <React/RCTBridgeModule.h>


@interface ReactController : UIViewController
typedef NS_ENUM(NSUInteger, BundleType) {
    InApp  = 0,
    NetWork
};

- (instancetype)initWithURL:(NSString *)url path:(NSString *)path type:(BundleType) type moduleName:(NSString *) name;
@end

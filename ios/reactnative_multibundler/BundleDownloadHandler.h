//
//  BundleDownloadHandler.h
//  reactnative_multibundler
//


#import <Foundation/Foundation.h>

@interface BundleDownloadHandler : NSObject<NSURLSessionDelegate>
-(void)downloadBundle:(NSString*) url moduleName:(NSString*) moduleName downloadCompleteHandler:(void(^)(BOOL success,NSString* bundlePath)) downloadCompleteHandler;
@end

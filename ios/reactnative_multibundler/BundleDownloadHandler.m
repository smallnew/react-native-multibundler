//
//  BundleDownloadHandler.m
//  reactnative_multibundler
//

#import <Foundation/Foundation.h>
#import <SSZipArchive.h>
#import "BundleDownloadHandler.h"
#import "ScriptLoadUtil.h"

@implementation BundleDownloadHandler

-(void)downloadBundle:(NSString*) urlStr moduleName:(NSString*) moduleName downloadCompleteHandler:(void(^)(BOOL success,NSString* bundlePath)) downloadCompleteHandler{
  if([ScriptLoadUtil isScriptLoaded:moduleName]){
    downloadCompleteHandler(YES,nil);
    return;
  }
  NSURL *url = [NSURL URLWithString:urlStr];
  NSURLSession *session = [NSURLSession sharedSession];
  NSURLSessionDownloadTask *downloadTask = [session downloadTaskWithURL:url completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    if(error!=nil){
      NSLog(@"下载失败 %@",error.localizedFailureReason);
      downloadCompleteHandler(NO,nil);
      return ;
    }
      //location 下载到沙盒的地址
      NSLog(@"下载完成 %@",location);
  
      //response.suggestedFilename 响应信息中的资源文件名
    NSString* subDir = [@"BundleDownloaded" stringByAppendingPathComponent:response.suggestedFilename];
      NSString * desPath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:subDir];
    NSString * desPathDir = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:@"BundleDownloaded"];
    
    NSString* subScriptDir = [@"Bundles" stringByAppendingPathComponent:moduleName];
      NSString * bundlePath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:subScriptDir];
    
      NSLog(@"下载地址 %@",desPath);
      
      //获取文件管理器
      NSFileManager * mgr = [NSFileManager defaultManager];
    [mgr createDirectoryAtPath:subScriptDir withIntermediateDirectories:YES attributes:nil error:nil];
    [mgr createDirectoryAtPath:desPathDir withIntermediateDirectories:YES attributes:nil error:nil];
    
    NSError* moveError = nil;
      [mgr removeItemAtURL:[NSURL fileURLWithPath:desPath] error:nil];
      [mgr moveItemAtURL:location toURL:[NSURL fileURLWithPath:desPath] error:&moveError];
    if(moveError!=nil){
      NSLog(@"转存失败 %d",moveError.code);
      if(moveError.code!=516){//file exist
        downloadCompleteHandler(NO,nil);
        return;
      }
    }
      @try {
        [SSZipArchive unzipFileAtPath:desPath toDestination:bundlePath];
        downloadCompleteHandler(YES,bundlePath);
      } @catch (NSException *exception) {
        NSLog(@"解压失败 %@",exception);
        downloadCompleteHandler(NO,nil);
      }
  }];
  [downloadTask resume];
}

@end

//
//  ScriptLoadUtil.h
//  reactnative_multibundler
//
//  Created by smallnew on 2019/12/30.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridge+Private.h>

@interface ScriptLoadUtil : NSObject
+(void)init:(RCTBridge*) bridge;
+(RCTBridge*)getBridge;
+(BOOL)isDebugable;
+(BOOL)isScriptLoaded:(NSString*) moduleName;
+(NSString*) getDownloadedScriptPath:(NSString*)path moduleName:(NSString*) moduleName;
+(NSString*) getDownloadedScriptDirWithModuleName:(NSString*) moduleName;
+(void)loadScriptWithBridge:(RCTBridge*) bridge path:(NSString*) path moduleName:(NSString*) moduleName mainBundle:(BOOL) inMain;
@end

const pathSep = require('path').sep;
const useIndex = true;//是否使用递增的数字作为模块的id，如果为false则使用模块相对的路径名作为模块id
let curModuleId = -100;//基础包ModuleId
let curBuzModuleId = -100;//业务包ModuleId
let baseModuleIdMap = [];
let buzModuleIdMap = [];
const fs=require("fs");
var baseMappingPath;
var buzMappingPath;

/** 通过自增长的index来确定moduleID，优点是能使用rambundle且减小了bundle包的大小，隐藏了模块路径，提升安全性，缺点是需要保存和依赖已经打包进去的模块的路径和id的对应信息，需要注意打包顺序和重复依赖的打包模块*/
/**
 * projectRootPath:工程目录
 * path:js模块路径
 * entry:打包的入口
 * isBuz:是否是业务包
 * */
function getModuleIdByIndex(projectRootPath,path,entry,isBuz){

  const moduleIdConfig = require('./ModuleIdConfig.json');
  if(curModuleId==-100) {
    curModuleId =  - 1;//基础包的Module都是从0开始的
  }
  if(baseMappingPath==null) {
    baseMappingPath = __dirname + pathSep + "platformMap.json";
  }
  if(baseModuleIdMap.length == 0){
    if(fs.existsSync(baseMappingPath)){
      baseModuleIdMap = require(baseMappingPath);
      if(baseModuleIdMap.length!=0) {
	      curModuleId = baseModuleIdMap[baseModuleIdMap.length - 1].id;
      }
    }
  }
  if(isBuz){
    if(buzMappingPath==null) {
      buzMappingPath = __dirname + pathSep + entry.replace(".js", "") + "Map.json";
    }
    if(buzModuleIdMap.length==0){
      if(fs.existsSync(buzMappingPath)){
        buzModuleIdMap = require(buzMappingPath);
        curBuzModuleId = buzModuleIdMap[buzModuleIdMap.length-1].id;
      }else if(curBuzModuleId==-100){
        curBuzModuleId = moduleIdConfig[entry]-1;//根据业务包moduleid的配置取初始modueId
      }
    }
  }
  let pathRelative = null;
  if (path.indexOf(projectRootPath) == 0) {
    pathRelative = path.substr(projectRootPath.length + 1);
  }
  const findPlatformItem = baseModuleIdMap.find((value)=>{return value.path==pathRelative});
  const findBuzItem = buzModuleIdMap.find((value)=>{return value.path==pathRelative});
  if(findPlatformItem){
    return findPlatformItem.id;
  }else if(findBuzItem){
    return findBuzItem.id;
  }else {
    if(!isBuz) {//基础包
      curModuleId = ++curModuleId;
      baseModuleIdMap.push({id: curModuleId, path: pathRelative});
      fs.writeFileSync(baseMappingPath, JSON.stringify(baseModuleIdMap));
      return curModuleId;
    }else{//业务包
      curBuzModuleId = ++curBuzModuleId;
      buzModuleIdMap.push({id: curBuzModuleId, path: pathRelative});
      fs.writeFileSync(buzMappingPath, JSON.stringify(buzModuleIdMap));
      return curBuzModuleId;
    }

  }

}

/** 根据模块路径返回moduleId，优点是简单且确保唯一，缺点是无法使用rambundle打包方式*/
function getModuleIdByName(projectRootPath,path){
  let name = '';
  if (path.indexOf('node_modules' + pathSep + 'react-native' + pathSep + 'Libraries' + pathSep) > 0) {
    name = path.substr(path.lastIndexOf(pathSep) + 1);
  } else if (path.indexOf(projectRootPath) == 0) {
    name = path.substr(projectRootPath.length + 1);
  }
  name = name.replace('.js', '');
  name = name.replace('.png', '');
  let regExp = pathSep == '\\' ? new RegExp('\\\\', "gm") : new RegExp(pathSep, "gm");
  name = name.replace(regExp, '_');//把path中的/换成下划线
  return name;
}

function getModuleId(projectRootPath,path,entry,isBuz){
  if(useIndex){
    return getModuleIdByIndex(projectRootPath,path,entry,isBuz);
  }
  return getModuleIdByName(projectRootPath,path);
}


module.exports={getModuleId,useIndex}

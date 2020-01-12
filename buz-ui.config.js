const pathSep = require('path').sep;
const buzDeps = require('./buzDep');
const noFilterModules = buzDeps;
const plaformModules = require('./multibundler/platformNameMap.json');
const getModuleId = require('./multibundler/getModulelId').getModuleId;
const useIndex = require('./multibundler/getModulelId').useIndex;
let entry;

function packageToBundle(path){
  for(let i=0;i<noFilterModules.length;i++) {
    let moduleName = noFilterModules[i];
    if (path.indexOf(pathSep + 'node_modules' + pathSep + moduleName) > 0) {
      return true;
    }
  }
  return false;
}

function postProcessModulesFilter(module) {//返回false则过滤不编译
  const projectRootPath = __dirname;
  if(plaformModules==null||plaformModules.length==0){
    console.log('请先打基础包');
    process.exit(1);
    return false;
  }
  const path = module['path']
  if (path.indexOf("__prelude__") >=0 ||
    path.indexOf("/node_modules/react-native/Libraries/polyfills") >=0 ||
    path.indexOf("source-map") >=0 ||
    path.indexOf("/node_modules/metro/src/lib/polyfills/") >=0){
    return false;
  }
  if(path.indexOf(pathSep+'node_modules'+pathSep)>0){
    if(packageToBundle(module['path'])){
      return true;
    }
    if('js'+pathSep+'script'+pathSep+'virtual'==module['output'][0]['type']){
      return false;
    }
    let name = getModuleId(projectRootPath,path);
	  if (useIndex && name < 100000) {//这个模块在基础包已打好，过滤
		  return false;
	  }else if(useIndex!==true && plaformModules.includes(name)){//使用模块名作为模块id的逻辑
		  return false;
	  }
  }
  return true;
}

function createModuleIdFactory() {
  const projectRootPath = __dirname;
  return path => {
    let name = getModuleId(projectRootPath,path,entry,true);
    return name;
  };
}

function getModulesRunBeforeMainModule(entryFilePath) {
  console.log('entryFilePath',entryFilePath);
  entry = entryFilePath;
  return [];
}

module.exports = {

  serializer: {
    createModuleIdFactory:createModuleIdFactory,
    processModuleFilter:postProcessModulesFilter,
    getModulesRunBeforeMainModule:getModulesRunBeforeMainModule
    /* serializer options */
  }
};

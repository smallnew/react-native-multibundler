const pathSep = require('path').sep;
const buzDeps = require('./buzDep');
const noFilterModules = buzDeps;
const plaformModules = require('./moduleMap/platformMapping.json');

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
    let name = '';
    if(path.indexOf('node_modules'+pathSep+'react-native'+pathSep+'Libraries'+pathSep)>0){
      name = path.substr(path.lastIndexOf(pathSep)+1);
    }else if(path.indexOf(projectRootPath)==0){
      name = path.substr(projectRootPath.length+1);
    }
    name = name.replace('.js','');
    name = name.replace('.png','');
    let regExp = pathSep=='\\'?new RegExp('\\\\',"gm"):new RegExp(pathSep,"gm");
    name = name.replace(regExp,'_');//把path中的/换成下划线
    if(plaformModules.indexOf(name)>=0){//这个模块在基础包已打好，过滤
      return false;
    }
  }
  return true;
}

function createModuleIdFactory() {
  const projectRootPath = __dirname;
  return path => {
    //console.log('path ',path);
    let name = '';
    if(path.indexOf('node_modules'+pathSep+'react-native'+pathSep+'Libraries'+pathSep)>0){
      name = path.substr(path.lastIndexOf(pathSep)+1);
    }else if(path.indexOf(projectRootPath)==0){
      name = path.substr(projectRootPath.length+1);
    }
    name = name.replace('.js','');
    name = name.replace('.png','');
    let regExp = pathSep=='\\'?new RegExp('\\\\',"gm"):new RegExp(pathSep,"gm");
    name = name.replace(regExp,'_');//把path中的/换成下划线
    return name;
  };
}


module.exports = {

  serializer: {
    createModuleIdFactory:createModuleIdFactory,
    processModuleFilter:postProcessModulesFilter
    /* serializer options */
  }
};

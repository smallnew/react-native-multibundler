const pathSep = require('path').sep;
const buzDeps = require('./buzDep');
const noFilterModules = buzDeps;

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
  if(module['path'].indexOf('__prelude__')>=0){
    return false;
  }
  if(module['path'].indexOf(pathSep+'node_modules'+pathSep)>0){
    if(packageToBundle(module['path'])){
      return true;
    }
    if('js'+pathSep+'script'+pathSep+'virtual'==module['output'][0]['type']){
      return true;
    }
    return false;
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

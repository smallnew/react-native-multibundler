function postProcessModulesFilter(module) {
    const projectRootPath = __dirname;
    if(module['path'].indexOf('__prelude__')>=0){
        return false;
    }
    if(module['path'].indexOf('/node_modules/')>0){
        if('js/script/virtual'==module['output'][0]['type']){
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
        if(path.indexOf('node_modules/react-native/Libraries/')>0){
            name = path.substr(path.lastIndexOf('/')+1);
        }else if(path.indexOf(projectRootPath)==0){
            name = path.substr(projectRootPath.length+1);
        }
        name = name.replace('.js','');
        name = name.replace('.png','');
        name = name.replace(new RegExp("/","gm"),'_');
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


function createModuleIdFactory() {
    const projectRootPath = __dirname;
    return path => {
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
        createModuleIdFactory:createModuleIdFactory
        /* serializer options */
    }
};

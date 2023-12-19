module.exports = {
    // "plugins": {
    //   "postcss-import": {},
    //   "postcss-url": {},
    //   // to edit target browsers: use "browserslist" field in package.json
    //   "autoprefixer": {}
    // }
    plugins: {
        // 'autoprefixer': {
        //     browsers: ['Android >= 4.0', 'iOS >= 8']
        // },
        //设计稿是750的 按理说应该是75 但是引用的vant库尺寸是以375px为标准的
        // 这样写样式的时候只需要把设计稿/2写px即可
        'postcss-pxtorem': {
            rootValue ({ file }) {
                return file.indexOf('vant') !== -1 ? 37.5 : 75
            },
            propList: ['*']
            // exclude 这个属性可以配置不需要转换的资源 直接写文件名就行，不需要后缀
            // exclude: 'github-markdown'
        }
    }
}

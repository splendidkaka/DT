// // postcss.config.cjs
// const isMobile = process.env.VITE_APP_MODE === 'mobile'

// module.exports = {
//   plugins: {
//     'postcss-pxtorem': {
//       rootValue: 16, // PC端基准值
//       propList: ['*'],
//       exclude: /node_modules|mobile/i
//     },
//     'postcss-px-to-viewport-8-plugin': {
//       viewportWidth: isMobile ? 375 : 1920, // 动态设计稿尺寸
//       unitToConvert: 'px',
//       viewportUnit: isMobile ? 'vw' : 'vmin',
//       fontViewportUnit: isMobile ? 'vw' : 'vmin',
//       selectorBlackList: ['.rem-'],
//       exclude: /node_modules|pc/i
//     },
//     'autoprefixer': {}
//   }
// }
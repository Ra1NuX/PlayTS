const config = {
  appId: "com.arco.runts",
  productName: 'RunTS',
  directories: {
    buildResources: "public",
    output: "dist",
  },
  
  win: {
    icon: 'public/icon.ico',
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
  },
//   mac: {
//     target: [
//       {
//         target: "dmg",
//         arch: ["universal"],
//       },
//     ],
//   },
  linux: {
    target: [
      {
        target: "deb",
        arch: ["x64"],
      },
      {
        target: "AppImage",
        arch: ["x64"],
      },
    ],
  },
}

module.exports = config;

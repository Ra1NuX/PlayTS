module.exports = {
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    signtAndEdit
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
};

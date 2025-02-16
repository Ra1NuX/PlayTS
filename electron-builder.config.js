/**
 * @type {import('electron-builder').Configuration}
 */

const config = {
  appId: "com.arco.opents",
  productName: 'OpenTS',
  directories: {
    buildResources: "public",
    output: "dist",
  },  
  publish: {
    provider: 'github',
    owner: 'ra1nux',
    repo: 'OpenTS'
  },
  win: {
    icon: 'public/icon.ico',
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    artifactName: process.env.CHANNEL === 'beta' ? '${productName}Setup-Beta${version}.${ext}' : '${productName}Setup-${version}.${ext}',
  },
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

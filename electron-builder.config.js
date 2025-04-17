/**
 * @type {import('electron-builder').Configuration}
 */

const config = {
  appId: "com.arco.playts",
  generateUpdatesFilesForAllChannels: true,
  productName: `PlayTS ${process.env.CHANNEL === "beta" ? "Beta" : ""}`,
  asar: true,
  extraResources: [
    {
      from: "public/locales",
      to: "locales",
    },
  ],
  directories: {
    buildResources: "public",
    output: "dist",
  },
  publish: {
    provider: "github",
    owner: "ra1nux",
    repo: "PlayTS",
    releaseType: process.env.CHANNEL === "beta" ? "prerelease" : "release",
    publishAutoUpdate: true,
  },
  artifactName:
    process.env.CHANNEL === "beta"
      ? "Setup-${productName}${version}.${ext}"
      : "Setup-${productName}${version}.${ext}",
  win: {
    icon: "public/icon.ico",
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
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
};

module.exports = config;

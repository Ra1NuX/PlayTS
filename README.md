<p align="center">
  <img src="./public/icon.png" alt="PlayTS logo" width="150"/>
</p>

<h1 align="center">PlayTS</h1>

<h4 align="center">An open-source desktop app for executing and transpiling code.</h4>

<p align="center">
  <a href="https://www.paypal.me/Ra1NuXs">
    <img src="https://img.shields.io/badge/Donate-Support%20Us-green">
  </a>
  <a href="https://github.com/Ra1NuX/PlayTS/releases/latest">
    <img src="https://img.shields.io/badge/Download-PlayTS-blue">
  </a>
</p>

<p align="center">
  <img src="./public/doc/readme_video.gif">
</p>


PlayTS is an open-source transpiler designed for efficient and versatile code transformation. Leveraging modern web and desktop technologies, PlayTS provides a seamless experience for converting and optimizing source code.

## Description

Developed using <a href="https://react.dev/">React</a> and <a href="http://electron.atom.io" target="_blank">Electron</a>, PlayTS offers a modern and intuitive interface while running natively on Windows, macOS, and Linux. The integration of <a href="https://webcontainers.io/" target="_blank">WebContainers</a>  ensures a secure, isolated environment for code execution, enabling real-time testing and transpilation.

## Features

- **Modern, Responsive Interface:** Built with React for an intuitive and dynamic user experience.
- **Cross-Platform Compatibility:** Powered by Electron, PlayTS runs seamlessly on Windows, macOS, and Linux.
- **Secure Execution:** Utilizes WebContainers to safely isolate code execution.
- **Efficient Transpilation:** Converts and optimizes source code to meet diverse development needs.
- **Open Source & Extensible:** Encourages community contributions and provides a modular framework for future enhancements.

## Installation

### Download the Application

Click the download button above to obtain the latest release of PlayTS for your operating system.

> [!Warning] 
> Being an open source project without funding I can't afford to pay what a windows/mac certificate costs. That's why you will get a message that Windows/Mac does not trust.

### System Requirements

- **Operating System:** Windows, macOS, or Linux.
- **Node.js:** Required if you plan to build or contribute to the project.

### Manual Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ra1NuX/PlayTS.git
   ```

2. Navigate to the project directory:

   ```bash
   cd PlayTS
   ```

3. Install dependencies:

<details open style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    npm
  </summary>

```bash
npm install
```

</details>

<details style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    pnpm
  </summary>

```bash
pnpm install
```

  </div>
</details>

<details style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    yarn
  </summary>

```bash
yarn add
```

  </div>
</details>

<details style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    bun
  </summary>

```bash
bun add
```

  </div>
</details>

1. Start the application in development mode:

<details open style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    npm
  </summary>

```bash
npm electron:dev
```

</details>

<details style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    pnpm
  </summary>

```bash
pnpm electron:dev
```

  </div>
</details>

<details style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    yarn
  </summary>

```bash
yarn electron:dev
```

  </div>
</details>

<details style="border-radius: 4px; margin-bottom: 1em;">
  <summary style="padding: 0.5em; cursor: pointer; font-weight: bold;">
    bun
  </summary>

```bash
bun electron:dev
```

  </div>
</details>

## Usage

Once installed, run the application using the provided executable for your operating system or start it in development mode with `npm start`. The interactive interface allows you to easily load and transpile your code.

## Contribution

Contributions are welcome! To collaborate on PlayTS, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:

```bash
git checkout -b my-feature-branch
```

3. Implement your changes while adhering to the project standards.
4. Submit a Pull Request describing your modifications.

For more details, please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## 📄 License

This project is distributed under a [Personal Use License](./LICENSE.md).

You are free to use, study, and modify this software for personal and non-commercial purposes only. Redistribution or commercial use is not permitted without explicit permission from the author.

## Community & Support

If you have any questions, suggestions, or need assistance, please open an [Issue](https://github.com/Ra1NuX/PlayTS/issues) on GitHub or join our community on Discord/Slack to connect with other users and contributors.

---

Thank you for using and contributing to PlayTS! Together, we are building a powerful tool that fosters innovation in software development.

## Donations

If PlayTS has proven useful to you, please consider making a donation. Your support is vital in driving continued development and improvement of the project.

[![Donate](https://img.shields.io/badge/Donate-Support%20Us-green)](https://www.paypal.me/Ra1NuXs)

<p align="center">
  <img src="build/icon.png" alt="NitOwl" width="120" />
</p>

<h1 align="center">NitOwl</h1>

<p align="center">
  Code review as a call graph. Review a pull request one ring at a time, from the functions that
  matter most outward, and clear your inbox of PRs waiting on you.
</p>

Built with Electron, React, TypeScript, Tailwind CSS v4 and shadcn/ui.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## Troubleshooting

### `Error: Electron uninstall` when running `yarn dev`

The Electron binary didn't extract properly during install: `node_modules/electron/dist` contains only `LICENSES.chromium.html` and `node_modules/electron/path.txt` is missing. Extract the cached download manually from the project root:

```bash
rm -rf node_modules/electron/dist && mkdir node_modules/electron/dist
unzip -q ~/Library/Caches/electron/*/electron-v*-darwin-arm64.zip -d node_modules/electron/dist
printf 'Electron.app/Contents/MacOS/Electron' > node_modules/electron/path.txt
```

If the cache is empty, run `node node_modules/electron/install.js` first to download it. This was seen on Node v26; using an LTS version of Node may avoid it.

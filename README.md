# electron-vpaste

An Electron application with React and TypeScript

## Recommended IDE Setup

```bash
globalShortcut
clipboard
BrowserWindow

该模块提供了以下方法：

clipboard.readText([type]): 读取剪贴板中的文本内容。默认情况下，该方法读取系统剪贴板中的内容，但是你可以通过传递 selection 参数来读取 Linux 上的选择剪贴板中的内容。
clipboard.writeText(text[, type]): 将文本写入剪贴板。默认情况下，该方法将文本写入系统剪贴板，但是你可以通过传递 selection 参数来写入 Linux 上的选择剪贴板。
clipboard.readHTML([type]): 读取剪贴板中的 HTML 内容。默认情况下，该方法读取系统剪贴板中的内容，但是你可以通过传递 selection 参数来读取 Linux 上的选择剪贴板中的内容。
clipboard.writeHTML(markup[, type]): 将 HTML 写入剪贴板。默认情况下，该方法将 HTML 写入系统剪贴板，但是你可以通过传递 selection 参数来写入 Linux 上的选择剪贴板。
clipboard.readImage([type]): 读取剪贴板中的图像内容。默认情况下，该方法读取系统剪贴板中的内容，但是你可以通过传递 selection 参数来读取 Linux 上的选择剪贴板中的内容。
clipboard.writeImage(image[, type]): 将图像写入剪贴板。默认情况下，该方法将图像写入系统剪贴板，但是你可以通过传递 selection 参数来写入 Linux 上的选择剪贴板。
clipboard.readRTF([type]): 读取剪贴板中的 RTF 内容。默认情况下，该方法读取系统剪贴板中的内容，但是你可以通过传递 selection 参数来读取 Linux 上的选择剪贴板中的内容。
clipboard.writeRTF(text[, type]): 将 RTF 内容写入剪贴板。默认情况下，该方法将 RTF 内容写入系统剪贴板，但是你可以通过传递 selection 参数来写入 Linux 上的选择剪贴板。
你可以使用 Electron 的 globalShortcut 模块来注册全局快捷键，以便在按下 CTRL + SHIFT + V 时调用你的应用程序。你可以使用 Electron 的 BrowserWindow 模块来创建一个窗口，以便在窗口中显示剪贴板内容。你可以使用 Electron 的 Menu 模块来创建一个菜单，以便在菜单中显示剪贴板内容。你可以使用 Electron 的 dialog 模块来显示一个对话框，以便在对话框中显示剪贴板内容。

在实现这个功能时，你需要注意以下几点：

你需要在应用程序中注册全局快捷键，以便在按下 CTRL + SHIFT + V 时调用你的应用程序。
你需要在应用程序中创建一个窗口，以便在窗口中显示剪贴板内容。
你需要在应用程序中创建一个菜单，以便在菜单中显示剪贴板内容。
你需要在应用程序中显示一个对话框，以便在对话框中显示剪贴板内容。
你需要在应用程序中处理键盘事件，以便在按下 ENTER 或 CTRL + C 时执行粘贴操作。
你需要在应用程序中处理鼠标事件，以便在上下左右选择黏
```

```bash
src/
├── main/                 # Electron 主进程
│   ├── clipboard/        # 剪贴板管理
│   ├── store/           # 本地存储
│   └── ipc/             # 进程间通信
├── renderer/            # 渲染进程（React）
│   ├── components/      # UI 组件
│   ├── hooks/          # 自定义 Hooks
│   └── pages/          # 页面
└── preload/            # 预加载脚本
```

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

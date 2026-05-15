# Jhon Translate

A lightweight, open-source clone of "Immersive Translate". 极简开源版沉浸式双语网页翻译扩展。

## 🌟 Features / 特性

- **Immersive Bilingual Reading (沉浸式双语阅读)**: Inserts translations directly below the original text without disrupting the webpage's layout.
- **Hover Translation (悬停翻译)**: Simply hover over any paragraph and press `Option` (or `Alt`) to instantly translate it.
- **Full Page Translation (全页翻译)**: Press `Option + A` (or `Alt + A`) to toggle full-page bilingual translation on or off.
- **Zero Configuration (零配置)**: Uses public translation APIs out of the box. No API keys or login required.
- **Lightweight & Fast (轻量极速)**: Built with Vanilla JavaScript. No heavy frameworks or bloated dependencies.

## 🚀 Installation / 安装指南

由于插件暂未上架 Chrome 商店，你可以通过“开发者模式”在本地轻松安装：

1. 克隆或下载本仓库到本地:
   ```bash
   git clone git@github.com:jhon-71/jhon-translate.git
   ```
2. 打开 Chrome (或 Edge 等 Chromium 内核浏览器)，进入扩展管理页面：`chrome://extensions/`。
3. 打开右上角的 **“开发者模式” (Developer mode)**。
4. 点击左上角的 **“加载已解压的扩展程序” (Load unpacked)**，选择你刚刚下载的 `jhon-translate` 文件夹。
5. 安装完成！打开任意英文网页即可开始体验。

## ⌨️ Shortcuts / 快捷键

- **单段翻译**: 将鼠标悬停在想翻译的段落上，按一下 `Option` 键（Windows 为 `Alt` 键）。再按一次即可取消翻译。
- **全文翻译**: 直接按下 `Option + A`（Windows 为 `Alt + A`）即可翻译整个网页。再按一次即可恢复原网页。

## 🛠 Architecture / 技术实现

- **Manifest V3**: 完全兼容 Google 扩展的最新底层架构标准。
- **Vanilla JavaScript**: 纯原生 JS 编写，0 依赖，体积极致轻量。
- **Message Passing**: 完善的 Content Script 与 Service Worker 通信机制，从容应对扩展热更新与跨域 API 请求。

## 📄 License / 开源协议

MIT License

# 🌿 恢复平静治疗室

一款专注于音疗与情绪舒缓的跨平台移动应用。通过深呼吸节拍、自然白噪音、音钵共鸣、ASMR等方式，帮助你缓解紧张、焦虑与失眠。

---

## ✨ 功能亮点

| 功能 | 作用 | 默认时长 |
|------|------|----------|
| 🌬️ 深呼吸 | 跟随节拍吸气-屏息-呼气，缓解紧张 | 1分钟 |
| 🍃 自然音 | 雨声/森林/海浪，缓解焦虑 | 3分钟 |
| 🔔 音钵 | 模拟音钵共振，清空大脑杂念 | 1分钟 |
| 🌙 ASMR | 循环白噪音，自定义时长，助眠 | 10分钟（可调） |
| ☀️ 冥想 | 白噪音 + 呼吸引导 | 5分钟（可调） |
| ☁️ 专注 | 持续白噪音，提升注意力 | 30分钟（可调） |

- **治愈系配色**：每种疗法对应专属情绪色彩
- **月度统计**：记录每天使用时长，生成情绪色彩柱状图
- **简洁交互**：底部切换功能，中央一键开启

---

## 🚀 快速开始

### 1. 安装依赖

确保已安装 Node.js（18+），然后在项目目录运行：

```bash
cd calm-therapy-room
npm install
```

### 2. 生成音频资源

项目需要本地音频文件（节拍提示音、音钵、白噪音），运行：

```bash
node src/utils/generateSounds.js
```

这会在 `assets/sounds/` 下生成：
- `bell.wav` — 节拍提示音
- `bowl.wav` — 音钵声
- `white_noise.wav` — 白噪音
- `rain.wav` — 雨声

> 💡 你也可以替换成自己搜集的高品质音频，只要保持同名即可。

### 3. 准备图标（可选）

在 `assets/images/` 放入：
- `icon.png`（1024×1024）
- `splash.png`（1242×2436）
- `adaptive-icon.png`（1024×1024）

如果暂时没有，可以放任意图片占位。

### 4. 启动开发服务器

```bash
npx expo start
```

### 5. 手机预览

- **iPhone**: App Store 下载 **Expo Go**，扫描终端二维码
- **Android**: 应用商店下载 **Expo Go**，扫描终端二维码

或者按 `a` 启动安卓模拟器（需 Android Studio），按 `i` 启动 iOS 模拟器（需 macOS + Xcode）。

---

## 📦 打包发布

### Android APK/AAB

```bash
eas build -p android
```

或使用 Expo 经典方式：

```bash
expo prebuild
cd android
./gradlew assembleRelease
```

### iOS

需要 macOS + Xcode：

```bash
eas build -p ios
```

---

## 🛠 技术栈

- **React Native + Expo** — 跨平台框架
- **expo-av** — 音频播放
- **expo-haptics** — 触觉反馈
- **@react-navigation/bottom-tabs** — 底部导航
- **AsyncStorage** — 本地数据持久化
- **react-native-svg** — 统计图表

---

## 📂 项目结构

```
calm-therapy-room/
├── App.js                        # 应用入口
├── app.json                      # Expo 配置
├── package.json
├── src/
│   ├── theme.js                  # 治愈系配色
│   ├── constants.js              # 功能配置
│   ├── storage.js                # 本地存储/统计
│   ├── utils/
│   │   └── generateSounds.js     # 音频生成脚本
│   ├── navigation/
│   │   └── AppNavigator.js       # 底部导航
│   └── components/
│       ├── TherapyScreen.js      # 主页面
│       ├── BreathingGuide.js     # 深呼吸
│       ├── NatureSound.js        # 自然音
│       ├── BowlSound.js          # 音钵
│       ├── ASMRPlayer.js         # ASMR
│       ├── MeditationPlayer.js   # 冥想/专注
│       ├── StatsScreen.js        # 月度统计
│       ├── DailyChart.js         # 情绪图表
│       └── MainButton.js         # 中央按钮
└── assets/
    ├── sounds/                   # 音频文件（由脚本生成）
    └── images/                   # 图标与启动屏
```

---

## 📄 许可

MIT — 自由使用与修改。

祝你使用愉快，心随音静 🌸

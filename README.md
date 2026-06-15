# 🌿 心灵疗愈室 · Calm Therapy Room

一款专注于情绪疗愈的跨平台移动应用。融合深呼吸引导、自然白噪音、音钵共振、ASMR 助眠与冥想，搭配幸福日记、心情追踪、待办管理，构建完整的日常心理健康工具。

---

## ✨ 核心功能

### 🧘 音疗模式

| 模式 | 作用 | 默认时长 |
|------|------|----------|
| 🌬️ 深呼吸 | 跟随节拍吸气-屏息-呼气，缓解紧张 | 1 分钟 |
| 🍃 自然音 | 雨声 / 森林 / 海浪，缓解焦虑 | 3 分钟 |
| 🔔 音钵 | 模拟音钵共振，清空杂念 | 1 分钟 |
| 🌙 ASMR | 循环白噪音，助眠 | 10 分钟（可调） |
| ☀️ 冥想 | 白噪音 + 呼吸引导 | 5 分钟（可调） |
| ☁️ 专注 | 持续白噪音，提升注意力 | 30 分钟（可调） |

- 每种疗法对应专属治愈色系
- 使用时长自动记录，按日汇总统计

### 📔 幸福日记

- **日历视图**：月历选择日期，查看/记录每日疗愈数据
- **月度统计卡片**：当月疗愈分钟、日记天数、疗愈天数一目了然
- **幸福小事**（最少 3 件）：记录每天的小确幸，近 3 天内可编辑
- **昨日幸福**：聊天气泡样式展示昨天记录，可点击快速记录
- **当下心情**：选择开心/愤怒/沮丧/伤心，写心情日记（仅当天可记）
- **今日待办**：日期关联的待办清单，跟随日历切换，仅当天可编辑
- **日期详情弹窗**：疗愈时长明细 + 幸福小事 + 心情记录汇总

### 👤 个人中心

- **头像与昵称**：点击头像自定义图片，支持恢复默认；点击昵称修改
- **座右铭**：可编辑个性签名
- **今年目标**：添加/删除年度目标标签
- **订阅会员**：首月免费，每月满勤 28 天免续费，未达标可 9.9 元/月续费
- **意见反馈**：一键发送邮件反馈
- **月度报告**：本月使用次数、总时长、鼓励语

### 💾 数据存储

- 纯本地应用，无需注册登录，打开即用
- 所有数据通过 AsyncStorage 持久化在设备本地

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Expo Go App（手机预览）或 Android Studio / Xcode（模拟器）

### 安装

```bash
cd calm-therapy-room
npm install
```

### 启动

```bash
npx expo start
```

然后用 Expo Go 扫描终端二维码即可在手机上预览。

> 按 `a` 启动 Android 模拟器，按 `i` 启动 iOS 模拟器（需 macOS + Xcode）。

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.85 + Expo SDK 56 |
| 导航 | @react-navigation (Bottom Tabs) |
| 音频 | expo-audio |
| 触觉 | expo-haptics |
| 字体 | @expo-google-fonts/manrope |
| 图标 | @expo/vector-icons (Material Icons) |
| 存储 | @react-native-async-storage/async-storage |
| 动效 | expo-linear-gradient, expo-blur |
| 图片 | expo-image-picker |
| 样式 | StyleSheet, 自定义主题系统 |

---

## 📂 项目结构

```
calm-therapy-room/
├── App.js                          # 应用入口，导航根组件，字体加载
├── app.json                        # Expo 配置
├── package.json
├── src/
│   ├── theme.js                    # 治愈系配色、间距、阴影、圆角、字体体系
│   ├── constants.js                # 音疗模式配置、存储键名
│   ├── storage.js                  # AsyncStorage 数据层（日记/统计/待办/心情/目标/迁移）
│   ├── context/
│   │   ├── AuthContext.js           # 本地用户管理（昵称/头像持久化）
│   │   └── SubscriptionContext.js   # 订阅状态（首月免费/满勤免续/付费）
│   ├── navigation/
│   │   └── AppNavigator.js         # 底部 Tab 导航（疗愈/日记/我的）
│   └── screens/
│       ├── TherapyScreen.js        # 音疗主页（模式选择 + 播放控制）
│       ├── DiaryScreen.js          # 幸福日记（日历/统计/昨日幸福/心情/待办）
│       ├── ProfileScreen.js        # 个人中心（头像/目标/订阅/反馈）
│       ├── BreathingGuide.js       # 深呼吸引导
│       ├── NatureSound.js          # 自然音播放器
│       ├── BowlSound.js            # 音钵播放器
│       ├── ASMRPlayer.js           # ASMR 播放器（可调时长）
│       └── MeditationPlayer.js     # 冥想/专注播放器
└── assets/
    ├── sounds/                     # 音频资源
    └── images/                     # 图标与启动屏
```

---

## 📦 打包发布

```bash
# Android
eas build -p android

# iOS（需 macOS + Xcode）
eas build -p ios
```

---

## 📄 许可

MIT — 自由使用与修改。

祝使用愉快，心随音静 🌸

<div align="center">
<img width="1200" height="475" alt="AquaSense Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# AquaSense AI

**基于 AI 的人体水分追踪与生物特征分析系统**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 项目简介

AquaSense AI 是一款先进的 AI 驱动的水分管理应用。它通过分析用户的舌象（Tongue Analysis）和尿液（Urine Analysis）照片，提供深度的健康洞察。结合多维度的生物特征分析，AquaSense 为用户提供个性化的补水建议和健康报告。

## ✨ 核心功能

- **AI 舌诊分析**：利用 Google Gemini AI 分析舌头的颜色、苔质和纹理，评估体内水分和脏腑健康。
- **尿液颜色识别**：通过图像识别技术检测尿液比重和集中度，实时反馈脱水状态。
- **多维度水分报告**：提供包含矿物质、电解质、细胞内外液等指标的雷达图分析。
- **个性化饮品推荐**：根据分析结果，智能推荐最适合当前身体状态的补水方案（如：薄荷黄瓜水、椰子水等）。
- **历史追踪**：记录每次测试结果，追踪水分平衡趋势。

## 🛠️ 技术栈

### 前端
- **React 19** + **TypeScript**
- **Vite** (构建工具)
- **Tailwind CSS** (UI 框架)
- **Material Icons** (图标库)

### 后端
- **FastAPI** (Python Web 框架)
- **Google Gemini API** (AI 分析)
- **SQLite** (数据库)
- **Aliyun OSS** (图片存储)

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/lihe8811/AquaSense.git
cd AquaSense
```

### 2. 后端配置
1. 进入后端目录：
   ```bash
   cd backend
   ```
2. 创建并激活虚拟环境（推荐）：
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   ```
3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
4. 配置环境变量：在 `backend` 目录下创建 `.env` 文件，并填写相关 Key：
   ```env
   GEMINI_API_KEY=your_key_here
   OSS_ACCESS_KEY_ID=your_id
   OSS_ACCESS_KEY_SECRET=your_secret
   OSS_ENDPOINT=your_endpoint
   OSS_BUCKET_NAME=your_bucket
   ```
5. 启动后端服务：
   ```bash
   uvicorn main:app --reload
   ```

### 3. 前端配置
1. 返回根目录并安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 访问地址：`http://localhost:3000`

---

## 📂 目录结构

```text
AquaSense/
├── backend/                # Python FastAPI 后端
│   ├── data/               # Mock 数据与 SQLite 数据库
│   ├── services/           # AI、存储、认证等核心业务逻辑
│   └── main.py             # API 入口
├── src/                    # React 前端源码
│   ├── components/         # 通用组件 (图表、进度条等)
│   ├── views/              # 页面视图 (分析、报告、概览等)
│   └── App.tsx             # 路由与应用主入口
├── types.ts                # TypeScript 类型定义
└── README.md               # 项目说明
```

## 📄 开源协议

本项目遵循 MIT 协议。

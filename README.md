
<p align="center">
  <img src="https://raw.githubusercontent.com/EchoLook/.github/main/img/ECHOLOOKLOGO.png" alt="EchoLook Logo" width="200"/>
</p>
<div align="center">
Find, Try On, and Buy Clothes with AI
</div>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#technologies">Technologies</a> •
  <a href="#team">Team</a> •
  <a href="#license">License</a>
</p>

---

![Demo](doc/demo.gif)

## ✨ Features

EchoLook offers a comprehensive suite of AI-powered features for a revolutionary shopping experience:

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Search** | Simply describe what you're looking for and let AI find matches |
| 👗 **Clothing Segmentation** | Intelligent detection and classification of garments in photos |
| 🔍 **Visual Search** | Upload photos or take them instantly to find similar clothes in the Inditex catalog |
| 🎭 **Virtual Try-On** | See how clothes will look on you before purchasing |

Our application follows a modern client-server architecture:

- **Client**: Responsive Quasar/Vue.js frontend with intuitive UI components
- **Server**: Node.js backend with Express handling API requests and AI services
- **AI Modules**:
  - Cloth Segmentation Mini (U2NET model)
  - Whisper-Query-Parser (Voice to structured queries)
  - FashnAI API Integration (Virtual try-on)

## 🚀 Installation

### Prerequisites

```bash
# Install FFmpeg (required for audio processing)
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/echolook.git
cd echolook
```

2. **Install dependencies**

```bash
npm install
```

This will install dependencies for:
- Root project
- Client (Vue.js/Quasar)
- Server (Node.js/Express)
- AI modules (Python requirements)

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your API keys:
# - GOOGLE_API_KEY for Gemini
# - FASHN_API_KEY for virtual try-on
# - INDITEX_API_KEY for product search
# - PICTURE_BUCKET
# - ACCESS_KEY_ID
# - SECRET_ACCESS_KEY
# - INDITEX_USER
# - INDITEX_SECRET
# - INDITEX_OAUTH_URL
# - INDITEX_API_URL
# - WHISPER_API_URL
# - FASHNIA_API_URL
```

4. **Start the application**

```bash
npm run dev
```

This will concurrently launch:
- Frontend at http://localhost:9000
- Backend at http://localhost:3000

## 📱 Usage

### Visual Search

1. Navigate to the camera icon on the main page
2. Upload a photo or take one with your camera
3. The image will be automatically segmented
4. Click on any detected garment to see similar options in the Inditex catalog

### Voice Search

1. Click the microphone button
2. Describe what you're looking for (e.g., "I want a blue short-sleeve t-shirt")
3. The system will translate your request and show relevant results

### Virtual Try-On

1. Select an image of yourself
2. Choose a garment from search results
3. Click "Try On" to see the garment virtually fitted on your photo

## 💻 Technologies

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js"/>
  <img src="https://img.shields.io/badge/Quasar-1976D2?style=for-the-badge&logo=quasar&logoColor=white" alt="Quasar"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/Whisper-FF6F00?style=for-the-badge&logo=openai&logoColor=white" alt="Whisper"/>
  <img src="https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"/>
</p>

## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/manuamest">
        <img src="https://github.com/manuamest.png" width="100px;" alt="José Manuel Amestoy"/>
        <br />
        <sub><b>José Manuel Amestoy</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/alejandrobujan">
        <img src="https://github.com/alejandrobujan.png" width="100px;" alt="Alejandro Buján"/>
        <br />
        <sub><b>Alejandro Buján</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/sergio-legazpi">
        <img src="https://github.com/sergio-legazpi.png" width="100px;" alt="Sergio Gollanes"/>
        <br />
        <sub><b>Sergio Goyanes</b></sub>
      </a>
    </td>
  </tr>
</table>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Created for HackUPC 2025 InditexTECH Challenge*

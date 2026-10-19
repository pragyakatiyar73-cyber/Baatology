# Baatology 🎙️🚀
> **Speak • Learn • Grow**  
> *An AI-Powered 3D Biomolecular & Communication Platform for Group Discussions, Project Presentations, and Resume-Linked Interview Mastery.*

---

## 🌟 Overview

**Baatology** is an intelligent, client-side, real-time communication and placement readiness suite designed to eliminate interview anxiety, build speaking confidence, and polish corporate readiness. 

Whether practicing in a circular 5-seat Group Discussion, delivering a slide-by-slide project presentation with AI suggestions, or mastering an elevator pitch cross-matched directly against an uploaded resume, Baatology provides actionable, real-time feedback with zero cloud telemetry lag.

---

## 🚀 Core Features & Arenas

### 1. 👥 Group Discussion (GD) Studio
- **Circular 5-Seat Experience**: Simulates a real corporate GD room with 3 realistic AI student avatars (Rohan, Ananya, Vikram) + 1 candidate student + AI moderator.
- **Add Friends or Avatars**: Practice solo against avatars or invite real friends into the circle.
- **5-Minute Topic Prep & Key Points**: When a topic is chosen (either candidate's choice or avatar's choice), the platform surfaces critical debate perspectives and gives 5 minutes for structured preparation.
- **15-Minute Dynamic GD Session**: Real-time turn-taking, counter-arguments, and live listening indicators.
- **AI Celebration & Sentence Repeat Drill**: Automated congratulations, fireworks confetti, and audio feedback that detects grammatical/fluency errors and prompts the student to re-speak improved phrases aloud.

---

### 2. 📊 Project Presentation Studio
- **Direct PPT / PPTX & PDF Submission**: Drag-and-drop or browse your project slides. Instantly renders clean, high-resolution slide previews without mobile conversion hassles.
- **Live Slide-by-Slide Telemetry**:
  - Live Words-Per-Minute (WPM)
  - Hesitation Fillers Counter ("umm", "like", "basically")
  - Real-time Confidence Index & Eye Contact Tracking
- **AI Slide Audit ("Iske Jagah Ye Karte Toh Zyada Accha Hota")**: Scans slide titles and bullet points to suggest concrete, high-impact design and content improvements.
- **Dynamic Follow-Up Q&A**: Tailored questions based strictly on the content of the presented slides.
- **Post-Presentation Celebration**: Audio applause, confetti blast, and structured performance rubric.

---

### 3. 📄 Resume-Powered Self-Introduction & Interview Studio *(New)*
- **Resume Upload & Parsing**: Supports `.pdf`, `.docx`, `.txt`, or 1-click curated engineering student samples.
- **AI Resume Health Audit & Problem Detector**:
  - Scans for passive action verbs, missing quantifiable metrics, and ATS formatting gaps.
  - Generates side-by-side **"Iske Jagah Ye Likhein" (Better Alternative)** cards to make resume bullets 2x more impactful.
- **Live Speech vs. Resume Cross-Matcher**:
  - 🟢 **Mentioned Resume Items**: Dynamic badges light up as the candidate mentions their college, degree, core skills, and projects.
  - 🟡 **Omitted Highlights**: Real-time reminders of strong achievements forgotten during the pitch.
  - 🔴 **Inconsistency Detector**: Flags claims that contradict graduation years or listed skills.
- **Resume-Tailored Dynamic Interview Questions**: AI generates and speaks dynamic technical questions derived specifically from the candidate's primary project and skills.
- **Mistakes & Executive Phrasing Rewrites**: Detects campus grammar habits (e.g., *"Myself..."*, *"passed out"*) and provides executive corporate rewrites.

---

### 4. 📈 Communication Progress & Date-Wise Tracking
- **Dual Grouped Bar Chart**: Dark-themed visual comparison of **Previous Score (Blue)** vs **Latest Score (Green)** across:
  - Group Discussion (45 ➔ 65)
  - Presentation (55 ➔ 75)
  - Casual Talk (60 ➔ 80)
- **Date-Wise Consistency Table**: Historical tracker detailing practice domain, score out of 100, eye contact %, fillers count, milestone achievement badges, and a `+31% Growth 🔥` indicator.

---

### 5. 🤖 3D Embodied AI Mentor & Safe Space Companion
- **Realistic 3D Executive Avatar**: Seated in a modern glass corporate boardroom in an ergonomic executive chair.
- **Natural Seated Human Hand Posture**: Upper arms resting naturally along the ribcage with relaxed, gently curled fingers resting in the lap.
- **Authentic Human Skin**: High-fidelity skin texture matching face, neck, and hands with zero plastic mannequin artifacts.
- **Live Phonetic Viseme Lip-Sync**: Natural mouth movements matching speech synthesis syllables.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Canvas Confetti |
| **3D Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **Document Processing** | `pdfjs-dist`, `jszip` (PPTX XML parser) |
| **Speech & Audio** | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), Web Audio API (`AudioContext`, `AnalyserNode`) |
| **Backend API** | Node.js, Express (Port 3001) |

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- Modern web browser with Web Speech API support (Google Chrome, Microsoft Edge, or Brave recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pragyakatiyar73-cyber/Baatology.git
   cd Baatology
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Backend API Server**:
   ```bash
   node server.js
   ```
   *Runs on `http://localhost:3001`.*

4. **Start the Vite Frontend Development Server**:
   ```bash
   npm run dev
   ```
   *Opens on `http://localhost:3000`.*

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
Baatology/
├── public/
│   ├── backgrounds/          # High-resolution 3D boardroom & office environments
│   ├── models/               # 3D GLB humanoid models & custom textures
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Dashboard/        # Executive dashboard, sidebar, and progress charts
│   │   ├── GDStudio/         # Circular 5-seat Group Discussion arena
│   │   ├── Presentation/     # PPT slide presenter & live telemetry
│   │   ├── SelfIntro/        # Resume-linked self-introduction & interview studio
│   │   ├── Mentorship/       # 3D seated mentor avatar & code workspace
│   │   └── Call/             # Embodied robot 1-on-1 consultation
│   ├── hooks/                # Speech recognition, audio telemetry & webcam hooks
│   ├── utils/
│   │   ├── resumeParser.js   # PDF extraction, resume flaw audit & speech matcher
│   │   ├── pptxParser.js     # Presentation parser & slide audit engine
│   │   ├── gdFeedbackEngine.js # Avatar personalities, debate logic & scoring
│   │   └── progressHistory.js  # Date-wise consistency history engine
│   ├── App.jsx               # Central view router & session manager
│   └── index.css             # Tailwind setup & styling
├── server.js                 # Express backend server
├── package.json
└── README.md
```

---

## 🔒 Privacy & Client-Side Processing

- **Zero Cloud Video/Audio Streaming**: All facial tracking, posture estimation, and voice telemetry run 100% locally on the client's browser using native Web APIs.
- **Secure File Ingestion**: Uploaded resumes and presentation slide decks are processed in-memory and are never uploaded to third-party tracking servers.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request with your suggested improvements.

---

## 📄 License

This project is licensed under the MIT License.
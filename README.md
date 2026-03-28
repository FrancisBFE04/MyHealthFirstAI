# MyHealthFirstAI 🏃‍♂️🥗

**A comprehensive, gamified AI-powered fitness and nutrition platform.**

Built with React Native (Expo) for cross-platform mobile/web support and FastAPI for the backend. Features AI food recognition, voice logging, smartwatch integration, personalized workout plans, and more.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Frontend-React%20Native%20%2B%20Expo-61DAFB)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-009688)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)

---

## 🌟 Features Overview

### 📊 Dashboard
- Real-time calorie and macro ring charts
- Daily nutrition overview with progress tracking
- Quick action buttons for fast logging
- Current streak and badge display

### 📸 AI Food Scanner
- Camera-based food recognition using Google Gemini Vision
- Automatic portion size estimation
- Instant nutrition breakdown (calories, protein, carbs, fat)
- Multi-food detection in single image

### 🎤 Voice Food Logging
- Speak your meals naturally ("I had pizza and a coke for lunch")
- AI transcription and food parsing
- Text input fallback when voice unavailable
- Fallback food database (30+ foods) when AI quota exceeded

### 💧 Water Tracking
- Animated wave UI visualization
- Quick-add buttons (250ml, 500ml, custom)
- Daily hydration goals and progress
- History tracking

### 🍳 Smart Recipe Generator (Pantry Chef)
- Photo your ingredients → get healthy recipes
- Dietary preference support
- Step-by-step cooking instructions
- Nutrition breakdown per serving

### 📅 Meal Planner
- Weekly calendar view
- Drag-and-drop meal planning
- Quick meal suggestions
- Daily calorie totals

### 💪 AI Workout Planner
- Personalized workout plans based on:
  - Body metrics (height, weight, age, BMI)
  - Fitness goals (Weight Loss, Muscle Gain, Endurance, etc.)
  - Experience level (Beginner, Intermediate, Advanced)
  - Workout type (Gym, Home, Both)
  - Days per week (2-6 days)
- **Target Weight Goals**: Set specific weight loss/gain targets with timeframe (8-24 weeks)
- **Smart Calorie Adjustment**: Auto-calculates daily deficit/surplus
- **Goal-Specific Diet Plans**: Tailored nutrition and macros based on objective
- **Day-Specific Workouts**: Different exercises for Upper Body, Lower Body, Core & Cardio, Full Body, HIIT, Active Recovery

### ⌚ Smartwatch Integration
- Sync health data from wearables
- Track steps, heart rate, SpO2, sleep
- Activity monitoring and trends
- Supports Apple Watch, Fitbit, Garmin, Samsung Galaxy Watch

### 🏋️ AI Form Corrector
- Video analysis for exercise form feedback
- Real-time posture correction suggestions
- Safety scoring and injury prevention tips
- Supports major exercises (squat, deadlift, push-up, bench press, etc.)

### 🤖 AI Nutrition Coach
- Chat-based personalized advice
- Context-aware recommendations based on daily progress
- Meal suggestions and nutrition tips
- Answer fitness and diet questions

### 🎮 Gamification System
- **Badges**: Unlock achievements (First Scan, Week Warrior, Macro Master, etc.)
- **Streaks**: Daily login and logging streaks
- **Daily Challenges**: Random fitness/nutrition goals
- **Progress Milestones**: Track your transformation journey

### 💎 Freemium Model

| Feature | Free | Pro ($9.99/mo) |
|---------|------|----------------|
| Food Scans | 3/day | Unlimited |
| Voice Logging | ❌ | ✅ |
| Form Corrector | ❌ | ✅ |
| AI Coach | Limited | Unlimited |
| Recipes | 2/day | Unlimited |
| Smartwatch Sync | ❌ | ✅ |
| Target Weight Goals | ❌ | ✅ |
| Ads | Yes | No |

---

## 🏗️ Project Structure

```
MyHealthFirstAI/
├── frontend/                 # React Native + Expo
│   ├── app/                  # Expo Router screens (14 screens)
│   │   ├── _layout.tsx       # Root layout (responsive nav)
│   │   ├── index.tsx         # Dashboard
│   │   ├── food.tsx          # AI Food Scanner
│   │   ├── voice.tsx         # Voice Logging
│   │   ├── water.tsx         # Water Tracking
│   │   ├── recipes.tsx       # Pantry Chef
│   │   ├── planner.tsx       # Meal Planner
│   │   ├── workout.tsx       # AI Workout Planner
│   │   ├── watch.tsx         # Smartwatch Sync
│   │   ├── form.tsx          # Form Corrector
│   │   ├── coach.tsx         # AI Coach Chat
│   │   ├── badges.tsx        # Achievements & Gamification
│   │   ├── premium.tsx       # Subscription Management
│   │   └── more.tsx          # Additional Options
│   ├── components/
│   │   ├── shared/           # Cross-platform components
│   │   │   ├── GlassCard.tsx
│   │   │   ├── ActionButton.tsx
│   │   │   ├── RingChart.tsx
│   │   │   ├── Gamification.tsx
│   │   │   └── UpgradeModal.tsx
│   │   └── web/
│   │       └── Sidebar.tsx   # Web navigation sidebar
│   ├── contexts/
│   │   ├── SubscriptionContext.tsx
│   │   └── UserContext.tsx
│   ├── services/
│   │   ├── api.ts            # Backend API client
│   │   └── database.ts       # Local SQLite storage
│   ├── constants/
│   │   ├── theme.ts          # Colors, typography, spacing
│   │   ├── config.ts         # API configuration
│   │   └── foodDatabase.ts   # Local food fallback data
│   └── assets/
│       └── logo.png
│
├── backend/                  # FastAPI + Python
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt      # Python dependencies
│   ├── schema.sql            # Database schema
│   └── app/
│       ├── config.py         # Settings & API keys
│       ├── database.py       # SQLAlchemy async models
│       ├── routers/          # API endpoints (9 routers)
│       │   ├── auth.py       # JWT Authentication
│       │   ├── food.py       # Food analysis & diet adjustment
│       │   ├── voice.py      # Voice processing & text parsing
│       │   ├── form.py       # Exercise form analysis
│       │   ├── recipes.py    # Recipe generation
│       │   ├── chat.py       # AI coach conversations
│       │   ├── workout.py    # Workout plan generation
│       │   ├── health.py     # Smartwatch data sync
│       │   └── subscription.py # Freemium management
│       ├── services/
│       │   ├── gemini_ai.py  # Google Gemini integration
│       │   ├── vision_ai.py  # Multi-modal vision service
│       │   ├── voice_processor.py # Audio transcription
│       │   └── rate_limiter.py    # Usage tracking
│       └── middleware/
│           └── rate_limit.py # Request rate limiting
│
├── logo.png                  # App logo
├── README.md                 # This file
└── ARCHITECTURE.md           # Technical architecture
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **Expo CLI**: `npm install -g expo-cli`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Run on specific platforms:
```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser (http://localhost:19006)
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API documentation: `http://localhost:8000/docs`

---

## ⚙️ Configuration

### Backend Environment Variables

Create `.env` in the `backend/` folder:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Security
SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=true

# Database
DATABASE_URL=sqlite+aiosqlite:///./myhealthfirstai.db

# CORS Origins
ALLOWED_ORIGINS=["http://localhost:19006", "http://127.0.0.1:19006"]
```

### Frontend Configuration

Edit `frontend/constants/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000',  // Development
  // BASE_URL: 'https://api.myhealthfirstai.com',  // Production
};
```

---

## 🔌 API Endpoints

### Food & Nutrition
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/food/analyze` | POST | Analyze food image with AI |
| `/api/food/diet-adjustment` | POST | Get diet recommendations |

### Voice Logging
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/voice/analyze` | POST | Process voice recording |
| `/api/voice/parse-text` | POST | Parse text to nutrition (no auth) |
| `/api/voice/transcribe` | POST | Transcribe audio only |

### Workout & Health
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workout/generate-plan` | POST | Generate personalized workout |
| `/api/health/sync` | POST | Sync smartwatch data |
| `/api/health/today` | GET | Get today's health metrics |
| `/api/health/history` | GET | Get health data history |
| `/api/health/summary` | GET | Get health summary |

### AI Features
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recipes/generate` | POST | Generate recipe from image |
| `/api/chat/message` | POST | AI coach conversation |
| `/api/form/analyze` | POST | Analyze exercise form video |

### Subscription
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscription/check-limit` | GET | Check feature usage limits |
| `/api/subscription/check-badges` | POST | Check and unlock badges |

---

## 📱 Platform Support

| Platform | Status | Navigation | Notes |
|----------|--------|------------|-------|
| 🌐 Web | ✅ Full | Sidebar | Responsive, works on desktop/tablet |
| 📱 iOS | ✅ Full | Bottom Tabs | Expo managed workflow |
| 🤖 Android | ✅ Full | Bottom Tabs | Expo managed workflow |

---

## 🛠️ Tech Stack

### Frontend
- **React Native 0.73+** with **Expo SDK 50+**
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **Expo SQLite** - Local-first offline storage
- **expo-av** - Audio recording for voice
- **expo-camera** - Food scanning
- **expo-linear-gradient** - Glass morphism effects
- **AsyncStorage** - Preferences and cache

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy 2.0** - Async ORM with aiosqlite
- **Google Gemini AI** - Vision, text, and audio models
- **Pydantic v2** - Data validation
- **Uvicorn** - ASGI server
- **Python 3.11+**

### AI Models Used
| Model | Use Case |
|-------|----------|
| Gemini 2.0 Flash | Fast food recognition, chat, voice parsing |
| Gemini 1.5 Pro | Complex analysis, recipes, form correction |
| Fallback DB | 30+ common foods for offline/quota exceeded |

---

## 🎨 Design System

### Color Palette
```
Primary:     #00D4AA (Teal/Cyan)
Accent:      #FF6B6B (Coral Red)
Background:  #0A0A0F (Dark)
Card:        rgba(255, 255, 255, 0.08)
Text:        #FFFFFF
Text Muted:  #8E8E93
Success:     #34C759 (Green)
Warning:     #F1C40F (Yellow)
Error:       #FF3B30 (Red)
```

### UI Components
- **Glass Cards**: Blur effect with subtle borders
- **Ring Charts**: Animated progress indicators
- **Gradient Buttons**: Primary action emphasis
- **Responsive Layout**: Adapts to screen size

---

## 🔐 Security Features

- JWT-based authentication
- Rate limiting per user/endpoint
- CORS protection
- Input validation with Pydantic
- Secure API key management

---

## 📊 Database Schema

### Users
- Profile info, goals, preferences
- Subscription tier (free/pro)

### Food Logs
- Daily nutrition entries
- Meal type, timestamp, source

### Health Data
- Smartwatch sync data
- Steps, heart rate, sleep, SpO2

### Gamification
- Badges earned
- Streak tracking
- Daily challenges

---

## 🚧 Roadmap

- [ ] Apple HealthKit native integration
- [ ] Google Fit API integration
- [ ] Social features (friends, challenges)
- [ ] Barcode scanning
- [ ] Restaurant menu scanning
- [ ] Wearable real-time sync
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues and feature requests, please open a GitHub issue.

---

<p align="center">
  <b>Made with ❤️ for a healthier you!</b>
</p>

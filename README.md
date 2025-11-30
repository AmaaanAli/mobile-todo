# Mobile Todo Application

A full-stack todo application built with **FastAPI** (backend), **MongoDB** (database), and **React Native with Expo** (mobile frontend). Features JWT authentication, API integration, and a clean navigation structure.

<table align="center">
  <tr>
    <td align="center"><img src="images/1.jpeg" width="250" height="450" /></td>
    <td align="center"><img src="images/2.jpeg" width="250" height="450" /></td>
  </tr>
  <tr>
    <td align="center"><img src="images/3.jpeg" width="250" height="450" /></td>
    <td align="center"><img src="images/4.jpeg" width="250" height="450" /></td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 16+** (for mobile)
- **MongoDB** (local or Atlas cluster)
- **Git**

---

## 🔧 Backend Setup

### 1. Navigate to Backend

```powershell
cd backend
```

### 2. Create Virtual Environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```powershell
copy .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=YourApp
SECRET_KEY=your-long-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**MongoDB URI Examples:**

- **Local MongoDB:** `mongodb://localhost:27017/todoapp`
- **MongoDB Atlas:** `mongodb+srv://user:pass@cluster.mongodb.net/?appName=App`

### 5. Run Backend

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will start on `http://0.0.0.0:8000`. Visit `http://localhost:8000/docs` for interactive Swagger UI.

---

## 📱 Frontend Setup

### 1. Navigate to frontend

```powershell
cd frontend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Configure Backend URL

Edit `mobile/api/api.js` and update `BASE_URL`:

```javascript
export const BASE_URL = "http://10.0.2.2:8000"; // For Android emulator
// or use your machine IP: 'http://192.168.1.100:8000'
// or localhost for web: 'http://localhost:8000'
```

**Quick reference:**

- **Android Emulator:** `http://10.0.2.2:8000`
- **iOS Simulator:** `http://localhost:8000`
- **Physical Device:** Use your machine's local IP (e.g., `http://192.168.1.100:8000`)
- **Web:** `http://localhost:8000`

### 4. Start Expo Dev Server

```powershell
npm start
```


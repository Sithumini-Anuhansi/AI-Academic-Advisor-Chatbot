# EduMentor AI — Academic Advisor Chatbot

An AI-powered academic advisor web application that helps university students monitor their academic performance, predict their pass/fail outcome, view performance analytics, and receive personalised study advice through an AI chatbot.

## Overview

**EduMentor AI** combines a machine-learning prediction model with an academic-advice chatbot in a full-stack web application.

Students can:

- Create an account and securely log in
- Enter academic performance information
- Get an instant **PASS / FAIL prediction**
- View prediction confidence
- Review previous predictions
- Analyse performance trends through charts
- Chat with an academic advisor for personalised recommendations
- Receive advice based on their latest prediction and academic data

The application uses a **Logistic Regression** model for academic prediction and **Google Gemini** for AI-powered conversational advice, with predefined fallback responses available when the AI service is unavailable.

---

## Key Features

### 🔐 Authentication
- Student registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected prediction, dashboard, and chatbot routes
- Seven-day JWT access-token expiry

### 📊 Academic Prediction
Students provide:

- Attendance percentage
- Internal Test 1 score
- Internal Test 2 score
- Assignment score
- Daily study hours

The trained machine-learning model returns:

- `PASS` or `FAIL`
- Prediction confidence percentage

### 📈 Performance Dashboard
The dashboard provides:

- Total prediction count
- Number of predicted passes
- Number of predicted fails
- Latest prediction
- Pass/fail distribution chart
- Average academic input scores
- Prediction confidence trend
- Historical prediction records

### 🤖 AI Academic Advisor
The chatbot, **EduMentor AI**, can help with:

- Personalised study plans
- Exam and test preparation
- Time management
- Procrastination
- Study techniques
- Active recall and spaced repetition
- Assignment guidance
- Academic motivation
- Attendance improvement
- Understanding prediction results
- General student wellbeing and study habits

The chatbot can use the student's latest prediction data, including attendance, test scores, assignment score, study hours, prediction result, and confidence.

### 🛡️ API Protection
- JWT authentication
- Request rate limiting
- CORS support
- Input validation
- Protected API endpoints
- Password hashing

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | User interface |
| Vite | Frontend development/build tool |
| React Router | Client-side routing |
| Axios | API communication |
| Tailwind CSS | Styling |
| Recharts | Analytics and charts |
| React Hot Toast | Notifications |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend and ML development |
| Flask | REST API |
| Flask-JWT-Extended | Authentication |
| Flask-SQLAlchemy | Database ORM |
| Flask-Limiter | API rate limiting |
| Flask-CORS | Cross-origin requests |
| bcrypt | Password hashing |
| python-dotenv | Environment configuration |

### Machine Learning

| Technology | Purpose |
|---|---|
| scikit-learn | Machine learning |
| Logistic Regression | PASS/FAIL classification |
| StandardScaler | Feature scaling |
| pandas | Dataset processing |
| NumPy | Numerical operations |
| Joblib | Saving/loading trained model |

### AI

- Google Gemini API
- `google-genai` Python SDK
- Context-aware academic advice
- Fallback responses when Gemini is unavailable

### Database

- SQLAlchemy
- MySQL-compatible database through PyMySQL
- SQLite can also be used by configuring the appropriate SQLAlchemy database URL

---

## System Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│          Vite + UI           │
└──────────────┬───────────────┘
               │ Axios / REST API
               ▼
┌──────────────────────────────┐
│        Flask Backend         │
│                              │
│  Authentication              │
│  Prediction API              │
│  Chat API                    │
│  Analytics API               │
│  Rate Limiting               │
└───────┬───────────┬──────────┘
        │           │
        │           ├──────────────────┐
        ▼           ▼                  ▼
┌────────────┐ ┌──────────────┐ ┌───────────────┐
│ SQLAlchemy │ │ ML Prediction│ │ Gemini API    │
│ Database   │ │ Model        │ │ EduMentor AI  │
└────────────┘ └──────────────┘ └───────────────┘
```

---

## Project Structure

```text
AI-Academic-Advisor-Chatbot/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── train_model.py
│   ├── test.json
│   │
│   ├── chatbot/
│   │   ├── __init__.py
│   │   └── chatbot.py
│   │
│   ├── data/
│   │   └── student_data.csv
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   └── models.py
│   │
│   ├── model/
│   │   ├── student_model.pkl
│   │   └── scaler.pkl
│   │
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       └── predictions.py
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── logo.png
│   │
│   └── src/
│       ├── api/
│       │   └── axios.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── PrivateRoute.jsx
│       ├── pages/
│       │   ├── Chatbot.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── NotFound.jsx
│       │   ├── PredictionForm.jsx
│       │   └── Register.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── .gitignore
└── README.md
```

---

## Machine Learning Model

The prediction model uses **Logistic Regression** to classify whether a student is likely to pass or fail.

### Input Features

```text
Attendance (%)
Internal Test 1 (out of 40)
Internal Test 2 (out of 40)
Assignment Score (out of 10)
Daily Study Hours
```

### Target

The target is generated from the final exam mark:

```text
Final Exam Mark >= 50 → PASS
Final Exam Mark < 50  → FAIL
```

### Training Process

```text
Student Dataset
      ↓
Data Preparation
      ↓
Feature Selection
      ↓
Train/Test Split
      ↓
StandardScaler
      ↓
Logistic Regression
      ↓
Model Evaluation
      ↓
student_model.pkl
scaler.pkl
```

The trained model and scaler are stored in:

```text
backend/model/
```

To retrain the model:

```bash
cd backend
python train_model.py
```

---

## API Endpoints

### Authentication

#### Register

```http
POST /auth/register
```

Example request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
```

Example request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Prediction

#### Create Prediction

```http
POST /predict
Authorization: Bearer <JWT_TOKEN>
```

Example:

```json
{
  "attendance": 85,
  "test1": 32,
  "test2": 30,
  "assignment": 8,
  "study_hours": 4
}
```

Example response:

```json
{
  "prediction": "PASS",
  "confidence": 91.4
}
```

#### Prediction History

```http
GET /predictions/history
Authorization: Bearer <JWT_TOKEN>
```

#### Latest Prediction

```http
GET /predictions/latest
Authorization: Bearer <JWT_TOKEN>
```

#### Analytics

```http
GET /predictions/analytics
Authorization: Bearer <JWT_TOKEN>
```

---

### AI Chatbot

```http
POST /chat
Authorization: Bearer <JWT_TOKEN>
```

Example request:

```json
{
  "message": "Create a study plan for my next test.",
  "history": []
}
```

The backend automatically retrieves the student's latest prediction and uses relevant academic information as context for the advisor.

---

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=mysql+pymysql://username:password@localhost/database_name
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

### Variable Description

| Variable | Description |
|---|---|
| `SECRET_KEY` | Flask application secret |
| `JWT_SECRET_KEY` | Secret used to sign JWT tokens |
| `DATABASE_URL` | SQLAlchemy database connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `PORT` | Backend port; defaults to `5000` |

> Never commit `.env` or API keys to GitHub.

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd AI-Academic-Advisor-Chatbot
```

### 2. Set Up the Backend

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create:

```text
backend/.env
```

Add the required configuration:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=mysql+pymysql://username:password@localhost/database_name
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

### 4. Prepare the Database

Create your database and make sure the `DATABASE_URL` points to it.

The application automatically creates the required tables when the Flask application starts.

Main tables:

```text
users
predictions
```

### 5. Start the Backend

From the `backend` directory:

```bash
python app.py
```

The API will normally be available at:

```text
http://localhost:5000
```

Check that the server is running:

```text
http://localhost:5000/health
```

### 6. Set Up the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Frontend Scripts

Inside the `frontend` directory:

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Application Flow

```text
Student
   │
   ▼
Register / Login
   │
   ▼
Dashboard
   │
   ├───────────────┐
   │               │
   ▼               ▼
Enter Academic    View Previous
Information       Predictions
   │               │
   ▼               ▼
ML Prediction    Analytics
   │
   ▼
PASS / FAIL
   │
   ▼
AI Academic Advisor
   │
   ▼
Personalised Study Advice
```

---

## Security

The application includes several security-related measures:

- Passwords are hashed using bcrypt before storage.
- JWT tokens protect authenticated API endpoints.
- Prediction and chatbot endpoints require authentication.
- API requests are rate-limited.
- CORS is configured for frontend/backend communication.
- Secrets and API credentials are loaded from environment variables.
- User prediction records are associated with authenticated user IDs.

---

## Future Improvements

Potential future enhancements include:

- More advanced ML models and model comparison
- Additional academic features and student profiles
- Subject-level predictions
- More detailed recommendation generation
- Email notifications for academic-risk students
- Lecturer/admin dashboards
- Student progress goals
- Study-plan generation based on upcoming assessments
- Deployment using Docker and cloud services
- Automated model retraining
- More comprehensive model evaluation and explainability

---

## Disclaimer

EduMentor AI provides academic predictions and study guidance for educational support and should not be treated as an official academic assessment or institutional decision-making system. Prediction results are based on the data and trained model available in the application.

---

## Project Purpose

This project was developed as a full-stack AI and machine-learning application demonstrating:

- React frontend development
- REST API development with Flask
- JWT authentication
- Relational database integration
- Machine-learning model training and inference
- Generative AI integration
- Data visualisation
- API security and rate limiting
- End-to-end integration of AI, ML, backend, and frontend technologies

---

## Author

**Sithumini Anuhansi**

Software Engineering Undergraduate (NIBM)

[![Email](https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white)](mailto:anuhansisithumini@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sithumini-anuhansi-5b32a8334)

---

<div align="right">
<img src="https://visitor-badge.laobi.icu/badge?page_id=Sithumini-Anuhansi.AI-Academic-Advisor-Chatbot&left_text=Views"/>
</div>

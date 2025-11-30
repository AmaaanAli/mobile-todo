FastAPI Todo Backend

Requirements

- Python 3.10+
- MongoDB (local or Atlas)

Setup

1. Create and activate a virtualenv

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# edit .env with real values
```

Run

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints

- POST /auth/signup -> register
- POST /auth/login -> get access token
- GET /users/me -> profile (auth)
- GET /todos -> list user's todos (auth)
- POST /todos -> create todo (auth)
- PUT /todos/{id} -> update (mark complete) (auth)

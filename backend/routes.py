from fastapi import APIRouter, Depends, HTTPException, status
from models import UserCreate, UserOut, Token, TokenData, TodoCreate, TodoOut
import crud, auth
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post('/auth/signup', response_model=UserOut)
async def signup(user: UserCreate):
    existing = await crud.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    # Validate password strength and create user
    try:
        # will raise ValueError if password is weak
        import auth as _auth
        _auth.validate_password_strength(user.password)
        user_doc = await crud.create_user(user)
        return user_doc
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # log full traceback to the server console for debugging
        import traceback
        traceback.print_exc()
        # return a clearer HTTP error to the client
        raise HTTPException(status_code=500, detail='Internal Server Error')

@router.post('/auth/login', response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await crud.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect email or password')
    access_token_expires = timedelta(minutes=60)
    access_token = auth.create_access_token(data={"sub": user.get("_id")}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(auth.oauth2_scheme)):
    payload = auth.decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail='Invalid authentication credentials')
    user = await crud.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail='User not found')
    return user

@router.get('/users/me', response_model=UserOut)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get('/todos', response_model=list[TodoOut])
async def get_todos(current_user: dict = Depends(get_current_user)):
    todos = await crud.list_todos(current_user.get("_id"))
    return todos

@router.post('/todos', response_model=TodoOut)
async def post_todo(todo: TodoCreate, current_user: dict = Depends(get_current_user)):
    new = await crud.create_todo(current_user.get("_id"), todo)
    return new

@router.put('/todos/{todo_id}', response_model=TodoOut)
async def put_todo(todo_id: str, update_data: dict, completed: bool = None, current_user: dict = Depends(get_current_user)):
    # Support both old format (completed param) and new format (title/description in body)
    if completed is not None:
        update_data = {"completed": completed}
    updated = await crud.update_todo(current_user.get("_id"), todo_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail='Todo not found')
    return updated

@router.delete('/todos/{todo_id}')
async def delete_todo(todo_id: str, current_user: dict = Depends(get_current_user)):
    deleted = await crud.delete_todo(current_user.get("_id"), todo_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Todo not found')
    return {"message": "Todo deleted successfully"}

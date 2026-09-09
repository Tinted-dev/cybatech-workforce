import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 8  # 8 hours

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is not set in .env")

ALLOW_REGISTRATION = os.getenv("ALLOW_REGISTRATION", "true").lower() == "true"

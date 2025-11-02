from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Hardcoded Database URL ---
# Use "mysql+pymysql://" as the driver
# !! Replace with your actual database credentials !!
DATABASE_URL = "mysql+pymysql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:3306/YOUR_DB_NAME"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


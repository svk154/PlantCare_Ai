# 🚀 Quick Start - Database Setup

## Automated Script

Use the new automated Python script that creates everything for you:

```bash
# Navigate to backend
cd backend

# Install MySQL connector (one-time only)
pip install mysql-connector-python

# Run the automated setup script
python create_database_and_tables.py

# Follow the prompts:
# - MySQL User: root (or your username)
# - MySQL Password: (enter your password)
# - Database Name: plantcare_db (or press Enter for default)
```

**What it does automatically:**
- ✅ Creates database with UTF8MB4 encoding
- ✅ Creates all 17 tables in correct order
- ✅ Sets up all 18 foreign key relationships
- ✅ Adds indexes for performance
- ✅ Verifies everything is working
- ✅ Shows beautiful progress output

---

## After Setup

Once database is created, configure your `.env` file:

```env
# backend/.env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DB=plantcare_db

# Other required settings
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Then start the application:

```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm start
```

---

## 📚 Full Documentation
- **Project Documentation:** `README.md`

---
**Recommendation:** Use the **automated script** for hassle-free setup! 🎉

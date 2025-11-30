# 🚀 Quick Start - Database Setup

## Option 1: Automated Script (Recommended) ⭐

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

## Option 2: Manual Setup (Traditional)

### Step 1: Create Database Manually

```bash
mysql -u root -p -e "CREATE DATABASE plantcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 2: Create Tables Using Flask Migrations

```bash
cd backend
pip install -r requirements.txt
flask db upgrade
```

### Step 3: Verify Setup

```bash
python check_crop_db_status.py
```

---

## Comparison

| Method | Ease | Speed | Verification | Best For |
|--------|------|-------|--------------|----------|
| **Automated Script** | ⭐⭐⭐⭐⭐ | 2 min | Built-in ✅ | First-time setup |
| **Manual Setup** | ⭐⭐⭐ | 5 min | Manual 📝 | Experienced users |

---

## Troubleshooting

### Script Method Issues:

**Problem:** `ModuleNotFoundError: No module named 'mysql.connector'`
```bash
pip install mysql-connector-python
```

**Problem:** `Access denied for user`
- Verify MySQL username and password
- Ensure MySQL server is running

**Problem:** `Database already exists`
- Script will ask if you want to drop and recreate
- Type `yes` to recreate or `no` to use existing

---

### Manual Method Issues:

**Problem:** `Unknown database`
```bash
mysql -u root -p -e "CREATE DATABASE plantcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Problem:** `Table doesn't exist`
```bash
cd backend
flask db upgrade
```

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

- **Automated Script Details:** `backend/DATABASE_SETUP_GUIDE.md`
- **Complete Database Schema:** `DATABASE_README.md`
- **Project Documentation:** `README.md`

---

**Recommendation:** Use the **automated script** for hassle-free setup! 🎉

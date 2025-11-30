# Plant Care Application

A comprehensive plant care management system with AI-powered disease detection, crop recommendations, and farming tools.

## 🚀 Quick Start Guide

### ⚠️ IMPORTANT: Database Setup is MANDATORY!

**READ FIRST:** See Quick Start - Database Setup.md for critical setup instructions.

**You MUST create the database and tables BEFORE running the application!**

### Recommended Setup (Automated Script) ⭐

```bash
# 1. Run automated database setup script (MANDATORY!)
cd backend
pip install mysql-connector-python
python create_database_and_tables.py
# Follow prompts: Enter MySQL username, password, database name

# 2. Configure environment
# Edit backend/.env with database credentials and API keys

# 3. Setup backend
pip install -r requirements.txt
python run.py

# 4. Setup frontend (in new terminal)
cd frontend
npm install
# Configure .env file with API URL
npm start
```

## ⚠️ Prerequisites Checklist

Before starting, ensure you have completed ALL of the following:

### 🔴 MANDATORY (Must Complete First):
- [ ] **MySQL 5.7+** or **MySQL 8.0+** installed and running
- [ ] **Python 3.8+** installed
- [ ] **Ran database setup script:** `python create_database_and_tables.py` ✅ **CRITICAL!**
  - This creates the `plantcare_db` database
  - This creates all 17 required tables

### Required:
- [ ] **Node.js 16+** and npm installed
- [ ] **Gemini API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Configured `backend/.env` with database credentials and API keys
- [ ] Configured `frontend/.env` with API URL

### Optional:
- [ ] **OpenWeather API key** from [OpenWeatherMap](https://openweathermap.org/api) (for weather features)

## Features

### 🌱 Core Features
- **Disease Detection**: AI-powered plant disease identification using computer vision
- **Crop Recommendation**: Data-driven crop suggestions based on soil and weather conditions
- **Fertilizer Calculator**: Precise fertilizer recommendations for optimal crop growth
- **Weather Integration**: Real-time weather data and forecasting
- **Farm Management**: Track crops, farms, and agricultural activities
- **Community Forum**: Connect with other farmers and agricultural experts

### 🤖 AI-Powered Tools
- **Gemini AI Integration**: Advanced plant disease detection and analysis
- **Machine Learning Models**: Crop yield prediction and optimization
- **Smart Recommendations**: Personalized farming advice based on data

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MySQL
- **AI/ML**: Google Gemini API, TensorFlow/Keras models
- **APIs**: OpenWeather API for weather data
- **Authentication**: JWT tokens
- **Database Migration**: Alembic

### Frontend
- **Framework**: React 18
- **Styling**: Modern CSS with responsive design
- **State Management**: React Context API
- **HTTP Client**: Axios for API communication
- **UI Components**: Custom component library

## Prerequisites

Before running this application, make sure you have:

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **MySQL 5.7+** or **MySQL 8.0+** database server running
- **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenWeather API Key** from [OpenWeatherMap](https://openweathermap.org/api) (required for weather features)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd plantCare_update
```

### 2. Database Setup (🔴 CRITICAL - MUST BE COMPLETED FIRST)

**⚠️ MANDATORY PREREQUISITE**: You **MUST** run the database setup Quick Start - Database Setup script before running the application!

#### ⭐ Recommended: Automated Database Setup (2 Minutes)

```bash
cd backend

# Install MySQL connector (one-time only)
pip install mysql-connector-python

# Run automated setup script
python create_database_and_tables.py

# Follow the interactive prompts:
# - MySQL Username: root (or your username)
# - MySQL Password: (enter your password)
# - Database Name: plantcare_db (or press Enter for default)
```

**What this script does:**
- ✅ Creates `plantcare_db` database with UTF8MB4 encoding
- ✅ Creates all 17 required tables in correct order
- ✅ Sets up all 18 foreign key relationships
- ✅ Adds performance indexes
- ✅ Verifies setup automatically
- ✅ Shows real-time progress with color-coded output

### 3. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```bash
# For Windows PowerShell
Copy-Item .env.example .env

# For Linux/Mac
cp .env.example .env
```

Edit the `.env` file with your actual values:
```env
# Database Configuration (REQUIRED)
MYSQL_HOST=localhost
MYSQL_USER=root                    # or 'plantcare_user' if you created dedicated user
MYSQL_PASSWORD=your_database_password
MYSQL_DB=plantcare_db

# Flask Application Settings (REQUIRED)
SECRET_KEY=your_super_secret_key_here_min_32_chars
JWT_SECRET_KEY=your_jwt_secret_key_here_min_32_chars
FLASK_ENV=development

# Gemini API for plant disease detection (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Weather API (optional)
WEATHER_API_KEY=your_openweather_api_key_here
```

#### Start Backend Server
```bash
python run.py
```
The backend will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the `frontend` directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Important**: The OpenWeather API key must be added to the `.env` file. The application will not hardcode API keys for security reasons. Get your free API key from [OpenWeatherMap](https://openweathermap.org/api).

#### Start Frontend Development Server
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## Project Structure

```
plantCare_update/
├── backend/                    # Flask API backend
│   ├── app/                   # Main application package
│   │   ├── models/           # Database models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper utilities
│   │   └── static/           # Static files and ML models
│   ├── migrations/           # Database migrations
│   ├── models/               # Pre-trained ML models
│   └── requirements.txt      # Python dependencies
├── frontend/                  # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   └── package.json         # Node.js dependencies
└── README.md                # Project documentation
```

## Database Information

The PlantCare application uses **MySQL 5.7+** / **MySQL 8.0+** with **17 tables** and comprehensive foreign key relationships.

### Quick Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE plantcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create tables
cd backend
flask db upgrade

# Verify tables
python check_crop_db_status.py
```

### Database Tables Summary

The application includes 17 tables:
- **Core Tables**: users, farms, crops
- **Feature Tables**: disease_scans, forum_posts, calculator_results, monitored_crops, farm_notes
- **ML Tables**: crop_recommendations, crop_yield_predictions
- **Reference Tables**: disease_info, weather_data
- **Transaction Tables**: farm_ledger, calculator_history

### 📖 Complete Database Documentation

For comprehensive database documentation, see **[DATABASE_README.md](DATABASE_README.md)**

This separate database documentation includes:
- ✅ **Complete table schemas** - All 17 tables with column details, data types, constraints
- ✅ **Foreign key relationships** - Detailed relationship diagrams and constraint tables
- ✅ **Table creation order** - Proper sequence to respect dependencies
- ✅ **Setup commands** - Step-by-step MySQL installation and configuration
- ✅ **Verification commands** - SQL queries to verify database setup
- ✅ **Maintenance commands** - Backup, restore, and monitoring
- ✅ **Troubleshooting guide** - Solutions for common database issues
- ✅ **20+ FAQ questions** - Answers to common database questions
- ✅ **Security best practices** - Database security and hardening guidelines

---

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Disease Detection
- `POST /api/disease-detection` - Upload and analyze plant images
- `GET /api/disease-scans` - Get user's scan history

### Crop Management
- `GET /api/crop-predictions` - Get crop recommendations
- `POST /api/monitored-crops` - Add crops to monitor
- `GET /api/farms` - Get user's farms

### Calculators
- `POST /api/calculator/fertilizer` - Calculate fertilizer requirements
- `POST /api/calculator/pesticide` - Calculate pesticide requirements

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
cd backend

# Create a new migration after model changes
flask db migrate -m "Description of changes"

# Apply migration to database
flask db upgrade

# Rollback last migration
flask db downgrade

# View migration history
flask db history
```

### Building for Production
```bash
cd frontend
npm run build
```

## Database Management Commands

### Check Database Status
```bash
cd backend
python check_crop_db_status.py
```

### Create Missing Tables Manually
```bash
cd backend
python create_crop_tables.py
```

### Reset Database (⚠️ CAUTION: Deletes all data)
```sql
-- Login to MySQL
mysql -u root -p

-- Drop and recreate database
DROP DATABASE IF EXISTS plantcare_db;
CREATE DATABASE plantcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Exit and run migrations again
EXIT;
```

Then run:
```bash
cd backend
flask db upgrade
```

### Backup Database
```bash
# Windows PowerShell
mysqldump -u root -p plantcare_db > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql

# Linux/Mac
mysqldump -u root -p plantcare_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
mysql -u root -p plantcare_db < backup_file.sql
```

## Troubleshooting

### Database Connection Issues

**Problem**: `Can't connect to MySQL server`
```bash
# Check if MySQL is running
# Windows
net start | findstr MySQL

# Linux/Mac
sudo systemctl status mysql
```

**Solution**: Start MySQL service
```bash
# Windows
net start MySQL80  # or your MySQL service name

# Linux/Mac
sudo systemctl start mysql
```

### Missing Environment Variables

**Problem**: `ValueError: No SECRET_KEY set in environment variables`

**Solution**: Ensure `.env` file exists and contains all required variables
```bash
cd backend

# Check if .env file exists
ls .env  # Linux/Mac
dir .env  # Windows

# If missing, copy from example
cp .env.example .env  # Linux/Mac
Copy-Item .env.example .env  # Windows PowerShell

# Edit and add required values
```

### Port Already in Use

**Problem**: `Address already in use: Port 5000`

**Solution**: 
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac - Find and kill process
lsof -ti:5000 | xargs kill -9
```

### Python Package Issues

**Problem**: Module not found errors

**Solution**:
```bash
cd backend

# Reinstall all dependencies
pip install --upgrade pip
pip install -r requirements.txt

# If still issues, use virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### React Build Errors

**Problem**: `npm install` fails or dependency conflicts

**Solution**:
```bash
cd frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json  # Linux/Mac
Remove-Item -Recurse -Force node_modules, package-lock.json  # Windows PowerShell

npm cache clean --force
npm install
```

## Environment Variables

### Backend Environment Variables
- `MYSQL_HOST` - Database host
- `MYSQL_USER` - Database username  
- `MYSQL_PASSWORD` - Database password
- `MYSQL_DB` - Database name
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `GEMINI_API_KEY` - Google Gemini API key
- `WEATHER_API_KEY` - OpenWeather API key

### Frontend Environment Variables
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)
- `REACT_APP_OPENWEATHER_API_KEY` - **Required** OpenWeather API key for weather features and forecasts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Notes

- Never commit `.env` files containing real API keys
- Use environment variables for all sensitive configuration
- The `.env.example` files show the required variables without exposing secrets
- API keys should be kept secure and rotated regularly
- **Recent Update**: All API keys (including OpenWeather API) have been moved from hardcoded values to environment variables for enhanced security
- Make sure to add `.env` to your `.gitignore` file to prevent accidental commits
- Use strong, unique passwords for database users (minimum 16 characters recommended)
- In production, always set `FLASK_ENV=production` and enable HTTPS
- Change default `SECRET_KEY` and `JWT_SECRET_KEY` to random 32+ character strings

### Generating Secure Keys

```bash
# Python method
python -c "import secrets; print(secrets.token_hex(32))"

# OpenSSL method
openssl rand -hex 32
```

## Database Security Best Practices

1. **Use Dedicated Database User**: Don't use root for application access
2. **Limit Privileges**: Grant only necessary permissions
3. **Regular Backups**: Implement automated backup strategy
4. **Connection Encryption**: Use SSL/TLS for database connections in production
5. **Parameter Validation**: All user inputs are validated before database queries
6. **Prepared Statements**: SQLAlchemy ORM uses parameterized queries to prevent SQL injection

## Common Database Issues & Solutions

### Issue: Tables Not Created
**Symptom**: Application starts but queries fail with "table doesn't exist"

**Solution**:
```bash
cd backend
flask db upgrade
# OR
python create_crop_tables.py
```

### Issue: Foreign Key Violations
**Symptom**: Error when creating records related to other tables

**Solution**: Verify the referenced record exists
```python
# Check if user exists before creating farm
user = User.query.get(user_id)
if not user:
    # Create user first or use existing user_id
```

### Issue: Migration Conflicts
**Symptom**: Migration fails with "table already exists"

**Solution**:
```bash
cd backend
flask db stamp head  # Mark current state
rm -rf migrations/versions/*  # Remove old migrations
flask db migrate -m "Fresh migration"
flask db upgrade
```

## Frequently Asked Questions (FAQ)

### Database Setup Questions

**Q1: Do I need to create the database ?**
> **A:** Yes! Creating the database is a mandatory prerequisite. The python code file create the database automatically. You must run:
> ```The automated database py script code
> ```

**Q2: What happens if I skip the database setup?**
> **A:** The application will fail to start with database connection errors. All features require a properly configured database with tables.

**Q3: Can I use a different database name?**
> **A:** Yes, but you must update the `MYSQL_DB` variable in your `.env` file to match your chosen database name.

**Q4: Do all tables have foreign keys?**
> **A:** No. The following tables have NO foreign keys and can be created independently:
> - `users` (core table)
> - `disease_info` (reference data)
> - `weather_data` (cache table)

**Q5: What tables depend on the users table?**
> **A:** 13 tables have foreign keys to `users`: farms, disease_detections, disease_scans, forum_posts, forum_replies, forum_votes, farm_ledger, monitored_crops, calculator_results, calculator_history, crop_recommendations, crop_yield_predictions, and farm_notes.

**Q6: Can I delete a user without breaking the database?**
> **A:** Deleting a user will affect all related records. Some tables use CASCADE delete (automatically delete related records), others may prevent deletion. It's recommended to implement a "soft delete" or archive feature instead.

**Q7: Why do some foreign keys allow NULL values?**
> **A:** Optional foreign keys (like `farm_id` in `monitored_crops`) allow records to exist independently. For example, a crop can be monitored without being linked to a specific farm.

**Q8: How do I reset the database completely?**
> **A:** 
> ```sql
> DROP DATABASE IF EXISTS plantcare_db;
> CREATE DATABASE plantcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```
> Then run `flask db upgrade` again. ⚠️ **WARNING**: This deletes ALL data!

### Technical Questions

**Q1: What MySQL version is required?**
> **A:** MySQL 5.7 or higher. MySQL 8.0 is recommended for better performance and JSON support.

**Q2: Can I use MariaDB instead of MySQL?**
> **A:** Yes, MariaDB 10.2+ is compatible. Update your connection string if needed.

**Q3: Why UTF8MB4 character set?**
> **A:** UTF8MB4 supports full Unicode including emojis and special characters. It's essential for international character support.

**Q4: How are passwords stored?**
> **A:** Passwords are hashed using Werkzeug's security functions (bcrypt-based) and stored in the `password_hash` column. Plain passwords are never stored.

**Q5: What happens if I change the database schema?**
> **A:** You must create a new migration:
> ```bash
> flask db migrate -m "Description of changes"
> flask db upgrade
> ```

### Common Setup Issues

**Q1: "Access denied for user" error?**
> **A:** Check your `.env` file:
> - Verify `MYSQL_USER` and `MYSQL_PASSWORD` are correct
> - Ensure the user has proper privileges on `plantcare_db`
> - Test connection: `mysql -u your_user -p plantcare_db`

**Q2: "Unknown database" error?**
> **A:** The database doesn't exist. Create it first:
> ```bash
> mysql -u root -p -e "CREATE DATABASE plantcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
> ```

**Q3: Tables created but queries fail?**
> **A:** Check if foreign key constraints are properly set up:
> ```sql
> SHOW CREATE TABLE table_name;
> ```

**Q4: How do I verify foreign key relationships?**
> **A:** Use this query:
> ```sql
> SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
> FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
> WHERE REFERENCED_TABLE_SCHEMA = 'plantcare_db' AND REFERENCED_TABLE_NAME IS NOT NULL;
> ```

**Q5: Can I use this with Docker?**
> **A:** Yes! Create a `docker-compose.yml` with MySQL service and update `MYSQL_HOST` to the service name. Full Docker setup instructions can be added if needed.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This application uses MySQL as the database. Make sure you have MySQL installed and running before starting the backend server.

### 📝 Important Reminders

1. ✅ **Database creation is MANDATORY** - The app cannot function without it
2. ✅ **All 17 tables must be created** - Use `flask db upgrade` or the provided scripts
3. ✅ **Foreign keys link tables together** - Respect the creation order
4. ✅ **Verify setup with** `check_crop_db_status.py` before running the app
5. ✅ **Keep backups** - Regular database backups prevent data loss
6. ✅ **Secure your credentials** - Never commit `.env` files to version control

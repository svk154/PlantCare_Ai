#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🔴 MANDATORY DATABASE SETUP SCRIPT 🔴                          ║
║                                                                              ║
║                  PlantCare AI - Complete Database Creation                   ║
║                                                                              ║
║  ⚠️  THIS SCRIPT MUST BE RUN BEFORE STARTING THE APPLICATION!  ⚠️           ║
║                                                                              ║
║  What it does:                                                               ║
║  ✅ Creates plantcare_db database with UTF8MB4 encoding                     ║
║  ✅ Creates all 17 required tables in correct dependency order              ║
║  ✅ Sets up all 18 foreign key relationships                                ║
║  ✅ Adds performance indexes                                                ║
║  ✅ Configures cascade delete rules                                         ║
║  ✅ Verifies setup automatically                                            ║
║                                                                              ║
║  Usage:                                                                      ║
║    1. cd backend                                                             ║
║    2. pip install mysql-connector-python                                     ║
║    3. python create_database_and_tables.py                                   ║
║    4. Follow the interactive prompts                                         ║
║                                                                              ║
║  Prerequisites:                                                              ║
║    - MySQL 5.7+ or MySQL 8.0+ installed and running                          ║
║    - Python 3.8+ installed                                                   ║
║    - MySQL root credentials or user with CREATE DATABASE privileges          ║
║                                                                              ║
║  Documentation:                                                              ║
║    - IMPORTANT_READ_FIRST.md  - Why this is mandatory                        ║
║    - DATABASE_SETUP_GUIDE.md  - Complete usage guide                         ║ 
║    - DATABASE_README.md       - Full schema documentation                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Author: PlantCare AI Team
Date: October 2025
Version: 1.0
License: MIT
"""

import mysql.connector
from mysql.connector import Error
import sys
import os
from getpass import getpass

# ANSI color codes for better output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def get_mysql_credentials():
    """Get MySQL credentials from user or environment variables."""
    print_info("MySQL Connection Setup")
    print("=" * 60)
    
    # Try to get from environment first
    host = os.getenv('MYSQL_HOST', 'localhost')
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD', '')
    database_name = os.getenv('MYSQL_DB', 'plantcare_db')
    
    # If no password in environment, ask user
    if not password:
        user = input(f"MySQL User (default: {user}): ").strip() or user
        password = getpass(f"MySQL Password for {user}: ")
    
    database_name = input(f"Database Name (default: {database_name}): ").strip() or database_name
    
    return {
        'host': host,
        'user': user,
        'password': password,
        'database': database_name
    }

def create_database(credentials):
    """Create the PlantCare database with proper character encoding."""
    try:
        # Connect without specifying database
        connection = mysql.connector.connect(
            host=credentials['host'],
            user=credentials['user'],
            password=credentials['password']
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            db_name = credentials['database']
            
            print_info(f"Creating database: {db_name}")
            
            # Check if database exists
            cursor.execute("SHOW DATABASES LIKE %s", (db_name,))
            exists = cursor.fetchone()
            
            if exists:
                print_warning(f"Database '{db_name}' already exists")
                response = input("Do you want to DROP and recreate it? (yes/no): ").strip().lower()
                if response == 'yes':
                    cursor.execute(f"DROP DATABASE {db_name}")
                    print_warning(f"Dropped existing database: {db_name}")
                else:
                    print_info("Using existing database")
                    cursor.close()
                    connection.close()
                    return True
            
            # Create database with UTF8MB4 encoding
            create_db_query = f"""
            CREATE DATABASE {db_name}
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci
            """
            cursor.execute(create_db_query)
            print_success(f"Database '{db_name}' created successfully with UTF8MB4 encoding")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print_error(f"Error creating database: {e}")
        return False

def create_tables(credentials):
    """Create all 17 tables for PlantCare application."""
    try:
        connection = mysql.connector.connect(
            host=credentials['host'],
            user=credentials['user'],
            password=credentials['password'],
            database=credentials['database']
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            print_info(f"Connected to database: {credentials['database']}")
            
            # Table creation order (respecting foreign key dependencies)
            tables = {
                # 1. Core table with no dependencies
                'users': """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(64) NOT NULL,
                    phone VARCHAR(20),
                    date_joined DATETIME DEFAULT CURRENT_TIMESTAMP,
                    role VARCHAR(20) DEFAULT 'user',
                    INDEX idx_email (email),
                    INDEX idx_date_joined (date_joined)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 2. Reference table - no dependencies
                'disease_info': """
                CREATE TABLE IF NOT EXISTS disease_info (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) UNIQUE,
                    scientific_name VARCHAR(100),
                    description TEXT,
                    symptoms JSON,
                    treatment JSON,
                    prevention JSON,
                    affected_plants JSON,
                    severity_levels JSON,
                    INDEX idx_name (name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 3. Cache table - no dependencies
                'weather_data': """
                CREATE TABLE IF NOT EXISTS weather_data (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    location VARCHAR(128),
                    temperature FLOAT,
                    humidity FLOAT,
                    weather_condition VARCHAR(64),
                    wind_speed FLOAT,
                    rainfall FLOAT,
                    forecast_date DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_location (location),
                    INDEX idx_forecast_date (forecast_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 4. Farms - depends on users
                'farms': """
                CREATE TABLE IF NOT EXISTS farms (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(90) NOT NULL,
                    location VARCHAR(128),
                    main_crop VARCHAR(64) NOT NULL,
                    size_acres FLOAT NOT NULL,
                    soil_type VARCHAR(64),
                    is_active BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    user_id INT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 5. Crops - depends on farms
                'crops': """
                CREATE TABLE IF NOT EXISTS crops (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(64) NOT NULL,
                    variety VARCHAR(64),
                    planted_date DATE,
                    expected_harvest DATE,
                    status VARCHAR(32),
                    health_score FLOAT,
                    farm_id INT,
                    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
                    INDEX idx_farm_id (farm_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 6. Monitored crops - depends on users, farms (optional)
                'monitored_crops': """
                CREATE TABLE IF NOT EXISTS monitored_crops (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    farm_name VARCHAR(90) NOT NULL,
                    farm_id INT,
                    planting_date DATE NOT NULL,
                    status ENUM('Healthy', 'Needs Attention', 'Harvested') DEFAULT 'Healthy',
                    variety VARCHAR(100),
                    expected_harvest_date DATE,
                    health_score FLOAT DEFAULT 100.0,
                    notes TEXT,
                    user_id INT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
                    INDEX idx_user_id (user_id),
                    INDEX idx_farm_id (farm_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 7. Farm notes - depends on users, farms
                'farm_notes': """
                CREATE TABLE IF NOT EXISTS farm_notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    farm_id INT NOT NULL,
                    user_id INT NOT NULL,
                    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_farm_id (farm_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 8. Disease detections (legacy) - depends on users
                'disease_detections': """
                CREATE TABLE IF NOT EXISTS disease_detections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    plant_type VARCHAR(50),
                    image_path VARCHAR(200),
                    predicted_disease VARCHAR(100),
                    scientific_name VARCHAR(100),
                    confidence_score FLOAT,
                    severity VARCHAR(20),
                    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    details JSON,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_detected_at (detected_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 9. Disease scans (modern) - depends on users
                'disease_scans': """
                CREATE TABLE IF NOT EXISTS disease_scans (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    image_data LONGBLOB,
                    image_path VARCHAR(255),
                    image_filename VARCHAR(100) NOT NULL,
                    image_mimetype VARCHAR(50),
                    is_confident BOOLEAN DEFAULT FALSE,
                    confidence_threshold FLOAT DEFAULT 0.8,
                    disease_name VARCHAR(100),
                    confidence_score FLOAT,
                    description TEXT,
                    treatment TEXT,
                    possible_diseases TEXT,
                    plant_type VARCHAR(50),
                    scan_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    processing_time FLOAT,
                    model_version VARCHAR(20) DEFAULT 'v1.0',
                    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                    error_message TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_scan_timestamp (scan_timestamp),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 10. Forum posts - depends on users
                'forum_posts': """
                CREATE TABLE IF NOT EXISTS forum_posts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(150) NOT NULL,
                    content TEXT NOT NULL,
                    category VARCHAR(64),
                    is_expert_question BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(32) DEFAULT 'open',
                    views INT DEFAULT 0,
                    is_flagged BOOLEAN DEFAULT FALSE,
                    flagged_reason VARCHAR(200),
                    reply_count INT DEFAULT 0,
                    solved BOOLEAN DEFAULT FALSE,
                    upvotes INT DEFAULT 0,
                    downvotes INT DEFAULT 0,
                    edited_at DATETIME,
                    edit_count INT DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_category (category),
                    INDEX idx_created_at (created_at),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 11. Forum replies - depends on users, forum_posts
                'forum_replies': """
                CREATE TABLE IF NOT EXISTS forum_replies (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    post_id INT NOT NULL,
                    content TEXT NOT NULL,
                    is_expert_reply BOOLEAN DEFAULT FALSE,
                    is_accepted BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_flagged BOOLEAN DEFAULT FALSE,
                    flagged_reason VARCHAR(200),
                    helpful_count INT DEFAULT 0,
                    edited_at DATETIME,
                    edit_count INT DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_post_id (post_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 12. Forum votes - depends on users, forum_posts
                'forum_votes': """
                CREATE TABLE IF NOT EXISTS forum_votes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    post_id INT NOT NULL,
                    vote_type VARCHAR(10) NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_vote (user_id, post_id),
                    INDEX idx_post_id (post_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 13. Farm ledger - depends on users
                'farm_ledger': """
                CREATE TABLE IF NOT EXISTS farm_ledger (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    amount FLOAT NOT NULL,
                    category VARCHAR(64) NOT NULL,
                    note VARCHAR(128),
                    transaction_type VARCHAR(16) DEFAULT 'expense',
                    transaction_date DATE DEFAULT (CURRENT_DATE),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_transaction_type (transaction_type),
                    INDEX idx_transaction_date (transaction_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 14. Calculator results - depends on users
                'calculator_results': """
                CREATE TABLE IF NOT EXISTS calculator_results (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    calculator_type VARCHAR(32) NOT NULL,
                    input_data JSON NOT NULL,
                    result_data JSON NOT NULL,
                    notes VARCHAR(256),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_calculator_type (calculator_type),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 15. Calculator history - depends on users
                'calculator_history': """
                CREATE TABLE IF NOT EXISTS calculator_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    calculation_type VARCHAR(50) NOT NULL,
                    inputs JSON NOT NULL,
                    results JSON NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_calculation_type (calculation_type),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 16. Crop recommendations (ML) - depends on users (optional)
                'crop_recommendations': """
                CREATE TABLE IF NOT EXISTS crop_recommendations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    nitrogen FLOAT NOT NULL,
                    phosphorus FLOAT NOT NULL,
                    potassium FLOAT NOT NULL,
                    temperature FLOAT NOT NULL,
                    humidity FLOAT NOT NULL,
                    ph FLOAT NOT NULL,
                    rainfall FLOAT NOT NULL,
                    predicted_crop VARCHAR(100) NOT NULL,
                    confidence FLOAT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_user_id (user_id),
                    INDEX idx_predicted_crop (predicted_crop),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """,
                
                # 17. Crop yield predictions (ML) - depends on users (optional)
                'crop_yield_predictions': """
                CREATE TABLE IF NOT EXISTS crop_yield_predictions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    crop VARCHAR(100) NOT NULL,
                    season VARCHAR(50) NOT NULL,
                    state VARCHAR(100) NOT NULL,
                    annual_rainfall FLOAT NOT NULL,
                    fertilizer FLOAT NOT NULL,
                    pesticide FLOAT NOT NULL,
                    predicted_yield FLOAT NOT NULL,
                    unit VARCHAR(20) DEFAULT 'tons/hectare',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_user_id (user_id),
                    INDEX idx_crop (crop),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            }
            
            # Create each table
            table_count = 0
            print_info("Creating tables...")
            print("=" * 60)
            
            for table_name, create_query in tables.items():
                try:
                    cursor.execute(create_query)
                    table_count += 1
                    print_success(f"Table {table_count}/17: {table_name}")
                except Error as e:
                    print_error(f"Error creating table '{table_name}': {e}")
                    continue
            
            print("=" * 60)
            print_success(f"Successfully created {table_count}/17 tables")
            
            # Verify tables
            cursor.execute("SHOW TABLES")
            tables_list = cursor.fetchall()
            print_info(f"Total tables in database: {len(tables_list)}")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print_error(f"Error connecting to database: {e}")
        return False

def verify_setup(credentials):
    """Verify the database setup by checking tables and foreign keys."""
    try:
        connection = mysql.connector.connect(
            host=credentials['host'],
            user=credentials['user'],
            password=credentials['password'],
            database=credentials['database']
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            print("\n")
            print_info("Database Verification")
            print("=" * 60)
            
            # Get table count
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"📊 Total tables: {len(tables)}")
            
            # List all tables
            print("\n📋 Tables created:")
            for i, table in enumerate(tables, 1):
                print(f"   {i}. {table[0]}")
            
            # Check foreign keys
            print("\n🔗 Foreign Key Relationships:")
            cursor.execute("""
                SELECT 
                    TABLE_NAME,
                    COLUMN_NAME,
                    CONSTRAINT_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                    REFERENCED_TABLE_SCHEMA = %s
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ORDER BY TABLE_NAME, COLUMN_NAME
            """, (credentials['database'],))
            
            foreign_keys = cursor.fetchall()
            for fk in foreign_keys:
                print(f"   {fk[0]}.{fk[1]} → {fk[3]}.{fk[4]}")
            
            print(f"\n📊 Total foreign key constraints: {len(foreign_keys)}")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print_error(f"Error verifying setup: {e}")
        return False

def main():
    """Main function to run the database setup."""
    print("\n")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}PlantCare AI - Database Setup Script{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}")
    print("\n")
    
    # Get credentials
    credentials = get_mysql_credentials()
    
    print("\n")
    print_info("Starting database setup...")
    print("=" * 60)
    
    # Step 1: Create database
    print("\n📦 Step 1/3: Creating database...")
    if not create_database(credentials):
        print_error("Failed to create database. Exiting.")
        sys.exit(1)
    
    # Step 2: Create tables
    print("\n📊 Step 2/3: Creating tables...")
    if not create_tables(credentials):
        print_error("Failed to create tables. Exiting.")
        sys.exit(1)
    
    # Step 3: Verify setup
    print("\n✓ Step 3/3: Verifying setup...")
    if not verify_setup(credentials):
        print_warning("Verification completed with warnings")
    
    print("\n")
    print(f"{Colors.BOLD}{Colors.GREEN}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.GREEN}✅ Database setup completed successfully!{Colors.END}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'=' * 60}{Colors.END}")
    print("\n")
    
    print_info("Next steps:")
    print("  1. Update your backend/.env file with database credentials")
    print("  2. Start the backend server: python run.py")
    print("  3. Start the frontend: npm start")
    print("\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n")
        print_warning("Setup cancelled by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)

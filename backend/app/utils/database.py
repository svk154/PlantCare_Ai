from app import db

def create_tables():
    db.create_all()

def drop_tables():
    db.drop_all()

def init_db():
    create_tables()
    # Insert sample data if needed

def reset_db():
    drop_tables()
    create_tables()

def get_db_info():
    # Return record counts for key tables (users, farms, etc.)
    from app.models.user import User
    from app.models.farm import Farm
    from app.models.disease import DiseaseInfo
    from app.models.transaction import Transaction
    return {
        "users": User.query.count(),
        "farms": Farm.query.count(),
        "diseases": DiseaseInfo.query.count(),
        "transactions": Transaction.query.count()
    }

def check_db_connection():
    try:
        db.session.execute("SELECT 1")
        return True, "DB OK"
    except Exception as e:
        return False, str(e)

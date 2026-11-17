from backend.auth.security import get_password_hash
from backend.database.base import Base
from backend.database.session import SessionLocal, engine
from backend.models import MunicipalDepartment, Role, User


DEPARTMENTS = [
    ("Sanitation Command", "North Market / East Yard", "sanitation.ops@city.gov", 12),
    ("Roads & Public Works", "Transit Spine", "roads.ops@city.gov", 8),
    ("Water Utility Cell", "Utility Grid East", "water.ops@city.gov", 6),
    ("Electrical Maintenance", "Civic Center", "electrical.ops@city.gov", 18),
    ("Drainage Response Unit", "Canal Belt", "drainage.ops@city.gov", 4),
]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@civic.ai").first()
        if admin is None:
            db.add(
                User(
                    email="admin@civic.ai",
                    full_name="CivicAI Admin",
                    hashed_password=get_password_hash("admin123"),
                    role=Role.admin,
                    is_active=True,
                )
            )

        for name, jurisdiction, email, sla_hours in DEPARTMENTS:
            exists = db.query(MunicipalDepartment).filter(MunicipalDepartment.name == name).first()
            if exists is None:
                db.add(
                    MunicipalDepartment(
                        name=name,
                        jurisdiction=jurisdiction,
                        escalation_email=email,
                        sla_hours=sla_hours,
                    )
                )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized")

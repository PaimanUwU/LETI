from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String, Boolean, DateTime, Date, Time
from sqlalchemy.sql import func
from ..utils.database import Base

# Government-defined crime categories and types (from PDRM crime_district.csv)
VALID_CATEGORIES = ("assault", "property")
VALID_CRIME_TYPES = (
    "break_in",
    "causing_injury",
    "murder",
    "rape",
    "robbery_gang_armed",
    "robbery_gang_unarmed",
    "robbery_solo_armed",
    "robbery_solo_unarmed",
    "theft_other",
    "theft_vehicle_lorry",
    "theft_vehicle_motorcar",
    "theft_vehicle_motorcycle",
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    role = Column(String, default="user")  # "user" | "law_enforcer" | "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        CheckConstraint(
            "type IN ('break_in','causing_injury','murder','rape',"
            "'robbery_gang_armed','robbery_gang_unarmed','robbery_solo_armed',"
            "'robbery_solo_unarmed','theft_other','theft_vehicle_lorry',"
            "'theft_vehicle_motorcar','theft_vehicle_motorcycle')",
            name="ck_reports_gov_crime_type",
        ),
        CheckConstraint(
            "category IN ('assault','property')",
            name="ck_reports_gov_category",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, index=True)
    phone_number = Column(String, index=True)
    ic_number = Column(String, index=True)
    category = Column(String, default="property")  # "assault" | "property"
    type = Column(String)  # constrained to VALID_CRIME_TYPES
    title = Column(String)
    incident_date = Column(Date, nullable=True)
    incident_time = Column(Time, nullable=True)
    description = Column(String)
    location = Column(String)
    approval_status = Column(String, default="pending")  # "pending" | "approved" | "rejected"
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)  # FK to cases
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Case(Base):
    """An investigation case that bundles related approved reports."""
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Untitled Case")
    description = Column(String, default="")
    assigned_to = Column(Integer, nullable=True)                    # FK to users.id (enforcer)
    notes = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CrimeRecords(Base):
    __tablename__ = "crime_records"

    id = Column(Integer, primary_key=True, index=True)

    state = Column(String, index=True)
    district = Column(String, index=True)

    category = Column(String, index=True)
    crime_type = Column(String, index=True)

    date = Column(Date, index=True)
    crimes = Column(Integer)

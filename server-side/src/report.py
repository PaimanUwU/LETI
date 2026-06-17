import hashlib
import hmac
import os

from sqlalchemy.orm import Session

from .models import Report, User
from .schemas import UserCreate, ReportCreate

# ═══════════════════════════════════════════════════════════
# Report CRUD
# ═══════════════════════════════════════════════════════════

def create_report(db: Session, report: ReportCreate) -> Report:
    db_report = Report(
        name=report.name,
        phone_number=report.phone_number,
        type=report.type,
        title=report.title,
        description=report.description,
        location=report.location,
        approval_status="pending"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_reports(db: Session) -> list[Report]:
    return db.query(Report).all()


def get_report_by_id(db: Session, report_id: int) -> Report | None:
    return db.query(Report).filter(Report.id == report_id).first()


def update_report(db: Session, report_id: int, updates: dict) -> Report | None:
    """
    Update a report with the given field values.
    Only non-None keys in `updates` are applied.
    Returns the updated report or None if not found.
    """
    db_report = get_report_by_id(db, report_id)
    if db_report is None:
        return None

    for field, value in updates.items():
        if value is not None:
            setattr(db_report, field, value)

    db.commit()
    db.refresh(db_report)
    return db_report


from sqlalchemy.orm import Session

from ..models.models import Report
from ..models.schemas import ReportCreate

# ═══════════════════════════════════════════════════════════
# Report CRUD
# ═══════════════════════════════════════════════════════════

def create_report(db: Session, report: ReportCreate) -> Report:
    db_report = Report(
        name=report.name,
        email=report.email,
        phone_number=report.phone_number,
        ic_number=report.ic_number,
        category=report.category,
        type=report.type,
        title=report.title,
        incident_date=report.incident_date,
        incident_time=report.incident_time,
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


def get_reports_by_email(db: Session, email: str) -> list[Report]:
    """Return all reports matching an email (case-insensitive partial match)."""
    return db.query(Report).filter(Report.email.ilike(f"%{email}%")).all()


def get_reports_by_phone(db: Session, phone: str) -> list[Report]:
    """Return all reports matching a phone number (partial match)."""
    return db.query(Report).filter(Report.phone_number.contains(phone)).all()


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


def update_report_status(db: Session, report_id: int, status: str) -> Report | None:
    """Set the approval_status of a report. Returns the updated report or None."""
    db_report = get_report_by_id(db, report_id)
    if db_report is None:
        return None
    db_report.approval_status = status
    db.commit()
    db.refresh(db_report)
    return db_report


def delete_report(db: Session, report_id: int) -> bool:
    """Delete a report by ID. Returns True if deleted, False if not found."""
    db_report = get_report_by_id(db, report_id)
    if db_report is None:
        return False
    db.delete(db_report)
    db.commit()
    return True


def get_reports_by_status(db: Session, status: str) -> list[Report]:
    """Return all reports with a given approval_status."""
    return db.query(Report).filter(Report.approval_status == status).all()


def get_report_stats(db: Session) -> dict:
    """Return report counts grouped by approval_status."""
    total = db.query(Report).count()
    pending = db.query(Report).filter(Report.approval_status == "pending").count()
    approved = db.query(Report).filter(Report.approval_status == "approved").count()
    rejected = db.query(Report).filter(Report.approval_status == "rejected").count()
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
    }


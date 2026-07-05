from sqlalchemy.orm import Session

from ..models.models import Case, Report


def create_case(db: Session, title: str, description: str = "") -> Case:
    c = Case(title=title or "Untitled Case", description=description)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def get_cases(db: Session) -> list[dict]:
    """Return cases with report count."""
    cases = db.query(Case).all()
    result = []
    for c in cases:
        count = db.query(Report).filter(Report.case_id == c.id).count()
        result.append({
            "id": c.id, "title": c.title, "description": c.description,
            "assigned_to": c.assigned_to, "notes": c.notes,
            "report_count": count, "created_at": c.created_at,
        })
    return result


def get_case_by_id(db: Session, case_id: int) -> dict | None:
    c = db.query(Case).filter(Case.id == case_id).first()
    if not c:
        return None
    reports = db.query(Report).filter(Report.case_id == case_id).all()
    return {
        "id": c.id, "title": c.title, "description": c.description,
        "assigned_to": c.assigned_to, "notes": c.notes,
        "report_count": len(reports), "created_at": c.created_at,
        "reports": [{"id": r.id, "name": r.name, "title": r.title, "type": r.type,
                      "location": r.location, "created_at": str(r.created_at)} for r in reports],
    }


def get_case_stats(db: Session) -> dict:
    total = db.query(Case).count()
    # Count cases with no linked reports (just created) vs cases with reports
    case_ids_with_reports = db.query(Report.case_id).filter(Report.case_id.isnot(None)).distinct().subquery()
    active = db.query(Case).filter(Case.id.in_(case_ids_with_reports)).count()
    empty = total - active
    return {"total": total, "active": active, "empty": empty}


def link_report_to_case(db: Session, report_id: int, case_id: int) -> bool:
    """Assign a report to a case."""
    from . import report as report_service
    r = report_service.get_report_by_id(db, report_id)
    if not r:
        return False
    r.case_id = case_id
    db.commit()
    return True


def unlink_report(db: Session, report_id: int):
    """Remove a report from its case."""
    from . import report as report_service
    r = report_service.get_report_by_id(db, report_id)
    if not r:
        return
    r.case_id = None
    db.commit()

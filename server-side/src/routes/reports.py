"""
Report routes — create, read, update.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..services import report as report_service, case as case_service
from ..services.auth import get_current_user, require_admin_or_law_enforcer
from ..utils.database import get_db
from ..models.models import User
from ..models.schemas import ReportCreate, ReportResponse, ReportUpdate

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/submit", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Create a new crime report.  Any authenticated user can do this."""
    new_report = report_service.create_report(db, report)
    # If created as approved, auto-create a case
    if report.approval_status == "approved":
        c = case_service.create_case(db, report.title, report.description or "")
        case_service.link_report_to_case(db, new_report.id, c.id)
    return new_report


@router.get("", response_model=list[ReportResponse])
async def read_reports(
    email: Optional[str] = Query(None, description="Filter reports by email (case-insensitive partial match)"),
    phone: Optional[str] = Query(None, description="Filter reports by phone number (partial match)"),
    status: Optional[str] = Query(None, description="Filter by approval status (pending, approved, rejected)"),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """
    List all reports.  Any authenticated user can do this.

    - **email** — filter by email
    - **phone**  — filter by phone number
    - **status** — filter by approval_status

    If no filter is provided, returns all reports.
    """
    if email:
        return report_service.get_reports_by_email(db, email)
    if phone:
        return report_service.get_reports_by_phone(db, phone)
    if status:
        return report_service.get_reports_by_status(db, status)
    return report_service.get_reports(db)


@router.get("/stats")
async def get_report_stats(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Return report counts grouped by approval status."""
    return report_service.get_report_stats(db)


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    updates: ReportUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin_or_law_enforcer),
):
    """
    Update an existing report (partial update).
    Only admins and law enforcers can do this.
    """
    updated = report_service.update_report(db, report_id, updates.model_dump(exclude_unset=True))

    if updated is None:
        raise HTTPException(status_code=404, detail="Report not found")

    return updated


@router.patch("/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: int,
    body: dict,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin_or_law_enforcer),
):
    """
    Approve or reject a report.
    Body: { "approval_status": "approved" | "rejected", "case_id": <int|null> }

    When approved with a case_id, links the report to that case.
    When approved without one, creates a new case automatically.
    When reset to pending or rejected, unlinks from any case.
    """
    new_status = body.get("approval_status")
    if new_status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="approval_status must be 'approved', 'rejected', or 'pending'")

    updated = report_service.update_report_status(db, report_id, new_status)
    if updated is None:
        raise HTTPException(status_code=404, detail="Report not found")

    if new_status == "approved":
        case_id = body.get("case_id")
        if case_id:
            case_service.link_report_to_case(db, report_id, int(case_id))
        else:
            # Auto-create a new case using the report title
            c = case_service.create_case(db, updated.title, updated.description)
            case_service.link_report_to_case(db, report_id, c.id)
    else:
        case_service.unlink_report(db, report_id)

    return updated


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin_or_law_enforcer),
):
    """Delete a report. Only admins and law enforcers can do this."""
    deleted = report_service.delete_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")
    return None

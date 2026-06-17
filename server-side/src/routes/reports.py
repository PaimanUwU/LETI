"""
Report routes — create, read, update.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, require_admin_or_law_enforcer
from ..database import get_db
from ..models import User
from ..schemas import ReportCreate, ReportResponse, ReportUpdate

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Create a new crime report.  Any authenticated user can do this."""
    return crud.create_report(db, report)


@router.get("", response_model=list[ReportResponse])
async def read_reports(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """List all reports.  Any authenticated user can do this."""
    return crud.get_reports(db)


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
    updated = crud.update_report(db, report_id, updates.model_dump(exclude_unset=True))

    if updated is None:
        raise HTTPException(status_code=404, detail="Report not found")

    return updated

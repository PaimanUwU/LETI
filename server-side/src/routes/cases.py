"""Case routes — investigation files that bundle approved reports."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..services import case as case_service
from ..services.auth import get_current_user, require_admin_or_law_enforcer
from ..utils.database import get_db
from ..models.models import User
from ..models.schemas import CaseCreate, CaseResponse

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.get("", response_model=list[CaseResponse])
async def list_cases(db: Session = Depends(get_db)):
    """List all cases with report counts. Public read-only."""
    return case_service.get_cases(db)


@router.get("/stats")
async def case_stats(db: Session = Depends(get_db)):
    """Returns {total, active, empty} case counts. Public read-only."""
    return case_service.get_case_stats(db)


@router.get("/{case_id}")
async def get_case(case_id: int, db: Session = Depends(get_db)):
    """Get a case with its linked reports."""
    c = case_service.get_case_by_id(db, case_id)
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
    return c


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    body: CaseCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin_or_law_enforcer),
):
    """Create a new investigation case."""
    c = case_service.create_case(db, body.title, body.description or "")
    return case_service.get_case_by_id(db, c.id)


@router.post("/{case_id}/link/{report_id}")
async def link_report(
    case_id: int, report_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin_or_law_enforcer),
):
    """Link a report to an existing case."""
    ok = case_service.link_report_to_case(db, report_id, case_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"status": "ok"}

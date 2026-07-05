"""
Dashboard routes — aggregate stats, trends, top-N lists.
Public endpoints — data is sourced from the CSV dataset, not user data.
"""

from fastapi import APIRouter

from ..services.ai_utils import (
    crime_counts_by_category,
    dashboard_stats,
    monthly_trends,
    top_districts,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    return dashboard_stats()

@router.get("/top-districts")
async def get_top_districts(limit: int = 10):
    return top_districts(limit)


@router.get("/crime-counts-by-category")
async def get_crime_counts_by_category(limit: int = 10):
    return crime_counts_by_category(limit)


@router.get("/monthly-trends")
async def get_monthly_trends(year: int | None = None):
    return monthly_trends(year)

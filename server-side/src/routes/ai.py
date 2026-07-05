"""
AI / ML routes — prediction, heatmaps.
Public endpoints — data is sourced from the CSV dataset / ML model.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException

from ..services.ai_utils import (
    generate_heatmap_data,
    generate_state_heatmap_predictions,
    run_ml_prediction,
)
from ..models.schemas import CrimePredictionInput

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/predict")
def predict_crime(payload: CrimePredictionInput):
    res = run_ml_prediction(payload)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res


@router.get("/heatmap")
def crime_heatmap(
    state: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    limit: int = 0,
):
    """
    Returns heatmap data with optional filters.
    Omit any filter to include all values for that dimension.

    Examples:
      /api/ai/heatmap                                          → all data
      /api/ai/heatmap?state=selangor                           → all Selangor
      /api/ai/heatmap?state=selangor&category=assault           → Selangor assaults
      /api/ai/heatmap?year=2023&month=1                        → Jan 2023 only
      /api/ai/heatmap?state=selangor&type=murder&year=2022     → specific slice
      /api/ai/heatmap?limit=20                                 → all data, top 20
    """
    return generate_heatmap_data(
        state=state,
        category=category,
        type=type,
        year=year,
        month=month,
        limit=limit,
    )


@router.get("/heatmap_predictions")
def crime_heatmap_predictions(
    state: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
):
    """
    Returns predicted crime totals aggregated by state.
    All filter params are optional — omit any to include all.

    Examples:
      /api/ai/heatmap_predictions                              → all data, latest year
      /api/ai/heatmap_predictions?year=2027&month=1            → predict for Jan 2027
      /api/ai/heatmap_predictions?state=selangor               → Selangor only
      /api/ai/heatmap_predictions?state=selangor&category=assault
      /api/ai/heatmap_predictions?category=property&year=2026&month=6
    """
    return generate_state_heatmap_predictions(
        state=state,
        category=category,
        type=type,
        year=year,
        month=month,
    )

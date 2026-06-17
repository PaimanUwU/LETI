from pathlib import Path
from typing import Optional
import pandas as pd
import joblib
import numpy as np

from .schemas import CrimePredictionInput
from .district_coordinates import DISTRICT_COORDINATES

# =========================================================
# PATH CONFIG
# =========================================================
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "AI" / "crime_district.csv"
MODEL_PATH = BASE_DIR / "AI" / "crime_analysis_rf.joblib"


# =========================================================
# DATA LOADING
# =========================================================
def _preload_data_cache() -> pd.DataFrame:
    """
    @desc     Loads and cleans the initial dataset from CSV into volatile memory.
              Drops invalid rows and standardizes string casing for consistency.
    @returns  {pd.DataFrame} A sanitized dataframe ready for analytical queries.
    """
    try:
        if not DATA_PATH.exists():
            print(f"⚠️ CSV not found: {DATA_PATH}")
            return pd.DataFrame()

        df = pd.read_csv(DATA_PATH)

        # Enforce schemas and sanitize types
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["crimes"] = pd.to_numeric(df["crimes"], errors="coerce")

        # Drop records missing critical relational keys
        df = df.dropna(subset=["state", "district", "category", "type", "date"])

        # Normalize categorical values
        df["district"] = df["district"].astype(str).str.lower().str.strip()
        df["category"] = df["category"].astype(str).str.lower().str.strip()
        df["type"] = df["type"].astype(str).str.lower().str.strip()

        # Extract temporal features
        df["year"] = df["date"].dt.year
        df["month"] = df["date"].dt.month

        print("✅ Dataset loaded and cached")
        return df

    except Exception as e:
        print(f"❌ Dataset error: {e}")
        return pd.DataFrame()


# Initialize Global Data Cache
GLOBAL_DF = _preload_data_cache()


def load_data() -> pd.DataFrame:
    """
    @desc     Thread-safe accessor for the pre-loaded global DataFrame.
    @returns  {pd.DataFrame} The cached DataFrame instance.
    """
    return GLOBAL_DF


# =========================================================
# MODEL LOADING
# =========================================================
MODEL = None

try:
    if MODEL_PATH.exists():
        MODEL = joblib.load(MODEL_PATH)
        print("✅ ML model loaded successfully")
    else:
        print("⚠️ Model not found")

except Exception as e:
    print(f"❌ Model load failed: {e}")
    MODEL = None


# =========================================================
# DASHBOARD FUNCTIONS
# =========================================================
def top_districts(limit: int = 10) -> list[dict]:
    """
    @desc     Aggregates cumulative crime volume to find the highest affected areas.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @body     {int} limit - Maximum number of district records to return.
    @returns  {list[dict]} Ordered list of districts and their crime totals.
    """
    df = load_data()
    if df.empty:
        return []

    return (
        df.groupby("district", as_index=False)["crimes"]
        .sum()
        .sort_values("crimes", ascending=False)
        .head(limit)
        .to_dict("records")
    )


def crime_counts_by_category(limit: int = 10) -> list[dict]:
    """
    @desc     Groups records by crime category to surface the most frequent offenses.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @body     {int} limit - Maximum number of category records to return.
    @returns  {list[dict]} Ordered list of categories and their crime totals.
    """
    df = load_data()
    if df.empty:
        return []

    return (
        df.groupby("category", as_index=False)["crimes"]
        .sum()
        .sort_values("crimes", ascending=False)
        .head(limit)
        .to_dict("records")
    )


def monthly_trends(district: str | None = None) -> list[dict]:
    """
    @desc     Compiles chronological crime frequencies. Can be scoped to a specific area.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @body     {str|None} district - Optional district string to filter the dataset.
    @returns  {list[dict]} Chronological array of months mapping to crime counts.
    """
    df = load_data()
    if df.empty:
        return []

    if district:
        df = df[df["district"] == district.lower().strip()]

    return (
        df.groupby("month", as_index=False)["crimes"]
        .sum()
        .sort_values("month")
        .to_dict("records")
    )


def dashboard_summary(limit: int = 10) -> dict:
    """
    @desc     Consolidates high-level metrics required to populate the UI dashboard.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @body     {int} limit - Constraint parameter passed down to sub-queries.
    @returns  {dict} A combined dictionary holding rows, totals, and top N lists.
    """
    df = load_data()

    if df.empty:
        return {
            "total_rows": 0,
            "total_crimes": 0,
            "top_districts": [],
            "top_categories": [],
            "monthly_trends": []
        }

    return {
        "total_rows": len(df),
        "total_crimes": float(df["crimes"].sum()),
        "top_districts": top_districts(limit),
        "top_categories": crime_counts_by_category(limit),
        "monthly_trends": monthly_trends()
    }


# =========================================================
# DASHBOARD STAT CARDS
# =========================================================
def dashboard_stats() -> dict:
    """
    @desc     Computes the four summary statistics displayed in the dashboard
              stat cards: total cases, monthly trend %, affected areas count,
              and resolved cases.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @returns  {dict} Keys: total_cases, monthly_trend_pct, affected_areas, resolved_cases.
    """
    df = load_data()

    if df.empty:
        return {
            "total_cases": 0,
            "monthly_trend_pct": 0.0,
            "affected_areas": 0,
            "resolved_cases": 0,
        }

    # --- Total Cases --------------------------------------------------
    total_cases = float(df["crimes"].sum())

    # --- Monthly Trend (% change) ------------------------------------
    # Data is yearly (all dates are Jan-01), so we compare latest two years
    yearly = (
        df.groupby("year")["crimes"]
        .sum()
        .sort_index()
    )

    if len(yearly) >= 2:
        latest = float(yearly.iloc[-1])
        previous = float(yearly.iloc[-2])
        monthly_trend_pct = (
            round(((latest - previous) / previous) * 100, 2)
            if previous != 0
            else 0.0
        )
    else:
        monthly_trend_pct = 0.0

    # --- Affected Areas ----------------------------------------------
    # Count unique districts (exclude "all" which is an aggregate row)
    clean = df[df["district"] != "all"]
    affected_areas = clean["district"].nunique()

    # --- Resolved Cases ----------------------------------------------
    # TODO : HELP ME FIGURE OUT ARIFF
    # NOTE: The CSV does not contain a "resolved" column.
    # FIXME: This is a placeholder calculation. In a real implementation, this would require a data source that tracks case resolutions.
    # Resolved is estimated at ~70 % of total crimes as a placeholder
    # until a data source with actual resolution tracking is available.
    resolved_cases = round(total_cases * 0.70, 2)

    return {
        "total_cases": total_cases,
        "monthly_trend_pct": monthly_trend_pct,
        "affected_areas": affected_areas,
        "resolved_cases": resolved_cases,
    }


# =========================================================
# SAFE ML PREDICTION
# =========================================================
def run_ml_prediction(payload: CrimePredictionInput) -> dict:
    """
    @desc     Processes a single prediction task using the loaded joblib model.
              Automatically handles text normalization before matrix injection.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @body     {CrimePredictionInput} payload - Pydantic model containing feature inputs.
              Example:
              {
                  "district": "petaling",
                  "category": "property crime",
                  "type": "burglary",
                  "year": 2026,
                  "month": 6
              }
    @returns  {dict} Contains the "status" and float "predicted_crimes" count.
    """
    if MODEL is None:
        return {"error": "Model not loaded"}

    try:
        input_df = pd.DataFrame([{
            "district": payload.district.lower().strip(),
            "category": payload.category.lower().strip(),
            "type": payload.type.lower().strip(),
            "year": payload.year,
            "month": payload.month
        }])

        prediction = MODEL.predict(input_df)[0]

        return {
            "status": "success",
            "predicted_crimes": float(prediction)
        }

    except Exception as e:
        return {"error": f"Inference failed: {str(e)}"}


# =========================================================
# HEATMAP GENERATOR
# =========================================================

def generate_heatmap_data(
    state: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    limit: int = 0
) -> dict:
    """
    @desc     Builds heatmap payloads for geographic crime visualisation.
              All filter parameters are optional — omit a filter to include
              all values for that dimension.
    @header   X-State, X-Category, X-Type, X-Year, X-Month (all optional)
    @body     {str|None}  state    — optional state filter
    @body     {str|None}  category — optional category filter
    @body     {str|None}  type     — optional type filter
    @body     {int|None}  year     — optional year filter
    @body     {int|None}  month    — optional month filter
    @body     {int}       limit    — optional cap on records returned (0 = unlimited)
    @returns  {dict} Envelope with status, meta, and data array.
    """
    df = load_data()

    if df.empty:
        return {"status": "error", "message": "No dataset loaded", "meta": {}, "data": []}

    # ── Step 1: clean aggregate rows ──────────────────────
    df = df[
        (df["state"] != "Malaysia") &
        (df["district"] != "all") &
        (df["type"] != "all")
    ].copy()

    # ── Step 2: standardise string columns ────────────────
    df["state_clean"]    = df["state"].astype(str).str.lower().str.strip()
    df["district_clean"] = df["district"].astype(str).str.lower().str.strip()
    df["category_clean"] = df["category"].astype(str).str.lower().str.strip()
    df["type_clean"]     = df["type"].astype(str).str.lower().str.strip()

    # Double-clean — some rows may still contain "malaysia" / "all"
    df = df[
        (df["state_clean"] != "malaysia") &
        (df["district_clean"] != "all") &
        (df["type_clean"] != "all")
    ].copy()

    # ── Step 3: parse temporal features ───────────────────
    df["date"]  = pd.to_datetime(df["date"])
    df["year"]  = df["date"].dt.year
    df["month"] = df["date"].dt.month

    # ── Step 4: apply optional filters ────────────────────
    active_filters: list[str] = []

    if state is not None:
        s = state.lower().strip()
        df = df[df["state_clean"] == s]
        active_filters.append("state")

    if category is not None:
        c = category.lower().strip()
        df = df[df["category_clean"] == c]
        active_filters.append("category")

    if type is not None:
        t = type.lower().strip()  # e.g. "break_in", "murder"
        df = df[df["type_clean"] == t]
        active_filters.append("type")

    if year is not None:
        df = df[df["year"] == year]
        active_filters.append("year")

    if month is not None:
        df = df[df["month"] == month]
        active_filters.append("month")

    # ── Step 5: aggregate & map coordinates ──────────────
    if df.empty:
        return {"status": "success", "meta": {"filters_applied": active_filters, "total_records": 0}, "data": []}

    aggregated = df.groupby("district_clean")["crimes"].sum().reset_index()

    data_payload: list[dict] = []
    for _, row in aggregated.iterrows():
        district_name = row["district_clean"]
        coords = DISTRICT_COORDINATES.get(district_name)

        if coords:
            data_payload.append({
                "district":    district_name.title(),
                "latitude":    coords["lat"],
                "longitude":   coords["lon"],
                "crime_count": int(row["crimes"]),
            })

    # Optional result limiting
    if limit > 0:
        data_payload.sort(key=lambda x: x["crime_count"], reverse=True)
        data_payload = data_payload[:limit]

    return {
        "status": "success",
        "meta": {
            "state":    state.title() if state else "all",
            "category": category.title() if category else "all",
            "type":     type.title() if type else "all",
            "year":     year if year else "all",
            "month":    month if month else "all",
            "filters_applied": active_filters,
            "total_records": len(data_payload),
        },
        "data": data_payload,
    }
    
    
def generate_state_heatmap_predictions(
    state: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
) -> dict:
    """
    @desc     Runs ML predictions for every (district, category, type) combo and
              aggregates the results by state for map visualisation.
              All filter parameters are optional — omit a filter to include all
              values for that dimension.
    @header   X-State, X-Category, X-Type, X-Year, X-Month (all optional)
    @body     {str|None}  state    — optional state filter
    @body     {str|None}  category — optional category filter
    @body     {str|None}  type     — optional type filter
    @body     {int|None}  year     — optional prediction year (default: latest in data)
    @body     {int|None}  month    — optional prediction month (default: 1)
    @returns  {dict} Envelope with status, meta, and data array.
    """
    df = load_data()

    if df.empty:
        return {"status": "error", "message": "No dataset loaded", "meta": {}, "data": []}

    if MODEL is None:
        return {"status": "error", "message": "ML model not loaded", "meta": {}, "data": []}

    # ── Step 1: clean aggregate rows ──────────────────────
    df = df[
        (df["state"] != "Malaysia") &
        (df["district"] != "all") &
        (df["type"] != "all")
    ].copy()

    # ── Step 2: standardise string columns ────────────────
    df["state_clean"]    = df["state"].astype(str).str.lower().str.strip()
    df["district_clean"] = df["district"].astype(str).str.lower().str.strip()
    df["category_clean"] = df["category"].astype(str).str.lower().str.strip()
    df["type_clean"]     = df["type"].astype(str).str.lower().str.strip()

    # ── Step 3: apply optional filters before generating combos ──
    active_filters: list[str] = []

    if state is not None:
        s = state.lower().strip()
        df = df[df["state_clean"] == s]
        active_filters.append("state")

    if category is not None:
        c = category.lower().strip()
        df = df[df["category_clean"] == c]
        active_filters.append("category")

    if type is not None:
        t = type.lower().strip()
        df = df[df["type_clean"] == t]
        active_filters.append("type")

    # ── Step 4: resolve prediction year / month ───────────
    df["date"] = pd.to_datetime(df["date"])
    df["data_year"] = df["date"].dt.year

    resolved_year = year if year is not None else int(df["data_year"].max())
    resolved_month = month if month is not None else 1

    # ── Step 5: generate unique combos from remaining data ─
    grouped = (
        df.groupby(["state", "district_clean", "category_clean", "type_clean"])
        .size()
        .reset_index()
    )

    state_totals: dict[str, float] = {}

    for row in grouped.itertuples(index=False):
        payload = CrimePredictionInput(
            district=row.district_clean,
            category=row.category_clean,
            type=row.type_clean,
            year=resolved_year,
            month=resolved_month,
        )

        result = run_ml_prediction(payload)

        if "error" in result:
            continue

        s = row.state
        state_totals[s] = (
            state_totals.get(s, 0) + result["predicted_crimes"]
        )

    data_payload = [
        {
            "state": s,
            "predicted_crimes": round(value, 2),
        }
        for s, value in sorted(
            state_totals.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    ]

    return {
        "status": "success",
        "meta": {
            "state":    state.title() if state else "all",
            "category": category.title() if category else "all",
            "type":     type.title() if type else "all",
            "year":     resolved_year,
            "month":    resolved_month,
            "filters_applied": active_filters,
            "total_states": len(data_payload),
        },
        "data": data_payload,
    }
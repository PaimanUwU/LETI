from pathlib import Path
import pandas as pd
import joblib
import numpy as np

from .schemas import CrimePredictionInput

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
    total_cases = float(df["crimes"].count())

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
def generate_state_heatmap_predictions(year: int, month: int) -> list[dict]:
    """
    @desc     Simulates and aggregates geographic crime volumes to populate map UI.
              Cleans structural anomalies ("Malaysia", "all") before batch processing.
    @header   none - note: this endpoint is intended for internal dashboard use and may not require auth.
    @body     {int} year - Target forecasting year.
    @body     {int} month - Target forecasting month (1-12).
    @returns  {list[dict]} Grouped and sorted array of states with forecast totals.
    """
    df = load_data()

    if df.empty or MODEL is None:
        return []

    # Clean data payload constraints
    df = df[
        (df["state"] != "Malaysia") &
        (df["district"] != "all") &
        (df["type"] != "all")
    ].copy()

    # Generate unique topologies
    grouped = df.groupby(
        ["state", "district", "category", "type"]
    ).size().reset_index()

    state_totals = {}

    for row in grouped.itertuples(index=False):

        payload = CrimePredictionInput(
            district=row.district,
            category=row.category,
            type=row.type,
            year=year,
            month=month
        )

        result = run_ml_prediction(payload)

        if "error" in result:
            continue

        state = row.state

        state_totals[state] = (
            state_totals.get(state, 0)
            + result["predicted_crimes"]
        )

    return [
        {
            "state": state,
            "predicted_crimes": round(value, 2)
        }
        for state, value in sorted(
            state_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )
    ]
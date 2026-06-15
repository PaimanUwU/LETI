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
    try:
        if not DATA_PATH.exists():
            print(f"⚠️ CSV not found: {DATA_PATH}")
            return pd.DataFrame()

        df = pd.read_csv(DATA_PATH)

        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["crimes"] = pd.to_numeric(df["crimes"], errors="coerce")

        df = df.dropna(subset=["state", "district", "category", "type", "date"])

        df["district"] = df["district"].astype(str).str.lower().str.strip()
        df["category"] = df["category"].astype(str).str.lower().str.strip()
        df["type"] = df["type"].astype(str).str.lower().str.strip()

        df["year"] = df["date"].dt.year
        df["month"] = df["date"].dt.month

        print("✅ Dataset loaded and cached")
        return df

    except Exception as e:
        print(f"❌ Dataset error: {e}")
        return pd.DataFrame()


GLOBAL_DF = _preload_data_cache()


def load_data():
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
def top_districts(limit: int = 10):
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


def crime_counts_by_category(limit: int = 10):
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


def monthly_trends(district: str | None = None):
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


def dashboard_summary(limit: int = 10):
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
# SAFE ML PREDICTION (IMPORTANT FIX)
# =========================================================
def run_ml_prediction(payload: CrimePredictionInput) -> dict:
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
    df = load_data()

    if df.empty or MODEL is None:
        return []

    df = df[
        (df["state"] != "Malaysia") &
        (df["district"] != "all") &
        (df["type"] != "all")
    ].copy()

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
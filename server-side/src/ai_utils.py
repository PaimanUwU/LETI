from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "AI" / "crime_district.csv"

def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["crimes"] = pd.to_numeric(df["crimes"], errors="coerce")
    
    df = df.dropna(subset=["state", "district", "category", "type", "date"])
    df["year"] = df["date"].dt.year.fillna(0).astype(int)
    df["month"] = df["date"].dt.month.fillna(0).astype(int)
    
    return df

def top_districts (limit: int =10):
    
    df = load_data()
    results = (df.groupby("district", as_index=False)["crimes"]
        .sum()
        .sort_values("crimes", ascending=False)
        .head(limit)
    )
    return results.to_dict(orient="records")

def crime_counts_by_category(limit: int=10):
    df = load_data()
    result = (
        df.groupby("category", as_index=False)["crimes"]
        .sum()
        .sort_values("crimes", ascending=False)
        .head(limit)
    )
    return result.to_dict(orient="records")

import pandas as pd
from datetime import datetime

from src.database import SessionLocal
from src.models import CrimeRecords
import os
from dotenv import load_dotenv


def load_data(csv_path: str):
    db = SessionLocal()

    df = pd.read_csv(r"C:\Users\ariff\LETI\server-side\src\data\crime_district.csv")

    for _, row in df.iterrows():
        record = CrimeRecords(
            state=row["state"],
            district=row["district"],
            category=row["category"],
            crime_type=row["type"],
            date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
            crimes=int(row["crimes"]),
        )

        db.add(record)

    db.commit()
    db.close()

    print("✅ Data loaded successfully")


if __name__ == "__main__":
    load_data("crime.csv")

r"""
Seeder script — creates initial users and sample reports.

Run from the server-side directory:
    .venv\Scripts\python.exe seed.py

Safe to run multiple times — skips if users already exist.
"""
import sys
from pathlib import Path

# Ensure src/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from src.utils.database import SessionLocal, Base, engine
from src.models.models import User, Report
from src.services.crud import hash_password


def seed():
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ── Idempotency check ──────────────────────────────────────────
        if db.query(User).count() > 0:
            print("Database already has users — skipping seed.")
            return

        # ── 1. Admin user ───────────────────────────────────────────────
        admin = User(
            email="admin@leti.my",
            hashed_password=hash_password("admin123"),
            is_admin=True,
            role="admin",
        )
        db.add(admin)

        # ── 2. Law enforcer user ────────────────────────────────────────
        officer = User(
            email="officer@leti.my",
            hashed_password=hash_password("officer123"),
            is_admin=False,
            role="law_enforcer",
        )
        db.add(officer)
        db.flush()  # assign IDs without committing yet

        # ── 3. Five sample reports (submitted by non-login "users") ─────
        sample_reports = [
            Report(
                name="Ahmad Faizal",
                email="ahmad.faizal@gmail.com",
                phone_number="012-3456789",
                category="property",
                type="theft_vehicle_motorcycle",
                title="Motorcycle stolen near LRT station",
                description=(
                    "My Yamaha LC135 was stolen last night around 10pm while parked "
                    "near the Taman Jaya LRT station. I have already lodged a police "
                    "report at the Petaling Jaya station."
                ),
                location="Taman Jaya LRT, Petaling Jaya, Selangor",
                approval_status="pending",
            ),
            Report(
                name="Siti Nurhaliza",
                email="siti.nurhaliza@yahoo.com",
                phone_number="017-9876543",
                category="assault",
                type="causing_injury",
                title="Altercation at night market",
                description=(
                    "A group of youths attacked a food stall vendor at the Taman "
                    "Connaught night market. The vendor sustained minor injuries. "
                    "The incident happened around 9:30pm."
                ),
                location="Taman Connaught Night Market, Cheras, Kuala Lumpur",
                approval_status="pending",
            ),
            Report(
                name="Rajesh Kumar",
                email="rajesh.kumar@outlook.com",
                phone_number="019-1122334",
                category="property",
                type="break_in",
                title="Public park facilities damaged",
                description=(
                    "Several benches and the children's playground at Taman Tasik "
                    "Titiwangsa have been vandalized with graffiti and broken "
                    "equipment. This is the third time this month."
                ),
                location="Taman Tasik Titiwangsa, Kuala Lumpur",
                approval_status="pending",
            ),
            Report(
                name="Mei Ling Wong",
                email="meiling.wong@gmail.com",
                phone_number="016-5566778",
                category="property",
                type="break_in",
                title="House break-in during holiday",
                description=(
                    "Our house in USJ 6 was broken into while the family was away "
                    "for the Hari Raya holidays. The back door was pried open. "
                    "Jewellery and cash estimated at RM15,000 were stolen."
                ),
                location="USJ 6, Subang Jaya, Selangor",
                approval_status="pending",
            ),
            Report(
                name="Haris Iskandar",
                email="haris.iskandar@proton.me",
                phone_number="013-8899001",
                category="property",
                type="theft_other",
                title="Online shopping scam via social media",
                description=(
                    "I was scammed by a seller on Facebook Marketplace. Paid "
                    "RM800 via online transfer for a phone that was never "
                    "delivered. The seller has since deleted their account."
                ),
                location="Kota Damansara, Petaling Jaya, Selangor",
                approval_status="pending",
            ),
        ]

        db.add_all(sample_reports)
        db.commit()

        # ── Summary ─────────────────────────────────────────────────────
        print("✓ Seeding complete:")
        print("  • 2 login users created:")
        print("    - admin@leti.my      / admin123    (role: admin)")
        print("    - officer@leti.my    / officer123  (role: law_enforcer)")
        print("  • 5 sample reports created (3 pending, 1 approved, 1 rejected)")
        print("  • Cases are created when reports are approved via the dashboard")
        print("\nRegular users (report submitters) do not need login accounts.")
        print("Start the server with: uvicorn src.main:app --reload")

    finally:
        db.close()


if __name__ == "__main__":
    seed()

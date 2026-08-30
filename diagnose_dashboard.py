#!/usr/bin/env python3
import os
import sys
import json
import re
from pathlib import Path

try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, PyMongoError
except Exception:
    MongoClient = None

PROJECT_ROOT = Path(r"C:\Users\sayan\OneDrive\Desktop\Pharmacy")
DASHBOARD_PATH = PROJECT_ROOT / "Admin_Frontend" / "src" / "pages" / "Dashboard.jsx"
BACKEND_DIR = PROJECT_ROOT / "Backend"
ENV_FILE = BACKEND_DIR / ".env"


def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return f"<read error: {e}>"


def check_dashboard_code(text: str) -> dict:
    findings = []
    if "ResponsiveContainer" not in text:
        findings.append("ResponsiveContainer missing")
    if "useMemo" not in text:
        findings.append("useMemo not used for derived chart data")
    for chart_name in ["topMedicinesByStock", "medicinesBySystem", "medicinesByType", "orderTrend"]:
        if chart_name not in text:
            findings.append(f"Missing derived dataset: {chart_name}")
    return {
        "file": str(DASHBOARD_PATH),
        "exists": DASHBOARD_PATH.exists(),
        "findings": findings,
        "status": "OK" if not findings else f"Issues found: {'; '.join(findings)}",
    }


def extract_mongo_uri(text: str) -> str | None:
    m = re.search(r"MONGODB_URI\s*=\s*(.+)", text)
    if m:
        return m.group(1).strip().strip("\"'")
    return None


def check_backend_env() -> dict:
    text = read_file(ENV_FILE)
    uri = extract_mongo_uri(text)
    return {
        "env_file": str(ENV_FILE),
        "exists": ENV_FILE.exists(),
        "mongodb_uri_found": bool(uri),
        "mongodb_uri": uri or "<not found>",
    }


def check_mongo_data(uri: str | None) -> dict:
    if MongoClient is None:
        return {"error": "pymongo not installed"}
    if not uri:
        return {"error": "MONGODB_URI not found in backend .env"}
    result = {
        "connection": "unknown",
        "collections": {},
    }
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        result["connection"] = "ok"
        db_name = None
        if "/" in uri:
            last = uri.rsplit("/", 1)[-1]
            if last and "?" not in last:
                db_name = last.split("?")[0]
        if not db_name:
            env_db = None
            try:
                env_text = read_file(ENV_FILE)
                m = re.search(r"MONGODB_DB_NAME\s*=\s*(.+)", env_text)
                if m:
                    env_db = m.group(1).strip().strip("\"'")
            except Exception:
                env_db = None
            db_name = env_db or "Pharmacy"
        db = client[db_name]
        names = ["medicines", "orders", "vendors", "supplies", "users", "shops"]
        for name in names:
            try:
                count = db[name].count_documents({})
                result["collections"][name] = count
            except PyMongoError as e:
                result["collections"][name] = f"error: {e}"
    except ConnectionFailure as e:
        result["connection"] = f"failed: {e}"
    except Exception as e:
        result["connection"] = f"error: {e}"
    return result


def main() -> int:
    print("=== Dashboard Diagnostic ===\n")
    code_info = check_dashboard_code(read_file(DASHBOARD_PATH))
    print(f"Dashboard code: {code_info['status']}")
    if code_info["findings"]:
        for f in code_info["findings"]:
            print(f"  - {f}")
    print()

    env_info = check_backend_env()
    print(f"Backend .env: {env_info['env_file']} (exists={env_info['exists']})")
    print(f"Mongo URI found: {env_info['mongodb_uri_found']}")
    if env_info.get("mongodb_uri") and env_info["mongodb_uri"] != "<not found>":
        masked = env_info["mongodb_uri"]
        if "@" in masked:
            parts = masked.split("@")
            masked = "***:***@" + parts[-1]
        print(f"Mongo URI: {masked}")
    print()

    uri = env_info.get("mongodb_uri") if env_info.get("mongodb_uri") != "<not found>" else None
    if uri:
        mongo_info = check_mongo_data(uri)
        print(f"MongoDB connection: {mongo_info.get('connection')}")
        if "error" in mongo_info:
            print(f"MongoDB check error: {mongo_info['error']}")
        else:
            print("Collection document counts:")
            for coll, count in mongo_info.get("collections", {}).items():
                print(f"  {coll}: {count}")
    else:
        print("Skipping MongoDB data check because MONGODB_URI was not found.")

    print("\n=== Likely causes of blank charts ===")
    causes = []
    if any("not used" in f or "missing" in f for f in code_info.get("findings", [])):
        causes.append("Dashboard.jsx derived datasets missing or ResponsiveContainer missing")
    mongo_counts = None
    try:
        if uri and MongoClient:
            mongo_counts = check_mongo_data(uri).get("collections", {})
    except Exception:
        mongo_counts = None
    if isinstance(mongo_counts, dict):
        if mongo_counts.get("medicines", 0) == 0:
            causes.append("medicines collection is empty -> Bar/Pie/Donut charts have no data")
        if mongo_counts.get("orders", 0) == 0:
            causes.append("orders collection is empty -> Line chart has no data")
    if not causes:
        causes.append("Data exists; likely frontend render/container height issue")
    for c in causes:
        print(f"- {c}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

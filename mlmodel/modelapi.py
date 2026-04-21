from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from businessRules import apply_rules
from mlModel import detect_anomalies
import numpy as np


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    df = pd.read_csv(file.file, encoding="latin-1")
    flags = apply_rules(df)
    if("error" in flags):
        return flags
    flags["supplier_name"] = df["Supplier Name"].iloc[0] if "Supplier Name" in df.columns else "Unknown"
    flags["contract_start_date"] = df["Contract Start Date"].iloc[0] if "Contract Start Date" in df.columns else "Unknown"

    anomaly_scores, anomaly_preds, fairness = detect_anomalies(df)
    flags["anomaly_score"] = anomaly_scores.tolist()
    flags["anomaly_pred"] = anomaly_preds.tolist()
    flags["fairness"] = float(fairness)
    flags["current_month_commission"] = df["Acct Comm - Actual Current Month"].iloc[0].item() if "Acct Comm - Actual Current Month" in df.columns else 0
    flags["last_month_commission"] = df["Acct Comm - Actual Prior Mnt 1"].iloc[0].item() if "Acct Comm - Actual Prior Mnt 1" in df.columns else 0
    flags["prior_month_2_commission"] = df["Acct Comm - Actual Prior Mnt 2"].iloc[0].item() if "Acct Comm - Actual Prior Mnt 2" in df.columns else 0
    flags["prior_month_3_commission"] = df["Acct Comm - Actual Prior Mnt 3"].iloc[0].item() if "Acct Comm - Actual Prior Mnt 3" in df.columns else 0
    flags["prior_month_4_commission"] = df["Acct Comm - Actual Prior Mnt 4"].iloc[0].item() if "Acct Comm - Actual Prior Mnt 4" in df.columns else 0
    flags["prior_month_5_commission"] = df["Acct Comm - Actual Prior Mnt 5"].iloc[0].item() if "Acct Comm - Actual Prior Mnt 5" in df.columns else 0
    flags["contract_term_months"] = df["Term (Mos.)"].iloc[0].item() if "Term (Mos.)" in df.columns else 0
    flags["account_age_months"] = df["Account Aging"].iloc[0].item() if "Account Aging" in df.columns else 0

    return flags

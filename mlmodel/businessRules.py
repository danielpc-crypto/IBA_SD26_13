from sys import flags

import pandas as pd

def apply_rules(df):
    df = df.copy()

    #data input validation
    if("Order" not in df.columns or
       "Supplier Name" not in df.columns or
       "Customer Id" not in df.columns or
       "Contract Start Date" not in df.columns or
       "MRC" not in df.columns):
        return {"error": "Missing required columns"}

    percentVar = (df["Acct Comm - Actual Current Mnt"] - df["Acct Comm - Actual Prior Mnt 1"]) /  df["Acct Comm - Actual Prior Mnt 1"] 
    dollarVar = df["Acct Comm - Actual Current Mnt"] - df["Acct Comm - Actual Prior Mnt 1"]

    flags = {
        #BR-010
        "non_pay": (df["Acct Comm - Actual Current Mnt"] == 0).any(),
        #BR-011
        "chargeback": (df["Acct Comm - Actual Current Mnt"] < 0).any(),
        #BR-012
        "variance_commission_drop": ((percentVar < -0.1) & (abs(dollarVar) > 50)).any(),
        #BR-013
        # "commission_rate_variance": ((df["Account Passthrough Actual"] > 0) & ((df["Order Passthrough"] - df["Account Passthrough Actual"]).abs() > 2)).any(),
        
        
    }

    #do these after to avoid null values
    #BR-014
    #flags["mrc_review_flag"] = ((flags["variance_commission_drop"] | flags["commission_rate_variance"]) & (df["Account Aging"] < 12)).any()

    flags = {k: bool(v) for k, v in flags.items()}
    return flags


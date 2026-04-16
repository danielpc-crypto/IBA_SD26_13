from sys import flags

import pandas as pd

def apply_rules(df):
    df = df.copy()

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
    }

    flags = {k: bool(v) for k, v in flags.items()}
    return flags


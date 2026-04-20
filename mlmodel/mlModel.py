from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np

def preprocess_data(df):
    df = df.copy()

    for col in df.columns:
        if df[col].dtype == "object":
            if df[col].astype(str).str.contains("%", na=False).any():
                df[col] = (
                    df[col]
                    .astype(str)
                    .str.replace("%", "", regex=False)
                )
                df[col] = pd.to_numeric(df[col], errors="coerce") / 100

    for col in df.columns:
        if df[col].dtype == "object":
            try:
                converted = pd.to_datetime(df[col], errors="raise")
                df[col] = converted

                # expand into useful numeric features
                df[col + "_year"] = converted.dt.year
                df[col + "_month"] = converted.dt.month
                df[col + "_day"] = converted.dt.day
                df[col + "_dow"] = converted.dt.dayofweek

                df = df.drop(columns=[col])

            except:
                pass  # not a date column

    # for col in df.columns:
    #     if df[col].dtype == "object":
    #         df[col] = (df[col].str.replace(",", "", regex=False).str.replace("$", "", regex=False))
    #         df[col] = pd.to_numeric(df[col], errors="ignore")

    return df

def detect_anomalies(X_file):
    train_data_loc = "sampleData/updated_train_data.csv"
    X_train = pd.read_csv(train_data_loc)
    X_train = preprocess_data(X_train)
    X_train = pd.get_dummies(X_train)  # Convert categorical variables to dummy variables

    X = preprocess_data(X_file)
    X = pd.get_dummies(X)  # Convert categorical variables to dummy variables
    model = IsolationForest(contamination=0.05)
    feature_names = X_train.columns
    X_train = X_train.reindex(columns=feature_names, fill_value=0)

    model.fit(X_train)
    train_scores = -model.decision_function(X_train)
    p5, p95 = np.percentile(train_scores, [5, 95])

    # during inference


    X = X.reindex(columns=feature_names, fill_value=0)
    raw_score = -model.decision_function(X)
    pred = model.predict(X)

    anomaly_score_normalized = (raw_score - p5) / (p95 - p5)
    anomaly_score_normalized = max(0, min(1, anomaly_score_normalized))

    fairness = 100 * (1 - anomaly_score_normalized)

    return raw_score, pred, fairness

# if __name__ == "__main__":
   
#     test_data_loc = "sampleData/test_data.csv"

#     # Load training and test data


#     anomaly_score, anomaly_preds, fairness = detect_anomalies(test_data_loc)

#     print("Anomaly Scores:", anomaly_score)
#     print("Predictions:", anomaly_preds)
#     print("Fairness Score:", fairness)
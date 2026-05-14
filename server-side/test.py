# test_model.py (create this in server-side/)
import time
import sys
import os
import joblib
import numpy as np
from pathlib import Path
import pandas as pd

# Load model (resolve relative to this script's location)
script_dir = Path(__file__).resolve().parent
# Search upward for an "AI/crime_analysis_rf.joblib" location
model_path = None
for parent in script_dir.resolve().parents:
    candidate = parent / "AI" / "crime_analysis_rf.joblib"
    if candidate.exists():
        model_path = candidate
        break

if model_path is None:
    print("Model not found. Searched parent directories for AI/crime_analysis_rf.joblib")
    sys.exit(1)

print("Loading model...")
start = time.time()
model = joblib.load(model_path)
load_time = time.time() - start

print(f"✓ Model load time: {load_time:.3f}s")
print(f"✓ Model type: {type(model)}")

# Test a single prediction
try:
    # Determine expected input width from the fitted pipeline
    expected_n = None
    if hasattr(model, 'named_steps') and 'pre' in model.named_steps:
        pre = model.named_steps['pre']
        if hasattr(pre, 'n_features_in_'):
            expected_n = pre.n_features_in_
    if expected_n is None and hasattr(model, 'n_features_in_'):
        expected_n = model.n_features_in_
    if expected_n is None:
        print("Could not infer model input width; falling back to 5 features")
        expected_n = 5

    print(f"Model expects {expected_n} input features — preparing synthetic input data")
    # If the pipeline's preprocessor expects column names (strings), pass a DataFrame
    pre = None
    if hasattr(model, 'named_steps') and 'pre' in model.named_steps:
        pre = model.named_steps['pre']

    if pre is not None and hasattr(pre, 'feature_names_in_'):
        cols = list(pre.feature_names_in_)
        # create sensible synthetic values for categorical and numeric columns
        row = []
        for c in cols:
            if c.lower() in ('year', 'month'):
                row.append(int(np.random.randint(2000, 2024) if c.lower()=='year' else np.random.randint(1,13)))
            else:
                row.append(f"val_{np.random.randint(0,10)}")
        sample = pd.DataFrame([row], columns=cols)
    else:
        # fallback to numeric array
        sample = np.random.randn(1, expected_n)
    start = time.time()
    pred = model.predict(sample)
    inference_time = time.time() - start
    
    print(f"✓ Single prediction time: {inference_time*1000:.2f}ms")
    print(f"✓ Prediction result: {pred}")
    
    # Batch test
    if pre is not None and hasattr(pre, 'feature_names_in_'):
        cols = list(pre.feature_names_in_)
        rows = []
        for _ in range(100):
            r = []
            for c in cols:
                if c.lower() in ('year', 'month'):
                    r.append(int(np.random.randint(2000, 2024) if c.lower()=='year' else np.random.randint(1,13)))
                else:
                    r.append(f"val_{np.random.randint(0,10)}")
            rows.append(r)
        batch = pd.DataFrame(rows, columns=cols)
    else:
        batch = np.random.randn(100, expected_n)
    start = time.time()
    preds = model.predict(batch)
    batch_time = time.time() - start
    
    print(f"✓ 100 predictions time: {batch_time*1000:.2f}ms")
    print(f"\nResult: Model is {'SYNC-friendly ✓' if inference_time < 0.1 else 'might need ASYNC'}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("Adjust n_features (13) to match your model's input shape")
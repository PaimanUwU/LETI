# The AI Engine

Technical details and functional parameters governing the Law Enforcement Threat Intelligence (LETI) predictive framework.

## Core Architecture

### Random Forest Regression
The LETI Dashboard utilizes a robust **Random Forest Regression** model implemented via Python’s **Sci-Kit-Learn** framework. By evaluating multi-layered decision trees over historical time-series indicators, the model effectively determines threat percentages without relying on overfitted single-path calculations.

## Execution & Pipeline

### Daily Real-Time Inference
The machine learning module executes an automated schedule **daily** to refresh probability distributions across all districts in Malaysia. To eliminate latency bottlenecks, the model is serialized as a **Python pickle (.pkl) file** and embedded directly into the **Python backend engine**, delivering rapid inference results under **500ms**.

## Forecasting Interval

### 1-Year Future Projections
Using structured annual parameters sourced from OpenDOSM together with vetted community incident data, the engine generates actionable predictive distributions looking exactly **1 year into the future**. This enables strategic planning, proactive law enforcement resource allocation, and advanced jurisdictional zoning.

## System Robustness & Retraining Fail-Safes
To maintain high reliability in real-world environments, the administration console allows authorized users to trigger model retraining directly. However, the core system enforces rigid constraints against unexpected data anomalies:

*   **Retraining Guardrails**: If there is corrupted or insufficient input data in the database during an admin-triggered training run, the process immediately halts. If the resulting newly-trained model fails structural verification checks or produces high variance errors, the core system isolates it and securely **keeps the previous stable model active**.
*   **Graceful Degradation**: In the event of an unforeseen system inference failure or missing localized records, the frontend does not break. Instead, the visualization layers follow a **graceful degradation policy**, automatically reverting to show historical crime averages for that specific district until normal AI operations recover.

## Role-Based Output Restrictions
In compliance with Malaysian data integrity and privacy provisions, access to the raw outputs of the machine learning engine is strict and role-restricted:

*   **Law Enforcement Personnel**: Granted secure authentication privileges via JSON Web Tokens (JWT) to view granular raw analytical predictions, detailed probability vectors, and trends for strategic assessment.
*   **General Civilians & Public Users**: Access is limited purely to aggregated, anonymized public dashboards and simplified geographic safety indicators to gauge baseline risk safely.

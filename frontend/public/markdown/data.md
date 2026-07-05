# The Data

Information about our data collection architecture, validation workflows, and analytical processing.

## Primary Data Ingestion
The core foundation of the LETI Dashboard relies on official, structured annual crime datasets provided by the **Department of Statistics Malaysia (OpenDOSM)**. This raw statistical data is automatically ingested, processed, and categorized into relational formats within our database.

*   **Geographic Scope**: Broken down granularly across districts and states across Malaysia.
*   **Categorization**: Grouped into primary classifications consisting of violent and property crimes, as well as specific crime types (e.g., assault, robbery).

## Crowdsourced Reporting
Since official governmental datasets are updated on an annual basis, the system supplements the pipeline with crowdsourced incident reporting to capture recent real-time trends during the in-between periods. Citizens can submit localized incident reports containing:

*   Reporter name and contact phone verification.
*   Specific location coordinates (district/state) and occurrence date/time.
*   Crime classification (property or violent) with descriptions and optional attached video proof.

## Data Integrity & Moderation
To maintain high data accuracy and protect against false or malicious submissions, the LETI Dashboard enforces a strict role-based chain of custody.

*   **The "Pending" State**: Any crowdsourced incident submitted by a general public user is flagged immediately as *Pending*. Pending data remains strictly isolated and cannot influence the visualization layers or the predictive models.
*   **Law Enforcement Vetting**: Authenticated Law Enforcement Officers review and vet submissions using the administrative dashboard. Reports are either explicitly approved and merged as verified data points into the system database, or permanently rejected and wiped.

## Data Analytics & Predictive Modeling
Transforming raw figures into practical threat intelligence happens through two primary visualization and execution pipelines:

### Geospatial Heatmaps
Renders geographic coordinates into density heatmaps. Areas seamlessly shift along a dynamic color scale ranging from green (low crime rate density) to red (high crime rate density), giving an immediate picture of local threat exposure.

### Statistical Distributions
Aggregates metrics using diverse data presentations. Uses responsive line charts to trace the temporal trends of crimes over recent weeks/months, alongside bar and pie charts representing specific relative frequencies across jurisdictions.

### Random Forest Regression
Powers the AI/ML Prediction Engine. An algorithm built via Python's Sci-Kit-Learn library processes historical time-series datasets to calculate the statistical probability of future crime trends 1 year in advance.

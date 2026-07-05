# Project Documentation & Blueprint

Complete structural brief, system architecture, team layout, and engineering requirements for the Law Enforcement Threat Intelligence (LETI) Dashboard.

**Universiti Teknologi MARA (UiTM) • CSC577: Software Engineering - Theories and Principles**
*   **Course Evaluation**: CSC577 Project Deliverable
*   **Supervising Lecturer**: Miss Hafizatul Hanin bt Hamzah
*   **Academic Group**: Fire Engineers Team

---

## 1.0 Project Background & Motivation
Traditional security workflows are heavily reactive—relying on a citizen reporting an emergency or crime occurrence directly to police departments before an official tactical response can be initiated. To dramatically reduce dispatch times and strategically allocate regional patrol grids, the **Law Enforcement Threat Intelligence (LETI) Dashboard** introduces predictive analytics to civil protection workflows.

By combining historical data processing models with user-submitted crowd data pipelines, the LETI platform translates complex public safety statistics into visual intelligence. The target platform is modeled after environmental safety dashboards, such as the *Air Pollutant Index Management System (APIMS)* by Jabatan Alam Sekitar, aiming to deliver immediate structural transparency to public users while empowering the **Royal Malaysian Police Force (PDRM)** with a tactical forecasting utility.

---

## 2.0 Objectives & System Scope

### Project Objectives
*   **Interactive Mapping**: To transform standard tabular crime records into geographic heatmaps charting absolute danger indices across distinct Malaysian states and districts.
*   **Data Synthesis**: To host official statistical registries provided by the Department of Statistics Malaysia (OpenDOSM) alongside direct local community notifications.
*   **Predictive Intelligence**: To integrate mathematical regression models capable of determining regional crime probabilities one year into the future.

### Boundary Limits & Exclusions
To guarantee maximum execution control and maintain delivery metrics under the CSC577 scope, explicit bounds are defined:
*   **In-Scope**: Modern web layout, user crime logging forms, administrative vetting portals, and SciKit-Learn analytics tracking.
*   **Out-of-Scope**: Native mobile app development (iOS/Android), and real-time social media scraping or unverified thread mining pipelines.

---

## 3.0 Team Directory & Responsibilities
The engineering structure of the **Fire Engineers Team**, detailing matrix allocations and official job assignments:

### Mohamad Hafizul Rahman Bin Mohd Radzi (ID: 2025236612)
**Project Manager**
Manages timelines, leads group reviews, chairs administrative design updates, and directs the structural completion of the SRS, SDD, and STD document sets.

### Muhammad Demir Naufal Bin Norazam (ID: 2025484708)
**Requirement Analyst**
Reviews structural stakeholder guidelines, maps out functional criteria, designs flowcharts, and acts as the gatekeeper for compliance standards.

### Muhammad Aiman Bin Kamarul Ariffin Lo (ID: 2025480996)
**Designer & System Tester**
Constructs relational schemas, blueprints application layouts, establishes verification parameters, and executes comprehensive unit testing suites.

### Muhammad Ariff Bin Norhisham (ID: 2025471092)
**Software Developer**
Programs Python backend services, optimizes query routing mechanisms, builds administrative CRUD interfaces, and orchestrates model exports.

### Adi Aiman Putra (ID: 2025226052)
**Frontend Developer**
Builds responsive layout structures, implements design tokens, wires interactive mapping views, and configures modern data visualization charts.

### Adam Bin Zabidi (ID: 2025419556)
**AI Developer Assistant**
Gathers regional OpenDOSM registries, formats raw data vectors, trains Random Forest modules, and establishes accuracy indicators.

---

## 4.0 Technical Infrastructure

| Technical Layer | Specification Standard | Operational Context |
| :--- | :--- | :--- |
| **Backend Architecture** | Python-based Server Framework | Executes administrative data pipelines, coordinates user role authentications, manages predictive modeling inference, and serves secure API configurations. |
| **Package Management** | uv Package Manager | Enforces deterministic lockfiles across the Python stack, offering lightning-fast virtual environment building and highly stable server builds. |
| **Frontend Tooling** | Vite Node-based Ecosystem | Powers high-performance Hot Module Replacement (HMR) asset compilations, serving polished client-side distribution interfaces. |
| **Database Core** | MySQL Server | Maintains physical relational storage tables mapped perfectly to OpenDOSM templates and crowdsourced incident logs. |
| **Machine Learning** | Random Forest Regressor | Trained using SciKit-Learn, managing time-series variables to project multi-tree threat percentages. |

---

## 5.0 Market & Commercialization Framework
The LETI Dashboard operates on a dedicated **B2B Enterprise SaaS** deployment topology tailored exclusively for government intelligence entities, national defense ministries, and tactical administrative bureaus like Bukit Aman (PDRM).

The platform maximizes utility by balancing a public-tier transparency portal with high-level authenticated infrastructure tiers. This design provides law enforcement leadership with automated model updates, granular administrative controls, and secure report validation pipelines under a long-term enterprise software support structure.

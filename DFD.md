# AthNexus DFDs (Data Flow Diagrams)

This document contains the Data Flow Diagrams defining the flow of information across the AthNexus platform, directly aligned with the official system architecture (React, Flask/FastAPI, Python/Scikit-learn, PostgreSQL).

## 1. Context Diagram (Level 0)
The Context Diagram provides the highest-level view of the entire system.

```mermaid
flowchart TD
    Athlete[/Athlete/]
    Admin[/Admin / Verifier/]
    
    System((AthNexus\nPlatform))
    
    Athlete -- "Authentication, Participation Requests, Explores Events" --> System
    System -- "Event Recommendations, Event Discovery UI" --> Athlete
    
    Admin -- "Manage Events, Manage Approvals, System Data" --> System
    System -- "Admin Dashboard UI, User/Event Records" --> Admin
```

---

## 2. Level 1 DFD (Major Modules & Processes)
The Level 1 diagram breaks the AthNexus platform down into its primary backend modules as outlined in the architecture diagram.

```mermaid
flowchart TD
    Athlete[/Athlete/]
    Admin[/Admin/]
    
    P1((1.0 Authentication))
    P2((2.0 Event\nManagement))
    P3((3.0 Participation\nHandler))
    P4((4.0 Recommendation\nAPI & ML Module))
    
    DB[(PostgreSQL Database\nUsers • Events • Participation • Results)]
    
    %% Interactions
    Athlete -- "Credentials" --> P1
    Admin -- "Credentials" --> P1
    P1 -- "Auth Token" --> Athlete
    P1 -- "Verify/Write User Data" --> DB
    
    Admin -- "Event details" --> P2
    P2 -- "Create/Update Events" --> DB
    DB -- "List of Events" --> P2
    Athlete -- "Fetch Discovery" --> P2
    
    Athlete -- "Participation Request" --> P3
    Admin -- "Approve Requests" --> P3
    P3 -- "Maintain Participation Status" --> DB
    
    Athlete -- "Request Recommendations" --> P4
    DB -- "Athlete & Event Data" --> P4
    P4 -- "Filtered/Ranked Recommendations" --> Athlete
```

---

## 3. Level 2 DFD (Focus: ML & Recommendations Subsystem 4.0)
The Level 2 diagram breaks down Process 4.0 into the specific Machine Learning components from the diagram.

```mermaid
flowchart TD
    Req[/From Frontend\nRecommendation API/]
    
    P41((4.1 Athlete\nFiltering))
    P42((4.2 Ranking\nSystem))
    P43((4.3 Recommendation\nEngine))
    
    DB[(PostgreSQL DB:\nUsers & Events Data)]
    
    Req -- "Trigger Rec Request (UserID)" --> P41
    DB -- "Raw User & Events Data" --> P41
    
    P41 -- "Filtered Candidate Events" --> P42
    
    P42 -- "Request Model Inference" --> P43
    P43 -- "Compute Scikit-learn\nMatching Algorithm" --> P42
    P42 -- "Ranked Candidate List" --> Req
```

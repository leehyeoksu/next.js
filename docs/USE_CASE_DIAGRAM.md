# Use Case Diagram

```mermaid
useCaseDiagram
    actor User as "User"
    actor SocialAuth as "Social Auth Provider\n(Google/Naver/Kakao)"
    actor AI as "AI Model\n(Ollama/OpenAI)"

    package "Refine AI System" {
        usecase "Login" as UC1
        usecase "Input Prompt" as UC2
        usecase "View Refined Prompt" as UC3
        usecase "Copy Result" as UC4
        usecase "View History" as UC5
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5

    UC1 ..> SocialAuth : "Authenticate"
    UC2 ..> AI : "Process Prompt"
```

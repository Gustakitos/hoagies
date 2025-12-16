# System Architecture

## Database Schema

```mermaid
erDiagram
    User ||--o{ Hoagie : "creates"
    User ||--o{ Comment : "writes"
    User ||--o{ Collaborator : "is"
    Hoagie ||--o{ Comment : "has"
    Hoagie ||--o{ Collaborator : "has"

    User {
        ObjectId _id
        string name
        string email
        string password
    }

    Hoagie {
        ObjectId _id
        string name
        string[] ingredients
        string pictureUrl
        ObjectId creator
        Collaborator[] collaborators
        Date createdAt
        Date updatedAt
    }

    Collaborator {
        ObjectId user
        string role
    }

    Comment {
        ObjectId _id
        string text
        ObjectId user
        ObjectId hoagie
        Date createdAt
    }
```

## System Architecture

```mermaid
graph TD
    Client["Mobile App (React Native)"]
    API[Backend API (NestJS)]
    DB[(MongoDB)]

    Client -->|HTTP / JSON| API
    API -->|Mongoose| DB

    subgraph "Backend Modules"
        Auth[Auth Module]
        Users[Users Module]
        Hoagies[Hoagies Module]
        Comments[Comments Module]
    end

    API --> Auth
    API --> Users
    API --> Hoagies
    API --> Comments
```

## Implementation Details

- **Backend Framework:** NestJS with Mongoose.
- **Frontend Framework:** React Native with Expo.
- **Authentication:** JWT (JSON Web Tokens).
- **Search:** Regex-based email search for users.
- **Collaboration:** Users can be added as collaborators to Hoagies.
- **Rate Limiting:** `ThrottlerModule` protects API endpoints.

# Dosteon Backend

This is the FastAPI backend server for the Dosteon project. It handles core authentication logic (including social logins and magic links), user profile management, inventory, and orders via the Supabase Python SDK.

## Prerequisites

- Python 3.9+
- [Virtualenv](https://virtualenv.pypa.io/en/latest/) (recommended)
- Access to a Supabase project

## Getting Started

1.  **Set up Virtual Environment**:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    source venv/bin/activate  # Linux/macOS
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `backend/` directory and add the following:
    ```env
    PROJECT_NAME="Dosteon API"
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    BACKEND_CORS_ORIGINS=["http://localhost:3000"]
    ```

4.  **Run in Development Mode**:
    ```bash
    .\venv\Scripts\Activate.ps1
    uvicorn app.main:app --reload
    ```
    The server will start on `http://localhost:8000`. You can access the Interactive API docs at `http://localhost:8000/docs`.

## Recent Updates

- **Modular Architecture**: Refactored to a domain-driven structure (api, core, models, repositories, schemas, services).
- **Enhanced Authentication**: 
    - Password complexity validation.
    - Social login integration (Google, Apple).
    - Magic link sign-in flow.
    - Secure password rest mechanism.
- **Service Layer**: Implemented a dedicated service layer for business logic separation.

## Features

- **Auth**: Fully integrated with Supabase Auth for secure user management.
- **Inventory**: Endpoints for managing restaurant/supplier stock.
- **Orders**: Core order processing and tracking.

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

# Getting Started with the Project


## Prerequisites

Before you begin, make sure you have the following installed:

* **Git:** For cloning the repository. You can download it from [https://git-scm.com/downloads](https://git-scm.com/downloads).
* **PostgreSQL:** For the project's database. You can download it from [https://www.postgresql.org/downloads/](https://www.postgresql.org/downloads/).

## Step 1: Clone the Repository

1.  Open your terminal or command prompt.
2.  Navigate to the directory where you want to clone the project.

    ```bash
    git clone  https://github.com/ihamani0/Key-Management-Redistribution.git
    ```


## Step 2: Configure the PostgreSQL Database

1.  **Access PostgreSQL:** Open your preferred PostgreSQL client (e.g., pgAdmin, DBeaver, or the `psql` command-line tool).
2.  **Create a Database:** If it doesn't already exist, create a new database for this project. You can name it something like `mydb`.
3.  **Configure Database Credentials:** You'll need to provide the database connection details to the project. Look for a configuration file often named `.env` in the project's root directory or within the backend folder.
4.  **Update the Configuration File:** Open the configuration file and modify the following database settings according to your PostgreSQL setup:

    ```
      DATABASE_NAME="mydb"
      DATABASE_USER="postgres"
      DATABASE_PASSWORD="xxxx"
    ```

    Replace the bracketed placeholders with your actual PostgreSQL credentials.

## Step 3: Running the Application

The steps to run the application might vary depending on whether you are starting the backend or the frontend. Refer to the specific README files within the `backend` and `frontend` folders for detailed instructions.

## Important: CORS Configuration

This project likely uses Cross-Origin Resource Sharing (CORS) to control which domains can access the backend. **If you change the default port the frontend server runs on, you will need to update the allowed CORS origins.**

1.  **Locate the CORS Configuration:** The CORS settings are usually found in the backend codebase. Look for files or configurations related to middleware or server setup. Common places include:
    * Within the main server setup file server.js`.

2.  **Update the Allowed Origins:** Find the section where the allowed origins are defined. You'll likely see a list of URLs or a pattern. If you change the backend server's port ;
    ```
    app.use(
        cors({
          origin: "http://localhost:5173",
          allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
          credentials: true,
        })
      );
    ```


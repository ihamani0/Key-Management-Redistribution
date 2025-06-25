# VectaraKMS: Web-based Key Management & Redistribution Platform for IoT

A full-stack platform for secure, scalable, and automated cryptographic key management in IoT networks.  
This project includes a React frontend, Node.js/Express backend, MQTT-based gateway, and device simulation, all orchestrated with Docker.

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (v13+ recommended)
- **Docker** & **Docker Compose**
- (Optional) **tmux** for advanced log viewing

---

## Folder Structure

```
Backend/      # Node.js/Express API server
frontend/     # React web dashboard
gateway/      # Gateway service (Node.js, MQTT)
device/       # Device simulation (Python)
mosquitto/    # MQTT broker config (Docker)
docker-compose.yml
run-iot.sh    # Helper script for logs
```

---

## 1. Clone the Repository

```sh
git clone <your-repo-url>
cd Key-Management-Redistribution
```

---

## 2. Configure Environment Variables

- Copy `.env.example` to `.env` in both `Backend/` and `frontend/` folders.
- Edit the `.env` files to match your local PostgreSQL and other settings.

Example for `Backend/.env`:
```
DATABASE_NAME=your_db_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
SECRET_JWT=your_jwt_secret
PORT=5000
```

---

## 3. Install Dependencies

### Backend

```sh
cd Backend
npm install
```

### Frontend

```sh
cd ../frontend
npm install
```

### Gateway

```sh
cd ../gateway
npm install
```

---

## 4. Set Up the Database

- Make sure PostgreSQL is running.
- Create the database manually if it doesn't exist:
  ```sh
  createdb -U <your_db_user> <your_db_name>
  ```
- Run migrations (if using Sequelize CLI or auto-migrate on server start).

---

## 5. Start the Services

You can use Docker Compose to start all services (backend, frontend, gateway, MQTT broker, devices):

```sh
cd ..
docker-compose up --build
```

This will:
- Start the PostgreSQL database
- Start the MQTT broker (Mosquitto)
- Start the backend API server
- Start the frontend React app
- Start the gateway and device containers

---

## 6. (Optional) View Logs with tmux

For advanced log viewing, use the provided script:

```sh
./run-iot.sh
```

This opens a `tmux` session with panes for gateway and device logs.

---

## 7. Access the Application

- **Frontend Dashboard:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Gateway API (optional):** http://localhost:3001/health

---

## 8. Development

- To run backend or frontend separately (for development with hot reload):

  **Backend:**
  ```sh
  cd Backend
  npm run dev
  ```

  **Frontend:**
  ```sh
  cd frontend
  npm run dev
  ```

---

## 9. Useful Scripts

- **Stop all containers:**  
  `docker-compose down`
- **Rebuild containers:**  
  `docker-compose up --build`
- **Kill tmux session:**  
  `tmux kill-session -t iot-logs`

---

## 10. Notes

- Make sure ports `5000`, `5173`, `1883`, and `3001` are free.
- For production, review security settings and environment variables.
- The project is in the conceptual/academic phase.

---

## License

MIT (or specify your license)

---

## Contact

For questions or collaboration, email: your-email@example.com

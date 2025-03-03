# Mini Goal Tracker

## Project Overview
Mini Goal Tracker is a full-stack web application that allows users to set custom timers for their goals, track their completion, and share proof of their achievements. Users can create goals, start timers, and upload proof in the form of photos, badges, or short text to a shared feed.

## Tech Stack
- **Backend**: Node.js with Express, PostgreSQL
- **Frontend**: React with TypeScript, styled with Tailwind CSS

## Features
- Users can create and manage goals with custom durations.
- Timer functionality that tracks user engagement through tab visibility.
- Users can upload proof of goal completion to a shared feed.
- Responsive design using Tailwind CSS.

## Project Structure
```
mini-goal-tracker
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── app.ts
│   │   ├── database.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── tailwind.css
│   │   └── types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── README.md
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- Docker (optional, for running with Docker Compose)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd mini-goal-tracker
   ```

2. Set up the backend:
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Install dependencies:
     ```
     npm install
     ```

3. Set up the frontend:
   - Navigate to the frontend directory:
     ```
     cd ../frontend
     ```
   - Install dependencies:
     ```
     npm install
     ```

### Running the Application
- To run the backend:
  ```
  cd backend
  npm start
  ```

- To run the frontend:
  ```
  cd frontend
  npm start
  ```

### Docker
To run the application using Docker, use the following command:
```
docker-compose up
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
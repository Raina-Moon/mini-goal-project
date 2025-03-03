# Mini Goal Tracker Backend

This is the backend service for the Mini Goal Tracker application. It is built using Node.js, Express, and PostgreSQL. The backend handles user goals and posts related to completed goals.

## Features

- **Goal Management**: Users can create, update, and retrieve their goals.
- **Post Management**: Users can upload proof of goal completion in the form of posts.
- **Database**: Utilizes PostgreSQL for data storage.

## Project Structure

```
backend
├── src
│   ├── controllers        # Contains controllers for handling requests
│   │   ├── goalController.ts
│   │   └── postController.ts
│   ├── models             # Contains data models
│   │   ├── goalModel.ts
│   │   └── postModel.ts
│   ├── routes             # Contains route definitions
│   │   ├── goalRoutes.ts
│   │   └── postRoutes.ts
│   ├── app.ts             # Entry point for the Express application
│   ├── database.ts        # Database connection setup
│   └── server.ts          # Starts the server
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd mini-goal-tracker/backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up the PostgreSQL database**:
   - Create a PostgreSQL database and update the connection details in `database.ts`.

4. **Run the application**:
   ```
   npm run start
   ```

## API Endpoints

- **Goals**
  - `POST /goals`: Create a new goal
  - `GET /goals`: Retrieve all goals
  - `PUT /goals/:id`: Update a specific goal

- **Posts**
  - `POST /posts`: Create a new post
  - `GET /posts`: Retrieve all posts

## License

This project is licensed under the MIT License. See the LICENSE file for details.
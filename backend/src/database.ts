import { Pool } from 'pg';

const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'mini_goal_tracker',
  password: 'your_db_password',
  port: 5432,
});

export default pool;
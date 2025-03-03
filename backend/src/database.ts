import { Client } from 'pg';

const client = new Client({
    user: 'your_username',
    host: 'localhost',
    database: 'mini_goal_tracker',
    password: 'your_password',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Connection error', err.stack));

export default client;
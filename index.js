const express = require('express');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 8080;

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'openbadges'
};

const connection = mysql.createConnection(dbConfig);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.json({ message: `Server is running on port ${port}`, 'DB info': dbConfig, 'NodeJS verion': process.version });
});

app.get('/db', (req, res) => {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MariaDB: ' + err);
      return res.json(err);
    }
    console.log('Connected to MariaDB');

    // Respond with a success message
    res.json({ message: 'Connected to MariaDB successfully' });
  });
});

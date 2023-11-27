const express = require('express');
const mysql = require('mysql');
const { getSecretValue } = require('./secretsManager');

const app = express();
const port = process.env.PORT || 8080;
let awsSecret;

(async () => {
    try {
        awsSecret = await getSecretValue();
    } catch (error) {
        console.error('Error fetching AWS Secret:', error);
        process.exit(1);
    }

    const secretObject = JSON.parse(awsSecret);
    const dbConfig = {
        host: process.env.host || secretObject.host,
        user: process.env.username || secretObject.username,
        password: process.env.password || secretObject.password,
        database: process.env.dbInstanceIdentifier || secretObject.dbInstanceIdentifier,
    };

    const pool = mysql.createPool(dbConfig);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    app.get('/', (req, res) => {
        res.json({ message: `Server is running on port ${port}`, 'DB info': dbConfig, 'NodeJS version': process.version });
    });

    app.get('/db', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection from pool: ' + err);
                return res.json(err);
            }
            console.log('Connected to MariaDB');
            connection.release();
            res.json({ message: 'Connected to MariaDB successfully' });
        });
    });
})();

const express = require('express');
const mysql = require('mysql');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const app = express();
const port = process.env.PORT || 8080;

const secretName = "your-secret-name";
;

const secretsManagerClient = new SecretsManagerClient({
  region: 'your-aws-region',
  credentials: {
    accessKeyId: 'your-access-key-id',
    secretAccessKey: 'your-secret-access-key'
  }
});

let dbConfig;

async function getDbConfig() {
  try {
    const response = await secretsManagerClient.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: "AWSCURRENT",
        })
    );

    dbConfig = JSON.parse(response.SecretString);

    console.log('Retrieved DB configuration from Secrets Manager');
    startServer();
  } catch (error) {
    console.error('Error retrieving DB configuration from Secrets Manager: ', error);
    process.exit(1); // Exit the application on failure
  }
}

function startServer() {
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbConfig.host,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    acquireTimeout: 10000,
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  app.get('/', (req, res) => {
    res.json({
      message: `Server is running on port ${port}`,
      'DB info': dbConfig,
      'NodeJS version': process.version
    });
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
}

getDbConfig();

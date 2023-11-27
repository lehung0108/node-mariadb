const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretArn = 'secretArn_secretkey';
const region = 'eu-west-2';
const secretsManagerClient = new SecretsManagerClient({ region: region });

async function getSecretValue() {
    try {
        const command = new GetSecretValueCommand({ SecretId: secretArn });
        const response = await secretsManagerClient.send(command);
        const secretValue = response.SecretString || Buffer.from(response.SecretBinary, 'base64');
        return secretValue;
    } catch (error) {
        console.error('Error retrieving secret:', error);
    }
}

module.exports = { getSecretValue };

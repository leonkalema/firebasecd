const admin = require('firebase-admin');

const settings = {
    "type": "service_account",
    "project_id": process.env.GATSBY_FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": "112271470323379256130",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-l7p34%40shaun-as-a-service.iam.gserviceaccount.com"
};

admin.initializeApp({
    credential: admin.credential.cert(settings),
    databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL
});

module.exports = admin;

const admin = require("firebase-admin");

const serviceAccount = require("./auth-app-service.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin
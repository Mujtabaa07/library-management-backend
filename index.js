// index.js
const app = require('./server');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;
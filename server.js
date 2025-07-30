const { app: { port } } = require('./src/configs/config.mongodb');
const app = require("./src/app");

const PORT = port;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log(`Server closed`);
    });
});
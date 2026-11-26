const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`ProTrack Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();



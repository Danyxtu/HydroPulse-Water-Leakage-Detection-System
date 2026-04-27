import 'dotenv/config'; // Load environment variables first
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './config/database.js';
import { connectMQTT, disconnectMQTT } from './config/mqtt.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api', routes);

// Base route for sanity check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HydroPulse API', status: 'Online' });
});

// --- Initialization Phase ---
const startServer = async () => {
  console.log('🚀 Starting HydroPulse Backend...\n');

  // 1. Initialize Database Connection
  await connectDB();

  // 2. Initialize MQTT Connection
  try {
    await connectMQTT();
  } catch (error) {
    console.error('⚠️ Could not connect to MQTT broker during startup.', error);
  }

  // 3. Start Express Server
  const server = app.listen(PORT, () => {
    console.log(`\n🌐 Server is running on http://localhost:${PORT}`);
  });

  // --- Graceful Shutdown Handler ---
  const gracefulShutdown = async () => {
    console.log('\n🛑 Received shutdown signal. Closing connections gracefully...');
    
    server.close(async () => {
      console.log('🌐 Express server closed.');
      disconnectMQTT();
      await disconnectDB();
      console.log('👋 Goodbye!');
      process.exit(0);
    });

    // Force close if it takes too long (e.g., 10 seconds)
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals (Ctrl+C, Docker stop)
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
};

// Start the application
startServer();

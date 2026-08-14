import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Allows all origins for local testing and easy setup
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Initialize Database Connection and Auto-Seeding
connectDB().then((success) => {
  if (success) {
    console.log('✅ Connected and auto-seeded MongoDB Atlas successfully.');
  } else {
    console.log('⚠️ Failed to connect to MongoDB. Please configure MONGODB_URI in .env file.');
  }
});

// Register api endpoints
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Smart EMS Standalone Backend API is live!');
});

app.listen(PORT, () => {
  console.log(`🚀 Standalone backend server listening on port ${PORT}`);
});

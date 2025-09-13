require('dotenv').config();
const connectDB = require('./config/db');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const plannerRoutes = require('./routes/planner.routes');
const catalogRoutes = require('./routes/catalog.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

connectDB(); // uses process.env.MONGODB_URI

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use(authRoutes);
app.use(plannerRoutes);
app.use(catalogRoutes);
app.use(usersRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
require('dotenv').config();
const connectDB = require('./config/db');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const plannerRoutes = require('./routes/planner.routes');
const catalogRoutes = require('./routes/catalog.routes');
const usersRoutes = require('./routes/users.routes');
const collectionRoutes = require('./routes/collection.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin, credentials: true }));

connectDB();

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use(authRoutes);
app.use(plannerRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/', catalogRoutes);
app.use(usersRoutes);
app.use(collectionRoutes);
app.use('/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
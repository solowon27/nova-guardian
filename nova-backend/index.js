const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const auth = require('./utils/auth');

const startServer = async () => {
  const app = express();

   // ✅ Enable CORS
  app.use(cors({
    origin: 'https://nova-guardian.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // ✅ Middleware to decode JWT and attach user
  app.use(auth);

  // ✅ Wait for MongoDB to connect FIRST
   try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB connected and responsive!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }

  app.get('/mongo-test', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findOne(); // Just try to read any
    res.json({ message: '✅ Mongo query worked', user });
  } catch (err) {
    console.error('❌ /mongo-test error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


  // ✅ Apollo Server setup AFTER MongoDB is ready
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      req,
      user: req.user,
      introspection: true,
    }),
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.get('/', (req, res) => res.send('✅ NovaGuardian backend running.'));

  const PORT = process.env.PORT;
  if (!PORT) throw new Error('❌ PORT is not defined');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NovaGuardian Backend live at http://localhost:${PORT}/graphql`);
  });
};

startServer().catch(err => console.error('❌ Server startup failed:', err));
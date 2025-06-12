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
      serverSelectionTimeoutMS: 30000, // ⏱ timeout after 10s
    });
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Don't start the server if DB isn't connected
  }

  // ✅ Apollo Server setup AFTER MongoDB is ready
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      req,
      user: req.user,
    }),
    cache: 'bounded' 
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // ✅ Start Express Server
  const PORT = process.env.PORT;
  if(!PORT) {
     throw new Error('❌ PORT not defined! Render needs it to bind correctly.');
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NovaGuardian Backend at http://localhost:${PORT}/graphql`);
  });
};

startServer().catch(err => console.error('❌ Server startup failed:', err));

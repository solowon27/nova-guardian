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
    origin: 'https://nova-guardian.vercel.app/',
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // ✅ Middleware to decode JWT and attach user
  app.use(auth);

  // ✅ Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      req,
      user: req.user,
    }),
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // ✅ MongoDB Connection
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

  // ✅ Start Express Server
  const PORT = 4000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NovaGuardian Backend at http://localhost:${PORT}/graphql`);
  });
};

startServer().catch(err => console.error(err));

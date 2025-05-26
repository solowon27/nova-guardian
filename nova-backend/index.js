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

  // ✅ CORS goes right here
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(auth);

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

  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

    const PORT = 4000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 NovaGuardian Backend at http://localhost:${PORT}/graphql`);
    });
  }

  startServer().catch(err => console.error(err));

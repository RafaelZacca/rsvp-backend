import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';
import dotenv from 'dotenv';
import authRouter from './auth';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(authRouter);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');

    if (!token) return {};

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!);
      return { user };
    } catch {
      return {}; // invalid token, no user
    }
  },
});

async function start() {
  await server.start();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 GraphQL ready at http://localhost:4000/graphql`)
  );
}

start();

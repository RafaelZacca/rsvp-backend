import { gql } from 'apollo-server';

export const userTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    password: String
    external_id: String
  }

  type Query {
    users: [User!]!
  }

  type Mutation {
    createUser(username: String!, email: String, password: String, external_id: String): User!
    updateUser(
      id: ID!
      username: String
      email: String
      password: String
      external_id: String
    ): User
    deleteUser(id: ID!): User
  }
`;

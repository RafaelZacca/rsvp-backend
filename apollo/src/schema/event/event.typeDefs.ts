import { gql } from 'apollo-server';

export const eventTypeDefs = gql`
  type Event {
    id: ID!
    title: String!
    description: String
    date: String!
    location: String
  }

  type Query {
    events: [Event!]!
  }

  type Mutation {
    createEvent(title: String!, description: String, date: String!, location: String): Event!

    updateEvent(id: ID!, title: String, description: String, date: String, location: String): Event

    deleteEvent(id: ID!): Event
  }
`;

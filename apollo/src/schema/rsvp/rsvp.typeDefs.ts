import { gql } from 'apollo-server';

export const rsvpTypeDefs = gql`
  type rsvp {
    id: ID!
    user_id: ID!
    event_id: ID!
    status: String!
  }

  type Query {
    rsvps: [rsvp!]!
  }

  type Mutation {
    createRsvp(user_id: ID!, event_id: ID!, status: String!): rsvp!
    updateRsvp(id: ID!, status: String!): rsvp
    deleteRsvp(id: ID!): rsvp
  }
`;

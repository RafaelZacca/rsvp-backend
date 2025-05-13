import { eventTypeDefs } from './event/event.typeDefs';
import { eventResolvers } from './event/event.resolvers';
import { userResolvers } from './user/user.resolvers';
import { rsvpResolvers } from './rsvp/rsvp.resolvers';
import { userTypeDefs } from './user/user.typeDefs';
import { rsvpTypeDefs } from './rsvp/rsvp.typeDefs';

import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';

const baseTypeDefs = `
  type Query {
    _empty: String
  }
`;

export const typeDefs = mergeTypeDefs([baseTypeDefs, eventTypeDefs, userTypeDefs, rsvpTypeDefs]);
export const resolvers = mergeResolvers([eventResolvers, userResolvers, rsvpResolvers]);

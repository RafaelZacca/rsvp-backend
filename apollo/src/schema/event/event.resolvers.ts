import { AuthenticationError } from 'apollo-server';
import fetch from 'cross-fetch';

export const eventResolvers = {
  Query: {
    events: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            query {
              events {
                id
                title
                description
                date
                location
              }
            }
          `,
        }),
      });

      const json = await res.json();

      if (!json.data || !json.data.events) {
        console.error('Hasura response error:', JSON.stringify(json, null, 2));
        throw new Error('Failed to fetch events');
      }

      return json.data.events;
    },
  },

  Mutation: {
    createEvent: async (
      _: any,
      args: {
        title: string;
        description?: string;
        date: string;
        location?: string;
      },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const creator_id = context.user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id'];
      if (!creator_id) throw new AuthenticationError('User ID missing in JWT');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation CreateEvent($title: String!, $description: String, $date: timestamptz!, $location: String, $creator_id: uuid!) {
              insert_events_one(object: {
                title: $title,
                description: $description,
                date: $date,
                location: $location,
                creator_id: $creator_id
              }) {
                id
                title
                description
                date
                location
              }
            }
          `,
          variables: {
            ...args,
            creator_id,
          },
        }),
      });

      const { data } = await res.json();
      return data.insert_events_one;
    },

    updateEvent: async (
      _: any,
      args: { id: string; title?: string; description?: string; date?: string; location?: string },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const { id, ..._set } = args;

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateEvent($id: uuid!, $_set: events_set_input!) {
              update_events_by_pk(pk_columns: { id: $id }, _set: $_set) {
                id
                title
                description
                date
                location
              }
            }
          `,
          variables: { id, _set },
        }),
      });

      const { data } = await res.json();
      return data.update_events_by_pk;
    },

    deleteEvent: async (_: any, args: { id: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteEvent($id: uuid!) {
              delete_events_by_pk(id: $id) {
                id
                title
              }
            }
          `,
          variables: { id: args.id },
        }),
      });

      const { data } = await res.json();
      return data.delete_events_by_pk;
    },
  },
};

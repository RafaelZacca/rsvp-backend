import { AuthenticationError } from 'apollo-server';
import fetch from 'cross-fetch';

export const rsvpResolvers = {
  Query: {
    rsvps: async (_: any, __: any, context: any) => {
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
              rsvps {
                id
                user_id
                event_id
                status
              }
            }
          `,
        }),
      });

      const json = await res.json();

      if (!json.data || !json.data.rsvps) {
        console.error('Hasura response error:', JSON.stringify(json, null, 2));
        throw new Error('Failed to fetch rsvps');
      }

      return json.data.rsvps;
    },
  },

  Mutation: {
    createRsvp: async (
      _: any,
      args: { user_id: string; event_id: string; status: string },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation CreateRsvp($user_id: uuid!, $event_id: uuid!, $status: String!) {
              insert_rsvps_one(object: {
                user_id: $user_id,
                event_id: $event_id,
                status: $status
              }) {
                id
                user_id
                event_id
                status
              }
            }
          `,
          variables: args,
        }),
      });

      const { data } = await res.json();
      return data.insert_rsvps_one;
    },

    updateRsvp: async (_: any, args: { id: string; status: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateRsvp($id: uuid!, $status: String!) {
              update_rsvps_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
                id
                user_id
                event_id
                status
              }
            }
          `,
          variables: args,
        }),
      });

      const { data } = await res.json();
      return data.update_rsvps_by_pk;
    },

    deleteRsvp: async (_: any, args: { id: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteRsvp($id: uuid!) {
              delete_rsvps_by_pk(id: $id) {
                id
                user_id
                event_id
                status
              }
            }
          `,
          variables: { id: args.id },
        }),
      });

      const { data } = await res.json();
      return data.delete_rsvps_by_pk;
    },
  },
};

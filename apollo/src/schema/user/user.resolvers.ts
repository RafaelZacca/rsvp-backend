import { AuthenticationError } from 'apollo-server';
import fetch from 'cross-fetch';

// Exporting this exceptionally because we will reuse this on the OAuth flow.
export const createUser = async (
  _: any,
  args: { username: string; email?: string; password?: string; external_id?: string }
) => {
  const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
    body: JSON.stringify({
      query: `
        mutation CreateUser($username: String!, $email: String, $password: String, $external_id: String) {
          insert_users_one(object: {
            username: $username,
            email: $email,
            password: $password,
            external_id: $external_id
          }) {
            id
            username
            email
            password
            external_id
          }
        }
      `,
      variables: args,
    }),
  });

  const { data } = await res.json();
  return data.insert_users_one;
};

export const userResolvers = {
  Query: {
    users: async (_: any, __: any, context: any) => {
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
              users {
                id
                username
                email
                external_id
                password
              }
            }
          `,
        }),
      });

      const json = await res.json();

      if (!json.data || !json.data.users) {
        console.error('Hasura response error:', JSON.stringify(json, null, 2));
        throw new Error('Failed to fetch users');
      }

      return json.data.users;
    },
  },

  Mutation: {
    createUser,
    updateUser: async (
      _: any,
      args: {
        id: string;
        username?: string;
        email?: string;
        password?: string;
        external_id?: string;
      },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const { id, ...fieldsToUpdate } = args;

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($id: uuid!, $_set: users_set_input!) {
              update_users_by_pk(pk_columns: { id: $id }, _set: $_set) {
                id
                username
                email
                external_id
              }
            }
          `,
          variables: {
            id,
            _set: fieldsToUpdate,
          },
        }),
      });

      const { data } = await res.json();
      return data.update_users_by_pk;
    },

    deleteUser: async (_: any, args: { id: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');

      const res = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteUser($id: uuid!) {
              delete_users_by_pk(id: $id) {
                id
                username
                email
              }
            }
          `,
          variables: {
            id: args.id,
          },
        }),
      });

      const { data } = await res.json();
      return data.delete_users_by_pk;
    },
  },
};

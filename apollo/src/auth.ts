import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser } from './schema/user/user.resolvers';

dotenv.config();

const router = Router();

router.get('/auth/microsoft', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    response_mode: 'query',
    scope: 'openid profile email User.Read',
  });

  res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
});

router.get('/auth/microsoft/callback', async (req, res) => {
  const code = req.query.code as string;

  const tokenRes = await axios.post(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      code,
      grant_type: 'authorization_code',
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  const accessToken = tokenRes.data.access_token;

  const userRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const msUser = userRes.data;

  const fetchRes = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
    body: JSON.stringify({
      query: `
      query GetUserByExternalId($external_id: String!) {
        users(where: { external_id: { _eq: $external_id } }) {
          id
        }
      }
    `,
      variables: {
        external_id: msUser.id,
      },
    }),
  });

  const userResult = await fetchRes.json();
  let user = userResult.data?.users?.[0];

  if (!user) {
    user = await createUser(null, {
      username: msUser.displayName || msUser.userPrincipalName,
      email: msUser.mail || msUser.userPrincipalName,
      external_id: msUser.id,
    });
  }

  const customJwt = jwt.sign(
    {
      sub: user.id,
      email: user.email || user.username,
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': user.id,
      },
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  res.json({ token: customJwt });
});

export default router;

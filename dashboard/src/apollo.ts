import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { jwtDecode } from 'jwt-decode';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export interface DecodedToken {
  sub: string; // email
  role: string;
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const getRoleFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
};
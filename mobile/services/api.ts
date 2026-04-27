import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';

// Android emulator: use 10.0.2.2 (maps to host machine's localhost)
// iOS simulator / web: use localhost
const API_URL = 'http://10.0.2.2:8080/graphql';

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error fetching auth token:', error);
    return { headers };
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
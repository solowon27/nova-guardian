'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import client from '@/graphql/apollo-client';

export default function ApolloWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

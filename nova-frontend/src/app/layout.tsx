// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ApolloWrapper from '@/components/ApolloWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

console.log('🛰️ API Target:', process.env.NEXT_PUBLIC_API_URL);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
        <ApolloWrapper>
          <Header />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

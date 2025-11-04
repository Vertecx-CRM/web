'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { AuthProvider } from '@/features/auth/authcontext';
import { CartProvider } from '@/features/landing/contexts/CartContext';
import { LoaderProvider } from '@/shared/components/loader';
import { ToastContainer } from 'react-toastify';

export default function AppProviders({ children }: { children: ReactNode }) {
  const qc = getQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <ToastContainer position="bottom-right" />
      <AuthProvider>
        <LoaderProvider>
          <CartProvider>{children}</CartProvider>
        </LoaderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

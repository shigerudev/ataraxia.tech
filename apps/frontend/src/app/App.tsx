import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/login';
import { AppRouter } from './providers/router';
import './styles/global.css';

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionBootstrap>
          <AppRouter />
        </SessionBootstrap>
      </AuthProvider>
    </BrowserRouter>
  );
}

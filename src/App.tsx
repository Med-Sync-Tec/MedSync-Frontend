import { useEffect } from 'react';
import { BrowserRouter, useRoutes, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@lib/theme';
import { queryClient, setUnauthorizedHandler } from '@lib/query';
import { useAuthStore } from '@features/auth/store';
import { routes } from '@routes/index';

const AppRoutes = () => useRoutes(routes);

const UnauthorizedRedirect = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout().finally(() => navigate('/', { replace: true }));
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <UnauthorizedRedirect />
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;

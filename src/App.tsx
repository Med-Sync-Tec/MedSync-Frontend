import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@lib/theme';
import { routes } from '@routes/index';

const AppRoutes = () => useRoutes(routes);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

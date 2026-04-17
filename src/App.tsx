import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Futuras rutas: /doctor/dashboard, /coo/dashboard */}
      </Routes>
    </Router>
  );
}

export default App;

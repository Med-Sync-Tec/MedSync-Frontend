import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { ConsultationHistory } from './pages/Medical_record/ConsultationHistory';
import { NewSOAPEntry } from './pages/Medical_record/NewSOAPEntry';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/medical-record/history" element={<ConsultationHistory />} />
        <Route path="/medical-record/new-soap" element={<NewSOAPEntry />} />
        {/* Futuras rutas: /doctor/dashboard, /coo/dashboard */}
      </Routes>
    </Router>
  );
}

export default App;

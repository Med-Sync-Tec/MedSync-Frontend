import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { ConsultationHistory } from './pages/Patients/Medical_record/ConsultationHistory';
import { NewSOAPEntry } from './pages/Patients/Medical_record/NewSOAPEntry';
import { PatientList } from './pages/Patients/PatientList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/medical-record/history" element={<ConsultationHistory />} />
        <Route path="/medical-record/new-soap" element={<NewSOAPEntry />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        {/* Futuras rutas: /doctor/dashboard, /coo/dashboard */}
      </Routes>
    </Router>
  );
}

export default App;

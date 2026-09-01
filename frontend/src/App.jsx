import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientView from './pages/ClientView';
import AdminView from './pages/AdminView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-amber-50 text-neutral-900 font-sans selection:bg-orange-500/30">
        <Routes>
          <Route path="/" element={<ClientView />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

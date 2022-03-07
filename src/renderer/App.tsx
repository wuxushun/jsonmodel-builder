import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import 'antd/dist/antd.css';
import './App.css';
import Main from './windows/main';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}

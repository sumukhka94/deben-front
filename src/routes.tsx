import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GroupPage from './components/GroupPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/group/:id" element={<GroupPage />} />
    </Routes>
  );
}

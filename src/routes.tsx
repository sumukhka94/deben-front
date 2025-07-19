import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import GroupPage from './components/GroupPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/group/:id" element={<GroupPage />} />
    </Routes>
  );
}

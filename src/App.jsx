import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/homepage';
import StocksPage from './pages/stocks';
import Login from './components/Login';
import Signup from './components/SignUp';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/stocks"
          element={
            <ProtectedRoute>
              <StocksPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
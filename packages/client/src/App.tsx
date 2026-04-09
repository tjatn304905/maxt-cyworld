import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MiniHompyLayout from './components/layout/MiniHompyLayout'
import ProtectedRoute from './features/auth/ProtectedRoute'
import LoginPage from './features/auth/LoginPage'
import SignupPage from './features/auth/SignupPage'
import HomePage from './features/home/HomePage'
import DiaryPage from './features/diary/DiaryPage'
import PhotoPage from './features/photo/PhotoPage'
import BoardPage from './features/board/BoardPage'
import MiniroomPage from './features/miniroom/MiniroomPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected mini-hompy routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MiniHompyLayout />}>
            <Route index element={<HomePage />} />
            <Route path="diary" element={<DiaryPage />} />
            <Route path="photo" element={<PhotoPage />} />
            <Route path="board" element={<BoardPage />} />
            <Route path="miniroom" element={<MiniroomPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

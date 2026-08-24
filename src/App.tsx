import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BorrowingDetailPage from './pages/BorrowingDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/borrowing" element={<BorrowingDetailPage />} />
        <Route path="/borrowing/:id" element={<BorrowingDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

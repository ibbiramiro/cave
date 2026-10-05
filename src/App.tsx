import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import LoginPage from './pages/LoginPage';
import BorrowingDetailPage from './pages/BorrowingDetailPage';
import SchedulesPage from './pages/SchedulesPage';
import RoomBookingPage from './pages/RoomBookingPage';
import OnlineBookingPage from './pages/OnlineBookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ITFormPage from './pages/ITFormPage';
import ITFormSuccessPage from './pages/ITFormSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/borrowing" element={<BorrowingDetailPage />} />
            <Route path="/borrowing/:id" element={<BorrowingDetailPage />} />
            <Route path="/room-booking" element={<RoomBookingPage />} />
            <Route path="/online-booking" element={<OnlineBookingPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/it-form" element={<ITFormPage />} />
            <Route path="/it-form-success" element={<ITFormSuccessPage />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

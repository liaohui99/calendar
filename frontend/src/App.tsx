// React 17+ 不再需要显式导入 React
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DeviceReservationPage from './pages/DeviceReservationPage';
// 临时导入占位符，后续创建实际组件后更新
import ReservationListPage from './pages/ReservationListPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<DeviceReservationPage />} />
          <Route path="/reservations" element={<ReservationListPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

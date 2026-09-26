import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Receipts from './pages/Receipts/Receipts';
import Deliveries from './pages/Deliveries/Deliveries';
import Transfers from './pages/Transfers/Transfers';
import Adjustments from './pages/Adjustments/Adjustments';
import MoveHistory from './pages/MoveHistory/MoveHistory';
import Warehouses from './pages/Warehouses/Warehouses';
import ReorderRules from './pages/ReorderRules/ReorderRules';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

// Protected layout with Navigation Header
const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public & Application Shell Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Authenticated Module Routes with Navbar Layout */}
        <Route element={<MainLayout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/adjustments" element={<Adjustments />} />
          <Route path="/move-history" element={<MoveHistory />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/reorder-rules" element={<ReorderRules />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

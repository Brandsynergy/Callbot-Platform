import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import CallLogs from './CallLogs';
import BotSettings from './BotSettings';
import Analytics from './Analytics';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/calls" element={<CallLogs />} />
        <Route path="/settings" element={<BotSettings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  );
}

export default App;

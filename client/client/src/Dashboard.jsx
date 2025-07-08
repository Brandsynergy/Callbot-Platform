import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  Settings,
  BarChart3,
  FileText,
  Bot,
  Menu,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgCallDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const NavigationItem = ({ to, icon: Icon, title, description }) => (
    <Link
      to={to}
      className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900

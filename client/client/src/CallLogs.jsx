import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Clock, 
  Search, 
  Filter,
  Download,
  Play,
  MessageSquare,
  Calendar,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed
} from 'lucide-react';

const CallLogs = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/calls');
      const data = await response.json();
      setCalls(data);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCallIcon = (status) => {
    switch (status) {
      case 'answered': return <PhoneIncoming className="w-4 h-4 text-green-600" />;
      case 'missed': return <PhoneMissed className="w-4 h-4 text-red-600" />;
      case 'busy': return <PhoneCall className="w-4 h-4 text-yellow-600" />;
      default: return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.caller_number?.includes(searchTerm) || 
                         call.transcript?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCalls = filteredCalls.length;
  const answeredCalls = filteredCalls.filter(c => c.status === 'answered').length;
  const avgDuration = filteredCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Call Logs</h1>
            </div>
            <button className="btn-primary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <Phone className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold">{totalCalls}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <PhoneIncoming className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Answered</p>
                <p className="text-2xl font-bold">{answeredCalls}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(Math.round(avgDuration))}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">With Transcript</p>
                <p className="text-2xl font-bold">
                  {filteredCalls.filter(c => c.transcript).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Calls</option>
                <option value="answered">Answered</option>
                <option value="missed">Missed</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calls Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transcript
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {call.caller_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCallIcon(call.status)}
                        <span className={`ml-2 text-sm capitalize ${
                          call.status === 'answered' ? 'text-green-600' :
                          call.status === 'missed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDuration(call.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(call.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(call.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {call.transcript ? (
                          <p className="text-sm text-gray-600 truncate">
                            {call.transcript}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400">No transcript</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {call.transcript && (
                          <button
                            onClick={() => setSelectedCall(call)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        {call.recording_url && (
                          <button className="text-green-600 hover:text-green-900">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Call Transcript</h2>
              <button 
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Caller:</span> {selectedCall.caller_number}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {formatDuration(selectedCall.duration)}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(selectedCall.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className="ml-1 capitalize">{selectedCall.status}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Customer Said:</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm">{selectedCall.transcript || 'No transcript available'}</p>
                </div>
              </div>
              
              {selectedCall.ai_response && (
                <div>
                  <h3 className="font-medium mb-2">AI Response:</h3>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedCall.ai_response}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setSelectedCall(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogs;

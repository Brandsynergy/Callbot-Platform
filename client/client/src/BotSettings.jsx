import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit, 
  Trash2,
  MessageSquare,
  Bot,
  Settings,
  HelpCircle,
  Volume2,
  Clock,
  Phone
} from 'lucide-react';

const BotSettings = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
  const [botSettings, setBotSettings] = useState({
    welcomeMessage: 'Hello! Welcome to our business. How can I help you today?',
    voice: 'alice',
    language: 'en-US',
    responseTimeout: 5,
    maxCallDuration: 300,
    businessHours: {
      enabled: true,
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    }
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFaq ? `/api/faqs/${editingFaq.id}` : '/api/faqs';
      const method = editingFaq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqForm)
      });
      
      if (response.ok) {
        fetchFaqs();
        resetFaqForm();
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const deleteFaq = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const response = await fetch(`/api/faqs/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchFaqs();
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const resetFaqForm = () => {
    setFaqForm({ question: '', answer: '' });
    setEditingFaq(null);
    setShowAddFaq(false);
  };

  const startEditFaq = (faq) => {
    setFaqForm({ question: faq.question, answer: faq.answer });
    setEditingFaq(faq);
    setShowAddFaq(true);
  };

  const handleSettingsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBotSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBotSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const saveSettings = async () => {
    try {
      // In a real app, you'd save these to your backend
      console.log('Saving settings:', botSettings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

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
              <h1 className="text-xl font-bold text-gray-900">Bot Settings</h1>
            </div>
            <button onClick={saveSettings} className="btn-primary flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bot Configuration */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <Bot className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-lg font-semibold">Bot Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Welcome Message</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={botSettings.welcomeMessage}
                    onChange={(e) => handleSettingsChange('welcomeMessage', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Voice</label>
                    <select
                      className="input-field"
                      value={botSettings.voice}
                      onChange={(e) => handleSettingsChange('voice', e.target.value)}
                    >
                      <option value="alice">Alice (Female)</option>
                      <option value="man">Man (Male)</option>
                      <option value="woman">Woman (Female)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Language</label>
                    <select
                      className="input-field"
                      value={botSettings.language}
                      onChange={(e) => handleSettingsChange('language', e.target.value)}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Response Timeout (seconds)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={botSettings.responseTimeout}
                      onChange={(e) => handleSettingsChange('responseTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Max Call Duration (seconds)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={botSettings.maxCallDuration}
                      onChange={(e) => handleSettingsChange('maxCallDuration', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-lg font-semibold">Business Hours</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="businessHours"
                    checked={botSettings.businessHours.enabled}
                    onChange={(e) => handleSettingsChange('businessHours.enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="businessHours" className="text-sm text-gray-700">
                    Enable business hours restrictions
                  </label>
                </div>
                
                {botSettings.businessHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="input-field"
                        value={botSettings.businessHours.start}
                        onChange={(e) => handleSettingsChange('businessHours.start', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        className="input-field"
                        value={botSettings.businessHours.end}
                        onChange={(e) => handleSettingsChange('businessHours.end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Management */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <HelpCircle className="w-6 h-6 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">FAQ Management</h2>
                </div>
                <button
                  onClick={() => setShowAddFaq(true)}
                  className="btn-primary flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add FAQ
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditFaq(faq)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
                
                {faqs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No FAQs added yet</p>
                    <p className="text-sm">Add some frequently asked questions to help your bot respond better</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit FAQ Modal */}
      {showAddFaq && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button onClick={resetFaqForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="form-label">Question</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                  placeholder="What question might customers ask?"
                />
              </div>
              
              <div>
                <label className="form-label">Answer</label>
                <textarea
                  required
                  className="input-field"
                  rows="4"
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                  placeholder="How should the bot respond?"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingFaq ? 'Update' : 'Add'} FAQ
                </button>
                <button type="button" onClick={resetFaqForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotSettings;

/**
 * ADMIN DASHBOARD
 * 
 * Features:
 * - View system statistics
 * - Create new organizers (club heads)
 * - View all organizers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);//use state allows a fixed way to change the varaible and after upating it automatically changes ui accordingly
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create organizer form state
  const [formData, setFormData] = useState({
    loginEmail: '',
    organizerName: '',
    category: 'Technical',
    description: '',
    contactEmail: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();//it fetches the data from backend once noteverytime the component re-renders. 
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch system stats
      const statsResponse = await adminAPI.getSystemStats();
      setStats(statsResponse.data.stats);

      // Fetch all organizers
      const organizersResponse = await adminAPI.getAllOrganizers();
      setOrganizers(organizersResponse.data.organizers || []);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminAPI.createOrganizer(formData);
      setSuccess(`✅ Organizer created successfully! Password: ${response.data.organizer.password}`);
      
      // Reset form
      setFormData({
        loginEmail: '',
        organizerName: '',
        category: 'Technical',
        description: '',
        contactEmail: '',
      });

      // Refresh organizers list
      fetchDashboardData();
      
      // Keep form open so admin can copy password
      // User can manually close by clicking "Cancel" button
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organizer');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#666' }}>Manage organizers and view system statistics</p>
      </div>

      {/* System Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>{stats.totalEvents || 0}</div>
            <div style={{ color: '#666', marginTop: '5px' }}>Total Events</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.totalParticipants || 0}</div>
            <div style={{ color: '#666', marginTop: '5px' }}>Total Participants</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalOrganizers || 0}</div>
            <div style={{ color: '#666', marginTop: '5px' }}>Total Organizers</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{stats.totalRegistrations || 0}</div>
            <div style={{ color: '#666', marginTop: '5px' }}>Total Registrations</div>
          </div>
        </div>
      )}

      {/* Create Organizer Button */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: '#4f46e5',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Create New Organizer (Club Head)'}
        </button>
      </div>

      {/* Create Organizer Form */}
      {showCreateForm && (
        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '40px' }}>
          <h2>Create New Organizer</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Create a new club head/organizer who can create and manage events
          </p>

          {error && <div style={{ background: '#fee', padding: '15px', borderRadius: '6px', color: '#c00', marginBottom: '20px' }}>{error}</div>}
          {success && (
            <div style={{ background: '#d1fae5', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #10b981' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '10px' }}>
                ✅ Organizer Created Successfully!
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>📧 Login Email:</div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#4f46e5', marginBottom: '15px', userSelect: 'all' }}>
                  {formData.loginEmail}
                </div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>🔑 Password (copy this now):</div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#dc2626', fontWeight: 'bold', userSelect: 'all', padding: '10px', background: '#fef2f2', borderRadius: '4px' }}>
                  {success.split('Password: ')[1]}
                </div>
              </div>
              <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '6px', fontSize: '14px', color: '#856404' }}>
                ⚠️ <strong>Important:</strong> Save this password now! You won't see it again. Give these credentials to the club head.
              </div>
            </div>
          )}

          <form onSubmit={handleCreateOrganizer}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Login Email *</label>
              <input
                type="email"
                name="loginEmail"
                value={formData.loginEmail}
                onChange={handleInputChange}
                required
                placeholder="organizer@felicity.iiit.ac.in"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
              <small style={{ color: '#666' }}>This will be used to login</small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Club/Team Name *</label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                required
                placeholder="E-Cell, TechTeam, Chess Club, etc."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Brief description of the club/team"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Public contact email"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '6px',
                cursor: creating ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {creating ? 'Creating...' : 'Create Organizer'}
            </button>
          </form>
        </div>
      )}

      {/* Organizers List */}
      <div>
        <h2>Existing Organizers ({organizers.length})</h2>
        {organizers.length === 0 ? (
          <p style={{ color: '#666', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            No organizers yet. Create the first one using the button above!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {organizers.map((org) => (
              <div key={org._id} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{org.organizerName}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      👤 {org.firstName} {org.lastName}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      📧 {org.email}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <span style={{ background: '#e0e7ff', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: '500' }}>
                        {org.category}
                      </span>
                    </p>
                    <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
                      {org.organizerDescription}
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {org.isActive ? '✅ Active' : '❌ Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

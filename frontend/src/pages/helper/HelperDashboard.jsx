import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { matchAPI } from '../../services/api';

export default function HelperDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('notified');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const response = user.user_type === 'volunteer'
        ? await matchAPI.getVolunteerMatches(user.user_id, filter)
        : await matchAPI.getOrganizationMatches(user.user_id, filter);
      
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      await matchAPI.accept(matchId);
      fetchMatches(); // Refresh
    } catch (error) {
      console.error('Error accepting match:', error);
      alert(error.response?.data?.detail || 'Failed to accept match');
    }
  };

  const handleDecline = async (matchId) => {
    try {
      await matchAPI.decline(matchId);
      fetchMatches(); // Refresh
    } catch (error) {
      console.error('Error declining match:', error);
      alert(error.response?.data?.detail || 'Failed to decline match');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {user.user_type === 'volunteer' ? '🙋 Volunteer' : '🏢 Organization'} Dashboard
              </h1>
              <p className="text-slate-600">Welcome back, {user.name}!</p>
            </div>
            <button onClick={logout} className="btn-ghost">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('notified')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'notified'
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            New Requests
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'accepted'
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setFilter('declined')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'declined'
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Declined
          </button>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading requests...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-500 text-lg">
              {filter === 'notified' && 'No new requests at the moment.'}
              {filter === 'accepted' && 'You haven\'t accepted any requests yet.'}
              {filter === 'declined' && 'You haven\'t declined any requests yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={handleAccept}
                onDecline={handleDecline}
                userType={user.user_type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, onAccept, onDecline, userType }) {
  const request = match.request;

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    };
    return badges[urgency] || 'badge-medium';
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={getUrgencyBadge(request.urgency)}>
              {request.urgency} urgency
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {formatCategory(request.category)}
            </span>
            {userType === 'volunteer' && match.distance_miles && (
              <span className="text-xs text-slate-500 bg-blue-100 px-2 py-0.5 rounded-full">
                📍 {match.distance_miles} miles away
              </span>
            )}
          </div>
          
          <p className="text-slate-700 text-lg mb-2">{request.description}</p>
          
          {request.address && (
            <p className="text-sm text-slate-500">📍 {request.address}</p>
          )}
          
          <p className="text-xs text-slate-400 mt-2">
            Requested {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Contact Info (only show if accepted) */}
      {match.status === 'accepted' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">Contact Information:</h4>
          <p className="text-sm text-green-700">
            <strong>Name:</strong> {request.requester_name}
          </p>
          <p className="text-sm text-green-700">
            <strong>Email:</strong> {request.requester_email}
          </p>
          {request.requester_phone && (
            <p className="text-sm text-green-700">
              <strong>Phone:</strong> {request.requester_phone}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {match.status === 'notified' && (
        <div className="flex gap-3">
          <button
            onClick={() => onAccept(match.id)}
            className="btn-primary flex-1"
          >
            ✓ Accept Request
          </button>
          <button
            onClick={() => onDecline(match.id)}
            className="btn-outline flex-1"
          >
            ✗ Decline
          </button>
        </div>
      )}

      {match.status === 'accepted' && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center font-medium">
          ✓ You accepted this request
        </div>
      )}

      {match.status === 'declined' && (
        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-center">
          You declined this request
        </div>
      )}
    </div>
  );
}
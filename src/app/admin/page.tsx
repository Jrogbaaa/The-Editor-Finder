'use client';

import { useState, useEffect } from 'react';
import { SyncResult } from '@/lib/data-sync';

interface SyncStatus {
  source: string;
  status: string;
  lastSync?: Date;
}

const AdminDashboard = () => {
  const [syncResults, setSyncResults] = useState<{ [key: string]: SyncResult }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      
      if (data.success) {
        // Initialize status for each source
        const sources = data.data.availableSources;
        const statusPromises = sources.map(async (source: string) => {
          const statusResponse = await fetch(`/api/sync?source=${source}`);
          const statusData = await statusResponse.json();
          return statusData.data;
        });
        
        const statuses = await Promise.all(statusPromises);
        setSyncStatus(statuses);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleSync = async (source: string, maxItems = 20) => {
    setLoading(prev => ({ ...prev, [source]: true }));
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, maxItems }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSyncResults(prev => ({ ...prev, [source]: data.data }));
      } else {
        console.error('Sync failed:', data.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [source]: false }));
      await loadSyncStatus();
    }
  };

  const getSyncResultCard = (source: string, result?: SyncResult) => {
    if (!result) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {source.toUpperCase()} Sync Results
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {result.editorsProcessed}
            </div>
            <div className="text-sm text-gray-600">Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {result.editorsAdded}
            </div>
            <div className="text-sm text-gray-600">Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {result.editorsUpdated}
            </div>
            <div className="text-sm text-gray-600">Updated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {result.creditsAdded}
            </div>
            <div className="text-sm text-gray-600">Credits</div>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {result.errors.slice(0, 5).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
              {result.errors.length > 5 && (
                <li className="text-red-500">
                  ... and {result.errors.length - 5} more errors
                </li>
              )}
            </ul>
          </div>
        )}

        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          result.success
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {result.success ? '✅ Success' : '❌ Failed'}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage data synchronization and monitor system status
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { source: 'tmdb', name: 'TMDb', color: 'blue', available: true },
            { source: 'imdb', name: 'IMDb', color: 'yellow', available: false },
            { source: 'emmy', name: 'Emmy DB', color: 'purple', available: false },
            { source: 'all', name: 'All Sources', color: 'green', available: true }
          ].map(({ source, name, color, available }) => (
            <div key={source} className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{name}</h3>
              
              <button
                onClick={() => handleSync(source)}
                disabled={loading[source] || !available}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  available
                    ? `bg-${color}-600 text-white hover:bg-${color}-700 disabled:opacity-50`
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading[source] ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Syncing...
                  </div>
                ) : available ? (
                  'Start Sync'
                ) : (
                  'Coming Soon'
                )}
              </button>

              {!available && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Implementation in progress
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Sync Results */}
        <div className="space-y-6 mb-8">
          {Object.entries(syncResults).map(([source, result]) => (
            <div key={source}>
              {getSyncResultCard(source, result)}
            </div>
          ))}
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-gray-600">API Services</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">Ready</div>
              <div className="text-sm text-gray-600">Sync Engine</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Getting Started
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Click "Start Sync" for TMDb to import popular TV show editors</li>
            <li>• Monitor sync progress and results in real-time</li>
            <li>• Check for errors and adjust settings as needed</li>
            <li>• IMDb and Emmy integrations are coming soon</li>
          </ul>
        </div>

        {/* Configuration */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Sync Limit
              </label>
              <input
                type="number"
                defaultValue={20}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (ms)
              </label>
              <input
                type="number"
                defaultValue={2000}
                min={100}
                max={10000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';

interface Variables {
  variable_1: string;
  variable_2: string;
}

function App() {
  const [currentValues, setCurrentValues] = useState<Variables>({
    variable_1: '',
    variable_2: ''
  });
  const [formValues, setFormValues] = useState<Variables>({
    variable_1: '',
    variable_2: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch current values from Airtable
  const fetchVariables = async () => {
    try {
      setError(null);
      
      // For local development, use a mock response since Netlify functions aren't available
      if (import.meta.env.DEV) {
        // Mock data for development
        const mockData = {
          records: [
            {
              fields: {
                variable_1: 'Development Value 1',
                variable_2: 'Development Value 2'
              }
            }
          ]
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (mockData.records && mockData.records.length > 0) {
          const latestRecord = mockData.records[0];
          const variables: Variables = {
            variable_1: latestRecord.fields.variable_1 || '',
            variable_2: latestRecord.fields.variable_2 || ''
          };
          setCurrentValues(variables);
        }
        return;
      }
      
      const response = await fetch('/.netlify/functions/airtable-api');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Get the most recent record (first in the list)
      if (data.records && data.records.length > 0) {
        const latestRecord = data.records[0];
        const variables: Variables = {
          variable_1: latestRecord.fields.variable_1 || '',
          variable_2: latestRecord.fields.variable_2 || ''
        };
        setCurrentValues(variables);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch variables');
      console.error('Error fetching variables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new variable record in Airtable
  const createVariableRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      // For local development, simulate successful update
      if (import.meta.env.DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update current values and clear form
        setCurrentValues(formValues);
        setFormValues({ variable_1: '', variable_2: '' });
        setSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
        return;
      }
      
      const response = await fetch('/.netlify/functions/airtable-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variable_1: formValues.variable_1,
          variable_2: formValues.variable_2
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update current values and clear form
      setCurrentValues(formValues);
      setFormValues({ variable_1: '', variable_2: '' });
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Fetch latest values to show the most recent record
      await fetchVariables();
      
      setError(err instanceof Error ? err.message : 'Failed to create record');
      console.error('Error creating record:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof Variables, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch variables on component mount
  useEffect(() => {
    fetchVariables();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading variables...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Manage Airtable Variables</p>
        </div>

        {/* Current Values Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Values</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-md">
              <span className="font-medium text-blue-900">Variable 1:</span>
              <span className="text-blue-700 font-mono">
                {currentValues.variable_1 || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-md">
              <span className="font-medium text-green-900">Variable 2:</span>
              <span className="text-green-700 font-mono">
                {currentValues.variable_2 || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Variables</h2>
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              New record created successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={createVariableRecord} className="space-y-4">
            <div>
              <label htmlFor="variable_1" className="block text-sm font-medium text-gray-700 mb-1">
                Variable 1
              </label>
              <input
                type="text"
                id="variable_1"
                value={formValues.variable_1}
                onChange={(e) => handleInputChange('variable_1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите значение"
              />
            </div>

            <div>
              <label htmlFor="variable_2" className="block text-sm font-medium text-gray-700 mb-1">
                Variable 2
              </label>
              <input
                type="text"
                id="variable_2"
                value={formValues.variable_2}
                onChange={(e) => handleInputChange('variable_2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите значение"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating || (!formValues.variable_1 && !formValues.variable_2)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Изменяем...
                </>
              ) : (
                'Изменить'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
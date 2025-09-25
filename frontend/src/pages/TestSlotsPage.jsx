import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { slotsAPI } from '@/services/api';

const TestSlotsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async (testName, apiCall) => {
    try {
      setLoading(true);
      setResult(prev => prev + `\n\n--- Testing ${testName} ---\n`);
      console.log(`Testing ${testName}...`);
      
      const response = await apiCall();
      const resultText = `✅ ${testName} SUCCESS:\n${JSON.stringify(response, null, 2)}`;
      setResult(prev => prev + resultText);
      console.log(resultText);
      
    } catch (error) {
      const errorText = `❌ ${testName} ERROR:\n${error.message}\nStack: ${error.stack}`;
      setResult(prev => prev + errorText);
      console.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setResult('Starting API tests...\n');
    setResult(prev => prev + `User: ${JSON.stringify({
      id: user?.id,
      _id: user?._id,
      firstName: user?.firstName,
      userType: user?.userType,
      isAuthenticated
    }, null, 2)}\n`);

    // Test 1: Get my slots
    await testAPI('Get My Slots (Initial)', () => slotsAPI.getMySlots());
    
    // Test 2: Create a test slot
    await testAPI('Create Slot', () => slotsAPI.createSlot({
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: '15:00',
      type: 'consultation',
      duration: 30,
      consultationFee: 100
    }));

    // Test 3: Get slots again to see if creation worked
    await testAPI('Get My Slots After Creation', () => slotsAPI.getMySlots());

    // Test 4: Create another slot for variety
    await testAPI('Create Second Slot', () => slotsAPI.createSlot({
      dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      endTime: '16:30',
      type: 'follow-up',
      duration: 45,
      consultationFee: 80
    }));

    // Test 5: Final slot count
    await testAPI('Final Slot Count', () => slotsAPI.getMySlots());
  };

  const cleanupAllSlots = async () => {
    try {
      setLoading(true);
      setResult(prev => prev + '\n\n--- Cleaning up all slots ---\n');
      console.log('Cleaning up all slots...');
      
      const response = await slotsAPI.deleteAllSlots();
      const resultText = `✅ CLEANUP SUCCESS:\n${JSON.stringify(response, null, 2)}`;
      setResult(prev => prev + resultText);
      console.log(resultText);
      
    } catch (error) {
      const errorText = `❌ CLEANUP ERROR:\n${error.message}\nStack: ${error.stack}`;
      setResult(prev => prev + errorText);
      console.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Please login to test slots API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Slots API Test</h1>
          <p className="text-muted-foreground mt-1">Test the slots API functionality</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user?.id || user?._id || 'Not found'}</p>
                <p><strong>User Type:</strong> {user?.userType}</p>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={runTests} disabled={loading}>
                  {loading ? 'Running Tests...' : 'Run API Tests'}
                </Button>
                <Button variant="outline" onClick={clearResults}>
                  Clear Results
                </Button>
                <Button variant="destructive" onClick={cleanupAllSlots} disabled={loading}>
                  {loading ? 'Cleaning...' : 'Delete All Slots'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded max-h-96 overflow-auto whitespace-pre-wrap">
                {result || 'Click "Run API Tests" to start testing...'}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestSlotsPage;
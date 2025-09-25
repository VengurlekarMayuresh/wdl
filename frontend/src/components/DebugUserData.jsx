import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const DebugUserData = () => {
  const { user, isAuthenticated } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowDebug(true)}
          variant="outline"
          size="sm"
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug User Data
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="shadow-lg border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>🔍 User Data Debug</span>
            <Button
              onClick={() => setShowDebug(false)}
              variant="ghost"
              size="sm"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-xs">
            <div>
              <strong>📊 Status:</strong>
              <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
              <div>User exists: {user ? '✅' : '❌'}</div>
            </div>
            
            {user && (
              <>
                <div>
                  <strong>👤 Basic Info:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
{JSON.stringify({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  profilePicture: user.profilePicture,
  userType: user.userType,
  age: user.age,
  bio: user.bio
}, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>🏠 Address:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
{JSON.stringify(user.address, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>🏥 Profile Data:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
{JSON.stringify(user.profile, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>🔧 All Keys:</strong>
                  <div className="bg-gray-100 p-2 rounded text-xs">
                    {Object.keys(user).join(', ')}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugUserData;

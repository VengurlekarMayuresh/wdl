import React from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SecurityPrivacyPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'guest'}
        onLogout={logout}
      />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Your Data Is Secure and Private
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We take your privacy seriously. MASSS implements strong protections to keep your health data safe and accessible only to you and your authorized providers.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <div className="font-medium">Encrypted in transit and at rest</div>
                  <div className="text-sm text-muted-foreground">All communication uses TLS encryption and data is stored with encryption at rest.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <div className="font-medium">Role-based access control</div>
                  <div className="text-sm text-muted-foreground">Only you and your authorized providers can access your records; actions are audited.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <div className="font-medium">Granular permissions</div>
                  <div className="text-sm text-muted-foreground">Share information on a need-to-know basis. Revoke access anytime.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <div className="font-medium">Best practices and monitoring</div>
                  <div className="text-sm text-muted-foreground">We apply secure development practices, regular reviews, and logging/monitoring.</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityPrivacyPage;

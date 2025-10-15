import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const { login, isAuthenticated, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated to appropriate landing page
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect based on user role
      if (currentUser.role === 'Agent') {
        navigate('/personal-history', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        toast.success('Login successful!', {
          description: 'Welcome back to Staff Attendance Management',
          icon: <CheckCircle className="w-4 h-4" />,
        });
        // Navigation will be handled by the useEffect hook above
        // which will redirect based on user role
      } else {
        setError(result.error || 'Login failed');
        toast.error('Login failed', {
          description: result.error || 'Invalid credentials',
          icon: <AlertCircle className="w-4 h-4" />,
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'jdupont', password: '123456', role: 'Admin', color: 'purple' },
    { username: 'rasoamkt', password: '123456' , role: 'Manager', color: 'blue' },
    { username: 'rrabe', password: '123456', role: 'Agent', color: 'gray' },
  ];

  const handleDemoLogin = (username: string, password: string) => {
    setUsername(username);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 dark:bg-blue-950 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </Button>

      <div className="w-full max-w-6xl flex gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-1 flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">Staff Attendance</h1>
                <p className="text-gray-600 dark:text-gray-400">Management System</p>
              </div>
            </div>
          </div>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Key Features</h3>
            <div className="space-y-3">
              {[
                'Real-time attendance tracking',
                'Comprehensive reporting & analytics',
                'Role-based access control',
                'Holiday & schedule management',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-900 dark:text-blue-300 mb-1">Secure & Reliable</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Enterprise-grade security with encrypted data storage and audit logging
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 max-w-md w-full">
          <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4">
                <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 dark:text-blue-400 p-0 h-auto"
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Quick login - Test accounts for development */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                Quick Login (Click to autofill)
              </p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => handleDemoLogin(account.username, account.password)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          account.color === 'purple'
                            ? 'bg-purple-100 dark:bg-purple-900'
                            : account.color === 'blue'
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <User className={`w-4 h-4 ${
                            account.color === 'purple'
                              ? 'text-purple-600 dark:text-purple-400'
                              : account.color === 'blue'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {account.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {account.password}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          account.color === 'purple'
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700'
                            : account.color === 'blue'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                        }
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {account.role}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
            © 2025 Staff Attendance Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

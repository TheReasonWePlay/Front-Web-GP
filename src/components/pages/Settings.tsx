import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Plus, Pencil, Trash2, Key, Shield, Moon, Sun, Eye, EyeOff, Copy, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { usersService } from '../../lib/api';
import type { SystemUser, PasswordResetRequest } from '../../lib/api/types';
import { useTheme } from '../../lib/theme-context';
import { useAuth } from '../../lib/auth-context';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ConfirmDialog';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await usersService.getUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isAdmin]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  
  // Password management states
  const [passwordDialogUser, setPasswordDialogUser] = useState<SystemUser | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<{ token?: string; temporaryPassword?: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRevealTimer, setPasswordRevealTimer] = useState(0);
  const [isUnauthorizedDialogOpen, setIsUnauthorizedDialogOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  
  // Confirm dialog state for delete operations
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Timer for password auto-hide (30 seconds)
  useEffect(() => {
    if (passwordRevealTimer > 0) {
      const timer = setTimeout(() => {
        setPasswordRevealTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (passwordRevealTimer === 0 && showPassword) {
      setShowPassword(false);
      setRevealedPassword(null);
      toast.info('Password hidden for security');
    }
  }, [passwordRevealTimer, showPassword]);

  // Show delete confirmation dialog
  const handleDeleteClick = (user: SystemUser) => {
    setUserToDelete(user);
    setConfirmDialogOpen(true);
  };

  // Perform the actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await usersService.deleteUser(userToDelete.id);
      
      if (response.success) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast.success('User deleted successfully', {
          description: `${userToDelete.username} has been removed from the system.`,
        });
      } else {
        toast.error('Failed to delete user', {
          description: response.error || 'An error occurred while deleting the user.',
        });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handlePasswordManagement = (user: User) => {
    // Check authorization - only admins can access password management
    if (!isAdmin) {
      setIsUnauthorizedDialogOpen(true);
      return;
    }

    setPasswordDialogUser(user);
    setRevealedPassword(null);
    setResetToken(null);
    setShowPassword(false);
    setPasswordRevealTimer(0);
    setCopiedToken(false);
  };

  const handleRevealPassword = () => {
    if (!passwordDialogUser) return;

    try {
      const password = revealUserPassword(
        passwordDialogUser.id,
        currentUser.username,
        currentUser.role
      );
      setRevealedPassword(password);
      setShowPassword(true);
      setPasswordRevealTimer(30); // 30 seconds timer
      toast.success('Password revealed temporarily (30 seconds)', {
        description: 'The password will be automatically hidden after 30 seconds',
        duration: 5000,
      });
    } catch (error) {
      toast.error('Failed to reveal password');
    }
  };

  const handleGenerateResetToken = () => {
    if (!passwordDialogUser) return;

    try {
      const token = generatePasswordResetToken(
        passwordDialogUser.id,
        currentUser.username,
        currentUser.role
      );
      setResetToken(token);
      toast.success('Password reset token generated', {
        description: 'Token expires in 24 hours',
        duration: 5000,
      });
    } catch (error) {
      toast.error('Failed to generate reset token');
    }
  };

  const handleCopyToken = async () => {
    if (!resetToken) return;

    try {
      await navigator.clipboard.writeText(resetToken.token);
      setCopiedToken(true);
      toast.success('Token copied to clipboard');
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (error) {
      toast.error('Failed to copy token');
    }
  };

  const handleCopyResetLink = async () => {
    if (!resetToken) return;

    const resetLink = `https://yourcompany.com/reset-password?token=${resetToken.token}`;
    try {
      await navigator.clipboard.writeText(resetLink);
      toast.success('Reset link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy reset link');
    }
  };

  const closePasswordDialog = () => {
    setPasswordDialogUser(null);
    setRevealedPassword(null);
    setResetToken(null);
    setShowPassword(false);
    setPasswordRevealTimer(0);
    setCopiedToken(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-gray-100">Settings & Users</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system settings and user access.</p>
      </div>

      {!isAdmin && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Note:</strong> User Management and Security settings are only accessible to administrators. 
            Contact your system administrator if you need to make changes to user accounts or security settings.
          </p>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="dark:bg-gray-800">
          <TabsTrigger value="general" className="dark:data-[state=active]:bg-gray-700">General</TabsTrigger>
          {/* Only show User Management and Security tabs for Admins */}
          {isAdmin && (
            <>
              <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700">User Management</TabsTrigger>
              <TabsTrigger value="security" className="dark:data-[state=active]:bg-gray-700">Security</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-blue-600" />
                  )}
                  <div>
                    <Label className="dark:text-gray-200">Dark Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'dark' ? 'Dark theme is enabled' : 'Switch to dark theme'}
                    </p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* User Management - Only for Admins */}
        {isAdmin && (
          <TabsContent value="users">
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 dark:text-gray-100">Users</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage user accounts and permissions
                  </p>
                </div>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">Username</TableHead>
                  <TableHead className="dark:text-gray-300">Email</TableHead>
                  <TableHead className="dark:text-gray-300">Role</TableHead>
                  <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-gray-900 dark:text-gray-100">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          user.role === 'Admin' 
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700'
                            : user.role === 'Manager'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                        }
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePasswordManagement(user)}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400"
                          title="Password Management"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUser(user)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete User"
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        )}

        {/* Security Settings - Only for Admins */}
        {isAdmin && (
          <TabsContent value="security">
          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-900 dark:text-blue-300 mb-1">Password Management</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Only administrators can access password management features. All password-related actions are logged for security auditing.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-gray-200">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-gray-200">Session Timeout</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Auto logout after 30 minutes of inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        )}
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Add New User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Create a new user account with specific role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
              <Input id="username" placeholder="john_doe" className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
              <Input id="email" type="email" placeholder="john@company.com" className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="dark:text-gray-200">Role</Label>
              <Select>
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(false)}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Edit User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username" className="dark:text-gray-200">Username</Label>
                <Input id="edit-username" defaultValue={editingUser.username} className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="dark:text-gray-200">Email</Label>
                <Input id="edit-email" type="email" defaultValue={editingUser.email} className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role" className="dark:text-gray-200">Role</Label>
                <Select defaultValue={editingUser.role}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEditingUser(null)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Management Dialog */}
      <Dialog open={!!passwordDialogUser} onOpenChange={() => closePasswordDialog()}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Password Management
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {passwordDialogUser && `Manage password for ${passwordDialogUser.username}`}
            </DialogDescription>
          </DialogHeader>

          {passwordDialogUser && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    {passwordDialogUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-gray-100">{passwordDialogUser.username}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{passwordDialogUser.email}</p>
                  </div>
                </div>
              </Card>

              {/* Security Warning */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-orange-900 dark:text-orange-300 mb-1">Security Notice</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      This action will be logged for security auditing. Only use this feature when necessary and authorized.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Reveal Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="dark:text-gray-200">Temporary Password Reveal</Label>
                  {passwordRevealTimer > 0 && (
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {passwordRevealTimer}s
                    </Badge>
                  )}
                </div>
                
                {revealedPassword ? (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                        {showPassword ? revealedPassword : '••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="dark:hover:bg-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleRevealPassword}
                    className="w-full border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Reveal Password (30 seconds)
                  </Button>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password will be automatically hidden after 30 seconds for security
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <Label className="dark:text-gray-200 mb-3 block">Generate Password Reset Token</Label>
                
                {resetToken ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-green-900 dark:text-green-300">Reset token generated successfully</p>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            Expires: {new Date(resetToken.expiresAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Token</Label>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all">
                          {resetToken.token}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyToken}
                          className="flex-shrink-0 dark:hover:bg-gray-700"
                        >
                          {copiedToken ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleCopyResetLink}
                      className="w-full border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Reset Link
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleGenerateResetToken}
                    className="w-full border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Generate Reset Token
                  </Button>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  The reset token can be sent to the user via email or other secure channel
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closePasswordDialog}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unauthorized Access Dialog */}
      <AlertDialog open={isUnauthorizedDialogOpen} onOpenChange={setIsUnauthorizedDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Shield className="w-5 h-5" />
              Access Denied
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              You do not have sufficient permissions to access password management features. 
              Only administrators can view or reset user passwords.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setIsUnauthorizedDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete User Account"
        description="This will permanently delete the user account and revoke all access. The user will no longer be able to log in. This action cannot be undone."
        itemName={userToDelete ? `${userToDelete.username} (${userToDelete.email})` : ''}
        confirmText="Yes, Delete User"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

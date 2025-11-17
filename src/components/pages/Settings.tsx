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
import { User } from '../../lib/api/legacy-types';

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

  const [confirmResetDialogOpen, setConfirmResetDialogOpen] = useState(false);
const [userToReset, setUserToReset] = useState<SystemUser | null>(null);
const [isResetting, setIsResetting] = useState(false);
    // Password change states (for current user)
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
  

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

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');

  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  // Loading states pour Add/Update
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Quand on ouvre le dialog d'ajout, reset les champs
  useEffect(() => {
    if (isAddDialogOpen) {
      setNewUsername('');
      setNewEmail('');
      setNewRole('');
    }
  }, [isAddDialogOpen]);

  // Quand on ouvre le dialog d'édition, on remplit les champs avec l'utilisateur à modifier
  useEffect(() => {
    if (editingUser) {
      setEditUsername(editingUser.username);
      setEditEmail(editingUser.email);
      setEditRole(editingUser.role);
    } else {
      setEditUsername('');
      setEditEmail('');
      setEditRole('');
    }
  }, [editingUser]);

  // Gestion création utilisateur
  const validateEmail = (email: string) => {
    // Simple regex email (pas parfaite mais suffisante pour la plupart des cas)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateUsername = (username: string) => {
    // Alphanumérique + underscore, 3 à 20 caractères
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
  };
  
  const validRoles = ['Admin', 'Manager'];
  
  const handleAddUser = async () => {
    if (!newUsername || !newEmail || !newRole) {
      toast.error('Please fill all fields');
      return;
    }
  
    if (!validateUsername(newUsername)) {
      toast.error('Username must be 3-20 characters, alphanumeric or underscores only.');
      return;
    }
  
    if (!validateEmail(newEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
  
    if (!validRoles.includes(newRole)) {
      toast.error('Please select a valid role.');
      return;
    }
  
    try {
      setIsAdding(true);
      const response = await usersService.createUser({
        id: "",
        username: newUsername,
        email: newEmail,
        role: newRole,
      });
  
      if (response.success && response.data) {
        setUsers(prev => [...prev, response.data]);
        toast.success('User added successfully with default password');
        setIsAddDialogOpen(false);
      } else {
        toast.error('Failed to add user', {
          description: response.error || 'An error occurred',
        });
      }
    } catch (error) {
      console.error('Add user error:', error);
      toast.error('Unexpected error while adding user');
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleUpdateUser = async () => {
    if (!editingUser) return;
  
    if (!editUsername || !editEmail || !editRole) {
      toast.error('Please fill all fields');
      return;
    }
  
    if (!validateUsername(editUsername)) {
      toast.error('Username must be 3-20 characters, alphanumeric or underscores only.');
      return;
    }
  
    if (!validateEmail(editEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
  
    if (!validRoles.includes(editRole)) {
      toast.error('Please select a valid role.');
      return;
    }
  
    try {
      setIsUpdating(true);
      const response = await usersService.updateUser(editingUser.id, {
        username: editUsername,
        email: editEmail,
        role: editRole,
      });
  
      if (response.success && response.data) {
        setUsers(prev => prev.map(u => (u.id === editingUser.id ? response.data : u)));
        toast.success('User updated successfully');
        setEditingUser(null);
      } else {
        toast.error('Failed to update user', {
          description: response.error || 'An error occurred',
        });
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Unexpected error while updating user');
    } finally {
      setIsUpdating(false);
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

  const handleResetConfirm = async () => {
    if (!userToReset) return;
    setIsResetting(true);
    try {
      const response = await usersService.resetPwd(userToReset.id);
      toast.success('Password Reset', {
        description: `Password for ${userToReset.username} has been reset successfully.`,
      });
    } catch (error) {
      console.error('Reset password failed:', error);
      toast.error('Reset Failed', {
        description: 'Unable to reset password. Please try again later.',
      });
    } finally {
      setIsResetting(false);
      setConfirmResetDialogOpen(false);
      setUserToReset(null);
    }
  };

  // Handle current user password change
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Validation Error', {
        description: 'All password fields are required.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Validation Error', {
        description: 'New password and confirmation do not match.',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Validation Error', {
        description: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('Validation Error', {
        description: 'New password must be different from current password.',
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const response = await usersService.updatePwd(currentUser.id, {
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
  
      if (response.success && response.data) {
        toast.success('Password Changed', {
        description: 'Your password has been changed successfully.',
      });
      
      // Reset form and close dialog
      setIsChangePasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
    }} catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Change Failed', {
        description: 'Failed to change password. Please verify your current password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  }
  ;

  // Open password change dialog
  const handleOpenChangePasswordDialog = () => {
    setIsChangePasswordDialogOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };
  

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-gray-100">Paramètres et Utilisateurs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérer les paramètres du système et les comptes utilisateurs</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="dark:bg-gray-800">
          <TabsTrigger value="general" className="dark:data-[state=active]:bg-gray-700">Géneral</TabsTrigger>
          {/* Only show User Management and Security tabs for Admins */}
          {isAdmin && (
            <>
              <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700">Gestion Utilisateur</TabsTrigger>
              
            </>
          )}
          <><TabsTrigger value="security" className="dark:data-[state=active]:bg-gray-700">Securité</TabsTrigger></>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Apparence</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-blue-600" />
                  )}
                  <div>
                    <Label className="dark:text-gray-200">Mode Sombre</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'dark' ? 'Mode sombre actif' : 'Changer en Thème Sombre'}
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
                  <h3 className="text-gray-900 dark:text-gray-100">Utilisateurs</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gérer les comptes et les Permissions
                  </p>
                </div>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Utilisateur
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">Username</TableHead>
                  <TableHead className="dark:text-gray-300">Email</TableHead>
                  <TableHead className="dark:text-gray-300">Rôle</TableHead>
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
                          onClick={() => {
                            setUserToReset(user);
                            setConfirmResetDialogOpen(true);
                          }}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400"
                          title="Reset Password"
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
          
          <TabsContent value="security">
          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Paramètres de Sécurité</h3>
            <div className="space-y-4">
              {/* Password Change Section */}
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-blue-800 dark:text-blue-300">Modifier mot de Passe</h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                    Mettez à jour votre mot de passe pour sécuriser votre compte.
                    </p>
                  </div>
                  <Button 
                    onClick={handleOpenChangePasswordDialog}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <Key className="w-4 h-4" />
                    Modifié mot de Passe
                  </Button>
                </div>
              </div>
              
              {/*<div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-gray-200">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch />
                </div>
                </div>*/}

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-gray-200">Session Expiré</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Se déconnecter automatiquement après 30min d'inactivité</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

            </div>
          </Card>
        </TabsContent>
        
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Ajouter un nouvel Utilisateur</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
            Créez un nouveau compte utilisateur avec un rôle et des autorisations spécifiques.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
              <Input
                id="username"
                placeholder="john_doe"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="dark:text-gray-200">Rôle</Label>
              <Select
                value={newRole}
                onValueChange={setNewRole}
              >
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isAdding}
            >
              Annulé
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddUser}
              disabled={isAdding}
            >
              {isAdding ? 'Ajout...' : 'Crée utilisateur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Modifier Utilisateur</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update les Informations et Permissions Utilisateurs.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username" className="dark:text-gray-200">Username</Label>
                <Input
                  id="edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role" className="dark:text-gray-200">Rôle</Label>
                <Select
                  value={editRole}
                  onValueChange={setEditRole}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isUpdating}
            >
              Annulé
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleUpdateUser}
              disabled={isUpdating}
            >
              {isUpdating ? 'Sauvegarde en cours..' : 'Savegarder les Changements'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete User Account"
        description="Cette action supprimera définitivement le compte utilisateur et révoquera tous ses accès. L'utilisateur ne pourra plus se connecter. Cette action est irréversible."
        itemName={userToDelete ? `${userToDelete.username} (${userToDelete.email})` : ''}
        confirmText="Oui, supprimer cet Utilisateurs"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={confirmResetDialogOpen}
        onOpenChange={setConfirmResetDialogOpen}
        title="Reset User Password"
        description="Cette action réinitialisera le mot de passe de l'utilisateur à sa valeur par défaut. L'utilisateur devra le modifier lors de sa prochaine connexion."
        itemName={userToReset ? `${userToReset.username} (${userToReset.email})` : ''}
        confirmText="Oui, restaurer mot de passe"
        onConfirm={handleResetConfirm}
        isLoading={isResetting}
      />

      {/* Change Password Dialog (for current user) */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Modifié Mot de Passe
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
            Saisissez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="dark:text-gray-200">Mot de Passe Actuel</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'Mot de Passe'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="dark:text-gray-200">Nouveau Mot de Passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'Mot de Passe'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="dark:text-gray-200">Confirmer nouveau Mot de Passe</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? 'text' : 'Mot de Passe'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300 mb-2">Exigences de mot de passe:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-blue-700 dark:text-blue-400">
                <li>Au moins 8 caractères</li>
                <li>Different du Mot de Passe Actuel</li>
                <li>Recommandé : un mélange de lettres, de chiffres et de symboles</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangePasswordDialogOpen(false)}
              disabled={isChangingPassword}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annulé
            </Button>
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isChangingPassword ? 'Changement...' : 'Changeer Mot de Passe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
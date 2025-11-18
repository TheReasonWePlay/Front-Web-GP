import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { QRCodeCanvas, QRCodeSVG  } from 'qrcode.react';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Search, Plus, Pencil, Trash2, Filter, Eye, Calendar, Clock, TrendingUp, Award, QrCode, Printer, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { agentsService } from '../../lib/api';
import type { Agent, DailyAttendanceDetails, TemporaryExit, LongAbsence } from '../../lib/api/types';
import { useAuth } from '../../lib/auth-context';
import { getInitials } from '../../lib/utils';
import { ConfirmDialog } from '../ConfirmDialog';
import { toast } from 'sonner';

export function AgentsManagement() {
  const { isAdmin } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Confirm dialog state for delete operations
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for Add Dialog
  const [newAgent, setNewAgent] = useState<Agent>({
    matricule: '',
    nom: '',
    division: '',
    poste: ''
  });
  
  // Attendance Section State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendanceDetails | null>(null);
  const [temporaryExits, setTemporaryExits] = useState<TemporaryExit[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  
  // Absence Section State
  const [absences, setAbsences] = useState<LongAbsence[]>([]);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<LongAbsence | null>(null);
  const [absenceToDelete, setAbsenceToDelete] = useState<LongAbsence | null>(null);
  const [confirmAbsenceDialogOpen, setConfirmAbsenceDialogOpen] = useState(false);
  const [isDeletingAbsence, setIsDeletingAbsence] = useState(false);
  
  const [listeTypeAbsences, setListeTypeAbsences] = useState(["Congé","Autorisation d'absence","Permission","Mission", "Formation", "Repos médical"])
  // Absence Form State
  const [absenceForm, setAbsenceForm] = useState({
    startDate: '',
    endDate: '',
    type: 'Congé' as LongAbsence['type'],
    reason: '',
  });

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await agentsService.getAgents({ page: 1, pageSize: 100 });
        if (response.success && response.data) {
          setAgents(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);
  
  // Fetch daily attendance when date or viewing agent changes
  useEffect(() => {
    if (!viewingAgent) return;
    
    const fetchDailyAttendance = async () => {
      setLoadingAttendance(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      try {
        const [attendanceResponse, exitsResponse] = await Promise.all([
          agentsService.getDailyAttendance(viewingAgent.matricule, dateStr),
          agentsService.getTemporaryExits(viewingAgent.matricule, dateStr),
        ]);
        
        if (attendanceResponse.success && attendanceResponse.data) {
          setDailyAttendance(attendanceResponse.data);
        } else {
          setDailyAttendance(null);
        }
        
        if (exitsResponse.success && exitsResponse.data) {
          setTemporaryExits(exitsResponse.data);
        } else {
          setTemporaryExits([]);
        }
      } catch (error) {
        console.error('Failed to fetch daily attendance:', error);
        setDailyAttendance(null);
        setTemporaryExits([]);
      } finally {
        setLoadingAttendance(false);
      }
    };
    
    fetchDailyAttendance();
  }, [viewingAgent, selectedDate]);
  
  // Fetch absences when viewing agent changes
  useEffect(() => {
    if (!viewingAgent) return;
    
    const fetchAbsences = async () => {
      setLoadingAbsences(true);
      try {
        const response = await agentsService.getLongAbsences(viewingAgent.matricule);
        if (response.success && response.data) {
          setAbsences(response.data);
        }
        absences.forEach(element => {
          console.log(element);
        });
        
      } catch (error) {
        console.error('Failed to fetch absences:', error);
        toast.error('Failed to load absences');
      } finally {
        setLoadingAbsences(false);
      }
    };
    
    fetchAbsences();
  }, [viewingAgent]);

  const divisionsDbl = ["all", ...new Set(agents.map(agent => agent.division))];
  const divisions = [...new Set(divisionsDbl)];;

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.matricule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision = filterDivision === 'all' || agent.division === filterDivision;
    return matchesSearch && matchesDivision;
  });

  // Show delete confirmation dialog
  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setConfirmDialogOpen(true);
  };

  // Perform the actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await agentsService.deleteAgent(agentToDelete.matricule);
      
      if (response.success) {
        setAgents(agents.filter(agent => agent.matricule !== agentToDelete.matricule));
        toast.success('Agent éffacé avec succès', {
          description: `${agentToDelete.nom} a été éffacer du système.`,
        });
      } else {
        toast.error("Effacement d'agent échoué", {
          description: response.error || 'An error occurred while deleting the agent.',
        });
      }
    } catch (error) {
      console.error("Effacement d'agent échoué:", error);
      toast.error("Effacement d'agent échoué", {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setAgentToDelete(null);
    }
  };

  const validateAgent = (agent: Agent): boolean => {
    const matriculeRegex = /^[A-Za-z0-9]+$/;
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    const departmentRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    const positionRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  
    if (!agent.matricule?.trim()) {
      toast.error('Le matricule est obligatoire');
      return false;
    }
    if (!matriculeRegex.test(agent.matricule)) {
      toast.error('Le matricule ne doit contenir que des lettres et chiffres');
      return false;
    }
  
    if (!agent.nom?.trim()) {
      toast.error('Le nom est obligatoire');
      return false;
    }
    if (!nameRegex.test(agent.nom)) {
      toast.error('Le nom contient des caractères non valides');
      return false;
    }
  
    if (!agent.division?.trim()) {
      toast.error('Le département est obligatoire');
      return false;
    }
    if (!departmentRegex.test(agent.division)) {
      toast.error('Le département contient des caractères non valides');
      return false;
    }
  
    if (!agent.poste?.trim()) {
      toast.error('Le poste est obligatoire');
      return false;
    }
    if (!positionRegex.test(agent.poste)) {
      toast.error('Le poste contient des caractères non valides');
      return false;
    }
  
    return true;
  };

  const handleAddAgent = async () => {
    if (!validateAgent(newAgent)) return;
  
    // Si tout est OK → on envoie
    try {
      const response = await agentsService.createAgent(newAgent);
      if (response.success && response.data) {
        setAgents([...agents, response.data]);
        setIsAddDialogOpen(false);
        toast.success('Agent ajouté avec succès !');
  
        // Reset du formulaire
        setNewAgent({
          matricule: '',
          name: '',
          division: '',
          poste: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l’agent :', error);
      toast.error('Erreur lors de la création de l’agent');
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;
    if (!validateAgent(editingAgent)) return;
    
    try {
      const response = await agentsService.updateAgent(editingAgent.matricule, editingAgent);
      if (response.success && response.data) {
        setAgents(agents.map(a => a.matricule === editingAgent.matricule ? response.data! : a));
        setEditingAgent(null);
      }
    } catch (error) {
      console.error("Echec mis a jour Agent:", error);
    }
  };
  
  // Absence CRUD handlers
  const handleOpenAbsenceDialog = (absence?: LongAbsence) => {
    if (absence) {
      setEditingAbsence(absence);
      
      setAbsenceForm({
        startDate: absence.startDate,
        endDate: absence.endDate,
        type: absence.type,
        reason: absence.reason,
      });
    } else {
      setEditingAbsence(null);
      setAbsenceForm({
        startDate: '',
        endDate: '',
        type: 'Congé',
        reason: '',
      });
    }
    setShowAbsenceDialog(true);
  };

  const handleCloseAbsenceDialog = () => {
    setShowAbsenceDialog(false);
    setEditingAbsence(null);
    setAbsenceForm({
      startDate: '',
      endDate: '',
      type: 'Congé',
      reason: '',
    });
  };

  const handleSaveAbsence = async () => {
    if (!viewingAgent) return;
  
    const { startDate, endDate, reason } = absenceForm;
  
    // Vérifie les champs obligatoires
    if (!startDate || !endDate || !reason) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    // Vérifie cohérence des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    if (start > end) {
      toast.error('La date de début ne peut pas être postérieure à la date de fin');
      return;
    }
  
    // Validation du motif (avec accents et apostrophes)
    const reasonRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'’.,()\-]{3,100}$/;
    if (!reasonRegex.test(reason.trim())) {
      toast.error("Le motif d'absence contient des caractères non valides");
      return;
    }
  
    try {
      if (editingAbsence) {
        const response = await agentsService.updateLongAbsence(
          viewingAgent.matricule,
          editingAbsence.id,
          absenceForm
        );
        if (response.success && response.data) {
          toast.success('Absence mise à jour avec succès');
          setAbsences(absences.map(a => a.id === editingAbsence.id ? response.data! : a));
        }
      } else {
        const response = await agentsService.createLongAbsence(
          viewingAgent.matricule,
          absenceForm
        );
        if (response.success && response.data) {
          toast.success('Absence ajoutée avec succès');
          setAbsences([...absences, response.data]);
        }
      }
  
      handleCloseAbsenceDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l’absence :', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };
  
  

  const handleDeleteAbsenceClick = (absence: LongAbsence) => {
    setAbsenceToDelete(absence);
    setConfirmAbsenceDialogOpen(true);
  };

  const handleDeleteAbsenceConfirm = async () => {
    if (!absenceToDelete || !viewingAgent) return;
    
    setIsDeletingAbsence(true);
    try {
      const response = await agentsService.deleteLongAbsence(
        viewingAgent.matricule,
        absenceToDelete.id
      );
      
      if (response.success) {
        toast.success('Absence éffacer avec succès');
        setAbsences(absences.filter(a => a.id !== absenceToDelete.id));
      } else {
        toast.error(response.error || 'Echec effacement absence');
      }
    } catch (error) {
      console.error('Echec effacement absence:', error);
      toast.error('Echec effacement absence');
    } finally {
      setIsDeletingAbsence(false);
      setConfirmAbsenceDialogOpen(false);
      setAbsenceToDelete(null);
    }
  };
  
  // Helper function to check if time is late
  const isLate = (actualTime?: string, scheduledTime?: string, tol?: string): boolean => {
    if (!actualTime || !scheduledTime) return false;
    return actualTime > (scheduledTime + tol);
  };

  // Helper function to format time with status
  const formatTimeWithStatus = (time?: string, scheduledTime?: string, type: 'arrival' | 'departure' = 'arrival', tol?: string) => {
    if (!time) return { time: 'Not recorded', status: 'absent' };
    
    const late = type === 'arrival' ? isLate(time, scheduledTime, tol) : false;
    const early = type === 'departure' && scheduledTime ? time < scheduledTime : false;
    
    return {
      time,
      status: late ? 'late' : early ? 'early' : 'ontime',
    };
  };

  //-----utils---------

  const formatDateForInput = (dateString?: string): string  => {
    if (!dateString) return '';
  
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`; // ✅ ex: "2025-10-09"
  }

  const formatTimeToHourMinute = (time: string | null): string | null => {
    if (!time) return time;
  
    const [h, m] = time.split(":");
  
    return `${h}h ${m}`;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">Gestion des Agents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gérez les agents et leurs informations
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="Recherche par Nom ou Matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg"
              />
            </div>
            <Select value={filterDivision} onValueChange={setFilterDivision}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map(division => (
                  <SelectItem key={division} value={division}>
                    {division === 'all' ? 'Toutes Divisions' : division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Agent
            </Button>
          )}
        </div>
      </Card>

      {/* Agents Table */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <TableHead className="dark:text-gray-300">Matricule</TableHead>
              <TableHead className="dark:text-gray-300">Nom complet</TableHead>
              <TableHead className="dark:text-gray-300">Division</TableHead>
              <TableHead className="dark:text-gray-300">Poste</TableHead>
              <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow key={agent.matricule} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700">
                <TableCell>
                  <span className="text-gray-900 dark:text-gray-100">{agent.matricule}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {getInitials(agent.nom)}
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">{agent.nom}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                    {agent.division}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">{agent.poste}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingAgent(agent)}
                      className="hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAgent(agent)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit Agent"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(agent)}
                          className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete Agent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Agent Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Ajouter un Agent</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Entrer le détails du nouvel Agent
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="matricule" className="dark:text-gray-200">Matricule</Label>
              <Input 
                id="matricule" 
                placeholder="AG009" 
                value={newAgent.matricule}
                onChange={(e) => setNewAgent({ ...newAgent, matricule: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="dark:text-gray-200">Nom Complet</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={newAgent.nom}
                onChange={(e) => setNewAgent({ ...newAgent, nom: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="division" className="dark:text-gray-200">Division</Label>
              <Input 
                id="division"
                list="division-options"
                placeholder="Select or type division"
                value={newAgent.division}
                onChange={(e) => setNewAgent({ ...newAgent, division: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
              />
              <datalist id="division-options">
                {divisions.map(division => (
                    <option value={division} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position" className="dark:text-gray-200">Poste</Label>
              <Input 
                id="position" 
                placeholder="Developer" 
                value={newAgent.poste}
                onChange={(e) => setNewAgent({ ...newAgent, poste: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddAgent}>
              Ajouter Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Modifier Agent</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Mettre a jour les informations d'un agent.
            </DialogDescription>
          </DialogHeader>
          {editingAgent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-matricule" className="dark:text-gray-200">Matricule</Label>
                <Input 
                  id="edit-matricule" 
                  value={editingAgent.matricule} 
                  disabled
                  className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="dark:text-gray-200">Nom Complet</Label>
                <Input 
                  id="edit-name" 
                  value={editingAgent.nom}
                  onChange={(e) => setEditingAgent({ ...editingAgent, nom: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="division" className="dark:text-gray-200">Division</Label>
                <Input 
                  id="division"
                  list="division-options"
                  placeholder="Select or type division"
                  value={editingAgent.division}
                  onChange={(e) => setEditingAgent({ ...editingAgent, division: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
                <datalist id="division-options">
                  {divisions.map(division => (
                      <option value={division} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position" className="dark:text-gray-200">Poste</Label>
                <Input 
                  id="edit-position" 
                  value={editingAgent.poste}
                  onChange={(e) => setEditingAgent({ ...editingAgent, poste: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAgent(null)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateAgent}>
              Sauvegarder les Modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Agent Details Sheet */}
      <Sheet open={!!viewingAgent} onOpenChange={() => setViewingAgent(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          {viewingAgent && (
            <>
              <SheetHeader>
                <SheetTitle className="dark:text-gray-100">Détail Agent</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Agent Profile Card */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl">
                      {getInitials(viewingAgent.nom)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-1">{viewingAgent.nom}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{viewingAgent.poste}</p>
                      <Badge 
                        variant={viewingAgent.status === 'Active' ? 'default' : 'secondary'}
                        className={viewingAgent.status === 'Active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      >
                        {viewingAgent.status}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Tabs for different sections */}
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 dark:bg-gray-900">
                    <TabsTrigger value="personal" className="dark:data-[state=active]:bg-gray-700">Information Personnel</TabsTrigger>
                    <TabsTrigger value="attendance" className="dark:data-[state=active]:bg-gray-700">Pointage</TabsTrigger>
                    <TabsTrigger value="absence" className="dark:data-[state=active]:bg-gray-700">Absence</TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-4 mt-4">
                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <h4 className="text-gray-900 dark:text-gray-100 mb-3">Details de l'employé</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Matricule:</span>
                          <span className="text-gray-900 dark:text-gray-100">{viewingAgent.matricule}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Division:</span>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {viewingAgent.division}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    {/* QR Code Section */}
                    <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center gap-2 mb-4">
                        <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-gray-900 dark:text-gray-100">QR Code de l'agent</h4>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        {/* QR Code Display */}
                        <div 
                          id="qr-code-container" 
                          className="bg-white p-6 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                        >
                          <QRCodeSVG 
                            value={viewingAgent.matricule}
                            size={200}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        
                        {/* Agent Info Below QR Code */}
                        <div className="text-center space-y-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">{viewingAgent.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{viewingAgent.matricule}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{viewingAgent.department}</p>
                        </div>

                        {/* Print Button */}
                        <Button 
                          onClick={() => {
                            const printContent = document.getElementById('qr-code-container');
                            if (!printContent) return;
                            
                            const printWindow = window.open('', '_blank');
                            if (!printWindow) return;
                            
                            printWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>QR Code - ${viewingAgent.nom}</title>
                                  <style>
                                    body {
                                      display: flex;
                                      flex-direction: column;
                                      align-items: center;
                                      justify-content: center;
                                      min-height: 100vh;
                                      margin: 0;
                                      padding: 20px;
                                      font-family: system-ui, -apple-system, sans-serif;
                                      background: white;
                                    }
                                    .qr-container {
                                      text-align: center;
                                      padding: 40px;
                                      border: 2px solid #e5e7eb;
                                      border-radius: 12px;
                                      background: white;
                                    }
                                    .qr-code {
                                      margin: 0 auto 20px;
                                    }
                                    h2 {
                                      margin: 10px 0 5px;
                                      font-size: 20px;
                                      color: #1f2937;
                                    }
                                    .matricule {
                                      font-size: 14px;
                                      color: #6b7280;
                                      margin: 5px 0;
                                    }
                                    .division {
                                      font-size: 12px;
                                      color: #9ca3af;
                                      margin: 5px 0;
                                    }
                                    @media print {
                                      body {
                                        padding: 0;
                                      }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="qr-container">
                                    ${printContent.innerHTML}
                                    <h2>${viewingAgent.nom}</h2>
                                    <p class="matricule">Matricule: ${viewingAgent.matricule}</p>
                                    <p class="division">${viewingAgent.division}</p>
                                  </div>
                                  <script>
                                    window.onload = function() {
                                      window.print();
                                      window.onafterprint = function() {
                                        window.close();
                                      };
                                    };
                                  </script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimer QR Code
                        </Button>

                      </div>
                    </Card>
                  </TabsContent>

                  {/* Attendance Details Tab */}
                  <TabsContent value="attendance" className="space-y-4 mt-4">
                    <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-gray-900 dark:text-gray-100">Details pointage Journalier</h4>
                        </div>
                        <Input
                          type="date"
                          value={selectedDate.toISOString().split('T')[0]}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSelectedDate(new Date(e.target.value));
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          min="2020-01-01"
                          className="w-auto bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg"
                        />
                      </div>

                      {loadingAttendance ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Chargement des données...</p>
                      ) : dailyAttendance ? (
                        <>
                        {dailyAttendance.conge ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">Agent en {dailyAttendance.type_abs}</p>
                          </div>
                        ) : (
                          <>
                          {/* Attendance Summary */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Morning Arrival */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Arrivé en matinée</p>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {formatTimeToHourMinute(dailyAttendance.morningCheckIn) || 'Not recorded'}
                                  </p>
                                </div>
                                {dailyAttendance.morningCheckIn && (
                                  formatTimeWithStatus(dailyAttendance.morningCheckIn, dailyAttendance.entree_matin, 'arrival', dailyAttendance.tolerance).status === 'late' ? (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )
                                )}
                              </div>
                              {dailyAttendance.morningCheckIn && formatTimeWithStatus(dailyAttendance.morningCheckIn, dailyAttendance.entree_matin, 'arrival', dailyAttendance.tolerance).status === 'late' && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">Arrivé tardive</p>
                              )}
                            </div>

                            {/* Morning Departure */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Départ matinée</p>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {formatTimeToHourMinute(dailyAttendance.morningCheckOut) || 'Not recorded'}
                                  </p>
                                </div>
                                {dailyAttendance.morningCheckOut && (
                                  formatTimeWithStatus(dailyAttendance.morningCheckOut, dailyAttendance.sortie_matin, 'departure').status === 'early' ? (
                                    <XCircle className="w-5 h-5 text-orange-500" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )
                                )}
                              </div>
                              {dailyAttendance.morningCheckOut && formatTimeWithStatus(dailyAttendance.morningCheckOut, dailyAttendance.sortie_matin, 'departure').status === 'early' && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Départ tôt</p>
                              )}
                            </div>

                            {/* Afternoon Arrival */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Arrivée Après-midi</p>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {formatTimeToHourMinute(dailyAttendance.afternoonCheckIn) || 'Not recorded'}
                                  </p>
                                </div>
                                {dailyAttendance.afternoonCheckIn && (
                                  formatTimeWithStatus(dailyAttendance.afternoonCheckIn, dailyAttendance.entree_aprem, 'arrival', dailyAttendance.tolerance).status === 'late' ? (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )
                                )}
                              </div>
                              {dailyAttendance.afternoonCheckIn && formatTimeWithStatus(dailyAttendance.afternoonCheckIn, dailyAttendance.entree_aprem, 'arrival', dailyAttendance.tolerance).status === 'late' && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">Arrivé tardive</p>
                              )}
                            </div>

                            {/* Afternoon Departure */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Départ Après-midi</p>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {formatTimeToHourMinute(dailyAttendance.afternoonCheckOut) || 'Not recorded'}
                                  </p>
                                </div>
                                {dailyAttendance.afternoonCheckOut && (
                                  formatTimeWithStatus(dailyAttendance.afternoonCheckOut, dailyAttendance.sortie_aprem, 'departure').status === 'early' ? (
                                    <XCircle className="w-5 h-5 text-orange-500" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )
                                )}
                              </div>
                              {dailyAttendance.afternoonCheckOut && formatTimeWithStatus(dailyAttendance.afternoonCheckOut, dailyAttendance.sortie_aprem, 'departure').status === 'early' && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Départ tôt</p>
                              )}
                            </div>
                          </div>

                          {/* Temporary Exits */}
                          {temporaryExits.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                              <h4 className="text-gray-900 dark:text-gray-100 mb-3">Sortie Temporaire(s)</h4>
                              <div className="space-y-2">
                                {temporaryExits.map((exit) => (
                                  <div key={exit.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                          {formatTimeToHourMinute(exit.exitTime)} - {formatTimeToHourMinute(exit.returnTime) || 'Not returned'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {exit.description}
                                        </p>
                                      </div>
                                      {exit.duration && (
                                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                          {exit.duration}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="mt-4 flex items-center gap-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Status:</p>
                            <Badge 
                              variant="outline"
                              className={
                                dailyAttendance.status === 'Present' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                dailyAttendance.status === 'Late' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                dailyAttendance.status === 'Absent' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              }
                            >
                              {
                                dailyAttendance.status === 'Late' ? 'En retard' :
                                dailyAttendance.status 
                              }
                            </Badge>
                            {dailyAttendance.workHours && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                • {dailyAttendance.workHours} travaillé
                              </p>
                            )}
                          </div>
                          </>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">Aucun Pointage pour ce Jour</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* Absence Management Tab */}
                  <TabsContent value="absence" className="space-y-4 mt-4">
                    <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-gray-900 dark:text-gray-100">Gestion Absence</h4>
                        </div>
                        
                          <Button
                            onClick={() => handleOpenAbsenceDialog()}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvel Absence
                          </Button>
                        
                      </div>

                      {loadingAbsences ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Chargement des absences...</p>
                      ) : absences.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date de début</TableHead>
                              <TableHead>Date de Fin</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Raison</TableHead>
                              <TableHead>Durée</TableHead>
                              <TableHead>Status</TableHead>
                              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {absences.map((absence) => (
                              
                              <TableRow key={absence.id}>
                                <TableCell>
                                  {new Date(absence.startDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </TableCell>
                                <TableCell>
                                  {new Date(absence.endDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                    {absence.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{absence.reason}</TableCell>
                                <TableCell>{absence.duration || 'N/A'} jour(s)</TableCell>
                                <TableCell>
                                  {absence.status && (
                                    <Badge 
                                      variant="outline"
                                      className={
                                        absence.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                        'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                      }
                                    >
                                      {absence.status}
                                    </Badge>
                                  )}
                                </TableCell>
                                
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenAbsenceDialog(absence)}
                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                        title="Modifié Absence"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteAbsenceClick(absence)}
                                        className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                                        title="Supprimer Absence"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">Aucun Absence enregistrer</p>
                          {isAdmin && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add Absence" to create the first absence record</p>
                          )}
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Absence Dialog */}
      <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">{editingAbsence ? 'Edit Absence' : 'Add New Absence'}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {editingAbsence ? 'Update the absence details below.' : 'Fill in the details for the new absence.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="dark:text-gray-200">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formatDateForInput(absenceForm.startDate)}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, startDate: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="dark:text-gray-200">Date de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formatDateForInput(absenceForm.endDate)}
                  onChange={(e) => setAbsenceForm({ ...absenceForm, endDate: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type" className="dark:text-gray-200">Type</Label>
              <Select
                value={absenceForm.type}
                onValueChange={(value) => setAbsenceForm({ ...absenceForm, type: value as LongAbsence['type'] })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listeTypeAbsences.map((typeAbsence) => (
                    <SelectItem key={typeAbsence} value={typeAbsence}>
                      {typeAbsence}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reason" className="dark:text-gray-200">Raison / Motif</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this absence..."
                value={absenceForm.reason}
                onChange={(e) => setAbsenceForm({ ...absenceForm, reason: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseAbsenceDialog}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveAbsence}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingAbsence ? 'Mettre à jour' : 'Crée'} Absence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Agent Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Supprimer Agent"
        description="Êtes-vous sûr de vouloir supprimer cet agent ? Cette action supprimera définitivement toutes ses données, y compris les enregistrements de présence, et ne pourra pas être réstauré."
        itemName={agentToDelete ? `${agentToDelete.nom} (${agentToDelete.matricule})` : ''}
        confirmText="Oui, supprimer cet Agent"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      {/* Delete Absence Confirmation Dialog */}
      <ConfirmDialog
        open={confirmAbsenceDialogOpen}
        onOpenChange={setConfirmAbsenceDialogOpen}
        title="Supprimer Absence"
        description="Etes vous sûr de supprimer cet Absence? Cette action est irréversible."
        itemName={absenceToDelete ? `${absenceToDelete.type} (${formatDateForInput(absenceToDelete.startDate)} - ${formatDateForInput(absenceToDelete.endDate)})` : ''}
        confirmText="Oui, supprimer cet Absence"
        onConfirm={handleDeleteAbsenceConfirm}
        isLoading={isDeletingAbsence}
      />
    </div>
  );
}

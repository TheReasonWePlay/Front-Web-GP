import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
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
import { Label } from '../ui/label';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { schedulesService } from '../../lib/api';
import type { WorkSchedule } from '../../lib/api/types';
import { ConfirmDialog } from '../ConfirmDialog';
import { toast } from 'sonner';

export function WorkSchedules() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // States for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<WorkSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for new and editing schedules
  const [newSchedule, setNewSchedule] = useState<WorkSchedule>({
    id: '',
    name: '',
    morningStart: '08:00',
    morningEnd: '12:00',
    afternoonStart: '13:00',
    afternoonEnd: '17:00',
    tolerance: 15,
    isActive: false,
  });

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await schedulesService.getSchedules();
        if (response.success && response.data) {
          setSchedules(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Handlers for Add
  const handleAddChange = (field: keyof WorkSchedule, value: any) => {
    setNewSchedule((prev) => ({ ...prev, [field]: value }));
  };

  const validateSchedule = (schedule) => {
    const { name, morningStart, morningEnd, afternoonStart, afternoonEnd, tolerance } = schedule;
  
    if (!name || !name.trim()) {
      toast.error("Le nom de l'horaire est requis");
      return false;
    }
  
    if (morningStart >= morningEnd) {
      toast.error("L'heure de début du matin doit être avant l'heure de fin du matin");
      return false;
    }
  
    if (afternoonStart >= afternoonEnd) {
      toast.error("L'heure de début de l'après-midi doit être avant l'heure de fin de l'après-midi");
      return false;
    }
  
    if (morningEnd > afternoonStart) {
      toast.error("L'heure de fin du matin doit être avant le début de l'après-midi");
      return false;
    }
  
    if (isNaN(tolerance) || tolerance < 0) {
      toast.error("La tolérance doit être un nombre positif");
      return false;
    }
  
    return true; // ✅ Toutes les validations sont passées
  };
  

  const handleCreateSchedule = async () => {

    if (!validateSchedule(newSchedule)) return;
    
    try {
      const response = await schedulesService.createSchedule(newSchedule);
      if (response.success && response.data) {
        setSchedules((prev) => [...prev, response.data]);
        toast.success("Horaire créé avec succès !");
        setIsAddDialogOpen(false);
        setNewSchedule({
          id: '',
          name: '',
          morningStart: '08:00',
          morningEnd: '12:00',
          afternoonStart: '13:00',
          afternoonEnd: '17:00',
          tolerance: 15,
          isActive: false,
        });
      } else {
        toast.error('Échec de la création de l’horaire');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Une erreur inattendue est survenue');
    }
  };
  

  // Handlers for Edit
  const handleEditChange = (field: keyof WorkSchedule, value: any) => {
    if (editingSchedule) {
      setEditingSchedule((prev) => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSaveChanges = async () => {
    if (!editingSchedule) return;

    if (!validateSchedule(editingSchedule)) return; 

    try {
      const response = await schedulesService.updateSchedule(editingSchedule.id, editingSchedule);
      if (response.success && response.data) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingSchedule.id ? response.data : s))
        );
        toast.success('Schedule updated successfully');
        setEditingSchedule(null);
      } else {
        toast.error('Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Delete handlers
  const handleDeleteClick = (schedule: WorkSchedule) => {
    setScheduleToDelete(schedule);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;
    try {
      setIsDeleting(true);
      const response = await schedulesService.deleteSchedule(scheduleToDelete.id);
      if (response.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete.id));
        toast.success('Schedule deleted successfully');
      } else {
        toast.error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setConfirmDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const toggleActive = async (id: string) => {
    const updated = schedules.map((s) => ({
      ...s,
      isActive: s.id === id ? !s.isActive : false,
    }));
    setSchedules(updated);

    // Update active status via API
    const active = updated.find((s) => s.id === id);
    if (active) {
      await schedulesService.updateSchedule(id, { ...active });
    }
  };

  const formatTimeToHourMinute = (time: string | null): string | null => {
    if (!time) return time;
  
    const [h, m] = time.split(":");
  
    return `${h}h ${m}`;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-gray-100">Work Schedules</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Define and manage work schedules for your organization.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Schedules Table */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <TableHead className="dark:text-gray-300">Schedule Name</TableHead>
              <TableHead className="dark:text-gray-300">Morning Hours</TableHead>
              <TableHead className="dark:text-gray-300">Afternoon Hours</TableHead>
              <TableHead className="dark:text-gray-300">Tolerance</TableHead>
              <TableHead className="dark:text-gray-300">Status</TableHead>
              <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow
                key={schedule.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">{schedule.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {formatTimeToHourMinute(schedule.morningStart)} - {formatTimeToHourMinute(schedule.morningEnd)}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {formatTimeToHourMinute(schedule.afternoonStart)} - {formatTimeToHourMinute(schedule.afternoonEnd)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700">
                    {schedule.tolerance} min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleActive(schedule.id)}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSchedule(schedule)}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(schedule)}
                      className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                      disabled={!schedule.deletable}
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

      {/* --- Add Schedule Dialog --- */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Add New Schedule</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Create a new work schedule for your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="dark:text-gray-200">Schedule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Standard Schedule"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="morning-start" className="dark:text-gray-200">Morning Start</Label>
                <Input
                  id="morning-start"
                  type="time"
                  value={newSchedule.morningStart}
                  onChange={(e) => setNewSchedule({ ...newSchedule, morningStart: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="morning-end" className="dark:text-gray-200">Morning End</Label>
                <Input
                  id="morning-end"
                  type="time"
                  value={newSchedule.morningEnd}
                  onChange={(e) => setNewSchedule({ ...newSchedule, morningEnd: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="afternoon-start" className="dark:text-gray-200">Afternoon Start</Label>
                <Input
                  id="afternoon-start"
                  type="time"
                  value={newSchedule.afternoonStart}
                  onChange={(e) => setNewSchedule({ ...newSchedule, afternoonStart: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="afternoon-end" className="dark:text-gray-200">Afternoon End</Label>
                <Input
                  id="afternoon-end"
                  type="time"
                  value={newSchedule.afternoonEnd}
                  onChange={(e) => setNewSchedule({ ...newSchedule, afternoonEnd: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tolerance" className="dark:text-gray-200">Tolerance (minutes)</Label>
              <Input
                id="tolerance"
                type="number"
                value={newSchedule.tolerance}
                onChange={(e) => setNewSchedule({ ...newSchedule, tolerance: Number(e.target.value) })}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateSchedule}>
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Edit Schedule Dialog --- */}
      <Dialog open={!!editingSchedule} onOpenChange={() => setEditingSchedule(null)}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Edit Schedule</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update the schedule configuration.
            </DialogDescription>
          </DialogHeader>

          {editingSchedule && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="dark:text-gray-200">Schedule Name</Label>
                <Input
                  id="edit-name"
                  value={editingSchedule.name}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, name: e.target.value })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="dark:text-gray-200">Morning Start</Label>
                  <Input
                    type="time"
                    value={editingSchedule.morningStart}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, morningStart: e.target.value })}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="dark:text-gray-200">Morning End</Label>
                  <Input
                    type="time"
                    value={editingSchedule.morningEnd}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, morningEnd: e.target.value })}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="dark:text-gray-200">Afternoon Start</Label>
                  <Input
                    type="time"
                    value={editingSchedule.afternoonStart}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, afternoonStart: e.target.value })}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="dark:text-gray-200">Afternoon End</Label>
                  <Input
                    type="time"
                    value={editingSchedule.afternoonEnd}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, afternoonEnd: e.target.value })}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-tolerance" className="dark:text-gray-200">Tolerance (minutes)</Label>
                <Input
                  id="edit-tolerance"
                  type="number"
                  value={editingSchedule.tolerance}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, tolerance: Number(e.target.value) })}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchedule(null)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Work Schedule"
        description="Deleting this schedule will affect all agents currently assigned to it."
        itemName={scheduleToDelete?.name || ''}
        confirmText="Yes, Delete Schedule"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
/**/
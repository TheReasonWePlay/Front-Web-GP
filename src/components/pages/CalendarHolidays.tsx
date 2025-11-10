import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar as CalendarIcon, Plus, Download, Upload, Trash2, Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { calendarService } from '../../lib/api';
import type { Holiday } from '../../lib/api/types';
import { getDayStatistics, type DayStatistics } from '../../lib/api/legacy-types';
import { ConfirmDialog } from '../ConfirmDialog';
import { toast } from 'sonner';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDetails, setDayDetails] = useState<DayStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const [dayStatsMap, setDayStatsMap] = useState<Record<string, DayStatistics>>({});
  
  // Confirm dialog state for delete operations
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // état du formulaire d'ajout
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',        // "YYYY-MM-DD"
    recurring: false,
  });

  // état envoi
  const [isSubmittingHoliday, setIsSubmittingHoliday] = useState(false);

  //--------------------------

  useEffect(() => {
    const loadMonthStats = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
  
      const statsByDate: Record<string, DayStatistics> = {};
  
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const stats = await getDayStatistics(date);
        statsByDate[date.toISOString().split('T')[0]] = stats;
      }
  
      setDayStatsMap(statsByDate);
    };
  
    loadMonthStats();
  }, [currentDate]);
  

  // Fetch holidays from API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const response = await calendarService.getHolidays({
          year: currentDate.getFullYear(),
        });
        if (response.success && response.data) {
          setHolidays(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [currentDate]);


// simple validation minimale
const validateHoliday = (h: { name: string; date: string }) => {
  if (!h.name || !h.date) {
    return 'Please provide a title and a date for the holiday.';
  }

  // ✅ Vérification du nom (lettres, accents, espaces, tirets, apostrophes)
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  if (!nameRegex.test(h.name.trim())) {
    return "The holiday name contains invalid characters.";
  }

  // ✅ Vérification du format de date (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(h.date)) {
    return 'Date must be in YYYY-MM-DD format.';
  }

  return null;
};


const handleAddHoliday = async () => {
  const err = validateHoliday(newHoliday);
  if (err) {
    toast?.error ? toast.error(err) : alert(err);
    return;
  }

  try {
    setIsSubmittingHoliday(true);

    // appelle ton service back
    const response = await calendarService.createHoliday({
      name: newHoliday.name,
      date: newHoliday.date,
      recurring: newHoliday.recurring,
    });

    // réponse attendue: { success: true, data: Holiday }
    if (response?.success && response.data) {
      // Met à jour la liste locale (optimistic / client-side)
      setHolidays(prev => [ ...prev, response.data ]);

      // feedback
      toast?.success ? toast.success('Holiday added') : console.log('Holiday added');

      // reset form + fermer modal
      setNewHoliday({ name: '', date: '', recurring: false });
      setIsAddDialogOpen(false);
    } else {
      // Backend a renvoyé une erreur contrôlée
      const message = response?.error || response?.message || 'Failed to create holiday';
      toast?.error ? toast.error(message) : console.error(message);
    }
  } catch (error: any) {
    console.error('Error creating holiday:', error);
    toast?.error ? toast.error(error?.message || 'Network error') : alert(error?.message || 'Network error');
  } finally {
    setIsSubmittingHoliday(false);
  }
};


  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isWeekend = (day: number | null) => {
    if (day === null) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const formatLocalYMD = (isoOrDate: string | Date) => {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  
  const formatLocalMD = (isoOrDate: string | Date) => {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${m}-${day}`;
  };
  
  const isHoliday = (day: number | null) => {
    if (day === null) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
    return holidays.some(h => {
      // normal date comparison (local)
      if (h.recurring) {
        // recurring holiday: compare month-day only
        return formatLocalMD(h.date) === formatLocalMD(dateStr);
      }
      return formatLocalYMD(h.date) === dateStr;
    });
  };
  
  const getHolidayTitle = (day: number | null) => {
    if (day === null) return null;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
    const holiday = holidays.find(h => {
      if (h.recurring) {
        return formatLocalMD(h.date) === formatLocalMD(dateStr);
      }
      return formatLocalYMD(h.date) === dateStr;
    });
  
    return holiday?.name ?? null;
  };
  

  const isToday = (day: number | null) => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Show delete confirmation dialog
  const handleDeleteClick = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setConfirmDialogOpen(true);
  };

  // Perform the actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    if (!holidayToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await calendarService.deleteHoliday(holidayToDelete.id);
      
      if (response.success) {
        setHolidays(holidays.filter(h => h.id !== holidayToDelete.id));
        toast.success('Holiday deleted successfully', {
          description: `${holidayToDelete.name} has been removed from the calendar.`,
        });
      } else {
        toast.error('Failed to delete holiday', {
          description: response.error || 'An error occurred while deleting the holiday.',
        });
      }
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      toast.error('Failed to delete holiday', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setHolidayToDelete(null);
    }
  };

  const handleDateClick = async (day: number | null) => {
    if (day === null) return;
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  
    try {
      const data = await getDayStatistics(clickedDate);
      setDayDetails(data);
      console.log("Day details:", data);
    } catch (error) {
      console.error("Error fetching day statistics:", error);
    }
  };
  

  const getDayStats = (day: number | null) => {
    if (day === null) return null;
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return dayStatsMap[dateStr] || null;
  };
  

  return (
    <TooltipProvider delayDuration={300}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-gray-900 dark:text-gray-100">Calendar & Holidays</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage holidays and view daily attendance statistics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-gray-100">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth(-1)}
                  className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth(1)}
                  className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center p-2 text-sm text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentDate).map((day, index) => {
                const stats = getDayStats(day);
                console.log(stats);
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => handleDateClick(day)}
                        className={`
                          aspect-square p-2 text-center rounded-lg border transition-all
                          ${day === null ? 'border-transparent' : 'border-gray-200 dark:border-gray-600'}
                          ${isToday(day) ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 dark:border-blue-600 ring-2 ring-blue-300 dark:ring-blue-700' : ''}
                          ${isWeekend(day) && !isHoliday(day) ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                          ${isHoliday(day) ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700' : ''}
                          ${day !== null ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer hover:scale-105' : ''}
                        `}
                      >
                        {day !== null && (
                          <div className="h-full flex flex-col items-center justify-center">
                            <span className={`text-sm ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                              {day}
                            </span>
                            {isHoliday(day) && (
                              <span className="text-xs text-red-600 dark:text-red-400 mt-1 truncate w-full">
                                {getHolidayTitle(day)}
                              </span>
                            )}
                            {!isHoliday(day) && !isWeekend(day) && stats && (
                              <div className="mt-1 flex gap-1">
                                <div className={`w-1 h-1 rounded-full ${stats.attendanceRate >= 90 ? 'bg-green-500' : stats.attendanceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {day !== null && !isHoliday(day) && !isWeekend(day) && stats && (
                      <TooltipContent 
                        side="top" 
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                      >
                        <div className="space-y-2">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600 dark:text-gray-400">Attendance Rate:</span>
                              <span className={`${stats.attendanceRate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {stats.attendanceRate}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600 dark:text-gray-400">Present:</span>
                              <span className="text-gray-900 dark:text-gray-100">{stats.present}/{stats.totalAgents}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600 dark:text-gray-400">Late Arrivals:</span>
                              <span className="text-gray-900 dark:text-gray-100">{stats.late}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-gray-600 dark:text-gray-400">Absent:</span>
                              <span className="text-gray-900 dark:text-gray-100">{stats.absent}</span>
                            </div>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 pt-1 border-t border-gray-200 dark:border-gray-600">
                            Click for full details
                          </p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 border border-blue-500 dark:border-blue-600 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Holiday</span>
              </div>
            </div>
          </Card>

          {/* Holidays List */}
          <div className="space-y-6">
            <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-gray-100">Holidays</h3>
                <Button
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {holidays.map((holiday) => (
                  <div key={holiday.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{holiday.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {holiday.recurring && (
                          <Badge variant="outline" className="mt-2 text-xs dark:border-gray-600 dark:text-gray-300">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => handleDeleteClick(holiday)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
              <h3 className="text-gray-900 dark:text-gray-100 mb-4">Import / Export</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Import .ics File
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export Calendar
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Add Holiday Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Add Holiday</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Create a new holiday or non-working day.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="dark:text-gray-200">Holiday Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., New Year's Day"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date" className="dark:text-gray-200">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <Label htmlFor="recurring" className="dark:text-gray-200">Recurring Holiday</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Repeat this holiday every year</p>
                </div>
                <Switch
                  id="recurring"
                  checked={newHoliday.recurring}
                  onCheckedChange={(val) => setNewHoliday({...newHoliday, recurring: !!val})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  // reset form optionally
                  setNewHoliday({ name: '', date: '', recurring: false });
                }}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddHoliday}
                disabled={isSubmittingHoliday}
              >
                {isSubmittingHoliday ? 'Adding...' : 'Add Holiday'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Day Details Dialog */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col dark:bg-gray-800 dark:border-gray-700 p-0">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">
                  {selectedDate && selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Detailed attendance and pointage records for this day
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              {dayDetails && (
                <div className="space-y-6 py-6">
                  {/* Statistics Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Total Agents</p>
                          <p className="text-xl text-gray-900 dark:text-gray-100">{dayDetails.totalAgents}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Present</p>
                          <p className="text-xl text-gray-900 dark:text-gray-100">{dayDetails.present}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Late Arrivals</p>
                          <p className="text-xl text-gray-900 dark:text-gray-100">{dayDetails.late}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Absent</p>
                          <p className="text-xl text-gray-900 dark:text-gray-100">{dayDetails.absent}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</span>
                        <TrendingUp className={`w-4 h-4 ${dayDetails.attendanceRate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                      </div>
                      <p className="text-2xl text-gray-900 dark:text-gray-100">{dayDetails.attendanceRate}%</p>
                      <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${dayDetails.attendanceRate >= 90 ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${dayDetails.attendanceRate}%` }}
                        />
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Punctuality Rate</span>
                        <TrendingUp className={`w-4 h-4 ${dayDetails.punctualityRate >= 85 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                      </div>
                      <p className="text-2xl text-gray-900 dark:text-gray-100">{dayDetails.punctualityRate}%</p>
                      <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${dayDetails.punctualityRate >= 85 ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${dayDetails.punctualityRate}%` }}
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Pointage Records Table */}
                  <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-gray-900 dark:text-gray-100">Pointage Records</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        All check-in and check-out records for this day
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Agent</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Division</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Check-in AM</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Check-out AM</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Check-in PM</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Check-out PM</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap text-center">Number of Exits</TableHead>
                            <TableHead className="dark:text-gray-300 whitespace-nowrap">Total Missed Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dayDetails.pointageRecords.map((record) => (
                            <TableRow key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                                    {record.agentName.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className="text-gray-900 dark:text-gray-100 whitespace-nowrap">{record.agentName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 whitespace-nowrap">
                                  {record.division}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                {record.checkInAM || '-'}
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                {record.checkOutAM || '-'}
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                {record.checkInPM || '-'}
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                {record.checkOutPM || '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {record.temporaryExits && record.temporaryExits.length > 0 ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                                        {record.temporaryExits.length}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent 
                                      side="left" 
                                      className="max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg"
                                    >
                                      <div className="space-y-3">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                          Temporary Exits on this day:
                                        </p>
                                        <div className="space-y-2">
                                          {record.temporaryExits.map((exit) => (
                                            <div 
                                              key={exit.id} 
                                              className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                              <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                  {exit.exitTime} - {exit.returnTime}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                                                {exit.description}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={
                                    record.totalMissedTime && record.totalMissedTime !== '0h 0m'
                                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                      : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  }
                                >
                                  {record.totalMissedTime || '0h 0m'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="sticky bottom-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDate(null)}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title="Delete Holiday"
          description="Are you sure you want to delete this holiday? This will affect all work schedules and attendance calculations."
          itemName={holidayToDelete ? `${holidayToDelete.name} (${formatLocalMD(holidayToDelete.date)})` : ''}
          confirmText="Yes, Delete Holiday"
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
        />
      </div>
    </TooltipProvider>
  );
}

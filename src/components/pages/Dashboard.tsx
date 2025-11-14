import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import React from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  UserX, 
  Clock, 
  Plus,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statisticsService } from '../../lib/api';
import { useApi } from '../../lib/hooks/useApi';
import type { DashboardStats, RecentActivity } from '../../lib/api/types';
import { toast } from 'sonner';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch dashboard stats
      const statsResponse = await statisticsService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch recent activities
      const activitiesResponse = await statisticsService.getRecentActivities(5);
      if (activitiesResponse.success && activitiesResponse.data) {
        setActivities(activitiesResponse.data);
      }

      // Fetch attendance stats for charts
      const attendanceResponse = await statisticsService.getAttendanceStats();
      if (attendanceResponse.success && attendanceResponse.data) {
        setChartData(attendanceResponse.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error('Failed to load dashboard', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // KPI configuration
  const kpiData = stats ? [
    { 
      label: 'Present Today', 
      value: stats.presentToday, 
      icon: Users, 
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: 'Absent Today', 
      value: stats.absentToday, 
      icon: UserX, 
      color: 'text-red-600 dark:text-red-400', 
      bgColor: 'bg-red-50 dark:bg-red-900/20' 
    },
    { 
      label: 'Late Arrivals', 
      value: stats.lateArrivals, 
      icon: Clock, 
      color: 'text-orange-600 dark:text-orange-400', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20' 
    },
  ] : [];

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'check-in':
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'check-out':
        return <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'leave-request':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Get activity background color
  const getActivityBgColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'check-in':
      case 'check-out':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'leave-request':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };  

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2 dark:bg-gray-700" />
          <Skeleton className="h-4 w-96 dark:bg-gray-700" />
        </div>

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="h-24 dark:bg-gray-700" />
            </Card>
          ))}
        </div>

        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="h-[300px] dark:bg-gray-700" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchDashboardData}
          className="dark:border-gray-600 dark:text-gray-300"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{kpi.label}</p>
                <p className="text-3xl text-gray-900 dark:text-gray-100">{kpi.value}</p>
              </div>
              <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-lg`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Attendance */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Weekly Attendance Overview</h3>
          {chartData && chartData.daily ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.daily.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  className="dark:stroke-gray-400"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31, 41, 55)', 
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '8px',
                    color: 'rgb(229, 231, 235)'
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Monthly Attendance Trend</h3>
          {chartData && chartData.monthly ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31, 41, 55)', 
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '8px',
                    color: 'rgb(229, 231, 235)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Taux de présence" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Recent Activities</h3>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className={`p-2 rounded-lg ${getActivityBgColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-900 dark:text-gray-100">{activity.agentName}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activities
            </div>
          )}
        </Card>

        {/* Quick Actions & Summary */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report Excel
            </Button>
            <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report Pdf
            </Button>
          </div>

          {stats && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3">Today's Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Staff</span>
                  <span className="text-gray-900 dark:text-gray-100">{stats.totalAgents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stats.attendanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Avg Work Hours</span>
                  <span className="text-gray-900 dark:text-gray-100">{stats.avgWorkHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

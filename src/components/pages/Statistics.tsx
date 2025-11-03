import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FileText, Download } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Placeholder data for charts - replace with API data in production
const divisionAttendanceData = [
  { division: 'IT', rate: 95 },
  { division: 'HR', rate: 92 },
  { division: 'Finance', rate: 94 },
  { division: 'Sales', rate: 88 },
  { division: 'Marketing', rate: 91 },
];

const punctualityTrends = [
  { week: 'Week 1', onTime: 85, late: 10, absent: 5 },
  { week: 'Week 2', onTime: 88, late: 8, absent: 4 },
  { week: 'Week 3', onTime: 90, late: 6, absent: 4 },
  { week: 'Week 4', onTime: 87, late: 9, absent: 4 },
];

const absenceData = [
  { month: 'Jan', rate: 8 },
  { month: 'Feb', rate: 11 },
  { month: 'Mar', rate: 6 },
  { month: 'Apr', rate: 9 },
  { month: 'May', rate: 7 },
  { month: 'Jun', rate: 10 },
  { month: 'Jul', rate: 12 },
  { month: 'Aug', rate: 8 },
  { month: 'Sep', rate: 5 },
  { month: 'Oct', rate: 7 },
];

const statusDistribution = [
  { name: 'Present', value: 87, color: '#3b82f6' },
  { name: 'Absent', value: 5, color: '#ef4444' },
  { name: 'Late', value: 8, color: '#f59e0b' },
];

export function Statistics() {
  const [timePeriod, setTimePeriod] = useState('monthly');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-gray-100">Statistics & Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze attendance trends and generate reports.</p>
      </div>

      {/* Filters and Export */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time Period:</span>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[150px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              Export as Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Rate by Division */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Attendance Rate by Division</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={divisionAttendanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
              <XAxis type="number" domain={[0, 100]} stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis type="category" dataKey="division" stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '8px',
                  color: 'rgb(229, 231, 235)'
                }}
              />
              <Bar dataKey="rate" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                {divisionAttendanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.rate >= 90 ? '#10b981' : entry.rate >= 85 ? '#3b82f6' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Today's Status Distribution */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Today's Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '8px',
                  color: 'rgb(229, 231, 235)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Punctuality Trends */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Punctuality Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={punctualityTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
              <XAxis dataKey="week" stroke="#6b7280" className="dark:stroke-gray-400" />
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
                dataKey="onTime" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="late" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="absent" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Absence Rates */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Monthly Absence Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={absenceData}>
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
              <Bar dataKey="rate" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-800">
          <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Average Attendance Rate</h4>
          <p className="text-3xl text-blue-600 dark:text-blue-400 mb-1">92.3%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">+2.1% from last month</p>
        </Card>
        <Card className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-800">
          <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Best Performing Division</h4>
          <p className="text-3xl text-green-600 dark:text-green-400 mb-1">IT</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">95% attendance rate</p>
        </Card>
        <Card className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-800">
          <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Average Late Arrivals</h4>
          <p className="text-3xl text-orange-600 dark:text-orange-400 mb-1">8 / day</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">-1 from last month</p>
        </Card>
      </div>
    </div>
  );
}

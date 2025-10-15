import { useRef, useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, TrendingUp, Award, User, QrCode, Printer } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { agentsService } from '../../lib/api';
import type { Agent, AgentDetails } from '../../lib/api/types';
import { toast } from 'sonner@2.0.3';
import { getInitials } from '../../lib/utils';

export function PersonalHistory() {
  const { currentUser } = useAuth();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current agent's data
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const agentsResponse = await agentsService.getAgents({ pageSize: 100 });
        if (agentsResponse.success && agentsResponse.data) {
          // Match agent by username or use first agent as fallback for demo
          const agent = agentsResponse.data.data.find(a => a.name.toLowerCase().includes(currentUser.username.toLowerCase())) 
                     || agentsResponse.data.data[0];
          if (agent) {
            setCurrentAgent(agent);
            
            const detailsResponse = await agentsService.getAgentById(agent.matricule);
            if (detailsResponse.success && detailsResponse.data) {
              setAgentDetails(detailsResponse.data);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch agent data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [currentUser]);

  if (loading || !currentAgent) {
    return (
      <div className="p-8">
        <p className="text-gray-500 dark:text-gray-400">Loading your data...</p>
      </div>
    );
  }

  // Print QR Code functionality
  const handlePrintQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print QR code');
      return;
    }

    const qrCodeContent = qrCodeRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${currentAgent.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #2563eb;
              padding: 30px;
              border-radius: 12px;
              background: white;
            }
            .qr-code {
              margin: 20px auto;
            }
            h1 {
              color: #1f2937;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .info {
              color: #6b7280;
              margin: 5px 0;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${currentAgent.name}</h1>
            <p class="info">ID: ${currentAgent.matricule}</p>
            <p class="info">${currentAgent.position} - ${currentAgent.division}</p>
            <div class="qr-code">
              ${qrCodeContent}
            </div>
            <p class="info" style="margin-top: 20px;">Staff Attendance Management System</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    toast.success('Printing QR code...');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-gray-100">Personal History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View your attendance records and performance metrics.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl">
              {getInitials(currentAgent.name)}
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 dark:text-gray-100 mb-1">{currentAgent.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{currentAgent.position}</p>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={currentAgent.status === 'Active' ? 'default' : 'secondary'}
                  className={currentAgent.status === 'Active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                >
                  {currentAgent.status}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {currentAgent.department}
                </Badge>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-gray-100 mb-3">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Matricule:</span>
                <span className="text-gray-900 dark:text-gray-100">{currentAgent.matricule}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Department:</span>
                <span className="text-gray-900 dark:text-gray-100">{currentAgent.department}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Work Schedule:</span>
                <span className="text-gray-900 dark:text-gray-100">{agentDetails?.currentSchedule || 'Standard'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* QR Code Section */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-gray-900 dark:text-gray-100">Personal QR Code</h2>
            </div>
            <Button
              onClick={handlePrintQRCode}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print QR Code
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div 
              ref={qrCodeRef}
              className="flex-shrink-0 p-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-blue-200 dark:border-blue-800"
            >
              {/* QR Code SVG */}
              <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-auto">
                <rect width="200" height="200" fill="white"/>
                {/* QR Code pattern - simplified representation */}
                {/* Top-left position marker */}
                <rect x="10" y="10" width="60" height="60" fill="none" stroke="black" strokeWidth="6"/>
                <rect x="22" y="22" width="36" height="36" fill="black"/>
                
                {/* Top-right position marker */}
                <rect x="130" y="10" width="60" height="60" fill="none" stroke="black" strokeWidth="6"/>
                <rect x="142" y="22" width="36" height="36" fill="black"/>
                
                {/* Bottom-left position marker */}
                <rect x="10" y="130" width="60" height="60" fill="none" stroke="black" strokeWidth="6"/>
                <rect x="22" y="142" width="36" height="36" fill="black"/>
                
                {/* Data pattern - simplified */}
                <g fill="black">
                  {/* Row 1 */}
                  <rect x="80" y="10" width="8" height="8"/>
                  <rect x="90" y="10" width="8" height="8"/>
                  <rect x="100" y="10" width="8" height="8"/>
                  <rect x="110" y="10" width="8" height="8"/>
                  
                  {/* Row 2 */}
                  <rect x="80" y="20" width="8" height="8"/>
                  <rect x="100" y="20" width="8" height="8"/>
                  
                  {/* Row 3 */}
                  <rect x="80" y="30" width="8" height="8"/>
                  <rect x="90" y="30" width="8" height="8"/>
                  <rect x="110" y="30" width="8" height="8"/>
                  
                  {/* Center pattern */}
                  <rect x="80" y="80" width="8" height="8"/>
                  <rect x="90" y="80" width="8" height="8"/>
                  <rect x="100" y="80" width="8" height="8"/>
                  <rect x="110" y="80" width="8" height="8"/>
                  
                  <rect x="80" y="90" width="8" height="8"/>
                  <rect x="100" y="90" width="8" height="8"/>
                  <rect x="110" y="90" width="8" height="8"/>
                  
                  <rect x="80" y="100" width="8" height="8"/>
                  <rect x="90" y="100" width="8" height="8"/>
                  <rect x="110" y="100" width="8" height="8"/>
                  
                  <rect x="90" y="110" width="8" height="8"/>
                  <rect x="100" y="110" width="8" height="8"/>
                  
                  {/* Right side pattern */}
                  <rect x="130" y="80" width="8" height="8"/>
                  <rect x="140" y="80" width="8" height="8"/>
                  <rect x="150" y="80" width="8" height="8"/>
                  <rect x="160" y="80" width="8" height="8"/>
                  <rect x="170" y="80" width="8" height="8"/>
                  <rect x="180" y="80" width="8" height="8"/>
                  
                  <rect x="130" y="90" width="8" height="8"/>
                  <rect x="150" y="90" width="8" height="8"/>
                  <rect x="170" y="90" width="8" height="8"/>
                  
                  <rect x="140" y="100" width="8" height="8"/>
                  <rect x="160" y="100" width="8" height="8"/>
                  <rect x="180" y="100" width="8" height="8"/>
                  
                  <rect x="130" y="110" width="8" height="8"/>
                  <rect x="150" y="110" width="8" height="8"/>
                  <rect x="170" y="110" width="8" height="8"/>
                  
                  {/* Bottom pattern */}
                  <rect x="80" y="130" width="8" height="8"/>
                  <rect x="90" y="130" width="8" height="8"/>
                  <rect x="100" y="130" width="8" height="8"/>
                  <rect x="110" y="130" width="8" height="8"/>
                  
                  <rect x="80" y="140" width="8" height="8"/>
                  <rect x="100" y="140" width="8" height="8"/>
                  <rect x="110" y="140" width="8" height="8"/>
                  
                  <rect x="90" y="150" width="8" height="8"/>
                  <rect x="110" y="150" width="8" height="8"/>
                  
                  <rect x="80" y="160" width="8" height="8"/>
                  <rect x="100" y="160" width="8" height="8"/>
                  
                  <rect x="80" y="170" width="8" height="8"/>
                  <rect x="90" y="170" width="8" height="8"/>
                  <rect x="110" y="170" width="8" height="8"/>
                  
                  <rect x="100" y="180" width="8" height="8"/>
                  <rect x="110" y="180" width="8" height="8"/>
                </g>
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-gray-100 mb-3">About Your QR Code</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This QR code is uniquely generated for you and contains your employee identification information. 
                Use it for quick check-in at attendance terminals.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-gray-100">ID:</span> {currentAgent.matricule}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-gray-100">Name:</span> {currentAgent.name}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-gray-100">Department:</span> {currentAgent.department}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>Tip:</strong> Print and keep your QR code in a safe place. You can use it for contactless attendance tracking.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Present</p>
                <p className="text-2xl text-gray-900 dark:text-gray-100">{agentDetails.totalDaysPresent}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
          </Card>

          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Late Arrivals</p>
                <p className="text-2xl text-gray-900 dark:text-gray-100">{agentDetails.totalLateDays}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
          </Card>

          <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl text-gray-900 dark:text-gray-100">{agentDetails.averageAttendanceRate}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          </Card>
        </div>

        {/* Recent Attendance History */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <h2 className="text-gray-900 dark:text-gray-100 mb-4">Recent Attendance (Last 10 Days)</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {agentDetails?.attendanceHistory?.map((record) => (
              <div key={record.attendanceId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'Present' ? 'bg-green-500' :
                    record.status === 'Late' ? 'bg-orange-500' :
                    record.status === 'Absent' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{record.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      record.status === 'Present' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      record.status === 'Late' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      record.status === 'Absent' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {record.status}
                  </Badge>
                  {record.checkIn && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {record.checkIn} - {record.checkOut}
                    </p>
                  )}
                </div>
              </div>
            )) || <p className="text-gray-500 dark:text-gray-400 text-center py-4">No attendance records found</p>}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-gray-900 dark:text-gray-100">Performance Metrics (Last 6 Months)</h2>
          </div>
          <div className="space-y-4">
            {agentDetails?.performanceMetrics?.map((metric, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-gray-900 dark:text-gray-100">{metric.month}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metric.year}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`${
                      metric.rating === 'Excellent' 
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : metric.rating === 'Good'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {metric.rating}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Attendance</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{metric.attendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">On Time</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{metric.punctualityRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{metric.overallScore}/100</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
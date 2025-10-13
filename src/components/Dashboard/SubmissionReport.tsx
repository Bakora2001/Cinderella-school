import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, TrendingUp, Calendar, School, Users, Clock, CheckCircle, Eye, ExternalLink } from 'lucide-react';
import { mockSubmissions, mockAssignments } from '../../data/mockData';

interface SubmissionReportProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubmissionReport({ isOpen, onOpenChange }: SubmissionReportProps) {
  const [reportType, setReportType] = useState<'all' | 'student' | 'teacher'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const generateReport = () => {
    let filteredSubmissions = mockSubmissions;

    // Filter by date range if provided
    if (startDate) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => new Date(sub.submittedAt) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => new Date(sub.submittedAt) <= new Date(endDate)
      );
    }

    return filteredSubmissions;
  };

  const viewPDFReport = (pdfUrl: string, title: string) => {
    // In a real application, this would open the actual PDF
    // For demo purposes, we'll show an alert
    alert(`Opening PDF Report: ${title}\nURL: ${pdfUrl}\n\nIn a real application, this would open the PDF document in a new tab or embedded viewer.`);
  };

  const printReport = () => {
    const submissions = generateReport();
    const submissionsByStudent = submissions.reduce((acc, sub) => {
      if (!acc[sub.studentName]) {
        acc[sub.studentName] = [];
      }
      acc[sub.studentName].push(sub);
      return acc;
    }, {} as Record<string, typeof mockSubmissions>);

    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Submission Report - New Cinderella International School</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
          }
          
          .report-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #dc2626, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6);
          }
          
          .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          .school-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #dc2626, #ef4444);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: white;
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
          }
          
          .school-name {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .report-title {
            font-size: 20px;
            font-weight: 600;
            opacity: 0.9;
            margin-bottom: 15px;
          }
          
          .report-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.1);
            padding: 8px 16px;
            border-radius: 25px;
            backdrop-filter: blur(10px);
          }
          
          .content {
            padding: 40px;
          }
          
          .summary-section {
            background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 40px;
            border: 1px solid #fecaca;
            position: relative;
            overflow: hidden;
          }
          
          .summary-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #dc2626, #ef4444);
          }
          
          .summary-title {
            font-size: 24px;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .summary-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid #f1f5f9;
          }
          
          .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          
          .summary-icon {
            width: 50px;
            height: 50px;
            margin: 0 auto 15px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
          }
          
          .summary-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .summary-value {
            font-size: 28px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 5px;
          }
          
          .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin: 40px 0 25px 0;
            padding-bottom: 15px;
            border-bottom: 3px solid #e2e8f0;
            position: relative;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #dc2626, #ef4444);
          }
          
          .student-section {
            margin-bottom: 40px;
            background: #fafafa;
            border-radius: 12px;
            padding: 25px;
            border: 1px solid #e5e7eb;
          }
          
          .student-header {
            background: linear-gradient(135deg, #374151, #4b5563);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .student-name {
            font-size: 18px;
            font-weight: 600;
          }
          
          .submission-count {
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }
          
          .submissions-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .submissions-table th {
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .submissions-table td {
            padding: 15px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          
          .submissions-table tr:hover {
            background: #f8fafc;
          }
          
          .submissions-table tr:last-child td {
            border-bottom: none;
          }
          
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          
          .status-submitted {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #92400e;
            border: 1px solid #f59e0b;
          }
          
          .status-reviewed {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
            border: 1px solid #10b981;
          }
          
          .status-graded {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            border: 1px solid #3b82f6;
          }
          
          .status-late {
            background: linear-gradient(135deg, #fecaca, #fca5a5);
            color: #991b1b;
            border: 1px solid #ef4444;
          }
          
          .grade-cell {
            text-align: center;
            font-weight: 600;
            font-size: 16px;
          }
          
          .no-submissions {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
            background: #f8fafc;
            border-radius: 12px;
            border: 2px dashed #cbd5e1;
          }
          
          .no-submissions-icon {
            font-size: 48px;
            margin-bottom: 20px;
            opacity: 0.5;
          }
          
          .footer {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            margin-top: 40px;
          }
          
          .footer-content {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .footer-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
          }
          
          .footer-text {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          
          .report-id {
            background: #e2e8f0;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #475569;
            font-weight: 600;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .report-container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .summary-card:hover {
              transform: none;
            }
          }
          
          @media (max-width: 768px) {
            .report-meta {
              flex-direction: column;
              align-items: center;
            }
            
            .summary-grid {
              grid-template-columns: 1fr;
            }
            
            .submissions-table {
              font-size: 12px;
            }
            
            .submissions-table th,
            .submissions-table td {
              padding: 10px 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="school-logo">🎓</div>
            <h1 class="school-name">New Cinderella International School</h1>
            <h2 class="report-title">Admin Audit Form - Submission Report</h2>
            <div class="report-meta">
              <div class="meta-item">
                <span>📅</span>
                <span>Generated: ${reportDate}</span>
              </div>
              <div class="meta-item">
                <span>📊</span>
                <span>Period: ${dateRange}</span>
              </div>
              <div class="meta-item">
                <span>📋</span>
                <span>Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</span>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="summary-section">
              <h3 class="summary-title">
                <span>📈</span>
                Report Summary
              </h3>
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">📝</div>
                  <div class="summary-label">Total Submissions</div>
                  <div class="summary-value">${submissions.length}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">👥</div>
                  <div class="summary-label">Unique Students</div>
                  <div class="summary-value">${Object.keys(submissionsByStudent).length}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">⏳</div>
                  <div class="summary-label">Pending Review</div>
                  <div class="summary-value">${submissions.filter(s => s.status === 'submitted').length}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon" style="background: linear-gradient(135deg, #10b981, #059669);">✅</div>
                  <div class="summary-label">Reviewed/Graded</div>
                  <div class="summary-value">${submissions.filter(s => s.status === 'reviewed' || s.status === 'graded').length}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">⚠️</div>
                  <div class="summary-label">Late Submissions</div>
                  <div class="summary-value">${submissions.filter(s => s.status === 'late' || (s as any).isLate).length}</div>
                </div>
              </div>
            </div>

            <h3 class="section-title">📚 Detailed Submissions by Student</h3>
            
            ${Object.keys(submissionsByStudent).length === 0 ? 
              `<div class="no-submissions">
                <div class="no-submissions-icon">📭</div>
                <h4>No Submissions Found</h4>
                <p>No submissions match the selected criteria for this reporting period.</p>
              </div>` :
              Object.entries(submissionsByStudent).map(([studentName, studentSubmissions]) => `
                <div class="student-section">
                  <div class="student-header">
                    <div class="student-name">👨‍🎓 ${studentName}</div>
                    <div class="submission-count">${studentSubmissions.length} submission${studentSubmissions.length > 1 ? 's' : ''}</div>
                  </div>
                  <table class="submissions-table">
                    <thead>
                      <tr>
                        <th>📋 Assignment</th>
                        <th>📚 Subject</th>
                        <th>📅 Submitted Date</th>
                        <th>🔄 Status</th>
                        <th>🎯 Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${studentSubmissions.map(sub => {
                        const assignment = mockAssignments.find(a => a.id === sub.assignmentId);
                        const statusClass = sub.status === 'reviewed' ? 'status-reviewed' : 
                                          sub.status === 'graded' ? 'status-graded' :
                                          sub.status === 'late' ? 'status-late' : 'status-submitted';
                        const statusText = sub.status === 'reviewed' ? '✅ Reviewed' : 
                                         sub.status === 'graded' ? '🎯 Graded' :
                                         sub.status === 'late' ? '⚠️ Late' : '⏳ Pending Review';
                        
                        return `
                          <tr>
                            <td><strong>${assignment?.title || 'N/A'}</strong></td>
                            <td>${assignment?.subject || 'N/A'}</td>
                            <td>${new Date(sub.submittedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</td>
                            <td>
                              <span class="status-badge ${statusClass}">
                                ${statusText}
                              </span>
                            </td>
                            <td class="grade-cell">${sub.grade || '—'}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('')
            }
          </div>

          <div class="footer">
            <div class="footer-content">
              <div class="footer-title">New Cinderella International School</div>
              <p class="footer-text">
                This is an official automated report generated by the school management system.<br>
                All data is confidential and intended for administrative use only.
              </p>
              <div class="report-id">
                Report ID: ${Math.random().toString(36).substring(7).toUpperCase()}-${new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const submissions = generateReport();
  const submissionsByStudent = submissions.reduce((acc, sub) => {
    if (!acc[sub.studentName]) {
      acc[sub.studentName] = [];
    }
    acc[sub.studentName].push(sub);
    return acc;
  }, {} as Record<string, typeof mockSubmissions>);

  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const dateRange = startDate && endDate 
    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    : 'All Time';

  // Mock teacher reports data
  const mockTeacherReports = [
    {
      id: '1',
      teacherId: '2',
      teacherName: 'Sarah Johnson',
      title: 'Mathematics Department - Q1 Progress Report',
      description: 'Comprehensive analysis of student performance in mathematics courses during the first quarter.',
      createdAt: '2024-01-30T14:00:00Z',
      pdfUrl: '/reports/math_q1_progress.pdf',
      reportType: 'class_summary',
      isPublic: true
    },
    {
      id: '2',
      teacherId: '3',
      teacherName: 'Michael Brown',
      title: 'English Literature - Student Assessment Summary',
      description: 'Detailed assessment of student writing skills and literary analysis capabilities.',
      createdAt: '2024-02-01T10:30:00Z',
      pdfUrl: '/reports/english_assessment_summary.pdf',
      reportType: 'student_progress',
      isPublic: true
    },
    {
      id: '3',
      teacherId: '2',
      teacherName: 'Sarah Johnson',
      title: 'Chemistry Lab Safety Compliance Report',
      description: 'Monthly report on lab safety protocols and student compliance during chemistry experiments.',
      createdAt: '2024-02-05T16:45:00Z',
      pdfUrl: '/reports/chemistry_safety_report.pdf',
      reportType: 'other',
      isPublic: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            Admin Reports Dashboard
          </DialogTitle>
          <DialogDescription>
            Generate submission reports and view teacher PDF reports
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions">Submission Reports</TabsTrigger>
            <TabsTrigger value="teacher-reports">Teacher PDF Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submissions" className="space-y-6">
            {/* Report Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Report Type
                </Label>
                <Select value={reportType} onValueChange={(value: 'all' | 'student' | 'teacher') => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submissions</SelectItem>
                    <SelectItem value="student">Student Submissions</SelectItem>
                    <SelectItem value="teacher">Teacher Assignments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-red-200 focus:border-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
            </div>

            {/* Report Preview */}
            <Card className="border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <School className="h-5 w-5" />
                  Report Preview
                </CardTitle>
                <CardDescription>
                  Preview of the beautifully styled report with current filter settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-600 font-medium">Total Submissions</p>
                    <p className="text-2xl font-bold text-blue-800">{submissions.length}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 font-medium">Reviewed/Graded</p>
                    <p className="text-2xl font-bold text-green-800">
                      {submissions.filter((s) => s.status === 'reviewed' || s.status === 'graded').length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {submissions.filter((s) => s.status === 'submitted').length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-red-600 font-medium">Late</p>
                    <p className="text-2xl font-bold text-red-800">
                      {submissions.filter((s) => s.status === 'late' || (s as any).isLate).length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-purple-600 font-medium">Students</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {Object.keys(submissionsByStudent).length}
                    </p>
                  </div>
                </div>

                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
                    <p>No submissions match the selected criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {submissions.slice(0, 5).map((submission, index) => {
                      const assignment = mockAssignments.find(
                        (a) => a.id === submission.assignmentId
                      );

                      return (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{assignment?.title || 'N/A'}</h4>
                            <p className="text-sm text-gray-600">
                              {submission.studentName} • {assignment?.subject || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              submission.status === 'reviewed' || submission.status === 'graded'
                                ? 'default'
                                : submission.status === 'late'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className={
                              submission.status === 'reviewed' || submission.status === 'graded'
                                ? 'bg-green-600 hover:bg-green-700'
                                : submission.status === 'late'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-yellow-600 hover:bg-yellow-700'
                            }
                          >
                            {submission.status === 'reviewed' ? 'Reviewed' : 
                             submission.status === 'graded' ? 'Graded' :
                             submission.status === 'late' ? 'Late' : 'Pending'}
                          </Badge>
                        </div>
                      );
                    })}
                    {submissions.length > 5 && (
                      <p className="text-center text-sm text-gray-500 py-2">
                        ... and {submissions.length - 5} more submissions
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={printReport} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                disabled={submissions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate & Print Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="teacher-reports" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <FileText className="h-5 w-5" />
                  Teacher PDF Reports
                </CardTitle>
                <CardDescription>
                  View and download PDF reports submitted by teachers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {mockTeacherReports.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No teacher reports found</h3>
                    <p>No PDF reports have been submitted by teachers yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockTeacherReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>👨‍🏫 {report.teacherName}</span>
                            <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {report.reportType.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {report.isPublic && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                PUBLIC
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewPDFReport(report.pdfUrl, report.title)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // In a real application, this would download the PDF
                              alert(`Downloading: ${report.title}\nURL: ${report.pdfUrl}`);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
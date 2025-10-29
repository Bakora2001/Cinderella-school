import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  HelpCircle, FileText, Upload, Eye, Download, CheckCircle, 
  Clock, AlertCircle, MessageSquare, Calendar, Users, BookOpen
} from 'lucide-react';

export default function StudentHelp() {
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Help & Instructions</h1>
        <p className="text-gray-600 mt-1">Learn how to use the assignment system effectively</p>
      </div>

      {/* Quick Start Guide */}
      <Card className="shadow-lg border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-blue-800">View Assignments</h3>
                  <p className="text-sm text-blue-700">Check the Assignments tab to see all available work</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-green-800">Complete Work</h3>
                  <p className="text-sm text-green-700">Download, complete, and prepare your assignment</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-purple-800">Submit</h3>
                  <p className="text-sm text-purple-700">Upload your completed work before the deadline</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Instructions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Detailed Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Viewing Assignments
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• Navigate to the <strong>Assignments</strong> tab from the sidebar or dashboard</p>
                  <p>• Browse through all available assignments for your class</p>
                  <p>• Use the search bar to find specific assignments quickly</p>
                  <p>• Filter by status: All, Pending, Submitted, or Overdue</p>
                  <p>• Check the countdown timer to see time remaining</p>
                  <p>• Look for badges indicating assignment status and priority</p>
                  <Alert className="mt-3 border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Tip:</strong> Assignments with red badges are overdue. Prioritize these first!
                    </AlertDescription>
                  </Alert>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Previewing Documents
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• Click the <strong>"View"</strong> button to preview assignment documents</p>
                  <p>• Supported formats: PDF, images, videos, and more</p>
                  <p>• Read the instructions carefully before starting</p>
                  <p>• Note any specific requirements or guidelines</p>
                  <Alert className="mt-3 border-purple-200 bg-purple-50">
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>Note:</strong> Some file types may require downloading to view properly.
                    </AlertDescription>
                  </Alert>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Downloading Materials
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• Click the <strong>"Download"</strong> button to save files locally</p>
                  <p>• Files will be saved to your default download location</p>
                  <p>• Open downloaded files with appropriate software</p>
                  <p>• Keep original files for reference</p>
                  <p>• Make sure you have enough storage space</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-orange-600" />
                  Submitting Assignments
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p><strong>Step 1:</strong> Complete your assignment work offline</p>
                  <p><strong>Step 2:</strong> Save your work in an acceptable format (PDF, DOC, DOCX, images)</p>
                  <p><strong>Step 3:</strong> Click the <strong>"Submit"</strong> button on the assignment card</p>
                  <p><strong>Step 4:</strong> Click "Choose File" and select your completed work</p>
                  <p><strong>Step 5:</strong> Review the file name to ensure it's correct</p>
                  <p><strong>Step 6:</strong> Click "Submit Assignment" to upload</p>
                  <Alert className="mt-3 border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Important:</strong> Always submit before the deadline. Late submissions may not be accepted!
                    </AlertDescription>
                  </Alert>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <p className="font-semibold mb-2">Acceptable File Formats:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>PDF (.pdf) - Recommended</li>
                      <li>Word Documents (.doc, .docx)</li>
                      <li>Text Files (.txt)</li>
                      <li>Images (.jpg, .jpeg, .png)</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Tracking Submissions
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• Go to <strong>"My Submissions"</strong> tab to see all submitted work</p>
                  <p>• View submission dates and times</p>
                  <p>• Check grading status (Submitted, Graded)</p>
                  <p>• View grades once teacher has reviewed your work</p>
                  <p>• Read teacher feedback and comments</p>
                  <p>• Use feedback to improve future submissions</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Understanding Feedback
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• Teacher feedback appears in the blue box on graded assignments</p>
                  <p>• Read feedback carefully to understand your performance</p>
                  <p>• Note areas for improvement</p>
                  <p>• Apply feedback to future assignments</p>
                  <p>• If unclear, ask your teacher for clarification</p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold mb-2">Grade Interpretation:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>90-100%:</strong> Excellent work</li>
                      <li>• <strong>80-89%:</strong> Very good performance</li>
                      <li>• <strong>70-79%:</strong> Good, satisfactory work</li>
                      <li>• <strong>60-69%:</strong> Passing, but needs improvement</li>
                      <li>• <strong>Below 60%:</strong> Needs significant improvement</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Using the Calendar
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• Access the Calendar tab to see all due dates visually</p>
                  <p>• Days with assignments show colored indicators</p>
                  <p>• Green: Submitted assignments</p>
                  <p>• Orange: Pending assignments</p>
                  <p>• Red: Overdue assignments</p>
                  <p>• Click on any date to see assignments due that day</p>
                  <p>• Plan your work schedule using the calendar view</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg hover:text-blue-600">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Classmates Feature
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-gray-700 pl-7">
                  <p>• View all classmates in your class</p>
                  <p>• See who's currently online (green indicator)</p>
                  <p>• Check total classmate count</p>
                  <p>• Great for forming study groups</p>
                  <p>• Connect with peers for collaboration</p>
                  <Alert className="mt-3 border-green-200 bg-green-50">
                    <Users className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Collaboration:</strong> Work with classmates, but make sure to submit individual work unless it's a group assignment.
                    </AlertDescription>
                  </Alert>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Best Practices for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-green-800 mb-2">✓ Do's</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Check for new assignments daily</li>
                <li>• Start work early, don't wait until the last minute</li>
                <li>• Read instructions carefully before starting</li>
                <li>• Save your work frequently while working</li>
                <li>• Submit assignments well before the deadline</li>
                <li>• Review feedback from previous assignments</li>
                <li>• Keep track of multiple assignment deadlines</li>
                <li>• Ask for help if you don't understand something</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-red-800 mb-2">✗ Don'ts</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Don't wait until the deadline to submit</li>
                <li>• Don't ignore teacher feedback</li>
                <li>• Don't submit work in unsupported formats</li>
                <li>• Don't forget to check submission confirmation</li>
                <li>• Don't copy from others (plagiarism)</li>
                <li>• Don't leave assignments incomplete</li>
                <li>• Don't ignore due dates and reminders</li>
                <li>• Don't submit without reviewing your work</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Troubleshooting Common Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-red-600 bg-red-50 rounded">
              <h4 className="font-semibold text-red-800 mb-2">Cannot see assignments</h4>
              <p className="text-sm text-red-700">• Try refreshing the page</p>
              <p className="text-sm text-red-700">• Check your internet connection</p>
              <p className="text-sm text-red-700">• Make sure you're logged into the correct account</p>
            </div>

            <div className="p-4 border-l-4 border-l-orange-600 bg-orange-50 rounded">
              <h4 className="font-semibold text-orange-800 mb-2">Upload fails</h4>
              <p className="text-sm text-orange-700">• Check file size (should be under 10MB)</p>
              <p className="text-sm text-orange-700">• Verify file format is supported</p>
              <p className="text-sm text-orange-700">• Ensure stable internet connection</p>
              <p className="text-sm text-orange-700">• Try a different browser if problem persists</p>
            </div>

            <div className="p-4 border-l-4 border-l-blue-600 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Cannot view documents</h4>
              <p className="text-sm text-blue-700">• Try downloading the file instead</p>
              <p className="text-sm text-blue-700">• Make sure your browser is up to date</p>
              <p className="text-sm text-blue-700">• Enable pop-ups if blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Alert className="border-blue-200 bg-blue-50 shadow-lg">
        <HelpCircle className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Need More Help?</strong> If you're experiencing technical issues or have questions not covered here, 
          please contact your teacher or school administrator for assistance. They're here to help you succeed!
        </AlertDescription>
      </Alert>
    </div>
  );
}
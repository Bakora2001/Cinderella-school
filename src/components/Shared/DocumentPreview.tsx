import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, File } from 'lucide-react';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  onDownload?: () => void;
}

export default function DocumentPreview({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
  onDownload
}: DocumentPreviewProps) {
  const getFileIcon = () => {
    if (!documentType) return <File className="h-8 w-8 text-gray-400" />;
    
    if (documentType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (documentType.includes('image')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (documentType.includes('word') || documentType.includes('document')) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    }
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const canPreview = documentType?.includes('pdf') || documentType?.includes('image');

  const renderPreview = () => {
    if (!documentUrl || !canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {getFileIcon()}
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Preview not available for this file type
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click download to view the file
          </p>
        </div>
      );
    }

    if (documentType?.includes('pdf')) {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg"
          title="PDF Preview"
        />
      );
    }

    if (documentType?.includes('image')) {
      return (
        <div className="flex justify-center">
          <img
            src={documentUrl}
            alt="Document preview"
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            Document Preview
          </DialogTitle>
          <DialogDescription>
            {documentName || 'Unknown document'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {renderPreview()}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>File:</strong> {documentName || 'Unknown'}</p>
            <p><strong>Type:</strong> {documentType || 'Unknown'}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onDownload && (
              <Button onClick={onDownload} className="bg-red-600 hover:bg-red-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, FileVideo, FileImage, FileAudio, File, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  if (!documentUrl || !documentName) return null;

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'video': return <FileVideo className="h-6 w-6 text-red-500" />;
      case 'image': return <FileImage className="h-6 w-6 text-green-500" />;
      case 'audio': return <FileAudio className="h-6 w-6 text-purple-500" />;
      case 'document': return <FileText className="h-6 w-6 text-blue-500" />;
      default: return <File className="h-6 w-6 text-slate-500" />;
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const renderPreview = () => {
    const extension = getFileExtension(documentName);
    const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const audioFormats = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
    const documentFormats = ['pdf'];

    if (videoFormats.includes(extension)) {
      return (
        <div className="w-full h-96 bg-black rounded-lg overflow-hidden">
          <video
            src={documentUrl}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (imageFormats.includes(extension)) {
      return (
        <div className="w-full h-96 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={documentUrl}
            alt={documentName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-slate-500 text-center">
            <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Unable to load image</p>
          </div>
        </div>
      );
    }

    if (audioFormats.includes(extension)) {
      return (
        <div className="w-full p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="text-center mb-6">
            <FileAudio className="h-16 w-16 mx-auto text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{documentName}</h3>
          </div>
          <audio
            src={documentUrl}
            controls
            className="w-full"
            preload="metadata"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (documentFormats.includes(extension)) {
      return (
        <div className="w-full h-96 bg-white rounded-lg overflow-hidden">
          <iframe
            src={`${documentUrl}#toolbar=0`}
            className="w-full h-full border-0"
            title={documentName}
          />
        </div>
      );
    }

    // Default preview for unsupported formats
    return (
      <div className="w-full h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500">
        {getFileIcon(documentType)}
        <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-800 dark:text-white">{documentName}</h3>
        <p className="text-sm mb-4">Preview not available for this file type</p>
        <div className="flex gap-2">
          <Button
            onClick={onDownload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download to View
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(documentUrl, '_blank')}
            className="hover:bg-slate-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(documentType)}
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
                  {documentName}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  Document Preview • {documentType?.toUpperCase() || 'FILE'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                  className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(documentUrl, '_blank')}
                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 overflow-auto max-h-[70vh]">
          {renderPreview()}
        </div>
        
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onDownload && (
            <Button onClick={onDownload} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
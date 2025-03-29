
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'application/pdf') {
        onFileUpload(file);
        toast.success('PDF uploaded successfully');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
    setIsDragging(false);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full h-full p-8 border-2 border-dashed rounded-lg transition-all ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      <File className="w-12 h-12 mb-4 text-gray-400" />
      <p className="mb-2 text-lg font-semibold text-gray-700">Drag & drop your PDF here</p>
      <p className="mb-4 text-sm text-gray-500">or</p>
      <Button onClick={open} className="flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Select PDF
      </Button>
    </div>
  );
};

export default FileUpload;

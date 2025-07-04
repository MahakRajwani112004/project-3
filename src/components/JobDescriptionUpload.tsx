import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Textarea, Button, Progress, Chip } from '@nextui-org/react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface JobDescriptionUploadProps {
  // Add any props needed
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  success: boolean;
  error: string | null;
}

export const JobDescriptionUpload: React.FC<JobDescriptionUploadProps> = () => {
  const [textContent, setTextContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    success: false,
    error: null
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (files) => {
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    }
  });

  const handleTextUpload = async () => {
    if (!textContent.trim()) {
      setUploadStatus(prev => ({ ...prev, error: 'Please enter job description text' }));
      return;
    }

    setUploadStatus({ isUploading: true, progress: 50, success: false, error: null });

    try {
      const formData = new FormData();
      const blob = new Blob([textContent], { type: 'text/plain' });
      formData.append('file', blob, 'job_description.txt');

      const response = await fetch(`${API_BASE_URL}/upload-jd`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setUploadStatus({ 
        isUploading: false, 
        progress: 100, 
        success: true, 
        error: null 
      });

      // Clear text after successful upload
      setTextContent('');
      
    } catch (error) {
      setUploadStatus({
        isUploading: false,
        progress: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadStatus({ isUploading: true, progress: 25, success: false, error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadStatus(prev => ({ ...prev, progress: 50 }));

      const response = await fetch(`${API_BASE_URL}/upload-jd`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setUploadStatus({ 
        isUploading: false, 
        progress: 100, 
        success: true, 
        error: null 
      });
      
    } catch (error) {
      setUploadStatus({
        isUploading: false,
        progress: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const resetStatus = () => {
    setUploadStatus({
      isUploading: false,
      progress: 0,
      success: false,
      error: null
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Job Description Upload
        </h1>
        <p className="text-gray-600">
          Upload your job description by typing or uploading a file (PDF/DOCX)
        </p>
      </div>

      {/* Status Display */}
      {(uploadStatus.isUploading || uploadStatus.success || uploadStatus.error) && (
        <Card className="mb-6">
          <CardBody className="p-4">
            {uploadStatus.isUploading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing job description...</span>
                </div>
                <Progress 
                  value={uploadStatus.progress} 
                  color="primary" 
                  size="sm"
                  className="w-full"
                />
              </div>
            )}
            
            {uploadStatus.success && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Job description uploaded successfully!</span>
                </div>
                <Button size="sm" variant="light" onClick={resetStatus}>
                  Upload Another
                </Button>
              </div>
            )}
            
            {uploadStatus.error && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{uploadStatus.error}</span>
                </div>
                <Button size="sm" variant="light" onClick={resetStatus}>
                  Try Again
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Text Input Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Type Job Description</h3>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your job description here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              minRows={8}
              maxRows={12}
              className="w-full"
              variant="bordered"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {textContent.length} characters
              </span>
              <Button
                color="primary"
                onClick={handleTextUpload}
                disabled={!textContent.trim() || uploadStatus.isUploading}
                startContent={<Upload className="w-4 h-4" />}
              >
                Upload Text
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* OR Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* File Upload Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Upload File (PDF/DOCX)</h3>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${uploadStatus.isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              {acceptedFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">File selected:</p>
                  <Chip color="success" variant="flat">
                    {acceptedFiles[0].name}
                  </Chip>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your job description file'}
                  </p>
                  <p className="text-gray-500">
                    or <span className="text-blue-600 underline">click to browse</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports PDF and DOCX files
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
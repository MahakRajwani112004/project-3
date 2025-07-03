import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Input, Chip } from '@nextui-org/react';
import { FileText, Eye, Download, Search, RefreshCw, Upload, Grid3X3, FolderOpen } from 'lucide-react';

interface ResumeFile {
  filename: string;
  url: string;
}

interface UploadedResumesPageProps {
  uploadedResumes: ResumeFile[];
  onRefresh: () => void;
}

export const UploadedResumesPage: React.FC<UploadedResumesPageProps> = ({
  uploadedResumes,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<{ name: string; url: string } | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handlePreview = (name: string, url: string) => {
    setSelectedPreview({ name, url });
    onOpen();
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter resumes based on search term
  const filteredResumes = uploadedResumes.filter(resume =>
    resume.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Uploaded Resumes</h1>
                <p className="text-sm text-gray-600">Manage and view all uploaded resume files</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Chip 
                color="primary" 
                variant="flat"
                startContent={<Grid3X3 className="w-3 h-3" />}
              >
                {filteredResumes.length} of {uploadedResumes.length} resumes
              </Chip>
              <Button
                color="primary"
                variant="flat"
                startContent={<RefreshCw className="w-4 h-4" />}
                onClick={onRefresh}
                size="sm"
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search resumes by filename..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="flex-1"
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Resumes Grid */}
      {filteredResumes.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardBody className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              {uploadedResumes.length === 0 ? (
                <>
                  <Upload className="w-16 h-16 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-600">No Resumes Uploaded</h3>
                  <p className="text-gray-500">Upload some PDF resumes to get started with AI analysis</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-600">No Matching Resumes</h3>
                  <p className="text-gray-500">Try adjusting your search term</p>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResumes.map((resume, index) => (
            <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
              <CardBody className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* File Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* File Info */}
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight break-words">
                      {resume.filename.replace('.pdf', '')}
                    </h3>
                    <Chip size="sm" color="secondary" variant="flat">
                      PDF Resume
                    </Chip>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full">
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="primary" 
                      startContent={<Eye className="w-3 h-3" />}
                      onClick={() => handlePreview(resume.filename, resume.url)}
                      className="flex-1"
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="secondary" 
                      startContent={<Download className="w-3 h-3" />}
                      onClick={() => handleDownload(resume.url, resume.filename)}
                      className="flex-1"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Resume Preview Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Resume Preview: {selectedPreview?.name}</h3>
              </ModalHeader>
              <ModalBody className="p-0">
                {selectedPreview && (
                  <div className="w-full h-[80vh]">
                    <iframe 
                      src={selectedPreview.url} 
                      width="100%" 
                      height="100%"
                      className="border-0"
                      title={`Resume of ${selectedPreview.name}`}
                    />
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
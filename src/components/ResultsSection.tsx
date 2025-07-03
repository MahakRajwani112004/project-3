import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Chip, Button, Divider, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import { User, Star, Eye, Upload, Bot, FileText, ExternalLink } from 'lucide-react';

interface PreviewUrl {
  name: string;
  resume_url: string;
}

interface SearchResult {
  agent_used: string;
  answer: string;
  matched_candidates: string[];
  preview_urls?: PreviewUrl[];
}

interface ResultsSectionProps {
  searchResult: SearchResult | null;
  isSearching: boolean;
  databaseReady: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  searchResult, 
  isSearching, 
  databaseReady
}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedPreview, setSelectedPreview] = useState<{ name: string; url: string } | null>(null);

  const getAgentColor = (agent: string) => {
    const colors = {
      skill_matcher: 'success',
      experience_analyzer: 'warning', 
      relevancy_scorer: 'secondary',
      seniority_detector: 'primary',
      general_analyzer: 'default'
    };
    return colors[agent as keyof typeof colors] || 'default';
  };

  const formatAgentName = (agent: string) => {
    return agent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handlePreview = (name: string, url: string) => {
    setSelectedPreview({ name, url });
    onOpen();
  };

  if (isSearching) {
    return (
      <Card className="shadow-lg border-0 h-96">
        <CardBody className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">AI agents processing your query...</p>
            <div className="flex items-center justify-center gap-2">
              <Bot className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-500">Analyzing resumes with AI</span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!databaseReady) {
    return (
      <Card className="shadow-lg border-0 h-96">
        <CardBody className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <Upload className="w-16 h-16 text-gray-300 mx-auto" />
            <p className="text-gray-600">Upload resumes to get started</p>
            <p className="text-sm text-gray-500">Our AI agents will analyze and index them for intelligent searching</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!searchResult) {
    return (
      <Card className="shadow-lg border-0 h-96">
        <CardBody className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 text-gray-300 mx-auto" />
            <p className="text-gray-600">Start searching to find matching candidates</p>
            <p className="text-sm text-gray-500">Our AI agents will analyze resumes for the best matches</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Use preview URLs count instead of regex parsing
  const candidateCount = searchResult.preview_urls?.length || 0;

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-800">AI Analysis Results</h2>
              <Chip size="sm" color="primary" variant="flat">
                {candidateCount} {candidateCount === 1 ? 'match' : 'matches'}
              </Chip>
            </div>
            <Chip 
              color={getAgentColor(searchResult.agent_used)} 
              variant="flat"
              size="sm"
            >
              {formatAgentName(searchResult.agent_used)}
            </Chip>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0 max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {/* AI Analysis */}
            <Card className="border border-blue-200 bg-blue-50/50">
              <CardBody className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">AI Agent Analysis</h3>
                    <p className="text-xs text-blue-600">
                      Analyzed by {formatAgentName(searchResult.agent_used)}
                    </p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {searchResult.answer}
                  </div>
                </div>
              </CardBody>
            </Card>

            <Divider />

            {/* Resume Previews Section */}
            {searchResult.preview_urls && searchResult.preview_urls.length > 0 ? (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Matching Candidates ({candidateCount})
                </h3>
                
                <div className="grid grid-cols-1  gap-3">
                  {searchResult.preview_urls.map((previewUrl, index) => (
                    <Card key={index} className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {previewUrl.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-800 truncate">
                                {previewUrl.name}
                              </h4>
                              <p className="text-sm text-green-600 font-medium">
                                ✓ Matched Candidate
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-2">
                            <Button 
                              size="sm" 
                              variant="flat" 
                              color="primary" 
                              startContent={<Eye className="w-3 h-3" />}
                              onClick={() => handlePreview(previewUrl.name, previewUrl.resume_url)}
                            >
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              variant="flat" 
                              color="secondary" 
                              startContent={<ExternalLink className="w-3 h-3" />}
                              onClick={() => window.open(previewUrl.resume_url, '_blank')}
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No matching candidates found for this query</p>
                <p className="text-sm text-gray-400 mt-1">Try refining your search criteria</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

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
    </>
  );
};
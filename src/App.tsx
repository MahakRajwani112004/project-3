import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { SearchSection } from './components/SearchSection';
import { ResultsSection } from './components/ResultsSection';
import { AgentStatus } from './components/AgentStatus';
import { UploadedResumesPage } from './components/UploadedResumesPage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SearchResult {
  agent_used: string;
  answer: string;
  matched_candidates: string[];
  preview_urls?: Array<{
    name: string;
    resume_url: string;
  }>;
}

interface ResumeFile {
  filename: string;
  url: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'resumes'>('home');
  const [resumeList, setResumeList] = useState<string[]>([]);
  const [uploadedResumes, setUploadedResumes] = useState<ResumeFile[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<{
    chunks: number;
  }>({ chunks: 0 });

  // Fetch database status on component mount
  useEffect(() => {
    fetchStatus();
    fetchAllResumes();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (response.ok) {
        const status = await response.json();
        setDatabaseStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchAllResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes`);
      if (response.ok) {
        const data = await response.json();
        setResumeList(data.resumes || []);
        setUploadedResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        
        // Wait a bit for processing, then refresh
        setTimeout(() => {
          fetchStatus();
          fetchAllResumes();
        }, 2000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    if (databaseStatus.chunks === 0) {
      alert('Please upload some resumes first!');
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }
        setSearchResult(result);
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert(`Search failed: ${error.message}`);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (page: 'home' | 'resumes') => {
    setCurrentPage(page);
  };

  if (currentPage === 'resumes') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header currentPage={currentPage} onPageChange={handlePageChange} />
        <main className="container mx-auto px-4 py-8">
          <UploadedResumesPage 
            uploadedResumes={uploadedResumes}
            onRefresh={fetchAllResumes}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <AgentStatus 
          selectedAgent={searchResult?.agent_used || 'general_analyzer'} 
          isSearching={isSearching}
          databaseStatus={{
            status: databaseStatus.chunks > 0 ? 'ready' : 'empty',
            total_resumes: resumeList.length,
            database_ready: databaseStatus.chunks > 0
          }}
        />
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <UploadSection 
              onUpload={handleUpload} 
              isUploading={isUploading}
            />
            <SearchSection 
              onSearch={handleSearch} 
              isSearching={isSearching}
              resumeCount={resumeList.length}
              databaseReady={databaseStatus.chunks > 0}
            />
          </div>
          
          <div>
            <ResultsSection 
              searchResult={searchResult}
              isSearching={isSearching}
              databaseReady={databaseStatus.chunks > 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
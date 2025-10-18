import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import FileUpload from '@/components/FileUpload';
import FileDownload from '@/components/FileDownload';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { UploadResponse,FileMetadata } from '@/components/custom Interfaces/uploadResponse';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const mainContentRef = useRef<HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Smooth scroll to main content when page loads
    const timer = setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 800); // Small delay to let the page render

    return () => clearTimeout(timer);
  }, []);


  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    setIsUploading(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

     const maxSize = 50 * 1024 * 1024; // 50 MB in bytes
    if (selectedFile.size > maxSize) {
    setUploadResult({
      success: false,
      error: "File too large. Maximum allowed size is 50MB.",
    });
    return; // stop further execution
  }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post('api/upload', formData, {
         headers: {
          'Content-Type': 'multipart/form-data',
          },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });
    
      const obj = {
        success: true,
        port: response.data.port,
        metadata: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          lastModified: selectedFile.lastModified
        }
      }
     
     return response;
      
   } catch (error) {
      setUploadResult({
        success: false,
        error: "Upload failed. Please try again."
      });
    }

    setIsUploading(false);
    
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main ref={mainContentRef} className="container mx-auto px-4 py-8 animate-fade-in">
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <div className="mb-8">
          {activeTab === 'upload' ? (
             <FileUpload
        selectedFile= {selectedFile}
        setSelectedFile={setSelectedFile}
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        onCancel={resetUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadResult={uploadResult}
        setUploadResult={setUploadResult}
      />
          ) 
          : 
          (<FileDownload />)}
        </div>
      </main>
      
      <footer className="border-t border-border bg-muted/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by peer-to-peer technology • 
            <span className="text-accent ml-1">ByteDrop</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

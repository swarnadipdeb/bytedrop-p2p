import React, { useState, useCallback, useEffect } from 'react';
import { Upload, File, Check, X, Copy, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { UploadResponse } from '@/components/custom Interfaces/uploadResponse'
import { FileMetadata } from '@/components/custom Interfaces/uploadResponse'
import { Axios, AxiosPromise } from 'axios';

interface FileUploadProps {
  selectedFile: File | null;
  setSelectedFile: Function
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  onCancel: () => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadResult: any;
  setUploadResult: Function
  
}

const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  setSelectedFile,
  onFileSelect,
  onUpload,
  onCancel,
  isUploading,
  uploadProgress,
  uploadResult,
  setUploadResult,
  
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  useEffect(()=>{
      const fun = () => {console.log(uploadResult)}
      fun()
  },[uploadResult])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }, []);

  

  const simulateUpload = async (file: File) => {
    // setIsUploading(true);
    // setUploadProgress(0);
    // setUploadResult(null);

    // Simulate upload progress
    // for (let i = 0; i <= 100; i += 10) {
    //   await new Promise(resolve => setTimeout(resolve, 200));
    //   setUploadProgress(i);
    // }

    // Simulate random success/failure
    // const success = Math.random() > 0.2; // 80% success rate
    const res:any = await onUpload()
    console.log(res)
    if (res.status===200) {
      setUploadResult({
        success: true,
        port: res.data.port,
        metadata: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          lastModified: selectedFile.lastModified
        }
      });
    } else {
      setUploadResult({
        success: false,
        error: "Upload failed due to network error. Please try again."
      });
    }
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Share code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive"
      });
    }
  }, [toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Upload Your File
        </h2>
        <p className="text-muted-foreground">
          Share files securely with anyone using our peer-to-peer network
        </p>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <div className="p-8">
          {!selectedFile && !uploadResult && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudUpload className={`mx-auto h-16 w-16 mb-4 transition-colors ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h3 className="text-xl font-semibold mb-2">
                Drop your file here
              </h3>
              <p className="text-muted-foreground mb-6">
                or click to browse from your device
              </p>
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="lg" className="pointer-events-none">
                <Upload className="mr-2 h-5 w-5" />
                Choose File
              </Button>
            </div>
          )}

          {selectedFile && !uploadResult && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-secondary rounded-lg">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex space-x-3">
                <Button 
                  onClick={() => simulateUpload(selectedFile)}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
                <Button variant="outline" onClick={() => onCancel()} disabled={isUploading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {uploadResult && (
            <div className="space-y-4">
              {uploadResult.success ? (
                <div className="space-y-4">
                  <Alert className="border-success bg-success/5">
                    <Check className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      File uploaded successfully!
                    </AlertDescription>
                  </Alert>

                  {uploadResult.metadata && (
                    <div className="bg-secondary p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold">File Metadata</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{uploadResult.metadata.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <p className="font-medium">{formatFileSize(uploadResult.metadata.size)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">{uploadResult.metadata.type || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Modified:</span>
                          <p className="font-medium">
                            {new Date(uploadResult.metadata.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Share Code</h4>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-background p-3 rounded font-mono text-sm border">
                        {uploadResult.port}
                      </code>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(uploadResult.port!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this code with others to let them download your file
                    </p>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>
                    {uploadResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={()=>onCancel()} className="w-full">
                Upload Another File
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FileUpload;
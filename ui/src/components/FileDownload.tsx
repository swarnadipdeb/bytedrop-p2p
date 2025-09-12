import React, { useState, useCallback } from 'react';
import { Download, FileDown, Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  uploadDate: string;
}

interface DownloadResponse {
  success: boolean;
  fileInfo?: FileInfo;
  error?: string;
}

const FileDownload = () => {
  const [shareCode, setShareCode] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResult, setDownloadResult] = useState<DownloadResponse | null>(null);
  const { toast } = useToast();

  const downloadFile = useCallback(async () => {
  if (!shareCode) return;

  setIsDownloading(true);
  setDownloadProgress(0);
  setDownloadResult(null);

  try {
    const response = await axios.get(`/api/download/${shareCode}`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(percent);
        }
      }
    });

    const disposition = response.headers['content-disposition'];
//     const match = disposition?.match(/filename="?(.+)"?/);
    const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^\";]+)"?/i);
    const fileName = match ? match[1] : `downloaded_file_${Date.now()}`;


    const fileSize = response.data.size;
    const fileType = response.data.type;

    // Create a download link
    const blob = new Blob([response.data], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setDownloadResult({
      success: true,
      fileInfo: {
        name: fileName,
        size: fileSize,
        type: fileType,
        uploadDate: new Date().toISOString(),
      },
    });

    toast({
      title: "Download complete!",
      description: `${fileName} has been downloaded successfully`,
    });

  } catch (error) {
    console.error("Download error:", error);
    setDownloadResult({
      success: false,
      error: "Failed to download the file. Please check the share code and try again.",
    });
  }

  setIsDownloading(false);
}, [shareCode, toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetDownload = () => {
    setShareCode('');
    setDownloadResult(null);
    setDownloadProgress(0);
    setIsDownloading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Download File
        </h2>
        <p className="text-muted-foreground">
          Enter the share code and click download to get your file
        </p>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label htmlFor="shareCode" className="text-sm font-medium">
              Share Code
            </label>
            <Input
              id="shareCode"
              type="text"
              placeholder="Enter the share code here..."
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value)}
              className="w-full"
              disabled={isDownloading}
            />
          </div>

          {!downloadResult && (
            <div className="space-y-4">
              {isDownloading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Downloading...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={downloadFile}
                disabled={isDownloading || !shareCode.trim()}
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {isDownloading ? 'Downloading...' : 'Download File'}
              </Button>
            </div>
          )}

          {downloadResult && (
            <div className="space-y-4">
              {downloadResult.success ? (
                <div className="space-y-4">
                  <Alert className="border-success bg-success/5">
                    <Check className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      Download completed successfully!
                    </AlertDescription>
                  </Alert>

                  {downloadResult.fileInfo && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Downloaded File</h4>
                      <div className="flex items-center space-x-3">
                        <FileDown className="h-6 w-6 text-success" />
                        <div>
                          <p className="font-medium">{downloadResult.fileInfo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(downloadResult.fileInfo.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>
                    {downloadResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={resetDownload} className="w-full" variant="outline">
                Download Another File
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FileDownload;
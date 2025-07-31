import React from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TabNavigationProps {
  activeTab: 'upload' | 'download';
  onTabChange: (tab: 'upload' | 'download') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-muted p-2 rounded-lg inline-flex space-x-2">
        <Button
          variant={activeTab === 'upload' ? 'default' : 'ghost'}
          onClick={() => onTabChange('upload')}
          className={`px-6 py-2 ${
            activeTab === 'upload' 
              ? 'shadow-glow' 
              : 'hover:bg-secondary'
          }`}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button
          variant={activeTab === 'download' ? 'default' : 'ghost'}
          onClick={() => onTabChange('download')}
          className={`px-6 py-2 ${
            activeTab === 'download' 
              ? 'shadow-glow' 
              : 'hover:bg-secondary'
          }`}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default TabNavigation;
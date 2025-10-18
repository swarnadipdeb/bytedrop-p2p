import React from 'react';
import { Share2, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-10" />
      <div className="relative container mx-auto px-4 py-12 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
            <div className="relative bg-gradient-primary p-3 rounded-2xl shadow-glow">
              <Share2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ByteDrop
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Secure peer-to-peer file sharing made simple. Share files instantly without any cloud storage.
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-accent" />
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center space-x-2">
            <Share2 className="h-4 w-4 text-accent" />
            <span>Peer-to-Peer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-success" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
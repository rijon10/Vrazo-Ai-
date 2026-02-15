import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, Upload, Sparkles, ScanLine, Loader2, ArrowRight, Zap, Gem } from 'lucide-react';
import { enhanceImage } from '../services/geminiService';
import { Project } from '../types';

interface EditorProps {
  project?: Project | null;
  initialTool?: string;
  onBack: () => void;
  onCheckLimit: () => boolean;
  onConsumeCredit: () => void;
}

const Editor: React.FC<EditorProps> = ({ project, onBack, onCheckLimit, onConsumeCredit }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(project?.thumbnail || null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolution, setResolution] = useState<'4K' | '8K'>('4K');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEnhancedImage(null); // Reset result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    // Check limit before starting
    if (!onCheckLimit()) return;
    
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const result = await enhanceImage(originalImage, resolution);
      if (result) {
        setEnhancedImage(result);
        onConsumeCredit(); // Consume credit only on success
      }
    } catch (e) {
      console.error(e);
      alert("Failed to enhance image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = `enhanced-${resolution}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800 bg-slate-900 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-full">
            <ArrowLeft size={24} className="text-slate-200" />
          </button>
          <h2 className="font-semibold text-white">HD Enhancer & Cleaner</h2>
        </div>
        {enhancedImage && (
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-sm font-semibold">Download {resolution}</span>
            <Download size={16} />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto pb-20">
        
        {!originalImage ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30 m-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Upload size={32} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Photo</h3>
            <p className="text-slate-400 text-center max-w-xs mb-8">
              Fix blurry, dirty, or unclear photos instantly. AI will clean the image and upscale it to 4K or 8K.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Select Photo</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6">
            
            {/* Compare View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original (Unclear/Low Quality)</span>
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video">
                  <img src={originalImage} className="w-full h-full object-contain opacity-80" alt="Original" />
                  <button 
                     onClick={() => {setOriginalImage(null); setEnhancedImage(null);}}
                     className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 text-white"
                  >
                     <ScanLine size={16} />
                  </button>
                </div>
              </div>

              {/* Enhanced Result */}
              <div className="space-y-2">
                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    {enhancedImage ? <Sparkles size={12} /> : null}
                    Result ({resolution} Clean)
                 </span>
                 <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
                    {isProcessing ? (
                        <div className="flex flex-col items-center space-y-3">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                            <span className="text-sm text-blue-400 font-medium">Cleaning & Restoring...</span>
                        </div>
                    ) : enhancedImage ? (
                        <img src={enhancedImage} className="w-full h-full object-contain" alt="Enhanced" />
                    ) : (
                        <div className="text-slate-600 text-sm flex flex-col items-center">
                            <ArrowRight size={24} className="mb-2 rotate-90 md:rotate-0" />
                            Ready to Restore
                        </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Action Bar */}
            {!enhancedImage && !isProcessing && (
                <div className="space-y-6 pt-2">
                    {/* Resolution Selector */}
                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 flex p-1">
                        <button
                            onClick={() => setResolution('4K')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                resolution === '4K' 
                                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Zap size={16} className={resolution === '4K' ? 'text-yellow-400' : ''} />
                            4K Ultra HD
                        </button>
                        <button
                            onClick={() => setResolution('8K')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                resolution === '8K' 
                                ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-white shadow-sm ring-1 ring-purple-500/50' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Gem size={16} className={resolution === '8K' ? 'text-purple-400' : ''} />
                            8K Hyper Real
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            onClick={handleEnhance}
                            className={`w-full max-w-sm py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95 ${
                                resolution === '8K'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/20'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-900/20'
                            }`}
                        >
                            <Sparkles size={20} className="text-yellow-200" />
                            <span>Restore & Enhance (1 Credit)</span>
                        </button>
                    </div>
                </div>
            )}
            
            {enhancedImage && (
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl text-center">
                    <p className="text-emerald-400 text-sm font-medium">Image successfully restored to {resolution}!</p>
                </div>
            )}
          </div>
        )}

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default Editor;
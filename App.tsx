import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Project } from './types';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import { generateImage, generateThumbnail } from './services/geminiService';
import { Loader2, X, Upload, Image as ImageIcon, Search, Sliders, ChevronRight, User, Bell, Database, HelpCircle, LogOut, Trash2, Sparkles, ArrowDown, Download, Type, Lock, MessageCircle, Phone, Flame, Zap, Heart } from 'lucide-react';

// CONSTANTS
const MAX_DAILY_FREE = 3;
// Premium Avatar - High Quality Cinematic Portrait (Eye-catching, Stylish, Attractive)
const USER_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80"; 

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [initialEditorTool, setInitialEditorTool] = useState<string | undefined>(undefined);
  
  // Usage Limits State
  const [dailyCount, setDailyCount] = useState(0);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // AI Modal State (Photo Gen)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  
  // Thumbnail Modal State
  const [isThumbModalOpen, setIsThumbModalOpen] = useState(false);
  const [thumbTitle, setThumbTitle] = useState('');
  const [thumbStyle, setThumbStyle] = useState('Viral Reaction');
  const [thumbImage1, setThumbImage1] = useState<string | null>(null);
  const [thumbImage2, setThumbImage2] = useState<string | null>(null);
  
  // Thumbnail Result Editing
  const [thumbHeadline, setThumbHeadline] = useState('');
  const [thumbSubtext, setThumbSubtext] = useState('');

  // General Loading/Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for file inputs and canvas
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trending / Explore Data - Final Fix for Images
  const trendingItems = [
    {
        id: 1,
        // Cyberpunk Samurai - Using a reliable neon/cyberpunk aesthetic image
        image: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=600&auto=format&fit=crop",
        title: "Cyberpunk Samurai",
        category: "Cyberpunk",
        prompt: "Futuristic cyberpunk samurai standing in neon rain, glowing katana, detailed armor, cinematic lighting, 8k resolution, unreal engine 5 render."
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
        title: "Abstract Fluid",
        category: "3D",
        prompt: "Abstract swirling fluid liquid shapes, iridescent holographic colors, glossy texture, 4k wallpaper, studio lighting, minimal background."
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
        title: "Cinematic Portrait",
        category: "Realistic",
        prompt: "Hyper-realistic portrait of a woman with freckles, golden hour lighting, bokeh background, 85mm lens, sharp focus, detailed eyes."
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop",
        title: "Anime Style Art",
        category: "Anime",
        prompt: "High quality anime style portrait, vibrant colors, detailed eyes, soft lighting, makoto shinkai style, atmospheric background."
    },
    {
        id: 5,
        // Neon Logo - Fixed with a proper neon mascot/face image
        image: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?q=80&w=600&auto=format&fit=crop",
        title: "Neon Lion Logo",
        category: "Logos",
        prompt: "Minimalist neon glowing lion head logo, dark background, vector style, esports mascot, clean lines, high contrast."
    },
    {
        id: 6,
        // Neon City - Using a very popular Tokyo night image
        image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=600&auto=format&fit=crop",
        title: "Neon City",
        category: "Cyberpunk",
        prompt: "Futuristic megacity skyline at night, flying cars, massive holograms, neon purple and blue lights, blade runner style, atmospheric fog."
    },
    {
        id: 7,
        // Neon Gaming Room - Using a reliable gaming setup image
        image: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=600&auto=format&fit=crop",
        title: "Neon Gaming Room",
        category: "3D",
        prompt: "Cozy isometric gaming room, neon lighting, multiple monitors, mechanical keyboard, plant decorations, lo-fi aesthetic, detailed 3d render."
    },
    {
        id: 8,
        image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=600&auto=format&fit=crop",
        title: "Retro Synthwave",
        category: "Realistic",
        prompt: "80s synthwave landscape, retro sun, grid mountains, palm trees, purple and orange gradient, vhs glitch effect."
    }
  ];

  const filteredTrendingItems = trendingItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Default Mock Data
  const defaultProjects: Project[] = [];

  // Initialize Projects & Usage from LocalStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('vrazo-projects');
      return saved ? JSON.parse(saved) : defaultProjects;
    } catch (e) {
      return defaultProjects;
    }
  });

  useEffect(() => {
    // Check Daily Usage Reset
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('vrazo_last_date');
    const storedCount = parseInt(localStorage.getItem('vrazo_daily_count') || '0');

    if (storedDate !== today) {
      // New day, reset count
      setDailyCount(0);
      localStorage.setItem('vrazo_last_date', today);
      localStorage.setItem('vrazo_daily_count', '0');
    } else {
      setDailyCount(storedCount);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('vrazo-projects', JSON.stringify(projects));
    } catch (e) {
      console.error("Failed to save projects", e);
    }
  }, [projects]);

  // --- LIMITATION LOGIC ---
  const checkLimit = () => {
    if (dailyCount >= MAX_DAILY_FREE) {
      setIsPremiumModalOpen(true);
      return false;
    }
    return true;
  };

  const incrementUsage = () => {
    const newCount = dailyCount + 1;
    setDailyCount(newCount);
    localStorage.setItem('vrazo_daily_count', newCount.toString());
  };

  const handleContactWhatsApp = (number: string) => {
    const text = encodeURIComponent("Hello, I am interested in buying this app or need support. Please let me know the details.");
    window.open(`https://wa.me/88${number}?text=${text}`, '_blank');
  };

  // --- NAVIGATION ---
  const handleOpenEditor = (project?: Project, initialTool?: string) => {
    setActiveProject(project || null);
    setInitialEditorTool(initialTool);
    setCurrentView('editor');
  };

  // --- DELETE LOGIC ---
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    }
  };

  // --- Photo Gen Logic ---
  const handleOpenAI = (initialPrompt?: string) => {
    if (!checkLimit()) return;
    setPrompt(''); // Always clear prompt value first
    if (initialPrompt) {
        setSuggestedPrompt(initialPrompt);
        // FIX: Do NOT set prompt value here. User wants it as placeholder only.
        // setPrompt(initialPrompt); 
    } else {
        setSuggestedPrompt(null);
    }
    setIsAIModalOpen(true);
  };

  const handleGenerate = async () => {
    if (!checkLimit()) return;
    
    // Use prompt if user typed, otherwise use suggestedPrompt
    const finalPrompt = prompt || suggestedPrompt;
    
    if (!finalPrompt) return;
    
    setIsGenerating(true);
    try {
      const base64Image = await generateImage(finalPrompt);
      if (base64Image) {
        setGeneratedImage(base64Image);
        incrementUsage(); // Deduct credit on success
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `vrazo-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadUrl = async (url: string, filename: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
          console.error("Download failed, trying direct link", error);
          // Fallback
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  // --- Thumbnail Logic ---
  const handleOpenThumb = () => {
      if (!checkLimit()) return;
      setIsThumbModalOpen(true);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setImage: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!checkLimit()) return;
    if (!thumbTitle) {
      alert("Please enter a title");
      return;
    }
    
    setIsGenerating(true);
    setThumbHeadline(thumbTitle.toUpperCase());
    setThumbSubtext('');
    
    try {
      const images = [];
      if (thumbImage1) images.push(thumbImage1);
      if (thumbImage2) images.push(thumbImage2);

      const base64Image = await generateThumbnail(thumbTitle, images, thumbStyle);
      if (base64Image) {
        setGeneratedImage(base64Image);
        incrementUsage(); // Deduct credit
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate thumbnail.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadComposite = () => {
      if(!generatedImage || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if(!ctx) return;

      const img = new Image();
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if(thumbHeadline) {
             const fontSize = canvas.height * 0.15;
             ctx.font = `900 ${fontSize}px Inter, sans-serif`;
             ctx.fillStyle = "yellow";
             ctx.strokeStyle = "black";
             ctx.lineWidth = fontSize * 0.15;
             ctx.textAlign = "center";
             ctx.shadowColor = "rgba(0,0,0,0.8)";
             ctx.shadowBlur = 20;
             ctx.strokeText(thumbHeadline, canvas.width / 2, canvas.height * 0.25);
             ctx.fillText(thumbHeadline, canvas.width / 2, canvas.height * 0.25);
          }

          if(thumbSubtext) {
             const fontSizeSub = canvas.height * 0.10;
             ctx.font = `800 ${fontSizeSub}px Inter, sans-serif`;
             ctx.fillStyle = "white";
             ctx.strokeStyle = "black";
             ctx.lineWidth = fontSizeSub * 0.15;
             ctx.textAlign = "center";
             ctx.strokeText(thumbSubtext, canvas.width / 2, canvas.height * 0.85);
             ctx.fillText(thumbSubtext, canvas.width / 2, canvas.height * 0.85);
          }

          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `vrazo-thumb-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      };
      img.src = generatedImage;
  };

  const handleSaveGenerated = (source: 'ai' | 'thumb') => {
    if (!generatedImage) return;
    
    let title = "Generated Image";
    if (source === 'ai') {
        const textToSave = prompt || suggestedPrompt || "Untitled";
        title = textToSave.length > 20 ? textToSave.substring(0, 20) + '...' : textToSave;
    } else {
        title = thumbTitle;
    }

    const newProject: Project = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      thumbnail: generatedImage,
      type: source === 'ai' ? 'Photo' : 'Thumbnail',
      date: new Date().toLocaleString()
    };
    
    setProjects([newProject, ...projects]);
    closeModals();
    setCurrentView('home');
  };

  const closeModals = () => {
    setIsAIModalOpen(false);
    setIsThumbModalOpen(false);
    setGeneratedImage(null);
    setIsGenerating(false);
    setThumbTitle('');
    setThumbHeadline('');
    setThumbSubtext('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">
      
      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <main className={`min-h-screen ${currentView !== 'editor' ? 'pb-20' : ''}`}>
        
        {/* DASHBOARD VIEW */}
        {currentView === 'home' && (
          <Dashboard 
            projects={projects} 
            dailyCount={dailyCount}
            maxDaily={MAX_DAILY_FREE}
            userAvatar={USER_AVATAR}
            onOpenAI={handleOpenAI}
            onOpenThumbnailMaker={handleOpenThumb}
            onOpenEditor={handleOpenEditor}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onDeleteProject={handleDeleteProject}
          />
        )}
        
        {/* ENHANCER VIEW */}
        {currentView === 'editor' && (
          <Editor 
            project={activeProject} 
            initialTool={initialEditorTool}
            onBack={() => setCurrentView('home')} 
            onCheckLimit={checkLimit}
            onConsumeCredit={incrementUsage}
          />
        )}

        {/* EXPLORE / TRENDING VIEW (Replaces Projects) */}
        {currentView === 'explore' && (
             <div className="p-4 animate-fade-in pb-24">
                {/* Search Bar */}
                <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-xl mb-6 mt-6 border border-slate-700 focus-within:border-blue-500/50 transition-colors">
                    <Search size={20} className="text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search prompts & styles..." 
                        className="bg-transparent outline-none text-white w-full placeholder:text-slate-500" 
                    />
                    {searchQuery ? (
                        <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white"><X size={18} /></button>
                    ) : (
                        <Sliders size={18} className="text-slate-400" />
                    )}
                </div>
                
                {/* Functional Categories */}
                <div className="mb-6">
                    <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar">
                        {['All', 'Realistic', 'Anime', '3D', 'Cyberpunk', 'Logos'].map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                                    selectedCategory === cat
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-500' 
                                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTrendingItems.map((item) => (
                        <div key={item.id} onClick={() => handleOpenAI(item.prompt)} className="group cursor-pointer relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/10 animate-fade-in">
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.category}</span>
                                </div>
                            </div>
                            <div className="p-4 relative">
                                <div className="absolute -top-6 right-4">
                                     <button className="h-10 w-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 transition-transform active:scale-95 text-white">
                                        <Zap size={20} fill="currentColor" />
                                     </button>
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{item.prompt}</p>
                                <div className="mt-3 flex items-center gap-4 text-slate-500 text-xs font-medium">
                                    <span className="flex items-center gap-1 hover:text-pink-400 transition-colors"><Heart size={14} /> 2.4k</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadUrl(item.image, `vrazo-${item.title}.jpg`);
                                        }}
                                        className="flex items-center gap-1 hover:text-blue-400 transition-colors z-10"
                                    >
                                        <Download size={14} /> 
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTrendingItems.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 animate-fade-in">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-slate-500" />
                            </div>
                            <p className="font-medium text-white">No styles found</p>
                            <p className="text-sm">Try a different search term or category.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-8 text-center pb-8">
                    <p className="text-slate-500 text-sm">More styles added daily!</p>
                </div>
             </div>
        )}

        {/* SETTINGS VIEW */}
        {currentView === 'settings' && (
             <div className="p-4 animate-fade-in">
                <h1 className="text-2xl font-bold mb-6 mt-2">Settings</h1>
                
                <div className="flex items-center space-x-4 mb-8 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                     <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 bg-white">
                        {/* Ensure object-cover fills it perfectly */}
                        <img src={USER_AVATAR} alt="Profile" className="w-full h-full object-cover" />
                     </div>
                     <div>
                         <h3 className="font-bold text-lg">Vrazo AI</h3>
                         <p className="text-blue-400 text-sm">Free plans contact RIJON</p>
                     </div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 hover:from-yellow-600/30 hover:to-yellow-800/30 border border-yellow-500/30 rounded-xl transition-all">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Lock size={20} /></div>
                            <span className="font-bold text-yellow-400">Upgrade to Premium</span>
                        </div>
                        <ChevronRight size={18} className="text-yellow-500" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><User size={20} /></div>
                            <span className="font-medium">Account Settings</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-500" />
                    </button>
                     <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><HelpCircle size={20} /></div>
                            <span className="font-medium">Help & Support</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-500" />
                    </button>
                </div>

                <button className="w-full mt-6 p-4 text-red-400 font-medium flex items-center justify-center space-x-2 hover:bg-slate-800 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
             </div>
        )}

      </main>

      {/* Navigation */}
      {currentView !== 'editor' && (
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      )}

      {/* MODAL: Premium / Limit Reached / Contact */}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-fade-in">
             <div className="bg-slate-800 border border-yellow-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-center">
                 <button onClick={() => setIsPremiumModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                 
                 <div className="w-20 h-20 rounded-full border-2 border-yellow-500/50 mx-auto mb-4 overflow-hidden bg-white">
                     <img src={USER_AVATAR} className="w-full h-full object-cover" alt="Owner" />
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">Vrazo AI Premium & Support</h2>
                 
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6">
                     <p className="text-slate-300 text-sm leading-relaxed">
                        If you want to buy this app, get premium features, or need support, please contact us at these numbers.
                     </p>
                 </div>
                 
                 <div className="space-y-3">
                    <button 
                        onClick={() => handleContactWhatsApp("01576971592")}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-lg"
                    >
                        <MessageCircle size={18} />
                        <span>WhatsApp: 01576971592</span>
                    </button>

                    <button 
                        onClick={() => handleContactWhatsApp("01643791557")}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-white flex items-center justify-center space-x-2 transition-transform active:scale-95"
                    >
                        <Phone size={18} />
                        <span>Call/WhatsApp: 01643791557</span>
                    </button>
                 </div>
             </div>
        </div>
      )}

      {/* MODAL: AI Photo Generation */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button onClick={closeModals} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-1">AI Photo Generation</h2>
            <p className="text-slate-400 text-sm mb-6">Free Credits: <span className="text-blue-400">{MAX_DAILY_FREE - dailyCount} left</span></p>

            {!generatedImage ? (
              <>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={suggestedPrompt ? suggestedPrompt : "Describe what you want to create..."}
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!prompt && !suggestedPrompt)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
                >
                  {isGenerating ? <><Loader2 size={20} className="animate-spin" /><span>Generating...</span></> : <span>Generate Art (1 Credit)</span>}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-700"><img src={generatedImage} alt="Generated" className="w-full h-auto" /></div>
                <div className="flex space-x-3">
                  <button onClick={() => setGeneratedImage(null)} className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors">Discard</button>
                  <button onClick={handleDownloadImage} className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors text-slate-200" title="Download"><Download size={20} /></button>
                  <button onClick={() => handleSaveGenerated('ai')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors">Save Project</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Thumbnail Maker */}
      {isThumbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative my-auto">
            <button onClick={closeModals} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-1">YouTube Thumbnail Maker</h2>
            <p className="text-slate-400 text-sm mb-6">Free Credits: <span className="text-blue-400">{MAX_DAILY_FREE - dailyCount} left</span></p>

            {!generatedImage ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Video Title</label>
                  <input type="text" value={thumbTitle} onChange={(e) => setThumbTitle(e.target.value)} placeholder="e.g., I SURVIVED 100 Days..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Thumbnail Style</label>
                   <div className="grid grid-cols-2 gap-2">
                      {['Viral Reaction', 'Tech Review', 'Cinematic', 'Gaming'].map((style) => (
                          <button key={style} onClick={() => setThumbStyle(style)} className={`p-2 rounded-lg text-xs font-medium border transition-all ${thumbStyle === style ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>{style}</button>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInput1Ref} onChange={(e) => handleFileSelect(e, setThumbImage1)} />
                        <div onClick={() => fileInput1Ref.current?.click()} className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${thumbImage1 ? 'border-blue-500 bg-slate-900' : 'border-slate-600 hover:border-slate-400 hover:bg-slate-700/50'}`}>
                            {thumbImage1 ? <img src={thumbImage1} className="w-full h-full object-cover" alt="Upload 1" /> : <Upload size={24} className="text-slate-400 mb-2" />}
                        </div>
                    </div>
                    <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInput2Ref} onChange={(e) => handleFileSelect(e, setThumbImage2)} />
                        <div onClick={() => fileInput2Ref.current?.click()} className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${thumbImage2 ? 'border-blue-500 bg-slate-900' : 'border-slate-600 hover:border-slate-400 hover:bg-slate-700/50'}`}>
                             {thumbImage2 ? <img src={thumbImage2} className="w-full h-full object-cover" alt="Upload 2" /> : <ImageIcon size={24} className="text-slate-400 mb-2" />}
                        </div>
                    </div>
                </div>
                <button
                  onClick={handleGenerateThumbnail}
                  disabled={isGenerating || !thumbTitle}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all mt-2"
                >
                  {isGenerating ? <><Loader2 size={20} className="animate-spin" /><span>Designing...</span></> : <span>Generate (1 Credit)</span>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video shadow-2xl group">
                  <img src={generatedImage} alt="Generated Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-[5%]">
                      {thumbHeadline && <h2 className="text-yellow-400 font-black text-center text-3xl md:text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] stroke-black" style={{ WebkitTextStroke: '1px black', textShadow: '0 4px 8px black' }}>{thumbHeadline}</h2>}
                      {thumbSubtext && <h3 className="text-white font-extrabold text-center text-xl md:text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)]" style={{ WebkitTextStroke: '1px black', textShadow: '0 4px 8px black' }}>{thumbSubtext}</h3>}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-3">
                   <div className="flex items-center space-x-2 text-slate-400 mb-1"><Type size={16} /><span className="text-xs font-bold uppercase">Add Text Overlay</span></div>
                   <input type="text" value={thumbHeadline} onChange={(e) => setThumbHeadline(e.target.value)} placeholder="MAIN HEADLINE" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-yellow-400 font-bold placeholder:text-slate-600 focus:outline-none" />
                   <input type="text" value={thumbSubtext} onChange={(e) => setThumbSubtext(e.target.value)} placeholder="Subtext (optional)" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white font-bold placeholder:text-slate-600 focus:outline-none" />
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setGeneratedImage(null)} className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors">Back</button>
                  <button onClick={handleDownloadComposite} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2"><span>Download HD</span><Download size={18} /></button>
                  <button onClick={() => handleSaveGenerated('thumb')} className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors">Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
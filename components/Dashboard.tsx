import React from 'react';
import { Bell, Wand2, Youtube, Plus, Sparkles, ArrowRight, Zap, Smile, ShoppingBag, Mountain, Brain, Box, Sun, Palette, Layers, Eye, Lock, Ghost, Gamepad2, Hexagon, Database, Download, Trash2 } from 'lucide-react';
import { Project, QuickAccessItem } from '../types';

interface DashboardProps {
  projects: Project[];
  dailyCount: number;
  maxDaily: number;
  userAvatar: string;
  onOpenAI: (initialPrompt?: string) => void;
  onOpenThumbnailMaker: () => void;
  onOpenEditor: (project?: Project, initialTool?: string) => void;
  onOpenPremium: () => void;
  onDeleteProject: (projectId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, dailyCount, maxDaily, userAvatar, onOpenAI, onOpenThumbnailMaker, onOpenEditor, onOpenPremium, onDeleteProject }) => {
  const quickAccess: QuickAccessItem[] = [
    {
      id: 'ai-photo',
      title: 'AI Photo Generation',
      description: 'Transform ideas into art',
      icon: <Wand2 size={24} className="text-white" />,
      color: 'bg-blue-600',
      action: () => onOpenAI(),
    },
    {
      id: 'yt-thumb',
      title: 'YouTube Thumbnail',
      description: 'Viral style maker',
      icon: <Youtube size={24} className="text-white" />,
      color: 'bg-red-600',
      action: onOpenThumbnailMaker,
    },
  ];

  const templates = [
    {
      id: 'cyberpunk',
      title: 'Neon Cyberpunk',
      image: 'https://picsum.photos/seed/neon/400/300',
      icon: <Zap size={16} className="text-cyan-400" />,
      prompt: 'A futuristic cyberpunk city street at night, raining, neon signs reflecting on wet pavement, cinematic lighting, 8k resolution, photorealistic, highly detailed.'
    },
    {
      id: '3d-char',
      title: '3D Pixar Style',
      image: 'https://picsum.photos/seed/pixar/400/300',
      icon: <Smile size={16} className="text-yellow-400" />,
      prompt: 'Cute 3D character design, soft lighting, pixar style animation render, 4k, vibrant colors, expressive eyes, smooth textures, studio lighting.'
    },
    {
      id: 'product',
      title: 'Minimal Product',
      image: 'https://picsum.photos/seed/minimal/400/300',
      icon: <ShoppingBag size={16} className="text-emerald-400" />,
      prompt: 'Minimalist product photography, podium, pastel background, soft shadows, studio lighting, high quality, commercial photography.'
    },
    {
      id: 'landscape',
      title: 'Epic Landscape',
      image: 'https://picsum.photos/seed/mountains/400/300',
      icon: <Mountain size={16} className="text-orange-400" />,
      prompt: 'Epic mountain landscape during golden hour, wide angle lens, dramatic clouds, hyperrealistic, national geographic style, detailed foliage.'
    },
    {
      id: 'anime',
      title: 'Anime Portrait',
      image: 'https://picsum.photos/seed/animeart/400/300',
      icon: <Sparkles size={16} className="text-pink-400" />,
      prompt: 'High quality anime portrait, Makoto Shinkai style, vibrant colors, detailed eyes, emotional atmosphere, lens flare, 4k wallpaper.'
    },
    {
      id: 'abstract',
      title: 'Abstract 3D',
      image: 'https://picsum.photos/seed/fluid3d/400/300',
      icon: <Layers size={16} className="text-purple-400" />,
      prompt: 'Abstract 3D fluid shapes, iridescent colors, glossy texture, floating in void, studio lighting, raytracing, surreal digital art.'
    },
    {
      id: 'isometric',
      title: 'Isometric Room',
      image: 'https://picsum.photos/seed/isometric/400/300',
      icon: <Box size={16} className="text-blue-400" />,
      prompt: 'Isometric cozy gaming room, low poly style, soft lighting, pastel colors, highly detailed, blender 3d render, cute aesthetic.'
    },
    {
      id: 'fantasy',
      title: 'Dark Fantasy',
      image: 'https://picsum.photos/seed/fantasy/400/300',
      icon: <Ghost size={16} className="text-red-400" />,
      prompt: 'Dark fantasy rpg character, mysterious foggy forest background, magical glowing rune effects, detailed armor, cinematic lighting, unreal engine 5.'
    }
  ];

  const handleDownloadProject = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = project.thumbnail;
    link.download = `vrazo-${project.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteProject(projectId);
  };

  return (
    <div className="pb-24 px-4 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 ring-2 ring-blue-500/20">
             <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            {/* Gradient Text for App Name */}
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text leading-none mb-1">
              Vrazo AI
            </h1>
            <p className="text-slate-300 text-xs font-medium flex items-center gap-1">
              Welcome back, RIJON <span className="text-blue-400">✨</span>
            </p>
          </div>
        </div>
        <button onClick={onOpenPremium} className="px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold flex items-center gap-1 hover:bg-yellow-500/20 transition-colors">
          <Lock size={12} />
          <span>Premium</span>
        </button>
      </div>

      {/* Credit Status */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700 flex justify-between items-center">
          <div>
              <p className="text-slate-400 text-xs mb-1">Daily Free Credits</p>
              <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-white">{maxDaily - dailyCount}</span>
                  <span className="text-sm text-slate-500 mb-1">/ {maxDaily} left</span>
              </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
              <Sparkles size={20} className={dailyCount >= maxDaily ? "text-slate-500" : "text-blue-400"} />
          </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-4">Create New</h2>
      <div className="space-y-3 mb-8">
        {quickAccess.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl p-3 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-lg`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-slate-400 text-xs">{item.description}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-slate-600">
               <ArrowRight size={14} className="text-slate-300" />
            </div>
          </button>
        ))}
      </div>

      {/* SAVED PROJECTS SECTION */}
      {projects.length > 0 && (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database size={18} className="text-blue-400" />
                    Your Creations
                </h2>
                <span className="text-xs text-slate-500">{projects.length} saved</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {projects.map((project) => (
                    <div key={project.id} onClick={() => onOpenEditor(project)} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative group cursor-pointer shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-[16/9] bg-slate-900">
                            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                            <h3 className="text-sm font-bold text-white truncate">{project.title}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">{project.type} • {project.date.split(',')[0]}</p>
                        </div>
                        
                        {/* Delete Button - Top Left */}
                        <button 
                            onClick={(e) => handleDeleteClick(e, project.id)}
                            className="absolute top-2 left-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 z-20 shadow-md"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>

                        {/* Download Button - Top Right */}
                        <button 
                            onClick={(e) => handleDownloadProject(e, project)}
                            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 z-20 shadow-md"
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-400" />
          Trending Styles
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => (
          <div 
            key={t.id} 
            onClick={() => onOpenAI(t.prompt)} 
            className="group cursor-pointer relative rounded-2xl overflow-hidden border border-slate-700 aspect-[4/3] shadow-lg"
          >
            <img 
              src={t.image} 
              alt={t.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
            <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/50 shadow-sm">
                {t.icon}
            </div>
            <div className="absolute bottom-3 left-3 right-3">
               <h3 className="font-bold text-white text-sm mb-0.5 leading-tight">{t.title}</h3>
               <div className="flex items-center space-x-1 text-blue-400">
                  <span className="text-[10px] font-medium uppercase tracking-wider">Try Prompt</span>
                  <ArrowRight size={10} />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onOpenEditor()}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 transition-transform active:scale-95 z-50"
      >
        <Plus size={28} className="text-white" />
      </button>
    </div>
  );
};

export default Dashboard;
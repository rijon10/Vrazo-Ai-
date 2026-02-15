import React from 'react';

export interface Project {
  id: string;
  title: string;
  thumbnail: string;
  type: 'Video' | 'Photo' | 'Thumbnail';
  date: string;
  duration?: string;
}

export type ViewState = 'home' | 'editor' | 'explore' | 'settings';

export interface NavItem {
  id: ViewState;
  label: string;
  icon: React.ReactNode;
}

export interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}
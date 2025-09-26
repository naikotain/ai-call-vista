// components/dashboard/NavigationMenu.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NavigationMenuProps {
  activeView: 'dashboard' | 'call-table';
  onViewChange: (view: 'dashboard' | 'call-table') => void;
}

export const NavigationMenu = ({ activeView, onViewChange }: NavigationMenuProps) => {
  return (
    <Card className="p-2 mb-6">
      <div className="flex space-x-2">
        <Button
          variant={activeView === 'dashboard' ? 'default' : 'outline'}
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2"
        >
          📊 Dashboard
        </Button>
        <Button
          variant={activeView === 'call-table' ? 'default' : 'outline'}
          onClick={() => onViewChange('call-table')}
          className="flex items-center gap-2"
        >
          📋 Tabla de Llamadas
        </Button>
      </div>
    </Card>
  );
};
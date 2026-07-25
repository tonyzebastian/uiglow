'use client';

import { Pen } from 'lucide-react';

export default function ToolsPreview() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
      <Pen className="w-12 h-12 text-white" />
    </div>
  );
}

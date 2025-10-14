'use client';

import { Eraser, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Color presets
const COLOR_PRESETS = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#6b7280' }
];

export default function DrawingToolbar({
  // Drawing controls
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,

  // View controls
  showImages,
  onShowImagesChange,
  showGrid,
  onShowGridChange,

  // Action buttons
  onUpload,
  onClear,
  onSave,

  // Button visibility
  showUploadButton = true,
  showClearButton = true,
  showSaveButton = true
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-6">
      {/* Left Section - Drawing Controls */}
      <div className="flex items-center gap-4">
        {/* Color Dropdown */}
        <Select value={currentColor} onValueChange={onColorChange}>
          <SelectTrigger className="w-[110px] h-9">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-slate-300"
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-sm">
                {COLOR_PRESETS.find(c => c.value === currentColor)?.name || 'Color'}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {COLOR_PRESETS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.value }}
                  />
                  <span>{color.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stroke Width Slider */}
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
          className="w-[150px] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          title={`Stroke width: ${strokeWidth}px`}
        />
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Middle Section - View Controls */}
      <div className="flex items-center gap-4">
        {/* Toggle Images */}
        <div className="flex items-center gap-2">
          <Switch
            checked={showImages}
            onCheckedChange={onShowImagesChange}
            id="toggle-images"
          />
          <label
            htmlFor="toggle-images"
            className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            Image
          </label>
        </div>

        {/* Toggle Grid Pattern */}
        <div className="flex items-center gap-2">
          <Switch
            checked={showGrid}
            onCheckedChange={onShowGridChange}
            id="toggle-grid"
          />
          <label
            htmlFor="toggle-grid"
            className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            Grid
          </label>
        </div>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-3">
        {showUploadButton && (
          <Button
            onClick={onUpload}
            variant="secondary"
            size="sm"
            title="Upload image"
          >
            <Upload className="w-4 h-4" />
          </Button>
        )}

        {showClearButton && (
          <Button
            onClick={onClear}
            variant="secondary"
            size="sm"
            title="Clear drawings"
          >
            <Eraser className="w-4 h-4" />
          </Button>
        )}

        {showSaveButton && (
          <Button
            onClick={onSave}
            size="sm"
            title="Save drawing"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

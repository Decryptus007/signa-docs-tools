
import React from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, Underline, MessageSquare, Pen, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface AnnotationToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  onExport: () => void;
  canExport: boolean;
}

const ColorPicker: React.FC<{
  activeColor: string;
  setActiveColor: (color: string) => void;
}> = ({ activeColor, setActiveColor }) => {
  const colors = [
    { name: 'Yellow', value: '#FEF08A' },
    { name: 'Green', value: '#D1FAE5' },
    { name: 'Blue', value: '#DBEAFE' },
    { name: 'Red', value: '#FEE2E2' },
    { name: 'Pink', value: '#FCE7F3' },
    { name: 'Purple', value: '#EDE9FE' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {colors.map((color) => (
        <button
          key={color.value}
          className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
            activeColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
          }`}
          style={{ backgroundColor: color.value }}
          onClick={() => setActiveColor(color.value)}
          title={color.name}
        />
      ))}
    </div>
  );
};

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  onExport,
  canExport
}) => {
  return (
    <div className="p-2 bg-white border rounded-lg shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={activeTool === 'highlight' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setActiveTool(activeTool === 'highlight' ? 'none' : 'highlight')}
                    className="relative"
                  >
                    <Highlighter className="h-4 w-4" />
                    {activeTool === 'highlight' && (
                      <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-sm"
                        style={{ backgroundColor: activeColor }}
                      ></div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-auto p-0">
                  <ColorPicker activeColor={activeColor} setActiveColor={setActiveColor} />
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Highlight Text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={activeTool === 'underline' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setActiveTool(activeTool === 'underline' ? 'none' : 'underline')}
                    className="relative"
                  >
                    <Underline className="h-4 w-4" />
                    {activeTool === 'underline' && (
                      <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-sm"
                        style={{ backgroundColor: activeColor }}
                      ></div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-auto p-0">
                  <ColorPicker activeColor={activeColor} setActiveColor={setActiveColor} />
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Underline Text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'comment' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool(activeTool === 'comment' ? 'none' : 'comment')}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Comment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'signature' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool(activeTool === 'signature' ? 'none' : 'signature')}
              >
                <Pen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Signature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator className="my-2" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onExport}
                disabled={!canExport}
                className={!canExport ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Export Document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default AnnotationToolbar;

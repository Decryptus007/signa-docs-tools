
import React from 'react';
import { Button } from '@/components/ui/button';

interface PageNavigationProps {
  pageNumber: number;
  numPages: number | null;
  setPageNumber: (pageNumber: number) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ 
  pageNumber, 
  numPages, 
  setPageNumber 
}) => {
  if (!numPages || numPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center mt-4 space-x-4">
      <Button
        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
        disabled={pageNumber <= 1}
        variant="outline"
      >
        Previous
      </Button>
      <span>
        Page {pageNumber} of {numPages}
      </span>
      <Button
        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
        disabled={pageNumber >= numPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};

export default PageNavigation;

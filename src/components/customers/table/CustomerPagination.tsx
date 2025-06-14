
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomerPagination = React.memo(({ currentPage, totalPages, onPageChange }: CustomerPaginationProps) => {
  if (totalPages <= 1) return null;
  
  // Memoize page numbers array to avoid recreation on every render
  const pageNumbers = React.useMemo(() => 
    Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  const handlePrevious = React.useCallback(() => {
    onPageChange(Math.max(1, currentPage - 1));
  }, [currentPage, onPageChange]);

  const handleNext = React.useCallback(() => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = React.useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
  
  return (
    <nav
      role="navigation"
      aria-label="Customer table pagination"
      className="mt-4"
    >
      <Pagination className="animate-fade-in">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={handlePrevious}
              onKeyDown={(e) => handleKeyDown(e, handlePrevious)}
              className={`transition-all duration-200 ${
                currentPage === 1 
                  ? 'pointer-events-none opacity-50' 
                  : 'hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
              aria-disabled={currentPage === 1}
              aria-label={`Go to previous page, currently on page ${currentPage}`}
              tabIndex={currentPage === 1 ? -1 : 0}
            />
          </PaginationItem>
          
          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink 
                isActive={currentPage === pageNum} 
                onClick={() => handlePageClick(pageNum)}
                onKeyDown={(e) => handleKeyDown(e, () => handlePageClick(pageNum))}
                className={`transition-all duration-200 ${
                  currentPage === pageNum ? 
                    'bg-gradient-to-r from-broker-primary to-broker-accent text-white shadow-md' : 
                    'hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
                aria-label={`${currentPage === pageNum ? 'Current page, ' : ''}Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={handleNext}
              onKeyDown={(e) => handleKeyDown(e, handleNext)}
              className={`transition-all duration-200 ${
                currentPage === totalPages 
                  ? 'pointer-events-none opacity-50' 
                  : 'hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
              aria-disabled={currentPage === totalPages}
              aria-label={`Go to next page, currently on page ${currentPage}`}
              tabIndex={currentPage === totalPages ? -1 : 0}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </nav>
  );
});

CustomerPagination.displayName = 'CustomerPagination';

export default CustomerPagination;

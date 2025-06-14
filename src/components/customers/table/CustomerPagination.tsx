
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
  
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={handlePrevious}
            className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:scale-105 hover:shadow-md transition-all'}`}
          />
        </PaginationItem>
        
        {pageNumbers.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink 
              isActive={currentPage === pageNum} 
              onClick={() => handlePageClick(pageNum)}
              className={`${currentPage === pageNum ? 
                'bg-gradient-to-r from-broker-primary to-broker-accent text-white shadow-md' : 
                'hover:scale-105 hover:shadow-sm transition-all'}`}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={handleNext}
            className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:scale-105 hover:shadow-md transition-all'}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
});

CustomerPagination.displayName = 'CustomerPagination';

export default CustomerPagination;

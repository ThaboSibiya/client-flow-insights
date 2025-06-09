
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

const CustomerPagination = ({ currentPage, totalPages, onPageChange }: CustomerPaginationProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:scale-105 hover:shadow-md transition-all'}`}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPages }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i + 1} 
              onClick={() => onPageChange(i + 1)}
              className={`${currentPage === i + 1 ? 
                'bg-gradient-to-r from-broker-primary to-broker-accent text-white shadow-md' : 
                'hover:scale-105 hover:shadow-sm transition-all'}`}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:scale-105 hover:shadow-md transition-all'}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomerPagination;

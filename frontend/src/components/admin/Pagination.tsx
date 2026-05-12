import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;

    if (totalPages <= maxVisiblePages) {
      // Nếu tổng số trang ít hơn hoặc bằng 4, hiển thị hết
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị 4 trang đầu và dấu ...
      if (currentPage <= 3) {
        // Nếu đang ở các trang đầu
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage > totalPages - 3) {
        // Nếu đang ở các trang cuối
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Nếu đang ở giữa
        pages.push(1);
        pages.push('...');
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => (
      <button
        key={`pg-${index}-${typeof page === 'number' ? page : 'ellipsis'}`}
        onClick={() => typeof page === 'number' && onPageChange(page)}
        disabled={page === '...'}
        className={`w-8 h-8 rounded text-xs font-bold transition-all ${
          currentPage === page
            ? 'bg-slate-500 text-white shadow-md shadow-slate-500/20'
            : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
        } ${page === '...' ? 'cursor-default' : ''}`}
      >
        {page}
      </button>
    ));
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
      <p className="text-xs text-slate-500 font-medium">
        Hiển thị <span className="text-slate-800 font-bold">{totalItems > 0 ? indexOfFirstItem : 0}</span> đến{' '}
        <span className="text-slate-800 font-bold">{indexOfLastItem}</span> trên{' '}
        <span className="text-slate-800 font-bold">{totalItems}</span> bản ghi
      </p>
      
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {renderPageNumbers()}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
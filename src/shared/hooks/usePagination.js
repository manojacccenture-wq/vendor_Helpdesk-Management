import { useState, useEffect } from 'react';

export const usePagination = (dataArray, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalItems = dataArray.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = dataArray.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToPage = (page) => setCurrentPage(page);
  const setItemsPerPage = (size) => {
    setItemsPerPageState(size);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalItems, currentPage, totalPages]);

  return { paginatedData, currentPage, totalPages, totalItems, itemsPerPage, nextPage, prevPage, goToPage, setItemsPerPage };
};

import { useState } from 'react';

export const usePagination = (dataArray = [], initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const safeData = Array.isArray(dataArray) ? dataArray : [];
  const totalItems = safeData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = currentPage > totalPages ? 1 : currentPage;

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedData = safeData.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToPage = (page) => setCurrentPage(page);
  const setItemsPerPage = (size) => {
    setItemsPerPageState(size);
    setCurrentPage(1);
  };

  return {
    paginatedData,
    currentData: paginatedData,
    currentPage: validCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage,
  };
};

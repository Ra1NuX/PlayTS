import { useState } from "react"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"

interface PaginationProps {
  totalPages: number
  initialPage?: number
  onPageChange?: (page: number) => void
}

const Pagination = ({totalPages, initialPage=1, onPageChange}: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    onPageChange?.(page)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      pages.push(
        <button key="1" onClick={() => handlePageChange(1)} className="px-3 py-1 dark:text-white dark:hover:bg-[#2a2e33] hover:bg-[#eaeaea] rounded">
          1
        </button>,
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-400">
            ...
          </span>,
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            i === currentPage ? "bg-[#3a86ff] text-white" : "dark:text-white dark:hover:bg-[#2a2e33] text-main-light hover:bg-[#eaeaea]"
          }`}
        >
          {i}
        </button>,
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-400">
            ...
          </span>,
        )
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 dark:text-white dark:hover:bg-[#2a2e33] text-main-light hover:bg-[#eaeaea] rounded"
        >
          {totalPages}
        </button>,
      )
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center p-4  rounded-md">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1 rounded-md ${
            currentPage === 1 ? "text-gray-500 cursor-not-allowed" : "dark:text-white dark:hover:bg-[#2a2e33] hover:bg-[#eaeaea]"
          }`}
          aria-label="Página anterior"
        >
          <BiChevronLeft size={20} />
        </button>

        <div className="flex items-center">{renderPageNumbers()}</div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md ${
            currentPage === totalPages ? "text-gray-500 cursor-not-allowed" : "dark:text-white dark:hover:bg-[#2a2e33] hover:bg-[#eaeaea]"
          }`}
          aria-label="Página siguiente"
        >
          <BiChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
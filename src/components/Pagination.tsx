import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getVisiblePages } from "../utils/paginationHelper"
import PageButton from "./pagination/PageButton"

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

  const visiblePages = getVisiblePages(currentPage, totalPages)

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
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center">
          {visiblePages.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <PageButton
                key={page}
                page={page}
                isActive={page === currentPage}
                onClick={handlePageChange}
              />
            )
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md ${
            currentPage === totalPages ? "text-gray-500 cursor-not-allowed" : "dark:text-white dark:hover:bg-[#2a2e33] hover:bg-[#eaeaea]"
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Pagination

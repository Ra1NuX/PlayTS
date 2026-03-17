interface PageButtonProps {
  page: number;
  isActive: boolean;
  onClick: (page: number) => void;
}

const PageButton = ({ page, isActive, onClick }: PageButtonProps) => {
  return (
    <button
      onClick={() => onClick(page)}
      className={`px-3 py-1 rounded ${
        isActive
          ? "bg-[#3a86ff] text-white"
          : "dark:text-white dark:hover:bg-[#2a2e33] text-main-light hover:bg-[#eaeaea]"
      }`}
    >
      {page}
    </button>
  );
};

export default PageButton;

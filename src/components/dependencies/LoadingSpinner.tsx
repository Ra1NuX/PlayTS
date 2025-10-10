export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-main-dark"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-accent-dark border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm dark:text-gray-400 text-main-light/70 font-medium">
        Buscando paquetes...
      </p>
    </div>
  );
};


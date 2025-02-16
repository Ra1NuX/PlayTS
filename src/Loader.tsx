const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#f7f7f7]"></div>
    </div>
  );
};

export default Loader;

import { useEffect, useRef } from "react";

const ApiKey = () => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    localStorage.setItem("apiKey", newApiKey);
  };

  const loadApiKey = () => {
    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) {

    const safeApiKey = apiKey.replace(/(.{4})(.*)(.{4})/, "$1****************$3");
      ref.current?.setAttribute('placeholder', safeApiKey);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2>Api Key</h2>

      <input
        type="text"
        placeholder="Enter your API key"
        onChange={handleChange}
        ref={ref}
        className="font-[roboto] placeholder:text-center font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 p-1 pr-2 rounded-xl flex items-center justify-between min-w-[180px]"
      />
    </div>
  );
};

export default ApiKey;

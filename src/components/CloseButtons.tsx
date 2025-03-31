import { api } from "../../main/preload";

declare global {
  interface Window {
    electron: typeof api;
  }
}

const CloseButtons = () => {
  return (
    <div className="float-right h-full flex leading-[30px] no-drag gap-1">
      <button
        onClick={() => window?.electron?.minimize()}
        className="tileStyleButton "
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 16 16"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 8H1V7h14v1z"></path>
        </svg>
      </button>
      <button
        onClick={() => window?.electron?.maximize()}
        className="tileStyleButton"
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 16 16"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.5 4l.5-.5h8l.5.5v8l-.5.5H4l-.5-.5V4zm1 .5v7h7v-7h-7z"
          ></path>
        </svg>
      </button>
      <button
        onClick={() => window?.electron?.close()}
        className="tileStyleButton hover:bg-[#ff0000dd] dark:hover:bg-[#ff0000dd] hover:text-white"
      >
        <span className="text-2xl font-extralight mb-1.5">&times;</span>
      </button>
    </div>
  );
};

export default CloseButtons;

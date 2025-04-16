const OutputComponent = () => {
  return (
    <div className="break-words group overflow-y-auto font-semibold font-mono leading-none dark:bg-main-light bg-[#eaeaea] rounded-md rounded-l-none border-l dark:border-l-main-dark border-l-[#f7f7f7] w-full flex flex-col flex-1 p-2 px-4">
      {Array.isArray(filledArray)
        ? filledArray?.map((element, i) => {
            if (element) {
              const { text } = element;
              return (
                <div
                  className="flex w-full rounded"
                  key={element.text + "-" + element.line + "-" + i}
                >
                  <div className="flex w-full justify-between font-mono">
                    <SyntaxHighlighter
                      language="javascript"
                      codeTagProps={{
                        style: {
                          whiteSpace: "pre-wrap",
                          fontFamily: `"${font}"`,
                          fontSize: size,
                        },
                      }}
                      PreTag={"pre"}
                      style={theme === "dark" ? darkTheme : lightTheme}
                      customStyle={{
                        padding: 0,
                        paddingLeft: "1.25rem",
                        backgroundColor: "transparent",
                        color: theme === "dark" ? "#fafafa" : "#0008",
                        lineHeight: "27px",
                      }}
                      className={`font-normal text-[#f1fa8c] ${
                        text !== "\n" ? "border-l-4 border-gray-900/10 " : ""
                      } pl-5`}
                    >
                      {text}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }
          })
        : JSON.stringify(filledArray)}

      {settings.apiKey && (
        <button
          onClick={() => {
            setOpenIaMenu((o) => !o);
          }}
          className="absolute right-3.5 font-bold p-1.5 rounded-lg opacity-10 group-hover:opacity-100 transition-all duration-300 ease-in-out text-[#eaeaea]"
        >
          <BsStars className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default OutputComponent;
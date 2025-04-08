const EmailInput = () => {
  return <div>
   <h2 className="p-0.5">
      Email
   </h2>
   
   <input
         type="email"
         placeholder="example@gmail.com"
         // onChange={}
         // ref={ref}
         className="font-[roboto] p-1 px-2 font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 pr-2 rounded-xl flex items-center justify-between w-full"
       />
  </div> 
 }
 
 export default EmailInput;
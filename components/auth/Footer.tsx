import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white sm:flex-row gap-2 flex-col md:text-base text-sm p-5 md:px-5 px-3 flex items-center justify-between ">
      <div className="flex flex-row items-center md:gap-5 gap-2">
        <span className=" text-gray-500">Need help?</span>
        <a href="mailto:support@example.com" className=" text-primary ">
          Contact Support
        </a>
      </div>
      <span className="">
        &copy; {new Date().getFullYear()} Dosteon. All rights reserved.
      </span>
    </footer>
  );
};

export default Footer;

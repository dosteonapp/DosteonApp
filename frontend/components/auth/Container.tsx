import React from "react";

const Container: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="bg-[#F7F7F7] flex flex-grow items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full flex justify-center">
        {children}
      </div>
    </div>

  );
};

export default Container;

import React from "react";

const Container: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="bg-[#F7F7F7] flex flex-grow items-center justify-center">
      {children}
    </div>
  );
};

export default Container;

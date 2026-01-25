import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      {children}
    </div>
  );
};

export default Layout;

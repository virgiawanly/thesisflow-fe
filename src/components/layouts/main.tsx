import { Outlet } from "react-router";
import { Navbar } from "./navbar";

const MainLayout = () => {
  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted dark:bg-background">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;

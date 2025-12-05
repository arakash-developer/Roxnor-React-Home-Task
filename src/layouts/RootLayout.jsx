import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <>
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
        {/* Main Content */}
        <Outlet />
      </div>
    </>
  );
}

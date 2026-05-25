import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

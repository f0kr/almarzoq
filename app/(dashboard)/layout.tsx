import NavBar from "./_components/NavBar";
import Sidebar from "./_components/Sidebar";

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="h-full">
            {/* sticky (not fixed): in-app browsers (e.g. Telegram on iOS) misplace
                fixed elements when their collapsing top bar resizes the viewport */}
            <div className="md:pl-56 sticky top-0 w-full z-50 bg-sidebar pt-[env(safe-area-inset-top,0px)] h-[calc(80px+env(safe-area-inset-top,0px))]">
            <NavBar/>
            </div>
            <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
              <Sidebar />
            </div>
            <main className="md:pl-56 h-full">
            {children}
            </main>
        </div>
    )
}
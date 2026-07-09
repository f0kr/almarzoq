import NavBarRoutes from "@/components/NavBarRoutes";
import MobileSideBar from "./MobileSideBar";

export default function NavBar() {
    return(
        <div className="p-4 border-b border-sidebar-border h-full flex items-center bg-sidebar shadow-sm">
            <MobileSideBar/>
            <NavBarRoutes/>
        </div>
    )
}
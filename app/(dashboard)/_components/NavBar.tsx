import NavBarRoutes from "@/components/NavBarRoutes";
import MobileSideBar from "./MobileSideBar";

export default function NavBar() {
    return(
        <div className="p-4 border-b h-full flex - items-center bg-white shadow-sm">
            <MobileSideBar/>
            <NavBarRoutes/>
        </div>
    )
}
import NavBarRoutes from "@/components/NavBarRoutes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CourseNavbar(){
  return(
    <div className="p-4 border-b border-sidebar-border h-full flex items-center gap-3 bg-sidebar shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-grey hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <NavBarRoutes/>
    </div>
  )
}

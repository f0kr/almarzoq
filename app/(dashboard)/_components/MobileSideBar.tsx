"use client"

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger,  } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { useState } from "react";


export default function MobileSideBar() {

    const [open, setOpen] = useState(false);

    return(
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger  className="md:hidden pr-4 hover:opacity-75 transition">
                 <Menu/>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white">
                <Sidebar onRouteClick={() => setOpen(false)}/>
            </SheetContent>
        </Sheet>
    )
}
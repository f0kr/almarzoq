

import Link from "next/link";
import Logo from "./Logo";
import SideBarRoutes from "./SideBarRoutes";
import { FaFacebook, FaFacebookF, FaInstagram, FaInstagramSquare, FaTiktok, FaYoutube } from "react-icons/fa";

export default function Sidebar({ onRouteClick }: { onRouteClick?: () => void }) {
    return(
        <div className="h-full border-r flex flex-col justify-between overflow-y-auto bg-white shadow-sm">
            <div className="h-full overflow-y-hidden">
         <div className="p-6">
            <Logo />
         </div>
         <div className="flex flex-col w-full h-full">
            <SideBarRoutes onRouteClick={onRouteClick}/>
         </div>
            </div>
         <div className="mx-auto border-t-2 w-full pt-4 flex justify-center items-center gap-4 mb-6 self-start">
                  <p className="text-muted-foreground text-s">Follow us</p>
                  <div className='flex items-center justify-center gap-2'>
                    <Link
                    href='https://www.tiktok.com/@almrzoq.academy?_r=1&_t=ZS-92DO28XgJld'
                    target='_blank'
                    >
                    <FaTiktok className='h-4 w-4' />
                    </Link>
                    <Link
                    href='https://www.facebook.com/share/16hnmTECfW/?mibextid=wwXIfr'
                    target='_blank'
                    >
                    <FaFacebookF className='h-4 w-4' />
                    </Link>
                    <Link
                    href='https://www.instagram.com/almrzoq.academy?igsh=bWs5dHluMDJkYXNh'
                    target='_blank'
                    >
                    <FaInstagram color="red" className='h-4 w-4'  />
                    </Link>
                    <Link
                    href='https://youtube.com/@almrzoq.academy?si=Nvb3uGQ40X09rT6I'
                    target='_blank'
                    >
                    <FaYoutube className='h-4 w-4' />
                    </Link>
                  </div>
         </div>
        </div>
    ) 
}


import Link from "next/link";
import Logo from "./Logo";
import SideBarRoutes from "./SideBarRoutes";
import { FaFacebook, FaFacebookF, FaInstagram, FaInstagramSquare, FaTiktok, FaYoutube } from "react-icons/fa";

export default function Sidebar({ onRouteClick }: { onRouteClick?: () => void }) {
    return(
        <div className="h-full border-r flex flex-col justify-between overflow-y-auto bg-white shadow-sm">
            <div>
         <div className="p-6">
            <Logo />
         </div>
         <div className="flex flex-col w-full">
            <SideBarRoutes onRouteClick={onRouteClick}/>
         </div>
            </div>
         <div>
                  <div className='flex items-center mb-8 justify-center gap-4'>
                    <Link
                    href='https://www.tiktok.com/@almrzoq.academy?_r=1&_t=ZS-92DO28XgJld'
                    target='_blank'
                    >
                    <FaTiktok className='h-5 w-5' />
                    </Link>
                    <Link
                    href='https://www.facebook.com/share/16hnmTECfW/?mibextid=wwXIfr'
                    target='_blank'
                    >
                    <FaFacebookF className='h-5 w-5' />
                    </Link>
                    <Link
                    href='https://www.instagram.com/almrzoq.academy?igsh=bWs5dHluMDJkYXNh'
                    target='_blank'
                    >
                    <FaInstagram color="black" className='h-5 w-5'  />
                    </Link>
                    <Link
                    href='https://youtube.com/@almrzoq.academy?si=Nvb3uGQ40X09rT6I'
                    target='_blank'
                    >
                    <FaYoutube className='h-5 w-5' />
                    </Link>
                  </div>
         </div>
        </div>
    ) 
}
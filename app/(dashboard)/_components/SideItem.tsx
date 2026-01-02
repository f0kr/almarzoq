'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SideItemProps {
    icon: LucideIcon | React.ComponentType<any>;
    label: string;
    href: string;
    onClick?: () => void;
}
const SideItem = ({
    icon : Icon,
    label,
    href,
    onClick
} : SideItemProps
) => {

    const pathname = usePathname()
    const router = useRouter()

    const isActive = (pathname === "/" && href === "/") || 
    pathname === href || pathname?.startsWith(`${href}/`)

    const handleClick = () => {
        router.push(href)
        if (onClick) onClick()
    }

    return (
       <button
            onClick={handleClick}
            type='button'
            className={cn(
                'flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 ',
                isActive && 'bg-red-200/20 text-red-700 hover:bg-red-200/20 hover:text-red-700'
            )}
         >
            <div className='flex items-center gap-x-2 py-4 '>
                <Icon size={22} className={cn("text-slate-500 ", isActive && "text-red-700")} />
                {label}
            </div>
            <div
            className={cn("ml-auto opacity-0 border-2 border-red-700 h-full transition-all", isActive && "opacity-100")}
            />
        </button>
    );
};

export default SideItem;
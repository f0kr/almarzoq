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
                'relative flex items-center gap-x-3 mx-3 px-3 py-2.5 rounded-lg text-muted-foreground text-sm font-medium transition-all hover:bg-paper',
                isActive && 'bg-clay text-clay-tint font-semibold hover:bg-clay'
            )}
         >
            <Icon size={20} className={cn("text-muted-foreground", isActive && "text-clay-tint")} />
            {label}
        </button>
    );
};

export default SideItem;
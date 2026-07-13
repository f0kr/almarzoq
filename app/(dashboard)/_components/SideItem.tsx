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
                isActive && 'bg-clay-tint text-primary font-semibold hover:bg-clay-tint'
            )}
         >
            <span
              className={cn('absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary opacity-0 transition-opacity', isActive && 'opacity-100')}
            />
            <Icon size={20} className={cn("text-muted-foreground", isActive && "text-primary")} />
            {label}
        </button>
    );
};

export default SideItem;
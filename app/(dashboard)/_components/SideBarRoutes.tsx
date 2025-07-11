'use client';

import SideItem from './SideItem';
import {Layout, Compass, List, BarChart} from 'lucide-react'
import { usePathname } from 'next/navigation';

const guestRoutes = [
    {
        icon: Layout,
        label: 'Dashboard',
        href: '/', 
    },

    {
        icon: Compass,
        label: 'Browse',
        href: '/search', 
    },

]

const teacherRoutes = [
    {
        icon: List,
        label: 'Courses',
        href: '/teacher/courses', 
    },
    {
        icon: BarChart,
        label: 'Analytics',
        href: '/teacher/analytics', 
    },
]

const SideBarRoutes = () => {
    const pathname = usePathname()
    const isTeacherPage = pathname?.startsWith('/teacher')
    const routes = isTeacherPage ? teacherRoutes : guestRoutes

    return (
        <div className='flex flex-col w-full'>
            {routes.map((route) => (
                <SideItem
                    key={route.label}
                    icon={route.icon}
                    label={route.label}
                    href={route.href}
                />
            ))}
        </div>
    );
};

export default SideBarRoutes;
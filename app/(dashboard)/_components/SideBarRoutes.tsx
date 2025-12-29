'use client';

import SideItem from './SideItem';
import {Layout, Compass, List, BarChart, Group, PersonStanding, InfoIcon, } from 'lucide-react'
import { usePathname } from 'next/navigation';
import { FaChalkboardTeacher } from 'react-icons/fa';


const guestRoutes = [
    {
        icon: Layout,
        label: 'Dashboard',
        href: '/dashboard', 
    },

    {
        icon: Compass,
        label: 'Courses',
        href: '/', 
    },
    
    {
        icon: FaChalkboardTeacher,
        label: 'Masters',
        href: '/masters',
    },

    {
        icon: InfoIcon,
        label: 'About Us',
        href: '/about-us',
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
        {
        icon: Group,
        label: 'Categories',
        href: '/teacher/categories',
    },
    {
        icon: PersonStanding ,
        label: 'Students',
        href: '/teacher/students',
    },
    {
        icon: FaChalkboardTeacher,
        label: 'Masters',
        href: '/teacher/masters',
    }
]

const SideBarRoutes = ({ onRouteClick }: { onRouteClick?: () => void }) => {
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
                    onClick={onRouteClick}
                />
            ))}
        </div>
    );
};

export default SideBarRoutes;
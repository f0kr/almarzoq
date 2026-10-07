"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, LayoutGrid, LucideIcon } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";
import { IconBadge } from "@/components/IconBadge";
import { cn } from "@/lib/utils";

export type DashboardCourseItem = {
    id: string;
    title: string;
    imageUrl: string;
    chaptersLength: number;
    price: number;
    progress: number | null;
    category: string;
    masters: { name: string; profileUrl?: string | null }[];
    status: "in-progress" | "completed";
};

type Filter = "all" | "in-progress" | "completed";

const filters: {
    value: Filter;
    label: string;
    icon: LucideIcon;
    variant?: "default" | "success";
    empty: { title: string; description: string };
}[] = [
    {
        value: "all",
        label: "All courses",
        icon: LayoutGrid,
        empty: {
            title: "No courses yet",
            description:
                "When you enroll in a course it will show up here. Explore the catalog to find your first one.",
        },
    },
    {
        value: "in-progress",
        label: "In progress",
        icon: Clock,
        empty: {
            title: "Nothing in progress",
            description:
                "You have finished everything you started. Time to pick up something new.",
        },
    },
    {
        value: "completed",
        label: "Completed",
        icon: CheckCircle2,
        variant: "success",
        empty: {
            title: "No completed courses yet",
            description:
                "Finish every chapter of a course and it will be marked complete here.",
        },
    },
];

export default function MyCourses({ items }: { items: DashboardCourseItem[] }) {
    const [filter, setFilter] = useState<Filter>("all");

    const counts = useMemo(
        () => ({
            all: items.length,
            "in-progress": items.filter((i) => i.status === "in-progress").length,
            completed: items.filter((i) => i.status === "completed").length,
        }),
        [items]
    );

    const visible = useMemo(
        () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
        [items, filter]
    );

    const active = filters.find((f) => f.value === filter)!;

    return (
        <div className="space-y-6">
            <div
                role="tablist"
                aria-label="Filter courses"
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
                {filters.map((f) => {
                    const isActive = f.value === filter;
                    const count = counts[f.value];
                    return (
                        <button
                            key={f.value}
                            role="tab"
                            type="button"
                            aria-selected={isActive}
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                "flex items-center gap-x-3.5 rounded-2xl border bg-card p-4 text-left transition",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isActive
                                    ? "border-clay shadow-sm ring-1 ring-clay"
                                    : "border-beige hover:border-tan hover:bg-paper"
                            )}
                        >
                            <IconBadge variant={f.variant} icon={f.icon} />
                            <div className="min-w-0">
                                <p className="text-[13px] text-grey">{f.label}</p>
                                <p className="font-serif text-xl font-semibold">
                                    {count} {count === 1 ? "Course" : "Courses"}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((item) => (
                        <CourseCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            chaptersLength={item.chaptersLength}
                            price={item.price}
                            progress={item.progress}
                            category={item.category}
                            masters={item.masters}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    className="mt-10"
                    title={active.empty.title}
                    description={active.empty.description}
                />
            )}
        </div>
    );
}

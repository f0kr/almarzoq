import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-center min-h-dvh">
            {children}
        </div>
    );
}
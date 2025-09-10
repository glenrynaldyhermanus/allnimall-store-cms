"use client";

import { SidebarNav } from "./sidebar-nav";
import { Toaster } from "@/components/ui/sonner";

interface MainLayoutProps {
	children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="flex h-screen">
			<SidebarNav />
			<div className="flex-1 flex flex-col">
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<div className="flex-1" />
				</header>
				<main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
					{children}
				</main>
			</div>
			<Toaster />
		</div>
	);
}

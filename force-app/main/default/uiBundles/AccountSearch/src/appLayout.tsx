import { Outlet, Link, useLocation } from "react-router";
import { getAllRoutes } from "./router-utils";
import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";

export default function AppLayout() {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();
	const navId = useId();
	const outletWrapperRef = useRef<HTMLDivElement>(null);
	const previousPathname = useRef<string | null>(null);

	useEffect(() => {
		if (previousPathname.current !== null && previousPathname.current !== location.pathname) {
			const wrapper = outletWrapperRef.current;
			const target = wrapper?.querySelector<HTMLElement>("h1, main, [role='main']") ?? wrapper;
			if (target) {
				if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
				target.focus();
			}
		}
		previousPathname.current = location.pathname;
	}, [location.pathname]);

	const isActive = (path: string) => location.pathname === path;

	const navigationRoutes: { path: string; label: string }[] = getAllRoutes()
		.filter(
			(route) =>
				route.handle?.showInNavigation === true &&
				route.fullPath !== undefined &&
				route.handle?.label !== undefined,
		)
		.map(
			(route) =>
				({
					path: route.fullPath,
					label: route.handle?.label,
				}) as { path: string; label: string },
		);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<a
				href="#main-content"
				onClick={(e) => {
					e.preventDefault();
					const content = outletWrapperRef.current;
					if (content) {
						if (!content.hasAttribute("tabindex")) content.setAttribute("tabindex", "-1");
						content.focus();
					}
				}}
				className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow focus:ring-2 focus:ring-primary"
			>
				Skip to main content
			</a>

			<nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-14">
						{/* Brand */}
						<Link
							to="/"
							className="flex items-center gap-2 font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity"
						>
							<Search aria-hidden="true" className="size-5 shrink-0" />
							<span>Account Search</span>
						</Link>

						{/* Desktop nav */}
						<div className="hidden sm:flex items-center gap-1">
							{navigationRoutes.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									aria-current={isActive(item.path) ? "page" : undefined}
									className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
										isActive(item.path)
											? "bg-primary-foreground/20 text-primary-foreground"
											: "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
									}`}
								>
									{item.label}
								</Link>
							))}
						</div>

						{/* Mobile hamburger */}
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="sm:hidden p-2 rounded text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
							aria-label="Toggle menu"
							aria-expanded={isOpen}
							aria-controls={navId}
						>
							<div aria-hidden="true" className="w-5 h-5 flex flex-col justify-center space-y-1">
								<span className={`block h-0.5 w-5 bg-current transition-all ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
								<span className={`block h-0.5 w-5 bg-current transition-all ${isOpen ? "opacity-0" : ""}`} />
								<span className={`block h-0.5 w-5 bg-current transition-all ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
							</div>
						</button>
					</div>

					{/* Mobile dropdown */}
					<div id={navId} hidden={!isOpen} className="sm:hidden pb-3">
						{isOpen && (
							<div className="flex flex-col gap-1">
								{navigationRoutes.map((item) => (
									<Link
										key={item.path}
										to={item.path}
										onClick={() => setIsOpen(false)}
										aria-current={isActive(item.path) ? "page" : undefined}
										className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
											isActive(item.path)
												? "bg-primary-foreground/20 text-primary-foreground"
												: "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
										}`}
									>
										{item.label}
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</nav>

			<div id="main-content" ref={outletWrapperRef} className="flex-1">
				<Outlet />
			</div>

			<footer className="border-t border-border py-4 mt-auto">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
					Account Search &mdash; Salesforce Internal
				</div>
			</footer>
		</div>
	);
}

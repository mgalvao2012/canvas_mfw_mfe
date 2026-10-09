import { useEffect } from "react";
import { GlobalSearchBox } from "../features/search";

export default function HomePage() {
	useEffect(() => {
		document.title = "Home | Account Search";
	}, []);

	return (
		<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div className="text-center mb-10">
				<h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
					Find any Account
				</h1>
				<p className="text-muted-foreground text-base">
					Search accounts, contacts, and opportunities across your Salesforce org.
				</p>
			</div>
			<GlobalSearchBox placeholder="Search by name, industry, phone…" />
		</main>
	);
}

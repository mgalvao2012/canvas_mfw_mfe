import { useEffect } from "react";

interface EmbeddedFramePageProps {
	src: string;
	title: string;
}

export default function EmbeddedFramePage({ src, title }: EmbeddedFramePageProps) {
	useEffect(() => {
		document.title = `${title} | MyApp`;
	}, [title]);

	return (
		<main className="flex flex-col h-[calc(100vh-4rem)]">
			<iframe
				src={src}
				title={title}
				className="flex-1 w-full border-0"
				loading="lazy"
				referrerPolicy="no-referrer"
				allow="fullscreen; clipboard-write"
			/>
		</main>
	);
}

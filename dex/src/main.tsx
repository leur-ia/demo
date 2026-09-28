import "./dex.css";

import { LeuriaProvider } from "@leuria/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ai } from "./ai";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<LeuriaProvider client={ai}>
			<App />
		</LeuriaProvider>
	</StrictMode>,
);

import { initializeSearch } from "./components/search";
import { initializeMoodboard, currentPage } from "./components/moodboard";
import { loadData } from "./components/storage";
import { setupUI } from "./components/ui";
import html2canvas from "html2canvas";

document.addEventListener("DOMContentLoaded", () => { 
	loadData(); 
	setupUI(); 
	initializeMoodboard(); 
	initializeSearch(); 

	const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement; 
	exportBtn.addEventListener("click", exportMoodboard); 
});

function exportMoodboard() { 
	const moodboardContent = document.getElementById( 
		"moodboard-content"
	) as HTMLElement;

	moodboardContent.classList.add("hide-handles"); 
	html2canvas(moodboardContent, { useCORS: true }).then((canvas) => { 
		moodboardContent.classList.remove("hide-handles"); 

		const link = document.createElement("a"); 
		link.download = `${currentPage}.png`; 
		link.href = canvas.toDataURL(); 
		link.click(); 
	});
}

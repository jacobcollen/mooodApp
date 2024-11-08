import { pages, pageOrder, switchPage, renderMoodboard } from "./moodboard";
import { renderTabs } from "./ui";

export function saveData() {
	localStorage.setItem("moodboardPages", JSON.stringify(pages)); 
	localStorage.setItem("pageOrder", JSON.stringify(pageOrder)); 
}

export function loadData() {
	const data = localStorage.getItem("moodboardPages"); 
	const orderData = localStorage.getItem("pageOrder"); 

	if (data) {
		const loadedPages = JSON.parse(data); 
		Object.assign(pages, loadedPages); 

		if (orderData) {
			const loadedOrder = JSON.parse(orderData); 
			pageOrder.length = 0; 
			pageOrder.push(...loadedOrder); 
		} else {
			pageOrder.length = 0; 
			pageOrder.push(...Object.keys(pages));
		}

		if (!pages["Page 1"]) { 
			pages["Page 1"] = [];
			pageOrder.unshift("Page 1"); 
		}
		
		const firstPage = pageOrder[0] || "Page 1";
		if (!pages[firstPage]) {
			pages[firstPage] = [];
		}
		
		switchPage(firstPage);
		
		renderTabs();
		renderMoodboard();
	} else {
		
		pages["Page 1"] = [];
		pageOrder.push("Page 1");
		switchPage("Page 1");
		renderTabs();
		renderMoodboard();
	}
}

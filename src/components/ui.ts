import {
	pages,
	pageOrder,
	currentPage,
	switchPage,
	renderMoodboard,
} from "./moodboard";
import { saveData } from "./storage";
import { createIconButton } from "./icons";

const pageTabs = document.getElementById("pageTabs") as HTMLUListElement;
const addTab = document.getElementById("addTab") as HTMLLIElement;

let draggedTab: HTMLElement | null = null;

export function setupUI() {
	addTab.addEventListener("click", addNewPage); 
	renderTabs(); 
}

function addNewPage() {

	const pageName = generateNewPageName(); 
	pages[pageName] = []; 
	pageOrder.push(pageName); 
	saveData(); 
	switchPage(pageName); 
	renderTabs(); 
}

function generateNewPageName(): string {
	let baseName = "Page";
	let count = 1;
	let newName = `${baseName} ${count}`;
	
	const existingNames = new Set([...Object.keys(pages), ...pageOrder]);
	
	while (existingNames.has(newName)) {
		count++;
		newName = `${baseName} ${count}`;
	}
	return newName;
}

export function renderTabs() {
	
	const existingTabs = pageTabs.querySelectorAll(".sidebar__tab:not(#addTab)");
	existingTabs.forEach((tab) => tab.remove());
	
	pageOrder.forEach((pageName) => {
		
		const tab = document.createElement("li");
		tab.classList.add("sidebar__tab");
		tab.setAttribute("data-page-name", pageName);
		
		if (pageName === currentPage) {
			tab.classList.add("sidebar__tab--active");
		}
		
		const tabContent = document.createElement("div");
		tabContent.classList.add("tab-content");
		
		const dragHandle = document.createElement("span");
		dragHandle.classList.add("tab-drag-handle");
		dragHandle.innerHTML = "&#9776;";
		dragHandle.setAttribute("draggable", "true");
		
		const tabLabel = document.createElement("span");
		tabLabel.textContent = pageName;
		tabLabel.classList.add("tab-label");
		
		tabContent.appendChild(dragHandle);
		tabContent.appendChild(tabLabel);
		tab.appendChild(tabContent);
		
		const deleteBtn = createIconButton(
			"tab__delete-btn",
			"close tab",
			"./assets/xicon.svg"
		);
		tab.appendChild(deleteBtn);
		
		deleteBtn.addEventListener("click", (event) => {
			event.stopPropagation();
			deletePage(pageName);
		});
		
		tab.addEventListener("click", () => {
			switchPage(pageName);
		});
		
		enableTabRenaming(tab, tabLabel, pageName);
		enableTabDragging(tab, dragHandle); 
		
		dragHandle.addEventListener("selectstart", (event) =>
			event.preventDefault()
		);
		
		pageTabs.insertBefore(tab, addTab);
	});
}

function deletePage(pageName: string) {
	delete pages[pageName]; 
	
	const index = pageOrder.indexOf(pageName);
	if (index > -1) {
		pageOrder.splice(index, 1);
	}
	
	saveData();
	
	if (currentPage === pageName) {
		if (pageOrder.length === 0) {
			addNewPage(); 
		} else {
			switchPage(pageOrder[0]);
		}
	}
	
	renderTabs();
	renderMoodboard();
}

function enableTabRenaming(
	tab: HTMLElement,
	tabLabel: HTMLElement,
	pageName: string
) {
	
	tabLabel.addEventListener("dblclick", (event) => {
		event.stopPropagation();
		event.preventDefault();
		
		if (currentPage !== pageName) {
			switchPage(pageName);
		}
		
		const input = document.createElement("input");
		input.type = "text";
		input.value = pageName;
		input.classList.add("tab__rename-input");
		
		tabLabel.replaceWith(input);
		input.focus(); 
		
		input.addEventListener("click", (event) => event.stopPropagation());
		input.addEventListener("mousedown", (event) => event.stopPropagation());
		
		input.addEventListener("blur", () => {
			const newName = input.value.trim() || pageName;
			if (newName !== pageName) {
				if (pages[newName]) {
					alert("En sida med det namnet finns redan.");
					input.focus();
					return;
				}
				
				pages[newName] = pages[pageName];
				delete pages[pageName];
				
				const index = pageOrder.indexOf(pageName);
				if (index > -1) {
					pageOrder[index] = newName;
				}
				
				tab.setAttribute("data-page-name", newName);
				saveData(); 

				if (currentPage === pageName) {
					
					switchPage(newName);
				}
			}
			
			renderTabs();
			renderMoodboard();
		});
		
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				input.blur();
			}
		});
	});
}

function enableTabDragging(tab: HTMLElement, dragHandle: HTMLElement) {
	dragHandle.addEventListener("dragstart", (event: DragEvent) =>
		handleDragStart(event, tab)
	);
	
	tab.addEventListener("dragover", (event: DragEvent) => handleDragOver(event));
	tab.addEventListener("drop", (event: DragEvent) => handleDrop(event));
}

function handleDragStart(event: DragEvent, tab: HTMLElement) {
	draggedTab = tab;
	event.dataTransfer?.setData("text/plain", "");
	// Gör den dragna fliken aktiv
	const pageName = tab.getAttribute("data-page-name");
	if (pageName && pageName !== currentPage) {
		switchPage(pageName);
	}
}

function handleDragOver(event: DragEvent) {
	event.preventDefault(); 
}

function handleDrop(event: DragEvent) {
	event.preventDefault();
	const targetTab = event.currentTarget as HTMLElement;
	if (draggedTab && targetTab !== draggedTab) {
		const draggedPageName = draggedTab.getAttribute("data-page-name");
		const targetPageName = targetTab.getAttribute("data-page-name");

		if (!draggedPageName || !targetPageName) {
			console.error("data-page-name saknas på en av flikarna.");
			return;
		}
		
		const draggedIndex = pageOrder.indexOf(draggedPageName);
		const targetIndex = pageOrder.indexOf(targetPageName);

		if (draggedIndex < 0 || targetIndex < 0) return;

		pageOrder.splice(draggedIndex, 1);
		pageOrder.splice(targetIndex, 0, draggedPageName);
		saveData(); 
		renderTabs(); 
	}

	draggedTab = null; 
}

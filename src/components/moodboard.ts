import { ImageResult } from "./interfaces";
import { saveData } from "./storage";
import { createIconButton } from "./icons";
import interact from "interactjs";

export let currentPage: string = "Page 1";
export let pages: { [key: string]: ImageResult[] } = {};
export let pageOrder: string[] = [];

export function initializeMoodboard() {
	if (!pages[currentPage]) {
		pages[currentPage] = [];
	}
	if (!pageOrder.includes(currentPage)) {
		pageOrder.push(currentPage);
	}
	renderMoodboard();
}

export function addImageToMoodboard(image: ImageResult) {
	if (!pages[currentPage]) {
		pages[currentPage] = [];
	}
	
	const maxZ = Math.max(...pages[currentPage].map((img) => img.zIndex || 0), 0);
	image.zIndex = maxZ + 1;
	pages[currentPage].push(image);
	renderMoodboard();
	saveData();
}

export function renderMoodboard() {
	const moodboardContent = document.getElementById(
		"moodboard-content"
	) as HTMLDivElement;

	moodboardContent.innerHTML = ""; // Rensar moodboarden
	const images = pages[currentPage] || [];

	images.forEach((image, index) => {
		// Skapar en container för bilden
		const imgContainer = document.createElement("div");
		imgContainer.classList.add("moodboard__image-container");
		imgContainer.style.left = image.position?.x || "0px";
		imgContainer.style.top = image.position?.y || "0px";
		imgContainer.style.width = image.size?.width || "200px";
		imgContainer.style.height = image.size?.height || "200px";
		imgContainer.style.zIndex = String(image.zIndex || 0);
		imgContainer.setAttribute("data-index", String(index));
		
		const imgElement = document.createElement("img");
		imgElement.src = image.url;
		imgElement.alt = image.altDescription || "Image";
		imgElement.classList.add("moodboard__image");
		imgElement.crossOrigin = "anonymous";
		
		imgContainer.appendChild(imgElement);
		
		const handlePositions = ["nw", "ne", "sw", "se"];
		handlePositions.forEach((pos) => {
			const handle = document.createElement("div");
			handle.classList.add("interact-resize-handle", pos);
			imgContainer.appendChild(handle);
		});
		
		const deleteBtn = createIconButton(
			"delete-btn",
			"delete image",
			"./assets/xicon.svg"
		);
		imgContainer.appendChild(deleteBtn);
		
		deleteBtn.addEventListener("click", (event) => {
			event.stopPropagation();
			pages[currentPage].splice(index, 1);
			renderMoodboard();
			saveData();
		});
		
		moodboardContent.appendChild(imgContainer);
		
		imgContainer.addEventListener("mousedown", (event) => {
			event.stopPropagation();
			deselectAll();
			imgContainer.classList.add("selected");
		});
		
		moodboardContent.addEventListener("mousedown", (event) => {
			if (event.target === moodboardContent) {
				deselectAll();
			}
		});
		
		imgElement.addEventListener("dblclick", (event) => {
			event.stopPropagation();
			event.preventDefault();
			changeZIndex(image);
		});
		
		interact(imgContainer)
			.draggable({
				listeners: {
					start: () => {
						deselectAll();
						imgContainer.classList.add("selected");
					},
					move: dragMoveListener,
				},
				modifiers: [
					interact.modifiers.snap({
						targets: [interact.snappers.grid({ x: 20, y: 20 })],
						range: Infinity,
						relativePoints: [{ x: 0, y: 0 }],
					}),
					interact.modifiers.restrictRect({
						restriction: "parent",
						endOnly: true,
					}),
				],
				inertia: true,
			})
			.resizable({
				edges: { left: true, right: true, bottom: true, top: true },
				listeners: {
					start: () => {
						deselectAll();
						imgContainer.classList.add("selected");
						imgElement.classList.add("resizing");
					},
					move: (event) => resizeMoveListener(event, image),
					end: () => {
						imgElement.classList.remove("resizing");
					},
				},
				modifiers: [
					interact.modifiers.snapSize({
						targets: [interact.snappers.grid({ width: 20, height: 20 })],
						range: Infinity,
					}),
					interact.modifiers.restrictSize({
						min: { width: 50, height: 50 },
						max: { width: 1000, height: 1000 },
					}),
				],
				inertia: true,
			});
	});
}

function deselectAll() {
	const moodboardContent = document.getElementById(
		"moodboard-content"
	) as HTMLDivElement;
	const selectedElements = moodboardContent.querySelectorAll(".selected");
	selectedElements.forEach((el) => el.classList.remove("selected"));
}

function changeZIndex(image: ImageResult) {
	const maxZ = Math.max(...pages[currentPage].map((img) => img.zIndex || 0), 0);
	image.zIndex = maxZ + 1;
	renderMoodboard();
	saveData();
}

function dragMoveListener(event: any) {
	const target = event.target as HTMLElement;
	
	const x = parseFloat(target.style.left || "0") + event.dx;
	const y = parseFloat(target.style.top || "0") + event.dy;
	
	const gridSize = 20;
	const snappedX = Math.round(x / gridSize) * gridSize;
	const snappedY = Math.round(y / gridSize) * gridSize;
	
	target.style.left = `${snappedX}px`;
	target.style.top = `${snappedY}px`;
	
	const indexAttr = target.getAttribute("data-index");
	if (indexAttr !== null) {
		const index = parseInt(indexAttr);
		const image = pages[currentPage][index];
		image.position = { x: `${snappedX}px`, y: `${snappedY}px` };
		saveData();
	}
}

function resizeMoveListener(event: any, image: ImageResult) {
	const target = event.target as HTMLElement;

	let x = parseFloat(target.style.left || "0");
	let y = parseFloat(target.style.top || "0");
	
	const gridSize = 20;
	const width = Math.round(event.rect.width / gridSize) * gridSize;
	const height = Math.round(event.rect.height / gridSize) * gridSize;

	target.style.width = `${width}px`;
	target.style.height = `${height}px`;
	
	x += event.deltaRect.left;
	y += event.deltaRect.top;
	
	const snappedX = Math.round(x / gridSize) * gridSize;
	const snappedY = Math.round(y / gridSize) * gridSize;

	target.style.left = `${snappedX}px`;
	target.style.top = `${snappedY}px`;
	
	const indexAttr = target.getAttribute("data-index");
	if (indexAttr !== null) {
		image.size = {
			width: `${width}px`,
			height: `${height}px`,
		};
		image.position = { x: `${snappedX}px`, y: `${snappedY}px` };
		saveData();
	}
}

export function switchPage(pageName: string) {
	currentPage = pageName;
	if (!pages[currentPage]) {
		pages[currentPage] = [];
	}
	
	const tabs = document.querySelectorAll(".sidebar__tab");
	tabs.forEach((tab) => {
		const tabPageName = tab.getAttribute("data-page-name");
		if (tabPageName === currentPage) {
			tab.classList.add("sidebar__tab--active");
		} else {
			tab.classList.remove("sidebar__tab--active");
		}
	});
	renderMoodboard();
}

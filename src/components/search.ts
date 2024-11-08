import { addImageToMoodboard } from "./moodboard";
import { ImageResult } from "./interfaces";

let searchInput: HTMLInputElement;
let searchOverlayInput: HTMLInputElement;
let searchOverlay: HTMLElement;
let searchResultsGrid: HTMLElement;

export function initializeSearch() { 
	searchInput = document.getElementById("searchInput") as HTMLInputElement;
	searchOverlayInput = document.getElementById(
		"searchOverlayInput"
	) as HTMLInputElement;
	searchOverlay = document.getElementById("searchOverlay") as HTMLElement;
	searchResultsGrid = document.getElementById(
		"searchResultsGrid"
	) as HTMLElement;
	const closeSearchBtn = document.getElementById(
		"closeSearchBtn"
	) as HTMLButtonElement;
	
	searchInput.addEventListener("input", handleHeaderSearchInput);
	searchOverlayInput.addEventListener("input", handleOverlaySearchInput);
	closeSearchBtn.addEventListener("click", closeSearchOverlay);
}

function handleHeaderSearchInput() {
	const query = searchInput.value.trim();
	if (query.length > 0) {
		searchOverlayInput.value = query; 
		searchOverlay.classList.remove("hidden"); 
		searchImagesAndDisplayResults(query); 
	} else {
		closeSearchOverlay(); 
	}
}

function handleOverlaySearchInput() {
	const query = searchOverlayInput.value.trim(); 
	searchInput.value = query;
	if (query.length > 0) {
		searchImagesAndDisplayResults(query); 
	} else {
		displaySearchResults([]); 
	}
}

function searchImagesAndDisplayResults(query: string) {
	searchImages(query).then((results) => {
		displaySearchResults(results);
	});
}

export async function searchImages(query: string): Promise<ImageResult[]> {
	const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
	const response = await fetch(
		`https://api.unsplash.com/search/photos?query=${encodeURIComponent(
			query
		)}&client_id=${accessKey}&per_page=20`
	);
	const data = await response.json(); 
	return data.results.map((item: any) => ({
		id: item.id,
		url: item.urls.regular,
		altDescription: item.alt_description,
	}));
}

function displaySearchResults(images: ImageResult[]) {
	if (images.length === 0) {
		searchResultsGrid.innerHTML = "<p>No results found.</p>";
		return;
	}
	
	searchResultsGrid.innerHTML = "";

	images.forEach((image) => {
		// Skapar ett img-element för varje bild
		const imgElement = document.createElement("img");
		imgElement.src = image.url;
		imgElement.alt = image.altDescription || "Image";
		imgElement.classList.add("search-results__image");

		imgElement.addEventListener("click", () => {
			
			addImageToMoodboard(image);
			closeSearchOverlay();
		});
		searchResultsGrid.appendChild(imgElement); 
	});
}

export function closeSearchOverlay() {
	searchOverlay.classList.add("hidden");
	searchInput.value = "";
	searchOverlayInput.value = "";
	searchResultsGrid.innerHTML = "";
}

export function createIconButton(
	className: string,
	altText: string,
	iconSrc: string
): HTMLButtonElement {
	
	const button = document.createElement("button");
	
	button.className = className;
	
	button.innerHTML = `<img src="${iconSrc}" alt="${altText}" />`;
	return button;
}

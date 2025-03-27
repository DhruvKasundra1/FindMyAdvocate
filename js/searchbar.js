function filterCards() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.getElementsByClassName("cards");

    Array.from(cards).forEach(card => {
        const name = card.querySelector("h1").textContent.toLowerCase();
        const location = card.querySelector(".location").textContent.toLowerCase();
        const expertise = card.querySelector(".expertise").textContent.toLowerCase();

        if (name.includes(searchInput) || location.includes(searchInput) || expertise.includes(searchInput)) {
            card.style.display = ""; // Show the card
        } else {
            card.style.display = "none"; // Hide the card
        }
    });

    const clearIcon = document.querySelector(".clear-icon");
    clearIcon.style.display = searchInput ? "block" : "none";
}

function clearSearch() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = ""; // Clear the input field
    filterCards(); // Reset the card display
}

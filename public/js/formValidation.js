console.log("Form validation loaded");

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", (e) => {
            const input = form.querySelector("input");

            if (!input || input.value.trim() === "") {
                e.preventDefault();
                alert("Field cannot be empty!");
            }
        });
    }
});
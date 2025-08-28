console.log("✅ script.js loaded");
console.log("Leaflet L is:", typeof L); // should be "function" or "object"



document.addEventListener("DOMContentLoaded", () => {
    // Leaflet map logic
    const mapDiv = document.getElementById("map");

    if (mapDiv && mapDiv.dataset.lat && mapDiv.dataset.lng) {
        const lat = parseFloat(mapDiv.dataset.lat);
        const lng = parseFloat(mapDiv.dataset.lng);
        const locationText = mapDiv.dataset.location || "Location";

        const map = L.map('map').setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(locationText)
            .openPopup();
    }

    // Bootstrap validation logic
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });
});

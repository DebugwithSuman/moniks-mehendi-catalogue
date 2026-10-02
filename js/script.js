// WhatsApp booking number
const WHATSAPP_NUMBER = "917559166232";

// Category names
const categoryNames = {
    bridal: "Bridal Mehendi",
    arabic: "Arabic Mehendi",
    simple: "Simple / Minimal",
    couple: "Engagement & Couple",
    "baby-shower": "Baby Shower",
    party: "Party / Festival",
    feet: "Feet Mehendi",
    custom: "Custom Designs"
};

// Empty catalogue populated from Supabase
const designs = {
    bridal: [],
    arabic: [],
    simple: [],
    couple: [],
    "baby-shower": [],
    party: [],
    feet: [],
    custom: []
};

// Supabase configuration
const SUPABASE_URL = "https://fcpdgxxrbrmuzepmxsps.supabase.co";
const SUPABASE_KEY = "sb_publishable_tiZWv6wYSgB8GmBumnzLMA_mAlVY0Os";

// Page elements
const categoriesSection = document.querySelector("#categories");
const gallerySection = document.querySelector("#gallery");
const detailSection = document.querySelector("#design-detail");

const galleryTitle = document.querySelector("#gallery-title");
const galleryDescription = document.querySelector("#gallery-description");
const designGrid = document.querySelector("#design-grid");
const detailContent = document.querySelector("#design-detail-content");
const searchInput = document.querySelector("#design-search");

let currentCategory = "";
let db = null;

// Initialize Supabase
if (window.supabase && SUPABASE_KEY !== "PASTE_YOUR_PUBLISHABLE_KEY_HERE") {
    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
} else {
    console.error("Supabase library or publishable key is missing.");
}

// Load designs from Supabase
async function loadSupabaseDesigns() {
    if (!db) return;

    const { data, error } = await db
        .from("designs")
        .select("design_id, category, image_url")
        .order("id", { ascending: false });

    if (error) {
        console.error("Error loading designs:", error.message);
        return;
    }

    // Clear existing designs
    Object.keys(designs).forEach(category => {
        designs[category] = [];
    });

    // Organize database records by category
    data.forEach(item => {
        const category = String(item.category || "")
            .trim()
            .toLowerCase();

        if (
            designs[category] &&
            item.design_id &&
            item.image_url
        ) {
            designs[category].push({
                id: String(item.design_id),
                image: item.image_url
            });
        }
    });

    console.log("Designs loaded:", designs);

    // Refresh the gallery if it is already open
    if (currentCategory) {
        renderDesigns(searchInput ? searchInput.value : "");
    }
}

// Display designs matching the search
function renderDesigns(searchText = "") {
    if (!designGrid) return;

    designGrid.innerHTML = "";

    const categoryDesigns = designs[currentCategory] || [];

    const filteredDesigns = categoryDesigns.filter(design =>
        design.id.toLowerCase().includes(
            searchText.toLowerCase().trim()
        )
    );

    if (filteredDesigns.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = searchText.trim()
            ? "No designs found for this ID."
            : "Designs will be added to this collection soon.";

        designGrid.appendChild(message);
        return;
    }

    filteredDesigns.forEach(design => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "design-card";

        const image = document.createElement("img");

        image.src = design.image;
        image.alt = `Mehendi design ${design.id}`;
        image.loading = "lazy";

        image.onerror = () => {
            image.alt = `Image not found for ${design.id}`;
            image.style.display = "none";
        };

        const label = document.createElement("span");

        label.textContent = `Design ID: ${design.id}`;

        card.append(image, label);

        card.addEventListener("click", () => {
            openDesign(design);
        });

        designGrid.appendChild(card);
    });
}

// Open a category gallery
function openGallery(category) {
    if (!categoryNames[category]) return;

    currentCategory = category;

    if (categoriesSection) categoriesSection.hidden = true;
    if (detailSection) detailSection.hidden = true;
    if (gallerySection) gallerySection.hidden = false;

    if (galleryTitle) {
        galleryTitle.textContent = categoryNames[category];
    }

    if (galleryDescription) {
        galleryDescription.textContent =
            "Explore designs from this collection.";
    }

    if (searchInput) searchInput.value = "";

    renderDesigns();

    if (gallerySection) {
        gallerySection.scrollIntoView({
            behavior: "smooth"
        });
    }
}

// Open design details
function openDesign(design) {
    if (!detailContent || !gallerySection || !detailSection) return;

    gallerySection.hidden = true;
    detailSection.hidden = false;

    detailContent.innerHTML = "";

    const image = document.createElement("img");

    image.src = design.image;
    image.alt = `Mehendi design ${design.id}`;
    image.className = "detail-image";

    const title = document.createElement("h2");

    title.textContent = `Design ID: ${design.id}`;

    const bookingButton = document.createElement("a");

    bookingButton.className = "whatsapp-btn";
    bookingButton.textContent = "Book on WhatsApp";
    bookingButton.target = "_blank";
    bookingButton.rel = "noopener noreferrer";

    const message =
        `Hello Moniks Mehndi Art! I'm interested in Design ${design.id}. Please share the details.`;

    bookingButton.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    detailContent.append(
        image,
        title,
        bookingButton
    );

    detailSection.scrollIntoView({
        behavior: "smooth"
    });
}

// Search designs in the current category
if (searchInput) {
    searchInput.addEventListener("input", () => {
        renderDesigns(searchInput.value);
    });
}

// Category card clicks
document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", event => {
        event.preventDefault();
        openGallery(card.dataset.category);
    });
});

// Back to categories
const backToCategories = document.querySelector("#back-to-categories");

if (backToCategories) {
    backToCategories.addEventListener("click", () => {
        if (gallerySection) gallerySection.hidden = true;
        if (detailSection) detailSection.hidden = true;

        if (categoriesSection) {
            categoriesSection.hidden = false;
            categoriesSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

// Back to gallery
const backToGallery = document.querySelector("#back-to-gallery");

if (backToGallery) {
    backToGallery.addEventListener("click", () => {
        if (detailSection) detailSection.hidden = true;
        if (gallerySection) {
            gallerySection.hidden = false;
            gallerySection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

// Mobile navigation menu
const menuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector(".nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("active");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("active");

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open menu");
        });
    });
}

// Homepage WhatsApp contact button
const heroWhatsApp = document.querySelector("#hero-whatsapp");

if (heroWhatsApp) {
    const message =
        "Hello Moniks Mehndi Art! I would like to know more about your mehendi designs and bookings.";

    heroWhatsApp.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    heroWhatsApp.target = "_blank";
    heroWhatsApp.rel = "noopener noreferrer";
}

// Load catalogue and update all category cover images
loadSupabaseDesigns().then(() => {
    Object.keys(categoryNames).forEach(category => {
        const cover = document.querySelector(
            `.category-image.${CSS.escape(category)}`
        );

        const firstDesign = designs[category]?.[0];

        if (cover && firstDesign) {
            cover.style.backgroundImage = `url("${firstDesign.image}")`;
        }
    });
});
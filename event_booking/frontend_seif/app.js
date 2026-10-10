async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    message.innerText = "";

    if (email === "" || password === "") {
        message.innerText =
            "Please enter email and password.";
        return;
    }

    try {

        const response = await fetch(
            "../backend/login.php",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href =
                "dashboard.html";

        } else {

            message.innerText =
                data.message || "Login failed.";

        }

    } catch (error) {

        console.error(error);

        message.innerText =
            "Unable to connect to server.";

    }
}


function togglePassword() {

    const passwordInput =
        document.getElementById("password");

    const button =
        document.querySelector(".show-button");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        button.innerText = "Hide";

    } else {

        passwordInput.type = "password";
        button.innerText = "Show";

    }
}

function loadDashboard() {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    document.getElementById("userName").innerText = user.name;
    document.getElementById("userRole").innerText = user.role;

    document.getElementById("userInitial").innerText =
        user.name.charAt(0).toUpperCase();

    const description =
        document.getElementById("roleDescription");

    const actions =
        document.getElementById("dashboardActions");

    if (user.role === "Administrator") {

        description.innerText =
            "Manage events and oversee the Event Booking System.";

        actions.innerHTML = `
    <div class="action-card" onclick="goToUsers()">
        <div class="action-number">01</div>
        <h3>Manage Users</h3>
        <p>Add, edit, view and delete system users.</p>
        <span>Open →</span>
    </div>

    <div class="action-card" onclick="goToEvents()">
        <div class="action-number">02</div>
        <h3>Manage Events</h3>
        <p>Create, edit, view and delete events.</p>
        <span>Open →</span>
    </div>

    <div class="action-card">
        <div class="action-number">03</div>
        <h3>Manage Venues</h3>
        <p>Create and manage venue information.</p>
        <span>Coming Soon</span>
    </div>
`;

    } else if (
        user.role === "Organiser" ||
        user.role === "Staff"
    ) {

        description.innerText =
            "Create and manage events and monitor booking activity.";

        actions.innerHTML = `
            <div class="action-card" onclick="goToEvents()">
                <div class="action-number">01</div>
                <h3>Manage Events</h3>
                <p>Create and maintain event information.</p>
                <span>Open →</span>
            </div>

            <div class="action-card">
                <div class="action-number">02</div>
                <h3>Bookings</h3>
                <p>View booking activity for events.</p>
                <span>Coming Soon</span>
            </div>
        `;

    } else {

        description.innerText =
            "Discover events and manage your personal bookings.";

        actions.innerHTML = `
            <div class="action-card" onclick="goToEvents()">
                <div class="action-number">01</div>
                <h3>Browse Events</h3>
                <p>Discover available and published events.</p>
                <span>Browse →</span>
            </div>

            <div class="action-card">
                <div class="action-number">02</div>
                <h3>My Bookings</h3>
                <p>View your booking information and status.</p>
                <span>Coming Soon</span>
            </div>
        `;
    }
}

function goToDashboard() {
    window.location.href = "dashboard.html";
}

function goToUsers() {
    window.location.href = "users.html";
}

function goToEvents() {
    window.location.href = "events.html";
}


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

async function loadEventsPage() {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);
    setupEventManagement(user);

    const pageTitle =
    document.getElementById("eventsPageTitle");

    const pageSubtitle =
        document.getElementById("eventsPageSubtitle");

    const viewLabel =
        document.getElementById("eventsViewLabel");

    const heroTitle =
        document.getElementById("eventsHeroTitle");

    const heroText =
        document.getElementById("eventsHeroText");

    if (
        user.role === "Administrator" ||
        user.role === "Organiser" ||
        user.role === "Staff"
    ) {

        pageTitle.innerHTML =
            `Manage <span>Events</span>`;

        pageSubtitle.innerText =
            "Create, update and manage event information.";

        viewLabel.innerText =
            "EVENT MANAGEMENT";

        heroTitle.innerText =
            "Manage your events";

        heroText.innerText =
            "Create new events, update event details and manage event availability.";

    } else {

        pageTitle.innerHTML =
            `Explore <span>Events</span>`;

        pageSubtitle.innerText =
            "Browse available events and book your next experience.";

        viewLabel.innerText =
            "CUSTOMER VIEW";

        heroTitle.innerText =
            "Discover upcoming events";

        heroText.innerText =
            "Find published events, check venue and date details, and book your preferred event quickly.";
    }

    document.getElementById("eventsUserInitial").innerText =
        user.name.charAt(0).toUpperCase();

    document.getElementById("eventsUserName").innerText =
        user.name;

    document.getElementById("eventsUserRole").innerText =
        user.role;

    const loading = document.getElementById("eventsLoading");
    const empty = document.getElementById("eventsEmpty");
    const grid = document.getElementById("eventsGrid");

    loading.style.display = "block";
    empty.style.display = "none";
    grid.innerHTML = "";

    try {
        const response = await fetch("../backend/events.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        loading.style.display = "none";

        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            alert("Your session has expired. Please log in again.");

            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            empty.style.display = "block";
            empty.innerText =
                data.message || "Unable to load events.";
            return;
        }

        let events = [];

        if (Array.isArray(data)) {
            events = data;
        } else if (Array.isArray(data.events)) {
            events = data.events;
        } else if (Array.isArray(data.data)) {
            events = data.data;
        }

        if (!events.length) {
            empty.style.display = "block";
            return;
        }

        renderEventCards(events);

    } catch (error) {
        console.error(error);
        loading.style.display = "none";
        empty.style.display = "block";
        empty.innerText = "Unable to load events from the server.";
    }
}


function renderEventCards(events) {

    const grid = document.getElementById("eventsGrid");

    const user =
        JSON.parse(localStorage.getItem("user"));

    grid.innerHTML = events.map(event => {

        const title =
            event.title || "Untitled Event";

        const description =
            event.description || "No description provided.";

        const venue =
            event.venue_name ||
            event.venue ||
            "Venue not specified";

        const dateText =
            formatEventDate(event.event_date);

        const priceText =
            formatPrice(event.ticket_price);

        const ticketsText =
            formatTickets(event.available_tickets);

        const safeTitle =
            JSON.stringify(title);

        let actionButtons = "";

        if (
            user.role === "Administrator" ||
            user.role === "Organiser" ||
            user.role === "Staff"
        ) {

            actionButtons = `
                <div class="event-management-buttons">

                    <button
                        class="edit-event-button"
                        onclick="editEvent(${event.event_id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-event-button"
                        onclick="deleteEvent(${event.event_id})"
                    >
                        Delete
                    </button>

                </div>
            `;

        } else {

            actionButtons = `
                <button
                    class="book-button"
                    onclick='bookEvent(${event.event_id}, ${safeTitle})'
                >
                    Book Now
                </button>
            `;
        }

        return `
            <div class="event-card">

                <div class="event-card-top">

                    <div class="event-date-badge">
                        ${dateText}
                    </div>

                    <span class="event-status">
                        ${event.status || "Published"}
                    </span>

                </div>

                <h3 class="event-title">
                    ${title}
                </h3>

                <p class="event-description">
                    ${description}
                </p>

                <div class="event-meta">

                    <div class="meta-item">
                        <span class="meta-label">
                            Location
                        </span>
                        <strong>
                            ${venue}
                        </strong>
                    </div>

                    <div class="meta-item">
                        <span class="meta-label">
                            Price
                        </span>
                        <strong>
                            ${priceText}
                        </strong>
                    </div>

                    <div class="meta-item">
                        <span class="meta-label">
                            Tickets Left
                        </span>
                        <strong>
                            ${ticketsText}
                        </strong>
                    </div>

                </div>

                ${actionButtons}

            </div>
        `;

    }).join("");
}

function formatEventDate(dateString) {
    if (!dateString) return "Date TBA";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatPrice(price) {
    const number = parseFloat(price);

    if (isNaN(number) || number <= 0) {
        return "Free";
    }

    return "RM " + number.toFixed(2);
}


function formatTickets(tickets) {
    if (tickets === null || tickets === undefined || tickets === "") {
        return "N/A";
    }

    return tickets;
}


function bookEvent(eventId, eventTitle) {
    alert(
        "Booking selected for: " +
        eventTitle +
        "\\n\\nEvent ID: " + eventId +
        "\\n\\nThe booking module can be connected next."
    );
}

function canManageEvents(role) {
    return [
        "Administrator",
        "Organiser",
        "Staff"
    ].includes(role);
}


function setupEventManagement(user) {
    const createButton =
        document.getElementById("createEventButton");

    if (
        createButton &&
        canManageEvents(user.role)
    ) {
        createButton.style.display = "block";
    }
}


function openCreateEventModal() {
    document.getElementById("eventModal").classList.add("show");

    document.getElementById("eventModalTitle").innerText =
        "Create Event";

    document.getElementById("saveEventButton").innerText =
        "Create Event";

    document.getElementById("editEventId").value = "";
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventVenue").value = "1";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventPrice").value = "";
    document.getElementById("eventTickets").value = "";
    document.getElementById("eventStatus").value = "draft";
    document.getElementById("eventFormMessage").innerText = "";
}


function closeEventModal() {
    document.getElementById("eventModal").classList.remove("show");
}

async function editEvent(eventId) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "../backend/events.php?id=" + eventId,
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load event.");
            return;
        }

        const event = data.data;

        document
            .getElementById("eventModal")
            .classList.add("show");

        document.getElementById("eventModalTitle").innerText =
            "Edit Event";

        document.getElementById("saveEventButton").innerText =
            "Save Changes";

        document.getElementById("editEventId").value =
            event.event_id;

        document.getElementById("eventTitle").value =
            event.title || "";

        document.getElementById("eventDescription").value =
            event.description || "";

        document.getElementById("eventVenue").value =
            event.venue_id || 1;

        document.getElementById("eventPrice").value =
            event.ticket_price || "";

        document.getElementById("eventTickets").value =
            event.total_tickets || "";

        document.getElementById("eventStatus").value =
            event.status || "draft";

        if (event.event_date) {
            document.getElementById("eventDate").value =
                event.event_date
                    .replace(" ", "T")
                    .substring(0, 16);
        }

        document.getElementById("eventFormMessage").innerText = "";

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}

async function deleteEvent(eventId) {

    const confirmed = confirm(
        "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
        return;
    }

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "../backend/events.php?id=" + eventId,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            alert("Your session has expired. Please log in again.");

            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete event."
            );

            return;
        }

        alert("Event deleted successfully.");

        loadEventsPage();

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


async function saveEvent() {

    const token = localStorage.getItem("token");

    const eventId =
        document.getElementById("editEventId").value;

    const title =
        document.getElementById("eventTitle").value.trim();

    const description =
        document.getElementById("eventDescription").value.trim();

    const venueId =
        parseInt(document.getElementById("eventVenue").value);

    const rawDate =
        document.getElementById("eventDate").value;

    const ticketPrice =
        parseFloat(document.getElementById("eventPrice").value);

    const totalTickets =
        parseInt(document.getElementById("eventTickets").value);

    const status =
        document.getElementById("eventStatus").value;

    const message =
        document.getElementById("eventFormMessage");

    message.innerText = "";

    if (
        !title ||
        !rawDate ||
        isNaN(venueId) ||
        isNaN(ticketPrice) ||
        isNaN(totalTickets)
    ) {
        message.innerText =
            "Please complete all required fields.";
        return;
    }

    const eventDate =
        rawDate.replace("T", " ") + ":00";

    const body = {
        title: title,
        description: description,
        venue_id: venueId,
        event_date: eventDate,
        ticket_price: ticketPrice,
        total_tickets: totalTickets,
        status: status
    };

    const isEditing = eventId !== "";

    const url = isEditing
        ? "../backend/events.php?id=" + eventId
        : "../backend/events.php";

    const method = isEditing
        ? "PUT"
        : "POST";

    try {

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {

            if (data.errors) {
                message.innerText =
                    data.errors
                        .map(error => error.message)
                        .join(" | ");
            } else {
                message.innerText =
                    data.message || "Unable to save event.";
            }

            return;
        }

        closeEventModal();
        loadEventsPage();

    } catch (error) {
        console.error(error);
        message.innerText =
            "Unable to connect to server.";
    }
}
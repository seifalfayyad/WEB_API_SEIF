/* =========================================================
   EVENT BOOKING SYSTEM
   app.js
========================================================= */


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const message =
        document.getElementById("message");


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    message.innerText = "";


    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }


    try {

        const response =
            await fetch(
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


        const data =
            await response.json();


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

        }

        else {

            message.innerText =
                data.message ||
                "Login failed.";

        }

    }

    catch (error) {

        console.error(error);

        message.innerText =
            "Unable to connect to server.";

    }

}



/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

function togglePassword() {

    const passwordInput =
        document.getElementById("password");

    const button =
        document.querySelector(".show-button");


    if (passwordInput.type === "password") {

        passwordInput.type =
            "text";

        if (button) {
            button.innerText =
                "Hide";
        }

    }

    else {

        passwordInput.type =
            "password";

        if (button) {
            button.innerText =
                "Show";
        }

    }

}



/* =========================================================
   NAVIGATION
========================================================= */

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


function goToUsers() {

    window.location.href =
        "users.html";

}


function goToVenues() {

    window.location.href =
        "venues.html";

}


function goToEvents() {

    window.location.href =
        "events.html";

}


function goToBookings() {

    window.location.href =
        "booking.html";

}



/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";

}



/* =========================================================
   DASHBOARD
========================================================= */

function loadDashboard() {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    if (!token || !userData) {

        window.location.href =
            "login.html";

        return;

    }


    const user =
        JSON.parse(userData);


    const userName =
        document.getElementById(
            "userName"
        );

    const userRole =
        document.getElementById(
            "userRole"
        );

    const userInitial =
        document.getElementById(
            "userInitial"
        );

    const description =
        document.getElementById(
            "roleDescription"
        );

    const actions =
        document.getElementById(
            "dashboardActions"
        );

    const sidebarNav =
        document.getElementById(
            "sidebarNav"
        );


    if (userName) {
        userName.innerText =
            user.name;
    }


    if (userRole) {
        userRole.innerText =
            user.role;
    }


    if (userInitial) {

        userInitial.innerText =
            user.name
                .charAt(0)
                .toUpperCase();

    }


    /* =====================================================
       ADMINISTRATOR
    ===================================================== */

    if (
        user.role === "Administrator"
    ) {

        if (description) {

            description.innerText =
                "Manage users and venues, and oversee system records.";

        }


        if (sidebarNav) {

            sidebarNav.innerHTML = `

                <button
                    class="nav-item active"
                    onclick="goToDashboard()"
                >
                    Dashboard
                </button>

                <button
                    class="nav-item"
                    onclick="goToUsers()"
                >
                    Users
                </button>

                <button
                    class="nav-item"
                    onclick="goToVenues()"
                >
                    Venues
                </button>

                <button
                    class="nav-item"
                    onclick="goToEvents()"
                >
                    Events
                </button>

                <button
                    class="nav-item"
                    onclick="goToBookings()"
                >
                    Bookings
                </button>

            `;

        }


        if (actions) {

            actions.innerHTML = `

                <div
                    class="action-card"
                    onclick="goToUsers()"
                >

                    <div class="action-number">
                        01
                    </div>

                    <h3>
                        Manage Users
                    </h3>

                    <p>
                        Add, edit, view and delete system users.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>


                <div
                    class="action-card"
                    onclick="goToVenues()"
                >

                    <div class="action-number">
                        02
                    </div>

                    <h3>
                        Manage Venues
                    </h3>

                    <p>
                        Add, edit, view and manage venue information.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>


                <div
                    class="action-card"
                    onclick="goToEvents()"
                >

                    <div class="action-number">
                        03
                    </div>

                    <h3>
                        View Event Records
                    </h3>

                    <p>
                        Review event information and ticket availability.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>


                <div
                    class="action-card"
                    onclick="goToBookings()"
                >

                    <div class="action-number">
                        04
                    </div>

                    <h3>
                        View Booking Records
                    </h3>

                    <p>
                        Review booking activity across the system.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>

            `;

        }

    }


    /* =====================================================
       ORGANISER / STAFF
       SAME PERMISSIONS
    ===================================================== */

    else if (
        user.role === "Organiser" ||
        user.role === "Staff"
    ) {

        if (description) {

            description.innerText =
                "Create and manage events, schedules, ticket availability and relevant bookings.";

        }


        if (sidebarNav) {

            sidebarNav.innerHTML = `

                <button
                    class="nav-item active"
                    onclick="goToDashboard()"
                >
                    Dashboard
                </button>

                <button
                    class="nav-item"
                    onclick="goToEvents()"
                >
                    Events
                </button>

                <button
                    class="nav-item"
                    onclick="goToBookings()"
                >
                    Bookings
                </button>

            `;

        }


        if (actions) {

            actions.innerHTML = `

                <div
                    class="action-card"
                    onclick="goToEvents()"
                >

                    <div class="action-number">
                        01
                    </div>

                    <h3>
                        Manage Events
                    </h3>

                    <p>
                        Create and manage event schedules and ticket availability.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>


                <div
                    class="action-card"
                    onclick="goToBookings()"
                >

                    <div class="action-number">
                        02
                    </div>

                    <h3>
                        Relevant Bookings
                    </h3>

                    <p>
                        View booking activity related to your events.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>

            `;

        }

    }


    /* =====================================================
       CUSTOMER
    ===================================================== */

    else if (
        user.role === "Customer"
    ) {

        if (description) {

            description.innerText =
                "Browse events, check availability and manage your own bookings.";

        }


        if (sidebarNav) {

            sidebarNav.innerHTML = `

                <button
                    class="nav-item active"
                    onclick="goToDashboard()"
                >
                    Dashboard
                </button>

                <button
                    class="nav-item"
                    onclick="goToEvents()"
                >
                    Events
                </button>

                <button
                    class="nav-item"
                    onclick="goToBookings()"
                >
                    My Bookings
                </button>

            `;

        }


        if (actions) {

            actions.innerHTML = `

                <div
                    class="action-card"
                    onclick="goToEvents()"
                >

                    <div class="action-number">
                        01
                    </div>

                    <h3>
                        Browse Events
                    </h3>

                    <p>
                        Browse published events and check ticket availability.
                    </p>

                    <span>
                        Browse →
                    </span>

                </div>


                <div
                    class="action-card"
                    onclick="goToBookings()"
                >

                    <div class="action-number">
                        02
                    </div>

                    <h3>
                        My Bookings
                    </h3>

                    <p>
                        Make, view or cancel your eligible bookings.
                    </p>

                    <span>
                        Open →
                    </span>

                </div>

            `;

        }

    }


    /* =====================================================
       UNKNOWN ROLE
    ===================================================== */

    else {

        alert(
            "Unknown user role."
        );

        logout();

    }

}



/* =========================================================
   EVENTS PAGE
========================================================= */

async function loadEventsPage() {

    const token =
        localStorage.getItem(
            "token"
        );

    const userData =
        localStorage.getItem(
            "user"
        );


    if (!token || !userData) {

        window.location.href =
            "login.html";

        return;

    }


    const user =
        JSON.parse(userData);


    /* =====================================================
       EVENTS SIDEBAR
    ===================================================== */

    const sidebarNav =
        document.getElementById(
            "eventsSidebarNav"
        );


    if (sidebarNav) {


        /* =====================================
           ADMINISTRATOR
        ===================================== */

        if (
            user.role === "Administrator"
        ) {

            sidebarNav.innerHTML = `

                <button
                    class="nav-item"
                    onclick="goToDashboard()"
                >
                    Dashboard
                </button>

                <button
                    class="nav-item"
                    onclick="goToUsers()"
                >
                    Users
                </button>

                <button
                    class="nav-item"
                    onclick="goToVenues()"
                >
                    Venues
                </button>

                <button
                    class="nav-item active"
                    onclick="goToEvents()"
                >
                    Events
                </button>

                <button
                    class="nav-item"
                    onclick="goToBookings()"
                >
                    Bookings
                </button>

            `;

        }


        /* =====================================
           ORGANISER / STAFF
        ===================================== */

        else if (
            user.role === "Organiser" ||
            user.role === "Staff"
        ) {

            sidebarNav.innerHTML = `

                <button
                    class="nav-item"
                    onclick="goToDashboard()"
                >
                    Dashboard
                </button>

                <button
                    class="nav-item active"
                    onclick="goToEvents()"
                >
                    Events
                </button>

                <button
                    class="nav-item"
                    onclick="goToBookings()"
                >
                    Bookings
                </button>

            `;

        }


        /* =====================================
           CUSTOMER
        ===================================== */

        else if (
            user.role === "Customer"
        ) {

            sidebarNav.innerHTML = `

                <button
                    class="nav-item"
                    onclick="goToDashboard()"
                >
                    Dashboard
                </button>

                <button
                    class="nav-item active"
                    onclick="goToEvents()"
                >
                    Events
                </button>

                <button
                    class="nav-item"
                    onclick="goToBookings()"
                >
                    My Bookings
                </button>

            `;

        }


        else {

            alert(
                "Unknown user role."
            );

            logout();

            return;

        }

    }


    /* =====================================================
       CREATE BUTTON PERMISSION
    ===================================================== */

    setupEventManagement(user);


    /* =====================================================
       PAGE TEXT
    ===================================================== */

    const pageTitle =
        document.getElementById(
            "eventsPageTitle"
        );

    const pageSubtitle =
        document.getElementById(
            "eventsPageSubtitle"
        );

    const viewLabel =
        document.getElementById(
            "eventsViewLabel"
        );

    const heroTitle =
        document.getElementById(
            "eventsHeroTitle"
        );

    const heroText =
        document.getElementById(
            "eventsHeroText"
        );


    /* =====================================
       ADMINISTRATOR
    ===================================== */

    if (
        user.role === "Administrator"
    ) {

        pageTitle.innerHTML =
            `Event <span>Records</span>`;

        pageSubtitle.innerText =
            "Review event information across the Event Booking System.";

        viewLabel.innerText =
            "ADMINISTRATOR VIEW";

        heroTitle.innerText =
            "System event records";

        heroText.innerText =
            "View event schedules, venues, prices and ticket availability.";

    }


    /* =====================================
       ORGANISER / STAFF
    ===================================== */

    else if (
        user.role === "Organiser" ||
        user.role === "Staff"
    ) {

        pageTitle.innerHTML =
            `Manage <span>Events</span>`;

        pageSubtitle.innerText =
            "Create, update and manage your event information.";

        viewLabel.innerText =
            "EVENT MANAGEMENT";

        heroTitle.innerText =
            "Manage your events";

        heroText.innerText =
            "Create events, manage schedules and control ticket availability.";

    }


    /* =====================================
       CUSTOMER
    ===================================== */

    else {

        pageTitle.innerHTML =
            `Explore <span>Events</span>`;

        pageSubtitle.innerText =
            "Browse available events and book your next experience.";

        viewLabel.innerText =
            "CUSTOMER VIEW";

        heroTitle.innerText =
            "Discover upcoming events";

        heroText.innerText =
            "Find published events, check venue and ticket availability, and book your preferred event.";

    }


    /* =====================================================
       USER INFORMATION
    ===================================================== */

    const eventsUserInitial =
        document.getElementById(
            "eventsUserInitial"
        );

    const eventsUserName =
        document.getElementById(
            "eventsUserName"
        );

    const eventsUserRole =
        document.getElementById(
            "eventsUserRole"
        );


    if (eventsUserInitial) {

        eventsUserInitial.innerText =
            user.name
                .charAt(0)
                .toUpperCase();

    }


    if (eventsUserName) {

        eventsUserName.innerText =
            user.name;

    }


    if (eventsUserRole) {

        eventsUserRole.innerText =
            user.role;

    }


    /* =====================================================
       EVENT LIST ELEMENTS
    ===================================================== */

    const loading =
        document.getElementById(
            "eventsLoading"
        );

    const empty =
        document.getElementById(
            "eventsEmpty"
        );

    const grid =
        document.getElementById(
            "eventsGrid"
        );


    loading.style.display =
        "block";

    empty.style.display =
        "none";

    grid.innerHTML =
        "";


    /* =====================================================
       FETCH EVENTS
    ===================================================== */

    try {

        const response =
            await fetch(
                "../backend/events.php",
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }
                }
            );


        const data =
            await response.json();


        loading.style.display =
            "none";


        /* =====================================
           EXPIRED TOKEN
        ===================================== */

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            alert(
                "Your session has expired. Please log in again."
            );


            window.location.href =
                "login.html";

            return;

        }


        /* =====================================
           REQUEST FAILED
        ===================================== */

        if (!response.ok) {

            empty.style.display =
                "block";

            empty.innerText =
                data.message ||
                "Unable to load events.";

            return;

        }


        /* =====================================
           GET ARRAY FROM API RESPONSE
        ===================================== */

        let events = [];


        if (
            Array.isArray(data)
        ) {

            events =
                data;

        }

        else if (
            Array.isArray(data.events)
        ) {

            events =
                data.events;

        }

        else if (
            Array.isArray(data.data)
        ) {

            events =
                data.data;

        }


        if (!events.length) {

            empty.style.display =
                "block";

            empty.innerText =
                "No events found.";

            return;

        }


        renderEventCards(
            events
        );

    }

    catch (error) {

        console.error(
            error
        );


        loading.style.display =
            "none";

        empty.style.display =
            "block";

        empty.innerText =
            "Unable to load events from the server.";

    }

}



/* =========================================================
   RENDER EVENT CARDS
========================================================= */

function renderEventCards(events) {

    const grid =
        document.getElementById(
            "eventsGrid"
        );

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    grid.innerHTML =
        events
            .map(event => {


                const title =
                    event.title ||
                    "Untitled Event";


                const description =
                    event.description ||
                    "No description provided.";


                const venue =
                    event.venue_name ||
                    event.venue ||
                    "Venue not specified";


                const dateText =
                    formatEventDate(
                        event.event_date
                    );


                const priceText =
                    formatPrice(
                        event.ticket_price
                    );


                const ticketsText =
                    formatTickets(
                        event.available_tickets
                    );


                let actionButtons =
                    "";


                /* =====================================
                   ORGANISER / STAFF
                   SAME POWER
                ===================================== */

                if (
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

                }


                /* =====================================
                   ADMINISTRATOR
                ===================================== */

                else if (
                    user.role === "Administrator"
                ) {

                    actionButtons = `

                        <div class="event-management-buttons">

                            <span class="event-status">
                                View Only
                            </span>

                        </div>

                    `;

                }


                /* =====================================
                   CUSTOMER
                ===================================== */

                else if (
                    user.role === "Customer"
                ) {

                    actionButtons = `

                        <button
                            class="book-button"
                            onclick="bookEvent(${event.event_id})"
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

            })

            .join("");

}



/* =========================================================
   FORMAT EVENT DATE
========================================================= */

function formatEventDate(
    dateString
) {

    if (!dateString) {

        return "Date TBA";

    }


    const date =
        new Date(
            dateString
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}



/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

    const number =
        parseFloat(
            price
        );


    if (
        isNaN(number) ||
        number <= 0
    ) {

        return "Free";

    }


    return "RM " +
        number.toFixed(2);

}



/* =========================================================
   FORMAT TICKETS
========================================================= */

function formatTickets(
    tickets
) {

    if (
        tickets === null ||
        tickets === undefined ||
        tickets === ""
    ) {

        return "N/A";

    }


    return tickets;

}



/* =========================================================
   CUSTOMER BOOK EVENT
========================================================= */

function bookEvent(eventId) {

    window.location.href =
        "booking.html?event_id=" +
        eventId;

}



/* =========================================================
   EVENT MANAGEMENT PERMISSION
========================================================= */

function canManageEvents(role) {

    return [
        "Organiser",
        "Staff"
    ].includes(role);

}



/* =========================================================
   SHOW / HIDE CREATE EVENT BUTTON
========================================================= */

function setupEventManagement(
    user
) {

    const createButton =
        document.getElementById(
            "createEventButton"
        );


    if (!createButton) {
        return;
    }


    if (
        canManageEvents(
            user.role
        )
    ) {

        createButton.style.display =
            "block";

    }

    else {

        createButton.style.display =
            "none";

    }

}



/* =========================================================
   OPEN CREATE EVENT MODAL
========================================================= */

function openCreateEventModal() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    if (
        !user ||
        !canManageEvents(
            user.role
        )
    ) {

        alert(
            "You do not have permission to create events."
        );

        return;

    }


    const modal =
        document.getElementById(
            "eventModal"
        );


    modal.classList.add(
        "show"
    );


    document.getElementById(
        "eventModalTitle"
    ).innerText =
        "Create Event";


    document.getElementById(
        "saveEventButton"
    ).innerText =
        "Create Event";


    document.getElementById(
        "editEventId"
    ).value =
        "";


    document.getElementById(
        "eventTitle"
    ).value =
        "";


    document.getElementById(
        "eventDescription"
    ).value =
        "";


    document.getElementById(
        "eventVenue"
    ).value =
        "1";


    document.getElementById(
        "eventDate"
    ).value =
        "";


    document.getElementById(
        "eventPrice"
    ).value =
        "";


    document.getElementById(
        "eventTickets"
    ).value =
        "";


    document.getElementById(
        "eventStatus"
    ).value =
        "draft";


    document.getElementById(
        "eventFormMessage"
    ).innerText =
        "";

}



/* =========================================================
   CLOSE EVENT MODAL
========================================================= */

function closeEventModal() {

    const modal =
        document.getElementById(
            "eventModal"
        );


    modal.classList.remove(
        "show"
    );

}



/* =========================================================
   EDIT EVENT
========================================================= */

async function editEvent(
    eventId
) {

    const token =
        localStorage.getItem(
            "token"
        );

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    if (
        !user ||
        !canManageEvents(
            user.role
        )
    ) {

        alert(
            "You do not have permission to edit events."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "../backend/events.php?id=" +
                eventId,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            alert(
                "Your session has expired. Please log in again."
            );


            window.location.href =
                "login.html";

            return;

        }


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to load event."
            );

            return;

        }


        const event =
            data.data;


        /*
            Organiser and Staff use
            the same management power.

            There is NO frontend
            own-event restriction here.
        */


        document.getElementById(
            "eventModal"
        ).classList.add(
            "show"
        );


        document.getElementById(
            "eventModalTitle"
        ).innerText =
            "Edit Event";


        document.getElementById(
            "saveEventButton"
        ).innerText =
            "Save Changes";


        document.getElementById(
            "editEventId"
        ).value =
            event.event_id;


        document.getElementById(
            "eventTitle"
        ).value =
            event.title || "";


        document.getElementById(
            "eventDescription"
        ).value =
            event.description || "";


        document.getElementById(
            "eventVenue"
        ).value =
            event.venue_id || 1;


        document.getElementById(
            "eventPrice"
        ).value =
            event.ticket_price || "";


        document.getElementById(
            "eventTickets"
        ).value =
            event.total_tickets || "";


        document.getElementById(
            "eventStatus"
        ).value =
            event.status || "draft";


        if (
            event.event_date
        ) {

            document.getElementById(
                "eventDate"
            ).value =
                event.event_date
                    .replace(
                        " ",
                        "T"
                    )
                    .substring(
                        0,
                        16
                    );

        }


        document.getElementById(
            "eventFormMessage"
        ).innerText =
            "";

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}



/* =========================================================
   DELETE EVENT
========================================================= */

async function deleteEvent(
    eventId
) {

    const token =
        localStorage.getItem(
            "token"
        );

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    if (
        !user ||
        !canManageEvents(
            user.role
        )
    ) {

        alert(
            "You do not have permission to delete events."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this event?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "../backend/events.php?id=" +
                eventId,
                {
                    method:
                        "DELETE",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }
                }
            );


        const data =
            await response.json();


        /* =====================================
           401 - TOKEN EXPIRED
        ===================================== */

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            alert(
                "Your session has expired. Please log in again."
            );


            window.location.href =
                "login.html";

            return;

        }


        /* =====================================
           403 - FORBIDDEN
        ===================================== */

        if (
            response.status === 403
        ) {

            alert(
                data.message ||
                "You do not have permission to delete this event."
            );

            return;

        }


        /* =====================================
           409 / OTHER ERRORS
        ===================================== */

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete event."
            );

            return;

        }


        /* =====================================
           SUCCESS
        ===================================== */

        alert(
            data.message ||
            "Event deleted successfully."
        );


        loadEventsPage();

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}



/* =========================================================
   SAVE EVENT
   CREATE / UPDATE
========================================================= */

async function saveEvent() {

    const token =
        localStorage.getItem(
            "token"
        );

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    if (
        !user ||
        !canManageEvents(
            user.role
        )
    ) {

        alert(
            "You do not have permission to manage events."
        );

        return;

    }


    /* =====================================================
       READ FORM
    ===================================================== */

    const eventId =
        document.getElementById(
            "editEventId"
        ).value;


    const title =
        document.getElementById(
            "eventTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "eventDescription"
        ).value.trim();


    const venueId =
        parseInt(
            document.getElementById(
                "eventVenue"
            ).value
        );


    const rawDate =
        document.getElementById(
            "eventDate"
        ).value;


    const ticketPrice =
        parseFloat(
            document.getElementById(
                "eventPrice"
            ).value
        );


    const totalTickets =
        parseInt(
            document.getElementById(
                "eventTickets"
            ).value
        );


    const status =
        document.getElementById(
            "eventStatus"
        ).value;


    const message =
        document.getElementById(
            "eventFormMessage"
        );


    message.innerText =
        "";


    /* =====================================================
       FRONTEND VALIDATION
    ===================================================== */

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


    if (
        ticketPrice < 0
    ) {

        message.innerText =
            "Ticket price cannot be negative.";

        return;

    }


    if (
        totalTickets <= 0
    ) {

        message.innerText =
            "Total tickets must be greater than 0.";

        return;

    }


    /* =====================================================
       CONVERT DATE
    ===================================================== */

    const eventDate =
        rawDate.replace(
            "T",
            " "
        ) + ":00";


    /* =====================================================
       REQUEST BODY
    ===================================================== */

    const body = {

        title:
            title,

        description:
            description,

        venue_id:
            venueId,

        event_date:
            eventDate,

        ticket_price:
            ticketPrice,

        total_tickets:
            totalTickets,

        status:
            status

    };


    /* =====================================================
       CREATE OR UPDATE
    ===================================================== */

    const isEditing =
        eventId !== "";


    const url =
        isEditing

        ? "../backend/events.php?id=" +
          eventId

        : "../backend/events.php";


    const method =
        isEditing
            ? "PUT"
            : "POST";


    try {

        const response =
            await fetch(
                url,
                {
                    method:
                        method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token

                    },

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const data =
            await response.json();


        /* =====================================
           401
        ===================================== */

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            alert(
                "Your session has expired. Please log in again."
            );


            window.location.href =
                "login.html";

            return;

        }


        /* =====================================
           403
        ===================================== */

        if (
            response.status === 403
        ) {

            message.innerText =
                data.message ||
                "You do not have permission to manage this event.";

            return;

        }


        /* =====================================
           VALIDATION / API ERROR
        ===================================== */

        if (!response.ok) {

            if (
                Array.isArray(
                    data.errors
                )
            ) {

                message.innerText =
                    data.errors
                        .map(
                            error =>
                                error.message
                        )
                        .join(
                            " | "
                        );

            }

            else {

                message.innerText =
                    data.message ||
                    "Unable to save event.";

            }


            return;

        }


        /* =====================================
           SUCCESS
        ===================================== */

        closeEventModal();


        await loadEventsPage();

    }

    catch (error) {

        console.error(
            error
        );


        message.innerText =
            "Unable to connect to server.";

    }

}
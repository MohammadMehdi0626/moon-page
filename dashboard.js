// =====================================================
// CONFIG
// =====================================================

const API =
    "https://moon-page-production.up.railway.app";


// =====================================================
// DOM
// =====================================================

const totalEvents =
    document.getElementById("totalEvents");

const totalSessions =
    document.getElementById("totalSessions");

const eventTypes =
    document.getElementById("eventTypes");

const lastEvent =
    document.getElementById("lastEvent");

const eventChart =
    document.getElementById("eventChart");

const funnelContainer =
    document.getElementById("funnelContainer");

const conversionContainer =
    document.getElementById("conversionContainer");

const recentEventsTable =
    document.getElementById("recentEventsTable");

const sessionTable =
    document.getElementById("sessionTable");

const sessionDetails =
    document.getElementById("sessionDetails");

const selectedSession =
    document.getElementById("selectedSession");

const sessionEventsTable =
    document.getElementById("sessionEventsTable");

const closeSessionButton =
    document.getElementById("closeSessionButton");

const connectionStatus =
    document.getElementById("connectionStatus");

const lastUpdate =
    document.getElementById("lastUpdate");

const errorMessage =
    document.getElementById("errorMessage");


// =====================================================
// HELPERS
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("fa-IR");

}


function setConnection(connected) {

    if (connected) {

        connectionStatus.textContent =
            "Backend متصل ✓";

        connectionStatus.className =
            "connection-status success";

    }

    else {

        connectionStatus.textContent =
            "Backend قطع است";

        connectionStatus.className =
            "connection-status error";

    }

}


// =====================================================
// API HELPER
// =====================================================

async function fetchAPI(endpoint) {

    const response =
        await fetch(
            API + endpoint,
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            `API Error: ${endpoint} - ${response.status}`
        );

    }

    return await response.json();

}


// =====================================================
// LOAD STATS
// =====================================================

async function loadStats() {

    const data =
        await fetchAPI("/api/stats");


    totalEvents.textContent =
        data.total_events ?? 0;


    totalSessions.textContent =
        data.total_sessions ?? 0;


    const eventCounts =
        data.event_counts || [];


    eventTypes.textContent =
        eventCounts.length;


    if (eventCounts.length > 0) {

        lastEvent.textContent =
            eventCounts[0].event_name;

    }

    else {

        lastEvent.textContent =
            "-";

    }


    renderEventChart(
        eventCounts
    );

}


// =====================================================
// EVENT CHART
// =====================================================

function renderEventChart(eventCounts) {

    eventChart.innerHTML = "";


    if (
        !eventCounts ||
        eventCounts.length === 0
    ) {

        eventChart.innerHTML = `
            <div class="empty-message">
                هنوز Eventی ثبت نشده است.
            </div>
        `;

        return;

    }


    const maxCount =
        Math.max(
            ...eventCounts.map(
                item => Number(item.count) || 0
            ),
            1
        );


    eventCounts.forEach(function (item) {

        const count =
            Number(item.count) || 0;


        const percentage =
            (count / maxCount) * 100;


        const row =
            document.createElement("div");


        row.className =
            "event-row";


        row.innerHTML = `

            <div class="event-name">
                ${escapeHtml(
                    item.event_name
                )}
            </div>

            <div class="event-bar-container">

                <div
                    class="event-bar"
                    style="width:${percentage}%"
                ></div>

            </div>

            <div class="event-count">
                ${count}
            </div>

        `;


        eventChart.appendChild(row);

    });

}


// =====================================================
// LOAD FUNNEL
// =====================================================

async function loadFunnel() {

    const data =
        await fetchAPI("/api/funnel");


    console.log(
        "FUNNEL DATA:",
        data
    );


    if (
        !data ||
        !Array.isArray(data.funnel)
    ) {

        throw new Error(
            "Invalid Funnel data format"
        );

    }


    renderFunnel(
        data.funnel
    );

}

// =====================================================
// RENDER FUNNEL
// =====================================================

function renderFunnel(funnel) {

    funnelContainer.innerHTML = "";


    if (
        !Array.isArray(funnel) ||
        funnel.length === 0
    ) {

        funnelContainer.innerHTML = `

            <div class="empty-message">
                اطلاعات Funnel موجود نیست.
            </div>

        `;

        return;

    }


    const maxValue =
        Math.max(

            ...funnel.map(
                item =>
                    Number(
                        item.sessions
                    ) || 0
            ),

            1

        );


    funnel.forEach(function (item) {

        const sessions =
            Number(
                item.sessions
            ) || 0;


        const percentage =
            (
                sessions /
                maxValue
            ) * 100;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "funnel-row";


        row.innerHTML = `

            <div class="funnel-name">

                <strong>
                    مرحله ${item.stage}
                </strong>

                <br>

                ${escapeHtml(
                    item.name
                )}

            </div>


            <div class="funnel-bar-container">

                <div
                    class="funnel-bar"
                    style="width:${percentage}%"
                ></div>

            </div>


            <div class="funnel-count">

                ${sessions}

            </div>

        `;


        funnelContainer.appendChild(
            row
        );

    });

}
// =====================================================
// LOAD CONVERSION
// =====================================================

async function loadConversion() {

    const data =
        await fetchAPI("/api/funnel/conversion");


    renderConversion(
        data
    );

}


// =====================================================
// RENDER CONVERSION
// =====================================================

function renderConversion(data) {

    conversionContainer.innerHTML = "";


    const counts =
        data.counts || {};


    const conversion =
        data.conversion_percent || {};


    const eventNames =
        Object.keys(conversion);


    if (eventNames.length === 0) {

        conversionContainer.innerHTML = `
            <div class="empty-message">
                اطلاعات نرخ تبدیل موجود نیست.
            </div>
        `;

        return;

    }


    eventNames.forEach(function (eventName) {

        const value =
            conversion[eventName] ?? 0;


        const count =
            counts[eventName] ?? 0;


        const card =
            document.createElement("div");


        card.className =
            "conversion-card";


        card.innerHTML = `

            <div class="conversion-name">

                ${escapeHtml(eventName)}

            </div>


            <div class="conversion-value">

                ${value}%

            </div>


            <div
                style="
                    margin-top:8px;
                    color:#94a3b8;
                    font-size:12px;
                "
            >

                ${count} Session

            </div>

        `;


        conversionContainer.appendChild(card);

    });

}


// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    const data =
        await fetchAPI("/api/events");


    renderRecentEvents(
        data.events || []
    );

}


// =====================================================
// RECENT EVENTS
// =====================================================

function renderRecentEvents(events) {

    recentEventsTable.innerHTML = "";


    if (
        !events ||
        events.length === 0
    ) {

        recentEventsTable.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-message"
                >
                    هنوز Eventی ثبت نشده است.
                </td>

            </tr>

        `;

        return;

    }


    const recent =
        [...events]
            .reverse()
            .slice(0, 20);


    recent.forEach(function (event) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${event.id ?? "-"}
            </td>

            <td>
                ${escapeHtml(
                    event.session_id
                )}
            </td>

            <td>
                ${escapeHtml(
                    event.event_name
                )}
            </td>

            <td>
                ${formatDate(
                    event.created_at
                )}
            </td>

        `;


        recentEventsTable.appendChild(row);

    });

}


// =====================================================
// LOAD SESSIONS
// =====================================================

async function loadSessions() {

    const data =
        await fetchAPI("/api/sessions");


    renderSessions(
        data.sessions || []
    );

}


// =====================================================
// RENDER SESSIONS
// =====================================================

function renderSessions(sessions) {

    sessionTable.innerHTML = "";


    if (
        !sessions ||
        sessions.length === 0
    ) {

        sessionTable.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-message"
                >
                    هنوز Sessionی ثبت نشده است.
                </td>

            </tr>

        `;

        return;

    }


    sessions.forEach(function (session) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    session.session_id
                )}
            </td>

            <td>
                ${formatDate(
                    session.started_at
                )}
            </td>

            <td>
                ${formatDate(
                    session.last_activity
                )}
            </td>

            <td>
                ${session.event_count ?? 0}
            </td>

            <td>

                <button
                    class="session-button"
                    data-session="${escapeHtml(
                        session.session_id
                    )}"
                >
                    مشاهده
                </button>

            </td>

        `;


        sessionTable.appendChild(row);

    });


    const buttons =
        sessionTable.querySelectorAll(
            ".session-button"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                loadSessionDetails(
                    button.dataset.session
                );

            }
        );

    });

}


// =====================================================
// SESSION DETAILS
// =====================================================

async function loadSessionDetails(sessionId) {

    try {

        const data =
            await fetchAPI(
                "/api/sessions/" +
                encodeURIComponent(sessionId)
            );


        selectedSession.textContent =
            sessionId;


        renderSessionEvents(
            data.events || []
        );


        sessionDetails.classList.remove(
            "hidden"
        );


        sessionDetails.scrollIntoView({
            behavior: "smooth"
        });

    }

    catch (error) {

        console.error(
            "SESSION DETAILS ERROR:",
            error
        );

    }

}


// =====================================================
// RENDER SESSION EVENTS
// =====================================================

function renderSessionEvents(events) {

    sessionEventsTable.innerHTML = "";


    if (
        !events ||
        events.length === 0
    ) {

        sessionEventsTable.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-message"
                >
                    Eventی برای این Session وجود ندارد.
                </td>

            </tr>

        `;

        return;

    }


    events.forEach(function (event) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${event.id ?? "-"}
            </td>

            <td>
                ${escapeHtml(
                    event.event_name
                )}
            </td>

            <td>
                ${escapeHtml(
                    event.data
                )}
            </td>

            <td>
                ${formatDate(
                    event.created_at
                )}
            </td>

        `;


        sessionEventsTable.appendChild(row);

    });

}


// =====================================================
// CLOSE SESSION DETAILS
// =====================================================

if (closeSessionButton) {

    closeSessionButton.addEventListener(
        "click",
        function () {

            sessionDetails.classList.add(
                "hidden"
            );

        }
    );

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    errorMessage.classList.add(
        "hidden"
    );


    const results =
        await Promise.allSettled([

            loadStats(),

            loadFunnel(),

            loadConversion(),

            loadEvents(),

            loadSessions()

        ]);


    const successfulRequests =
        results.filter(
            result =>
                result.status === "fulfilled"
        ).length;


    if (successfulRequests > 0) {

        setConnection(true);

    }

    else {

        setConnection(false);

        errorMessage.classList.remove(
            "hidden"
        );

    }


    results.forEach(
        function (result, index) {

            if (
                result.status === "rejected"
            ) {

                console.error(
                    `Dashboard request ${index} failed:`,
                    result.reason
                );

            }

        }
    );


    lastUpdate.textContent =
        new Date().toLocaleString(
            "fa-IR"
        );

}
// =====================================================
// INITIAL LOAD
// =====================================================

loadDashboard();


// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(
    loadDashboard,
    5000
);

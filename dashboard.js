// =====================================================
// CONFIG
// =====================================================

// IMPORTANT:
// آدرس باید فقط یک String ساده باشد.

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


    return date.toLocaleString(
        "fa-IR"
    );

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
// GENERIC API FETCH
// =====================================================

async function fetchAPI(endpoint) {

    const response =
        await fetch(
            API + endpoint,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `${endpoint} returned ${response.status}`
        );

    }


    return await response.json();

}



// =====================================================
// LOAD STATS
// =====================================================

async function loadStats() {

    const data =
        await fetchAPI(
            "/api/stats"
        );


    totalEvents.textContent =
        data.total_events ?? 0;


    totalSessions.textContent =
        data.total_sessions ?? 0;


    eventTypes.textContent =
        Array.isArray(data.event_counts)
            ? data.event_counts.length
            : 0;


    if (
        Array.isArray(data.event_counts) &&
        data.event_counts.length > 0
    ) {

        lastEvent.textContent =
            data.event_counts[0].event_name;

    }

    else {

        lastEvent.textContent =
            "-";

    }


    renderEventChart(
        data.event_counts || []
    );

}



// =====================================================
// EVENT CHART
// =====================================================

function renderEventChart(eventCounts) {

    eventChart.innerHTML =
        "";


    if (
        !Array.isArray(eventCounts) ||
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
                item =>
                    Number(item.count) || 0
            ),
            1
        );


    eventCounts.forEach(function (item) {

        const count =
            Number(item.count) || 0;


        const percentage =
            (
                count /
                maxCount
            ) * 100;


        const row =
            document.createElement(
                "div"
            );


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


        eventChart.appendChild(
            row
        );

    });

}



// =====================================================
// LOAD FUNNEL
// =====================================================

async function loadFunnel() {

    const data =
        await fetchAPI(
            "/api/funnel"
        );


    console.log(
        "FUNNEL RESPONSE:",
        data
    );


    renderFunnel(
        data.funnel || []
    );

}



// =====================================================
// RENDER FUNNEL
// =====================================================

function renderFunnel(funnel) {

    funnelContainer.innerHTML =
        "";


    if (
        !Array.isArray(funnel) ||
        funnel.length === 0
    ) {

        funnelContainer.innerHTML = `
            <div class="empty-message">
                اطلاعات Funnel هنوز موجود نیست.
            </div>
        `;

        return;

    }


    const maxValue =
        Math.max(
            ...funnel.map(
                item =>
                    Number(item.sessions) || 0
            ),
            1
        );


    funnel.forEach(function (item) {

        const sessions =
            Number(item.sessions) || 0;


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
                    مرحله ${item.stage ?? "-"}
                </strong>

                <br>

                ${escapeHtml(
                    item.name ?? item.event
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
        await fetchAPI(
            "/api/funnel/conversion"
        );


    renderConversion(
        data.conversion_percent || {}
    );

}



// =====================================================
// RENDER CONVERSION
// =====================================================

function renderConversion(conversion) {

    conversionContainer.innerHTML =
        "";


    const labels = {

        page_view:
            "ورود به صفحه",

        start_journey_click:
            "شروع سفر",

        authentication_shown:
            "رسیدن به مرحله ورود",

        verification_requested:
            "درخواست تایید",

        verification_success:
            "تایید موفق",

        final_choice_made:
            "انتخاب نهایی"

    };


    Object.entries(conversion).forEach(
        function ([eventName, value]) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "conversion-card";


            card.innerHTML = `

                <div class="conversion-name">

                    ${escapeHtml(
                        labels[eventName] ||
                        eventName
                    )}

                </div>

                <div class="conversion-value">

                    ${value}%

                </div>

            `;


            conversionContainer.appendChild(
                card
            );

        }
    );


    if (
        Object.keys(conversion).length === 0
    ) {

        conversionContainer.innerHTML = `
            <div class="empty-message">
                اطلاعات نرخ تبدیل موجود نیست.
            </div>
        `;

    }

}



// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    const data =
        await fetchAPI(
            "/api/events"
        );


    renderRecentEvents(
        data.events || []
    );

}



// =====================================================
// RECENT EVENTS
// =====================================================

function renderRecentEvents(events) {

    recentEventsTable.innerHTML =
        "";


    if (
        !Array.isArray(events) ||
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
            document.createElement(
                "tr"
            );


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


        recentEventsTable.appendChild(
            row
        );

    });

}



// =====================================================
// LOAD SESSIONS
// =====================================================

async function loadSessions() {

    const data =
        await fetchAPI(
            "/api/sessions"
        );


    renderSessions(
        data.sessions || []
    );

}



// =====================================================
// RENDER SESSIONS
// =====================================================

function renderSessions(sessions) {

    sessionTable.innerHTML =
        "";


    if (
        !Array.isArray(sessions) ||
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
            document.createElement(
                "tr"
            );


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


        sessionTable.appendChild(
            row
        );

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
                encodeURIComponent(
                    sessionId
                )
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

    sessionEventsTable.innerHTML =
        "";


    if (
        !Array.isArray(events) ||
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
            document.createElement(
                "tr"
            );


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


        sessionEventsTable.appendChild(
            row
        );

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

    const endpoints = [
        "/api/stats",
        "/api/events"
    ];


    // -------------------------------------------------
    // اول وضعیت واقعی Backend را جداگانه بررسی می‌کنیم
    // -------------------------------------------------

    try {

        await fetchAPI(
            "/api/stats"
        );


        setConnection(
            true
        );

    }

    catch (error) {

        console.error(
            "BACKEND CONNECTION ERROR:",
            error
        );


        setConnection(
            false
        );


        errorMessage.classList.remove(
            "hidden"
        );

        return;

    }


    // -------------------------------------------------
    // اگر Backend وصل بود،
    // هر بخش جداگانه لود می‌شود
    // -------------------------------------------------

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


    results.forEach(
        function (result, index) {

            if (
                result.status === "rejected"
            ) {

                console.error(
                    "Dashboard section failed:",
                    index,
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

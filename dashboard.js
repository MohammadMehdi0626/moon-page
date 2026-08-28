
// =====================================================
// CONFIG
// =====================================================

const API =
    "http://127.0.0.1:8000";


// =====================================================
// EVENT NAMES
// =====================================================

const FUNNEL_EVENTS = [

    {
        name: "page_view",
        label: "ورود به صفحه"
    },

    {
        name: "start_journey_click",
        label: "شروع سفر"
    },

    {
        name: "authentication_shown",
        label: "نمایش احراز هویت"
    },

    {
        name: "keyword_submitted",
        label: "ارسال کلمه"
    },

    {
        name: "authentication_success",
        label: "احراز هویت موفق"
    },

    {
        name: "transition_started",
        label: "شروع انتقال"
    },

    {
        name: "main_world_entered",
        label: "ورود به دنیای اصلی"
    },

    {
        name: "cat_appearing",
        label: "ظاهر شدن گربه"
    },

    {
        name: "cat_started_walking",
        label: "شروع حرکت گربه"
    },

    {
        name: "cat_reached_destination",
        label: "رسیدن گربه"
    },

    {
        name: "cat_petted",
        label: "نوازش گربه"
    },

    {
        name: "story_sequence_started",
        label: "شروع داستان"
    },

    {
        name: "story_choices_shown",
        label: "نمایش انتخاب نهایی"
    },

    {
        name: "final_choice_yes",
        label: "انتخاب بله"
    },

    {
        name: "final_choice_no",
        label: "انتخاب خیر"
    }

];


// =====================================================
// DOM
// =====================================================

const totalEvents =
    document.getElementById(
        "totalEvents"
    );


const totalSessions =
    document.getElementById(
        "totalSessions"
    );


const eventTypes =
    document.getElementById(
        "eventTypes"
    );


const lastEvent =
    document.getElementById(
        "lastEvent"
    );


const eventChart =
    document.getElementById(
        "eventChart"
    );


const funnelContainer =
    document.getElementById(
        "funnelContainer"
    );


const conversionContainer =
    document.getElementById(
        "conversionContainer"
    );


const recentEventsTable =
    document.getElementById(
        "recentEventsTable"
    );


const sessionTable =
    document.getElementById(
        "sessionTable"
    );


const sessionDetails =
    document.getElementById(
        "sessionDetails"
    );


const selectedSession =
    document.getElementById(
        "selectedSession"
    );


const sessionEventsTable =
    document.getElementById(
        "sessionEventsTable"
    );


const closeSessionButton =
    document.getElementById(
        "closeSessionButton"
    );


const connectionStatus =
    document.getElementById(
        "connectionStatus"
    );


const lastUpdate =
    document.getElementById(
        "lastUpdate"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


// =====================================================
// HELPERS
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function formatDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "fa-IR"
    );

}


function setConnection(
    connected
) {

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
// LOAD STATS
// =====================================================

async function loadStats() {

    const response =
        await fetch(
            API +
            "/api/stats"
        );


    if (!response.ok) {

        throw new Error(
            "Stats API error"
        );

    }


    const data =
        await response.json();


    totalEvents.textContent =
        data.total_events;


    totalSessions.textContent =
        data.total_sessions;


    eventTypes.textContent =
        data.event_counts.length;


    if (
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
        data.event_counts
    );

}


// =====================================================
// EVENT CHART
// =====================================================

function renderEventChart(
    eventCounts
) {

    eventChart.innerHTML =
        "";


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
                item =>
                    item.count
            )
        );


    eventCounts.forEach(
        function (item) {

            const percentage =
                maxCount > 0
                    ? (
                        item.count /
                        maxCount
                    ) * 100
                    : 0;


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
                    ${item.count}
                </div>

            `;


            eventChart.appendChild(
                row
            );

        }
    );

}


// =====================================================
// LOAD FUNNEL
// =====================================================

async function loadFunnel() {

    const response =
        await fetch(
            API +
            "/api/funnel"
        );


    if (!response.ok) {

        throw new Error(
            "Funnel API error"
        );

    }


    const data =
        await response.json();


    renderFunnel(
        data.funnel
    );

}


// =====================================================
// RENDER FUNNEL
// =====================================================

function renderFunnel(
    funnel
) {

    funnelContainer.innerHTML =
        "";


    const values =
        FUNNEL_EVENTS.map(
            item =>
                funnel[item.name] || 0
        );


    const maxValue =
        Math.max(
            ...values,
            1
        );


    FUNNEL_EVENTS.forEach(
        function (item) {

            const count =
                funnel[item.name] || 0;


            const percentage =
                (
                    count /
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
                    ${item.label}
                </div>

                <div class="funnel-bar-container">

                    <div
                        class="funnel-bar"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <div class="funnel-count">
                    ${count}
                </div>

            `;


            funnelContainer.appendChild(
                row
            );

        }
    );

}


// =====================================================
// LOAD CONVERSION
// =====================================================

async function loadConversion() {

    const response =
        await fetch(
            API +
            "/api/funnel/conversion"
        );


    if (!response.ok) {

        throw new Error(
            "Conversion API error"
        );

    }


    const data =
        await response.json();


    renderConversion(
        data.conversion_percent
    );

}


// =====================================================
// RENDER CONVERSION
// =====================================================

function renderConversion(
    conversion
) {

    conversionContainer.innerHTML =
        "";


    FUNNEL_EVENTS.forEach(
        function (item) {

            const value =
                conversion[item.name] || 0;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "conversion-card";


            card.innerHTML = `

                <div class="conversion-name">
                    ${item.label}
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

}


// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    const response =
        await fetch(
            API +
            "/api/events"
        );


    if (!response.ok) {

        throw new Error(
            "Events API error"
        );

    }


    const data =
        await response.json();


    renderRecentEvents(
        data.events
    );

}


// =====================================================
// RECENT EVENTS
// =====================================================

function renderRecentEvents(
    events
) {

    recentEventsTable.innerHTML =
        "";


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
            .slice(
                0,
                20
            );


    recent.forEach(
        function (event) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${event.id}
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

        }
    );

}


// =====================================================
// LOAD SESSIONS
// =====================================================

async function loadSessions() {

    const response =
        await fetch(
            API +
            "/api/sessions"
        );


    if (!response.ok) {

        throw new Error(
            "Sessions API error"
        );

    }


    const data =
        await response.json();


    renderSessions(
        data.sessions
    );

}


// =====================================================
// RENDER SESSIONS
// =====================================================

function renderSessions(
    sessions
) {

    sessionTable.innerHTML =
        "";


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


    sessions.forEach(
        function (session) {

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
                    ${session.event_count}
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

        }
    );


    const buttons =
        sessionTable.querySelectorAll(
            ".session-button"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const sessionId =
                        button.dataset.session;


                    loadSessionDetails(
                        sessionId
                    );

                }
            );

        }
    );

}


// =====================================================
// SESSION DETAILS
// =====================================================

async function loadSessionDetails(
    sessionId
) {

    try {

        const response =
            await fetch(
                API +
                "/api/sessions/" +
                encodeURIComponent(
                    sessionId
                )
            );


        if (!response.ok) {

            throw new Error(
                "Session details error"
            );

        }


        const data =
            await response.json();


        selectedSession.textContent =
            sessionId;


        renderSessionEvents(
            data.events
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
            error
        );

    }

}


// =====================================================
// RENDER SESSION EVENTS
// =====================================================

function renderSessionEvents(
    events
) {

    sessionEventsTable.innerHTML =
        "";


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


    events.forEach(
        function (event) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${event.id}
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

        }
    );

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

    try {

        errorMessage.classList.add(
            "hidden"
        );


        await Promise.all([

            loadStats(),

            loadFunnel(),

            loadConversion(),

            loadEvents(),

            loadSessions()

        ]);


        setConnection(
            true
        );


        const now =
            new Date();


        lastUpdate.textContent =
            now.toLocaleString(
                "fa-IR"
            );

    }

    catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );


        setConnection(
            false
        );


        errorMessage.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadDashboard();


// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(
    function () {

        loadDashboard();

    },
    5000
);
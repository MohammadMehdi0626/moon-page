from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import sqlite3
import json


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="Moon Page Backend",
    description="Backend for Moon Page analytics",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# DATABASE
# =====================================================

# DATABASE = (
#     r"C:\Users\Ertebatat-Sahar"
#     r"\OneDrive\Desktop\database_page"
#     r"\moon_data.db"
# )
import os

DATABASE = os.getenv(
    "DATABASE_PATH",
    "moon_data.db"
)


def get_db():

    connection = sqlite3.connect(
        DATABASE
    )

    connection.row_factory = sqlite3.Row

    return connection


def create_database():

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            session_id TEXT NOT NULL,

            event_name TEXT NOT NULL,

            data TEXT,

            created_at TEXT NOT NULL

        )
    """)

    connection.commit()

    connection.close()


create_database()


# =====================================================
# EVENT MODEL
# =====================================================

class Event(BaseModel):

    session_id: str

    event_name: str

    data: dict = Field(
        default_factory=dict
    )


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message":
            "Moon Backend is running 🌙"
    }


# =====================================================
# CREATE EVENT
# =====================================================

@app.post("/api/events")
def receive_event(event: Event):

    connection = get_db()

    cursor = connection.cursor()

    created_at = datetime.now().isoformat()

    event_data = json.dumps(
        event.data,
        ensure_ascii=False
    )

    cursor.execute(
        """
        INSERT INTO events
        (
            session_id,
            event_name,
            data,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            event.session_id,
            event.event_name,
            event_data,
            created_at
        )
    )

    connection.commit()

    event_id = cursor.lastrowid

    connection.close()


    # -------------------------------------------------
    # Terminal Log
    # -------------------------------------------------

    print()
    print("==============================")
    print("NEW EVENT")
    print("==============================")

    print(
        "ID      :",
        event_id
    )

    print(
        "Session :",
        event.session_id
    )

    print(
        "Event   :",
        event.event_name
    )

    print(
        "Data    :",
        event.data
    )

    print(
        "Time    :",
        created_at
    )

    print("==============================")
    print()


    return {

        "success": True,

        "message":
            "Event saved",

        "event_id":
            event_id,

        "session_id":
            event.session_id,

        "event":
            event.event_name

    }


# =====================================================
# GET ALL EVENTS
# =====================================================

@app.get("/api/events")
def get_events():

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            session_id,
            event_name,
            data,
            created_at
        FROM events
        ORDER BY id ASC
    """)

    rows = cursor.fetchall()

    connection.close()


    events = []

    for row in rows:

        events.append({

            "id":
                row["id"],

            "session_id":
                row["session_id"],

            "event_name":
                row["event_name"],

            "data":
                row["data"],

            "created_at":
                row["created_at"]

        })


    return {

        "success": True,

        "count":
            len(events),

        "events":
            events

    }


# =====================================================
# GET ALL SESSIONS
# =====================================================

@app.get("/api/sessions")
def get_sessions():

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            session_id,
            MIN(created_at) AS started_at,
            MAX(created_at) AS last_activity,
            COUNT(*) AS event_count
        FROM events
        GROUP BY session_id
        ORDER BY last_activity DESC
    """)

    rows = cursor.fetchall()

    connection.close()


    sessions = []

    for row in rows:

        sessions.append({

            "session_id":
                row["session_id"],

            "started_at":
                row["started_at"],

            "last_activity":
                row["last_activity"],

            "event_count":
                row["event_count"]

        })


    return {

        "success": True,

        "count":
            len(sessions),

        "sessions":
            sessions

    }


# =====================================================
# GET EVENTS OF ONE SESSION
# =====================================================

@app.get("/api/sessions/{session_id}")
def get_session_events(
    session_id: str
):

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            session_id,
            event_name,
            data,
            created_at
        FROM events
        WHERE session_id = ?
        ORDER BY id ASC
        """,
        (session_id,)
    )

    rows = cursor.fetchall()

    connection.close()


    events = []

    for row in rows:

        events.append({

            "id":
                row["id"],

            "session_id":
                row["session_id"],

            "event_name":
                row["event_name"],

            "data":
                row["data"],

            "created_at":
                row["created_at"]

        })


    return {

        "success": True,

        "session_id":
            session_id,

        "count":
            len(events),

        "events":
            events

    }


# =====================================================
# STATISTICS
# =====================================================

@app.get("/api/stats")
def get_stats():

    connection = get_db()

    cursor = connection.cursor()


    # -------------------------------------------------
    # Total Events
    # -------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*)
        FROM events
    """)

    total_events = cursor.fetchone()[0]


    # -------------------------------------------------
    # Total Unique Sessions
    # -------------------------------------------------

    cursor.execute("""
        SELECT COUNT(DISTINCT session_id)
        FROM events
    """)

    total_sessions = cursor.fetchone()[0]


    # -------------------------------------------------
    # Event Counts
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            event_name,
            COUNT(*) AS event_count
        FROM events
        GROUP BY event_name
        ORDER BY event_count DESC
    """)

    rows = cursor.fetchall()


    event_counts = []

    for row in rows:

        event_counts.append({

            "event_name":
                row["event_name"],

            "count":
                row["event_count"]

        })


    connection.close()


    return {

        "success": True,

        "total_events":
            total_events,

        "total_sessions":
            total_sessions,

        "event_counts":
            event_counts

    }


# =====================================================
# FUNNEL STATISTICS
# =====================================================

@app.get("/api/funnel")
def get_funnel():

    connection = get_db()

    cursor = connection.cursor()


    event_names = [

        "page_view",

        "start_journey_click",

        "authentication_shown",

        "verification_requested",

        "verification_success",

        "final_choice_made"

    ]


    funnel = {}


    for event_name in event_names:

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM events
            WHERE event_name = ?
            """,
            (event_name,)
        )

        count = cursor.fetchone()[0]

        funnel[event_name] = count


    connection.close()


    return {

        "success": True,

        "funnel":
            funnel

    }


# =====================================================
# SESSION FUNNEL
# =====================================================

@app.get("/api/funnel/sessions")
def get_session_funnel():

    connection = get_db()

    cursor = connection.cursor()


    event_names = [

        "page_view",

        "start_journey_click",

        "authentication_shown",

        "verification_requested",

        "verification_success",

        "final_choice_made"

    ]


    funnel = {}


    for event_name in event_names:

        cursor.execute(
            """
            SELECT COUNT(DISTINCT session_id)
            FROM events
            WHERE event_name = ?
            """,
            (event_name,)
        )

        count = cursor.fetchone()[0]

        funnel[event_name] = count


    connection.close()


    return {

        "success": True,

        "funnel":
            funnel

    }


# =====================================================
# CONVERSION FUNNEL
# =====================================================

@app.get("/api/funnel/conversion")
def get_conversion_funnel():

    connection = get_db()

    cursor = connection.cursor()


    event_names = [

        "page_view",

        "start_journey_click",

        "authentication_shown",

        "verification_requested",

        "verification_success",

        "final_choice_made"

    ]


    counts = {}


    for event_name in event_names:

        cursor.execute(
            """
            SELECT COUNT(DISTINCT session_id)
            FROM events
            WHERE event_name = ?
            """,
            (event_name,)
        )

        counts[event_name] = (
            cursor.fetchone()[0]
        )


    connection.close()


    page_views = counts["page_view"]


    conversion = {}


    if page_views > 0:

        for event_name in event_names:

            conversion[event_name] = round(
                (
                    counts[event_name]
                    / page_views
                ) * 100,
                2
            )

    else:

        for event_name in event_names:

            conversion[event_name] = 0


    return {

        "success": True,

        "base_sessions":
            page_views,

        "counts":
            counts,

        "conversion_percent":
            conversion

    }


# =====================================================
# SERVER START TEST
# =====================================================

print(
    "MAIN.PY LOADED - MOON BACKEND READY 🌙"
)
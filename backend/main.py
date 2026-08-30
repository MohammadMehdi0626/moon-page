from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from dotenv import load_dotenv

import sqlite3
import json
import os
import requests


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="Moon Page Backend",
    description="Backend for Moon Page analytics and SMS",
    version="2.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://mohammadmehdi0626.github.io"
    ],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# SMS.ir CONFIG
# =====================================================

SMS_API_KEY = os.getenv(
    "SMS_API_KEY"
)

SMS_LINE_NUMBER = os.getenv(
    "SMS_LINE_NUMBER"
)

SMS_API_URL = (
    "https://api.sms.ir/v1/send/bulk"
)


# =====================================================
# PHONE NUMBERS
# =====================================================

# شماره تست یگانه
YEGANEH_MOBILE = "9028671965"

# شماره خودت
OWNER_MOBILE = "9154956997"


# =====================================================
# SMS MESSAGES
# =====================================================

YEGANEH_MESSAGE = """
یه کلمه هست که بدون اون نمی‌تونی وارد این دنیا بشی...
چیزی که وقتی همه‌جا تاریکه، بیشتر از همیشه بهش نیاز داری 🌙
کلمه عبور، همون چیزیه که تاریکی رو کنار می‌زنه

یه دونه ن داره :))
""".strip()


# -----------------------------------------------------
# متن پیام خودت
# -----------------------------------------------------
# متن دقیق نسخه دوم قبلی در context فعلی قابل بازیابی نبود.
# این مقدار را با همان نسخه دوم نهایی خودت جایگزین کن.

OWNER_MESSAGE = """
🌙 یکی وارد صفحه «سفر تا ماه» شد.
به نظر می‌رسه سفر شروع شده...
""".strip()


# =====================================================
# DATABASE
# =====================================================

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
# PAGE OPEN MODEL
# =====================================================

class PageOpen(BaseModel):

    session_id: str


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
# HEALTH
# =====================================================

@app.get("/health")
def health():

    return {
        "status":
            "ok"
    }


# =====================================================
# SMS FUNCTION
# =====================================================

def send_sms(
    mobile,
    message
):

    if not SMS_API_KEY:

        return {
            "success": False,
            "error":
                "SMS_API_KEY is not configured"
        }


    if not SMS_LINE_NUMBER:

        return {
            "success": False,
            "error":
                "SMS_LINE_NUMBER is not configured"
        }


    headers = {

        "Content-Type":
            "application/json",

        "Accept":
            "application/json",

        "X-API-KEY":
            SMS_API_KEY
    }


    data = {

        "lineNumber":
            SMS_LINE_NUMBER,

        "MessageText":
            message,

        "Mobiles":
            [mobile]
    }


    try:

        response = requests.post(

            SMS_API_URL,

            headers=headers,

            json=data,

            timeout=15
        )


        try:

            response_data = response.json()

        except Exception:

            response_data = {
                "raw_response":
                    response.text
            }


        return {

            "success":
                response.ok,

            "status_code":
                response.status_code,

            "response":
                response_data

        }


    except Exception as error:

        return {

            "success":
                False,

            "error":
                str(error)

        }


# =====================================================
# SEND SMS WHEN PAGE OPENS
# =====================================================

@app.post("/api/page-open")
def page_open(
    page_data: PageOpen
):

    created_at = (
        datetime.now().isoformat()
    )


    # =================================================
    # SEND SMS TO YEGANEH
    # =================================================

    yeganeh_result = send_sms(

        YEGANEH_MOBILE,

        YEGANEH_MESSAGE

    )


    # =================================================
    # SEND SMS TO OWNER
    # =================================================

    owner_result = send_sms(

        OWNER_MOBILE,

        OWNER_MESSAGE

    )


    # =================================================
    # SAVE SMS EVENT
    # =================================================

    connection = get_db()

    cursor = connection.cursor()


    event_data = {

        "yeganeh_sms":
            yeganeh_result,

        "owner_sms":
            owner_result

    }


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

            page_data.session_id,

            "page_open_sms_sent",

            json.dumps(
                event_data,
                ensure_ascii=False
            ),

            created_at

        )
    )


    connection.commit()

    event_id = cursor.lastrowid

    connection.close()


    # =================================================
    # TERMINAL LOG
    # =================================================

    print()
    print("==============================")
    print("PAGE OPEN - SMS")
    print("==============================")

    print(
        "Session :",
        page_data.session_id
    )

    print(
        "Yeganeh:",
        yeganeh_result
    )

    print(
        "Owner  :",
        owner_result
    )

    print(
        "Event ID:",
        event_id
    )

    print(
        "Time   :",
        created_at
    )

    print("==============================")
    print()


    return {

        "success":
            True,

        "message":
            "Page open SMS process completed",

        "event_id":
            event_id,

        "yeganeh":
            yeganeh_result,

        "owner":
            owner_result

    }


# =====================================================
# CREATE EVENT
# =====================================================

@app.post("/api/events")
def receive_event(
    event: Event
):

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

        "success":
            True,

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

        "success":
            True,

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

        "success":
            True,

        "count":
            len(sessions),

        "sessions":
            sessions

    }


# =====================================================
# GET EVENTS OF ONE SESSION
# =====================================================

@app.get(
    "/api/sessions/{session_id}"
)
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

        "success":
            True,

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

    total_events = (
        cursor.fetchone()[0]
    )


    # -------------------------------------------------
    # Total Unique Sessions
    # -------------------------------------------------

    cursor.execute("""
        SELECT COUNT(DISTINCT session_id)
        FROM events
    """)

    total_sessions = (
        cursor.fetchone()[0]
    )


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

        "success":
            True,

        "total_events":
            total_events,

        "total_sessions":
            total_sessions,

        "event_counts":
            event_counts

    }


# =====================================================
# FUNNEL
# =====================================================

@app.get("/api/funnel")
def get_funnel():

    connection = get_db()

    cursor = connection.cursor()


    journey_stages = [

        {
            "stage": 1,
            "name": "ورود به صفحه",
            "event": "page_view"
        },

        {
            "stage": 2,
            "name": "شروع سفر",
            "event": "start_journey_click"
        },

        {
            "stage": 3,
            "name": "رسیدن به مرحله ورود",
            "event": "authentication_shown"
        },

        {
            "stage": 4,
            "name": "ورود موفق با کلمه نور",
            "event": "authentication_success"
        },

        {
            "stage": 5,
            "name": "شروع گذر از دنیای جدید",
            "event": "transition_started"
        },

        {
            "stage": 6,
            "name": "ورود به دنیای اصلی",
            "event": "main_world_entered"
        },

        {
            "stage": 7,
            "name": "ظاهر شدن گربه",
            "event": "cat_appearing"
        },

        {
            "stage": 8,
            "name": "گربه به مقصد رسید",
            "event": "cat_reached_destination"
        },

        {
            "stage": 9,
            "name": "نوازش گربه",
            "event": "cat_petted"
        },

        {
            "stage": 10,
            "name": "شروع داستان",
            "event": "story_sequence_started"
        },

        {
            "stage": 11,
            "name": "پایان داستان",
            "event": "story_sequence_finished"
        },

        {
            "stage": 12,
            "name": "نمایش انتخاب نهایی",
            "event": "final_choice_shown"
        },

        {
            "stage": 13,
            "name": "انتخاب نهایی",
            "event": "final_choice_made"
        }

    ]


    funnel = []


    for stage in journey_stages:

        cursor.execute(
            """
            SELECT COUNT(DISTINCT session_id)
            FROM events
            WHERE event_name = ?
            """,

            (stage["event"],)
        )


        session_count = (
            cursor.fetchone()[0]
        )


        funnel.append({

            "stage":
                stage["stage"],

            "name":
                stage["name"],

            "event":
                stage["event"],

            "sessions":
                session_count

        })


    connection.close()


    return {

        "success":
            True,

        "total_stages":
            len(journey_stages),

        "funnel":
            funnel

    }


# =====================================================
# FINAL CHOICES STATISTICS
# =====================================================

@app.get("/api/final-choices")
def get_final_choices():

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT data
        FROM events
        WHERE event_name = 'final_choice_made'
        """
    )


    rows = cursor.fetchall()


    yes_count = 0

    no_count = 0


    for row in rows:

        try:

            event_data = json.loads(
                row["data"]
            )


            choice = event_data.get(
                "choice"
            )


            if choice == "yes":

                yes_count += 1


            elif choice == "no":

                no_count += 1


        except Exception as error:

            print(
                "FINAL CHOICE ERROR:",
                error
            )


    connection.close()


    return {

        "success":
            True,

        "final_choices": {

            "yes":
                yes_count,

            "no":
                no_count,

            "total":
                yes_count + no_count

        }

    }


# =====================================================
# VERSION LOG
# =====================================================

print(
    "MOON BACKEND VERSION: SMS + FUNNEL V2 🌙"
)

print(
    "MAIN.PY LOADED - MOON BACKEND READY 🌙"
)

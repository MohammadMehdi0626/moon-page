from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import sqlite3
import json
import os
import requests


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
# ENVIRONMENT VARIABLES
# =====================================================

SMS_API_KEY = os.getenv("SMS_API_KEY")
SMS_LINE_NUMBER = os.getenv("SMS_LINE_NUMBER")


# =====================================================
# SMS.IR
# =====================================================

SMS_API_URL = "https://api.sms.ir/v1/send/bulk"


# =====================================================
# SMS NUMBERS
# =====================================================

# شماره تست یگانه
YEGANEH_MOBILE = "9158674760"

# شماره خودت
OWNER_MOBILE = "9028671965"


# =====================================================
# SMS MESSAGES
# =====================================================

YEGANEH_MESSAGE = """
یه کلمه هست که بدون اون نمی‌تونی وارد این دنیا بشی...
چیزی که وقتی همه‌جا تاریکه، بیشتر از همیشه بهش نیاز داری 🌙
کلمه عبور، همون چیزیه که تاریکی رو کنار می‌زنه

یه دونه ن داره :))
""".strip()


OWNER_MESSAGE = """
🌙 یکی وارد صفحه سفر تا ماه شد.

یه نفر همین الان صفحه رو باز کرده.
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
# CONTACT SUBMISSION MODEL
# =====================================================

class ContactSubmission(BaseModel):

    session_id: str

    phone: str
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
        "status": "ok"
    }


# =====================================================
# PAGE OPEN SMS
# =====================================================

@app.post("/send-page-open-sms")
def send_page_open_sms():

    print()
    print("==============================")
    print("PAGE OPEN SMS REQUEST")
    print("==============================")


    # -------------------------------------------------
    # بررسی تنظیمات SMS
    # -------------------------------------------------

    if not SMS_API_KEY:

        print(
            "SMS ERROR: SMS_API_KEY is not configured"
        )

        return {
            "success": False,
            "message":
                "SMS_API_KEY is not configured"
        }


    if not SMS_LINE_NUMBER:

        print(
            "SMS ERROR: SMS_LINE_NUMBER is not configured"
        )

        return {
            "success": False,
            "message":
                "SMS_LINE_NUMBER is not configured"
        }


    # -------------------------------------------------
    # Headers
    # -------------------------------------------------

    headers = {

        "Content-Type":
            "application/json",

        "Accept":
            "application/json",

        "X-API-KEY":
            SMS_API_KEY

    }


    # =================================================
    # SMS 1 - YEGANEH
    # =================================================

    yeganeh_data = {

        "lineNumber":
            SMS_LINE_NUMBER,

        "MessageText":
            YEGANEH_MESSAGE,

        "Mobiles": [
            YEGANEH_MOBILE
        ]

    }


    yeganeh_response = None


    try:

        yeganeh_response = requests.post(

            SMS_API_URL,

            headers=headers,

            json=yeganeh_data,

            timeout=15

        )

        print(
            "YEGANEH SMS STATUS:",
            yeganeh_response.status_code
        )

        print(
            "YEGANEH SMS RESPONSE:",
            yeganeh_response.text
        )

    except Exception as error:

        print(
            "YEGANEH SMS ERROR:",
            error
        )


    # =================================================
    # SMS 2 - OWNER
    # =================================================

    owner_data = {

        "lineNumber":
            SMS_LINE_NUMBER,

        "MessageText":
            OWNER_MESSAGE,

        "Mobiles": [
            OWNER_MOBILE
        ]

    }


    owner_response = None


    try:

        owner_response = requests.post(

            SMS_API_URL,

            headers=headers,

            json=owner_data,

            timeout=15

        )

        print(
            "OWNER SMS STATUS:",
            owner_response.status_code
        )

        print(
            "OWNER SMS RESPONSE:",
            owner_response.text
        )

    except Exception as error:

        print(
            "OWNER SMS ERROR:",
            error
        )


    print("==============================")
    print()


    # =================================================
    # RESPONSE
    # =================================================

    return {

        "success": True,

        "message":
            "Page open SMS process completed",

        "yeganeh": {

            "mobile":
                YEGANEH_MOBILE,

            "status_code":
                (
                    yeganeh_response.status_code
                    if yeganeh_response
                    else None
                )

        },

        "owner": {

            "mobile":
                OWNER_MOBILE,

            "status_code":
                (
                    owner_response.status_code
                    if owner_response
                    else None
                )

        }

    }

# =====================================================
# FINAL CONTACT SUBMISSION
# =====================================================

@app.post("/api/final-contact")
def submit_final_contact(contact: ContactSubmission):

    print()
    print("==============================")
    print("FINAL CONTACT SUBMISSION")
    print("==============================")

    # -------------------------------------------------
    # Clean phone number
    # -------------------------------------------------

    phone = contact.phone.strip()

    # -------------------------------------------------
    # Normalize Persian / Arabic digits
    # -------------------------------------------------

    phone = (
        phone
        .replace("۰", "0")
        .replace("۱", "1")
        .replace("۲", "2")
        .replace("۳", "3")
        .replace("۴", "4")
        .replace("۵", "5")
        .replace("۶", "6")
        .replace("۷", "7")
        .replace("۸", "8")
        .replace("۹", "9")
    )

    # -------------------------------------------------
    # Normalize +98 / 0098
    # -------------------------------------------------

    if phone.startswith("+98"):
        phone = "0" + phone[3:]

    elif phone.startswith("0098"):
        phone = "0" + phone[4:]

    # -------------------------------------------------
    # Validate Iranian mobile
    # -------------------------------------------------

    if (
        len(phone) != 11
        or not phone.isdigit()
        or not phone.startswith("09")
    ):

        print(
            "FINAL CONTACT ERROR: INVALID PHONE"
        )

        return {
            "success": False,
            "message": "Invalid phone number"
        }

    # -------------------------------------------------
    # Database
    # -------------------------------------------------

    connection = get_db()

    cursor = connection.cursor()

    # -------------------------------------------------
    # Get session events
    # -------------------------------------------------

    cursor.execute(
        """
        SELECT
            event_name,
            data,
            created_at
        FROM events
        WHERE session_id = ?
        ORDER BY id ASC
        """,
        (
            contact.session_id,
        )
    )

    rows = cursor.fetchall()

    # -------------------------------------------------
    # Build journey summary
    # -------------------------------------------------

    event_names = []

    for row in rows:

        if row["event_name"] not in event_names:

            event_names.append(
                row["event_name"]
            )

    # -------------------------------------------------
    # Human readable journey
    # -------------------------------------------------

    journey_map = {

        "page_view":
            "صفحه را باز کرد",

        "start_journey_click":
            "سفر را شروع کرد",

        "authentication_shown":
            "به مرحله ورود رسید",

        "keyword_submitted":
            "کلمه عبور را وارد کرد",

        "authentication_success":
            "با کلمه «نور» وارد شد",

        "authentication_failed":
            "کلمه عبور اشتباه وارد کرد",

        "transition_started":
            "وارد مرحله گذر شد",

        "main_world_entered":
            "وارد دنیای اصلی شد",

        "cat_appearing":
            "با گربه روبه‌رو شد",

        "cat_started_walking":
            "حرکت گربه را دید",

        "cat_reached_destination":
            "گربه به مقصد رسید",

        "cat_message_shown":
            "پیام گربه را دید",

        "cat_attention_started":
            "گربه توجهش را جلب کرد",

        "cat_petted":
            "گربه را نوازش کرد",

        "cat_happy":
            "باعث خوشحالی گربه شد",

        "cat_leaving":
            "گربه را تا خروج دنبال کرد",

        "cat_left_screen":
            "گربه از صفحه خارج شد",

        "story_sequence_started":
            "داستان را شروع کرد",

        "story_sequence_finished":
            "داستان را تا پایان دید",

        "story_choices_shown":
            "انتخاب نهایی را دید",

        "final_choice_shown":
            "انتخاب نهایی برایش نمایش داده شد",

        "final_choice_made":
            "گزینه «می‌تونیم بیشتر آشنا بشیم» را انتخاب کرد",

        "final_message_shown":
            "پیام پایانی را دید",

        "final_scene_started":
            "وارد صحنه پایانی شد"

    }

    journey_lines = []

    for event_name in event_names:

        if event_name in journey_map:

            journey_lines.append(
                "✓ " +
                journey_map[event_name]
            )

    # -------------------------------------------------
    # Save contact event
    # -------------------------------------------------

    created_at = datetime.now().isoformat()

    contact_data = {

        "phone":
            phone,

        "choice":
            "yes"

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
            contact.session_id,
            "contact_submitted",
            json.dumps(
                contact_data,
                ensure_ascii=False
            ),
            created_at
        )
    )

    connection.commit()

    contact_event_id = cursor.lastrowid

    connection.close()

    # =================================================
    # SEND SMS TO OWNER
    # =================================================

    if not SMS_API_KEY:

        print(
            "FINAL SMS ERROR: SMS_API_KEY missing"
        )

        return {
            "success": False,
            "message":
                "SMS_API_KEY is not configured"
        }

    if not SMS_LINE_NUMBER:

        print(
            "FINAL SMS ERROR: SMS_LINE_NUMBER missing"
        )

        return {
            "success": False,
            "message":
                "SMS_LINE_NUMBER is not configured"
        }

    # -------------------------------------------------
    # Journey text
    # -------------------------------------------------

    if journey_lines:

        journey_text = "\n".join(
            journey_lines
        )

    else:

        journey_text = (
            "اطلاعات مسیر ثبت نشده است."
        )

    # -------------------------------------------------
    # Final SMS
    # -------------------------------------------------

    owner_final_message = f"""
🌙 سفر تا ماه — گزارش نهایی

یک نفر تا پایان مسیر رسید.

انتخاب نهایی:
می‌تونیم بیشتر آشنا بشیم 🤍

شماره تماس:
{phone}

مسیر طی‌شده:
{journey_text}

Session:
{contact.session_id}

زمان ثبت شماره:
{created_at}
""".strip()

    headers = {

        "Content-Type":
            "application/json",

        "Accept":
            "application/json",

        "X-API-KEY":
            SMS_API_KEY

    }

    owner_data = {

        "lineNumber":
            SMS_LINE_NUMBER,

        "MessageText":
            owner_final_message,

        "Mobiles": [
            OWNER_MOBILE
        ]

    }

    try:

        owner_response = requests.post(

            SMS_API_URL,

            headers=headers,

            json=owner_data,

            timeout=15

        )

        print(
            "FINAL OWNER SMS STATUS:",
            owner_response.status_code
        )

        print(
            "FINAL OWNER SMS RESPONSE:",
            owner_response.text
        )

        # -------------------------------------------------
        # Parse SMS.ir response
        # -------------------------------------------------

        try:

            sms_result = (
                owner_response.json()
            )

        except Exception:

            sms_result = {}

        sms_success = (
            owner_response.status_code == 200
            and
            sms_result.get("status") == 1
        )

        if not sms_success:

            print(
                "FINAL SMS WAS NOT ACCEPTED"
            )

            return {

                "success": False,

                "message":
                    "SMS sending failed",

                "sms_status_code":
                    owner_response.status_code,

                "sms_response":
                    sms_result

            }

    except Exception as error:

        print(
            "FINAL OWNER SMS ERROR:",
            error
        )

        return {

            "success": False,

            "message":
                "SMS request failed",

            "error":
                str(error)

        }

    # -------------------------------------------------
    # Success
    # -------------------------------------------------

    print(
        "FINAL CONTACT SAVED:",
        contact_event_id
    )

    print(
        "FINAL PHONE:",
        phone
    )

    print("==============================")
    print()

    return {

        "success": True,

        "message":
            "Final contact submitted successfully",

        "phone":
            phone,

        "event_id":
            contact_event_id

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
# FUNNEL STATISTICS - JOURNEY TO THE MOON
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

        "success": True,

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

        "success": True,

        "final_choices": {

            "yes":
                yes_count,

            "no":
                no_count,

            "total":
                yes_count +
                no_count

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

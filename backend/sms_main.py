from fastapi import FastAPI
from dotenv import load_dotenv
import os
import requests


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()


# =====================================================
# FASTAPI
# =====================================================

app = FastAPI()


# =====================================================
# SMS.ir CONFIG
# =====================================================

SMS_API_KEY = os.getenv("SMS_API_KEY")
SMS_LINE_NUMBER = os.getenv("SMS_LINE_NUMBER")

SMS_API_URL = "https://api.sms.ir/v1/send/bulk"


# =====================================================
# TEST NUMBERS
# =====================================================

YEGANEH_TEST_NUMBER = "9028671965"
OWNER_NUMBER = "9154956997"


# =====================================================
# SMS TEXTS
# =====================================================

YEGANEH_MESSAGE = """یه کلمه هست که بدون اون نمی‌تونی وارد این دنیا بشی...
چیزی که وقتی همه‌جا تاریکه، بیشتر از همیشه بهش نیاز داری 🌙
کلمه عبور، همون چیزیه که تاریکی رو کنار می‌زنه.

یه دونه ن داره :))"""


OWNER_MESSAGE = """🌙 Moon Page Alert

یک نفر همین الان وارد «سفر تا ماه» شد.

⏱️ زمان ورود: همین لحظه"""


# =====================================================
# SEND SMS
# =====================================================

def send_sms(
    mobile: str,
    message: str
):

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-KEY": SMS_API_KEY
    }


    data = {
        "lineNumber": SMS_LINE_NUMBER,
        "MessageText": message,
        "Mobiles": [mobile]
    }


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
            "raw_response": response.text
        }


    return {
        "status_code": response.status_code,
        "response": response_data
    }


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "SMS Test Server is Running"
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
# PAGE OPEN
# =====================================================

@app.post("/send-page-open-sms")
def send_page_open_sms():

    yeganeh_result = send_sms(
        YEGANEH_TEST_NUMBER,
        YEGANEH_MESSAGE
    )


    owner_result = send_sms(
        OWNER_NUMBER,
        OWNER_MESSAGE
    )


    return {

        "status": "page_open_sms_processed",

        "yeganeh": yeganeh_result,

        "owner": owner_result

    }
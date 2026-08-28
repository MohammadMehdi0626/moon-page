import http.client
import json


# =====================================================
# SMS.IR CONFIG
# =====================================================

API_KEY = "HIDDEN"

LINE_NUMBER = 30002108034816


# =====================================================
# SEND SMS
# =====================================================

def send_sms(
    receptor,
    message
):

    connection = http.client.HTTPSConnection(
        "api.sms.ir"
    )

    payload = json.dumps({

        "lineNumber":
            LINE_NUMBER,

        "messageText":
            message,

        "mobiles": [
            receptor
        ],

        "sendDateTime":
            None

    })

    headers = {

        "X-API-KEY":
            API_KEY,

        "Content-Type":
            "application/json"

    }

    connection.request(
        "POST",
        "/v1/send/bulk",
        payload,
        headers
    )

    response = connection.getresponse()

    data = response.read()

    result = data.decode(
        "utf-8"
    )

    print("\n==============================")
    print("SMS.IR RESPONSE")
    print("==============================")

    print(
        "STATUS:",
        response.status
    )

    print(
        "BODY:",
        result
    )

    print("==============================\n")

    connection.close()

    if response.status >= 400:

        raise Exception(
            f"SMS.IR Error {response.status}: {result}"
        )

    return json.loads(result)
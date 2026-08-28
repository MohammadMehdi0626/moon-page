from sms_ir import send_sms


print("شروع ارسال SMS...")


result = send_sms(
    receptor="09013640205",
    message="TEST MOON 12345"
)


print("نتیجه نهایی:")
print(result)
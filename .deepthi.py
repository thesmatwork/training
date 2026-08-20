
import random
used_number=set()
for user in range(5):
    number=random.randint(100000,999999)
    while number in used_number:
        number=random.randint(100000,999999)
    used_number.add(number)
    print("user",user+1,":",number)
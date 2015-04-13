import config;
import json, httplib;

from random import randint;

fullName = "Test User #: " + str(randint(0, 150));
fbID = str(randint(1000, 100000));
phoneNumber = str(randint(1000000000, 9999999999));

params = {
    "userFullName": fullName,
    "fbID": fbID,
    "school": "Peddie",
    "phoneNumber": phoneNumber,
    "gender": "Female",
    "grade": "Sophomore"
}

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

connection.request('POST', '/1/functions/addUser', json.dumps(params), {
    "X-Parse-Application-Id": config.appID,
    "X-Parse-REST-API-Key": config.restAPIKey,
    "Content-Type": "application/json"
});

result = json.loads(connection.getresponse().read())

import config;
import json, httplib;

params = {
    "userFullName": "test one",
    "fbID": "1111111",
    "school": "Peddie",
    "phoneNumber": "111111111",
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

print result

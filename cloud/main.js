Parse.Cloud.define("swiped", function(request, response) {
    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", request.params.facebookID);

    query.find({
        success: function(results) {
            for(var i = 0; i < results.length; i++) {
                console.log("HERE:" + results[i].users_name);
            }
            console.log(request.params.facebookID + " SIZE: " + results.length);
            response.success("YES");
        }, error: function(error) {
            response.error(error);
        }
    });
});

//Gets people who have a value for a field
function getPeopleOfYValueFromXCharacteristic(fieldName, fieldValue, array) {

    var valid = [];

    for(var i = 0; i < array.length; i++) {
        if(array[i].get(fieldName) === fieldValue) {
            valid.push(array[i]);
        }
    }

    return valid;
}

//Gets people who are this gender
function getPeopleOfGender(gender, peopleArray) {
    return getPeopleOfYValueFromXCharacteristic("users_gender", gender, peopleArray);
}

//Gets people who go to this high school
function getPeopleFromHighSchool(highschoolName, peopleArray) {
    return getPeopleOfYValueFromXCharacteristic("users_highschool", gender, peopleArray);
}

//Returns an object with only the most important information
function getImportantParts(person) {

    var result = {
        "name": person.get("users_name"),
        "highschool": person.get("users_highschool"),
        "grade": person.get("users_grade"),
        "facebookID": person.get("users_facebook_id"),
        "gender": person.get("users_gender")
    }

    return result;
}

/* PARAMETERS
 * isLocation
 *      int distance
 * isHighSchool
 *      string high school name
 * isGender
 *      string gender
 * isGrade
 *      string grade */

Parse.Cloud.define("getPeopleToSwipe", function(request, response) {
    var params = request.params;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", params.myFBID);

    query.find({
        success: function(results) {

            var me = results[0];
            var alreadySwiped = me.swipedFacebookIDs;
        
            query = new Parse.Query("PromMeUser");

            if(params.isLocation) {
                var distance = params.maxDistance;

                query.withinMiles("users_hometown_geopoint", me.get("users_hometown_geopoint"), distance);
            }

            query.find({
                success: function(results) {

                    var validPeople = [];
                    validPeople = getPeopleOfGender("Female", results);

                    for(var i = 0; i < validPeople.length; i++) {
                        validPeople[i] = getImportantParts(validPeople[i]);
                    }

                    response.success(validPeople);
                }, 
                error: function(error) {
                    console.log(error);
                    response.error(error);
                }
            });
        }, 
        error: function(error) {
            console.log(error);
            response.error(error);
        }
    });
});

Parse.Cloud.define("addUser", function(request, response) {

    Parse.Cloud.useMasterKey();

    var UserClass = Parse.Object.extend("PromMeUser");
    var user = new UserClass();

    user.set("users_name", request.params.userFullName);
    user.set("users_facebook_id", request.params.fbID);
    user.set("users_highschool", request.params.school);
    user.set("users_phone_number", request.params.phoneNumber);
    user.set("users_gender", request.params.gender);
    user.set("users_grade", request.params.grade);
    user.set("users_hometown_geopoint", request.params.currentLocation);

    user.save(null, {
        success: function(result) {
            //response.success("YES");
            response.success(user);
        }, error: function(error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("userExists", function(request, response) {

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", request.params.facebookID);

    query.find({
        success: function(results) {
            if(results.length > 0) {
                response.success("YES");
            }
            else {
                response.success("NO");
            }
        }, error: function(error) {
            response.error(error);
        }
    });
});

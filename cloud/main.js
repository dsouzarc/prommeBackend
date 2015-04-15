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

//Removes people who are not this gender
function getPeopleOfGender(gender, peopleArray) {

    for(var i = 0; i < peopleArray.length; i++) {

        if(peopleArray[i].get("users_gender") != gender) {
            peopleArray.splice(i, 1);
        }
    }

    return peopleArray;
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

Parse.Cloud.define("getPeopleToSwipe", function(request, response) {
    var params = request.params;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", params.myFBID);

    query.find({
        success: function(results) {

        console.log("SIZE: " + results[0]);
        var me = results[0];
        console.log("ME: " + me.get("users_name"));

        var alreadySwiped = me.swipedFacebookIDs;
        
        query = new Parse.Query("PromMeUser");
        query.find({
            success: function(results) {

/* PARAMETERS
 * isLocation
 *      int distance
 * isHighSchool
 *      string high school name
 * isGender
 *      string gender
 * isGrade
 *      string grade */

                var validPeople = [];

                console.log("BEFORE: " + results.length);
                results = getPeopleOfGender("Female", results);
                for(var i = 0; i < results.length; i++) {

                    if(results[i].get("users_gender") != "Female") {
                        console.log("Removing...");
                        results[i] = "NULL";
                    }
                    else {
                        validPeople.push({"name": results[i].get("users_name"), "gender": results[i].get("users_gender")});
                    }
                }

                console.log("SIZE: " + results.length);
                response.success(validPeople);
        }, error: function(error) {
            console.log(error);
            response.error(error);
        }
        });
    }, error: function(error) {
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

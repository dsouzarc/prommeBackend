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

Parse.Cloud.define("findUserBasedOnSchoolGender", function(request, response) {

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", request.params.myFBID);

    query.find().then(function(result) {

        var alreadySwiped = result.swipedFacebookIDs;
        
        query = new Parse.Query("PromMeUser");
        query.find({
            success: function(results) {

                var validPeople = [];

                console.log("Reslults");

                for(var i = 0; i < results.length; i++) {

                    if(results[i].get("users_gender") == "Male") {
                        console.log("Here: " + results[i].get("users_name"));
                        var person = {
                            "name": results[i].get("users_name"),
                            "gender": results[i].get("users_gender"),
                            "pic_one": results[i].get("profile_picture_one")
                        };
                        validPeople.push(person);
                    }
                }
                console.log("SIZE: " + validPeople.length);

                response.success(validPeople);
        }, error: function(error) {
            console.log(error);
            response.error(error);
        }
        });
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

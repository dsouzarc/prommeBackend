function getUserPointer(objectID) {
    var pointer = {
        "__type": "Pointer", 
        "className": "PromMeUser",
        "objectId": objectID
    };
    return pointer;
}

Parse.Cloud.define("swipeLeft", function(request, response) {

    var myID = request.params.myFBID;
    var noID = request.params.noFBID;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", myID);

    query.first({
        success: function(me) {

            query = new Parse.Query("PromMeUser");
            query.equalTo("users_facebook_id", noID);

            query.first({
                success: function(no) {

                    var swiped = me.relation("swiped");
                    swiped.add(no);

                    me.save();

                    response.success("YES");
                }, error: function(error) {
                    response.error(error);
                }
            });
        }, error: function(error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("swipeRight", function(request, response) {

    var myID = request.params.myFBID;
    var yesID = request.params.yesFBID;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", myID);

    query.first({
        success: function(me) {

            query = new Parse.Query("PromMeUser");
            query.equalTo("users_facebook_id", yesID);

            query.first({
                success: function(otherPerson) {

                    var swiped = me.relation("swiped");
                    swiped.add(otherPerson);
                    
                    var yesTo = me.relation("saidYesTo");
                    yesTo.add(otherPerson);

                    me.save();

                    var gotSaidYesTo = otherPerson.relation("gotSaidYesToBy");
                    gotSaidYesTo.add(me);

                    otherPerson.save();

                    var otherPersonSaidYesTo = otherPerson.relation("saidYesTo");
                    query = otherPersonSaidYesTo.query();
                    query.equalTo("users_facebook_id", myID);
                    query.find({
                        success: function(matches) {

                            if(matches.length >= 0) {
                                var matchedWith = me.relation("matchedWith");
                                matchedWith.add(otherPerson);
                                me.save();
                                
                                matchedWith = otherPerson.relation("matchedWith");
                                matchedWith.add(me);
                                otherPerson.save();

                                //Notify both people
                                Parse.Push.send({
                                    channels: [("P" + myID)],
                                    data:{
                                        alert: "New match with " + otherPerson.get("users_name")
                                    }
                                }, {
                                    success: function() {
                                    }, error: function(error) {
                                        console.log(error);
                                    }
                                });

                                Parse.Push.send({
                                    channels: [("P" + yesID)],
                                    data:{
                                        alert: "New match with " + me.get("users_name")
                                    }
                                }, {
                                    success: function() {
                                    }, error: function(error) {
                                        console.log(error);
                                    }
                                });
                            }
                            response.success("YES");
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                }, error: function(error) {
                    response.error(error);
                }
            });
        }, 
        error: function(error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("getUserPhoto", function(request, response) {

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", request.params.facebookID);

    query.first({
        success: function(user) {

            console.log("NAME: " + user.get("users_name"));

            switch(request.params.pictureNumber) {
                case 1:
                    response.success(user.get("profile_picture_one"));
                    break;
                case 2:
                    response.success(user.get("profile_picture_two"));
                    break;
                case 3:
                    response.success(user.get("profile_picture_three"));
                    break;
                case 4:
                    response.success(user.get("profile_picture_four"));
                    break;
                case 5:
                    response.success(user.get("profile_picture_five"));
                    break;
                default:
                    response.success(user.get("profile_picture_one"));
                    break;
            }
        }, 
        error: function(error) {
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
    return getPeopleOfYValueFromXCharacteristic("users_highschool", highschoolName, peopleArray);
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

    query.first({
        success: function(me) {

            query = new Parse.Query("PromMeUser");

            //QUERY BASED ON LOCATION
            if(params.isLocation) {
                var distance = params.maxDistance;
                query.withinMiles("users_hometown_geopoint", me.get("users_hometown_geopoint"), distance);
            }

            query.find({
                success: function(results) {

                    var validPeople = [];

                    //QUERY BASED ON GENDER
                    if(params.isGender) {
                        validPeople = getPeopleOfGender(params.gender, results);
                    }

                    //QUERY BASED ON SCHOOL
                    if(params.isSchool) {
                        validPeople = getPeopleFromHighSchool(params.highschool, validPeople);
                    }

                    var alreadySwiped = me.relation("swiped").query();
                    alreadySwiped.find({

                        success: function(peopleAlreadySwiped) {
                            
                            var bestResults = [];

                            for(var i = 0; i < validPeople.length; i++) {

                                //Remove myself from the list
                                if(validPeople[i].get("users_facebook_id") != params.myFBID) {
                                    bestResults.push(getImportantParts(validPeople[i]));
                                }
                             }

                            response.success(bestResults);
                        },
                        error: function(error) {
                            response.error(error);
                        }
                    });
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

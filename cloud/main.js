Parse.Cloud.define("reportUser", function(request, reponse) {

    var myFBID = request.params.myFBID;
    var personToReportFBID = request.params.personToReportFBID;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", myFBID);

    query.first({
        success: function(me) {

            query = new Parse.Query("PromMeUser");
            query.equalTo("users_facebook_id", personToReportFBID);

            query.first({
                success: function(personToReport) {

                    //Add the person to the list of reports
                    var previousReports = personToReport.relation("reportedBy");
                    previousReports.add(me);

                    //And then essentially swipe left on them so they never appear
                    var swiped = me.relation("swiped");
                    swiped.add(personToReport);

                    //Save everything
                    me.save();
                    personToReport.save();

                    reponse.success("YES");
                }, error: function(error) {
                    response.error(error);
                }
            });
        }, error: function(error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("getMatches", function(request, response) {

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", request.params.myFBID);

    query.first({
        success: function(me) {
            query = new Parse.Query("PromMeUser");

            query.find({
                success: function(everyone) {
                    console.log("EVERYONE: " + everyone.length);
                    var matches = [];

                    for(var i = 0; i < everyone.length; i++) {
                        var person = everyone[i];

                        if(person.get("users_name") === "Ryan D'souza") {
                        }
                        else {
                        var match = {
                            "name": person.get("users_name"),
                            "highschool": person.get("users_highschool"),
                            "grade": person.get("users_grade"),
                            "fbid": person.get("users_facebook_id"),
                            "gender": person.get("users_gender"),
                            "phone": person.get("users_phone_number"),
                            "profilePhoto1": person.get("profile_picture_one")
                        };
                        matches.push(match);
                        }
                    }

                    response.success(matches);
                }, error: function(error) {
                    response.error(error);
                }
            });
        }, error: function(error) {
            response.error(error);
        }
    });
});

            

Parse.Cloud.define("getMatches1", function(request, response) {

    var myFBID = request.params.myFBID;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", myFBID);

    query.first({
        success: function(me) {

            query = me.relation("matchedWith").query();

            query.find({
                success: function(results) {

                    var matches = [];
                    console.log("MATCHES: " + matches.length);

                    for(var i = 0; i < results.length; i++) {
                        var person = results[i];
                        var match = {
                            "name": person.get("users_name"),
                            "highschool": person.get("users_highschool"),
                            "grade": person.get("users_grade"),
                            "fbid": person.get("users_facebook_id"),
                            "gender": person.get("users_gender"),
                            "phone": person.get("users_phone_number"),
                            "profilePhoto1": person.get("profile_picture_one")
                        };

                        matches.push(match);
                    }

                    response.success(matches);
                }, error: function(error) {
                    response.error(error);
                }
            });
        }, error: function(error) {
            response.error(error);
        }
    });
});

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

console.log("MY ID: " + myID);
    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", myID);

    query.first({
        success: function(me) {

            query = new Parse.Query("PromMeUser");
            query.equalTo("users_facebook_id", yesID);

            query.first({
                success: function(otherPerson) {
                    
                    console.log("OTHER PERSON: " + otherPerson.get("users_name"));
                    console.log("ME: " + me.get("users_name"));

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
        console.log("GENDER in for: " + array[i].get(fieldName));
        if(array[i].get(fieldName) === fieldValue) {
            console.log("Getting gender..." + array[i].get("users_name"));
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
    var myFBID = params.myFBID;

    var query = new Parse.Query("PromMeUser");
    query.equalTo("users_facebook_id", myFBID);

    query.first({
        success: function(me) {

            query = new Parse.Query("PromMeUser");

            //QUERY BASED ON LOCATION
            if(params.isLocation == 1) {
                console.log("IS LOCATION");
                var distance = params.maxDistance;
                query.withinMiles("users_hometown_geopoint", me.get("users_hometown_geopoint"), distance);
            }

            query.find({
                success: function(results) {

                    var validPeople = results; //[];


                    //QUERY BASED ON GENDER
                    if(params.isGender == 1) {
                        console.log("IS GENDER");

                        for(var i = 0; i < results.length; i++) {
                            console.log("RESULTS: " + results[i].get("users_name"));
                        }

                        //validPeople = getPeopleOfGender(params.gender, results);
                        console.log(params.gender);
                    }

                    //QUERY BASED ON SCHOOL
                    if(params.isSchool == 1) {
                        console.log("BASED ON SCHOOL");
                        //validPeople = getPeopleFromHighSchool(params.highschool, validPeople);
                    }

                    var alreadySwiped = me.relation("swiped").query();
                    alreadySwiped.find({

                        success: function(peopleAlreadySwiped) {

                            var bestResults = [];

                            if(peopleAlreadySwiped.length == 0 || 3 == 3) {
                                console.log("DOWN HERE");
                                
                                for(var i = 0; i < validPeople.length; i++) {
                            
                                    if(validPeople[i].get("users_name") === me.get("users_name")) {
                                    }
                                    else {
                                        bestResults.push(getImportantParts(validPeople[i]));
                                        console.log("VALID PERSON: " + validPeople[i].get("users_name"));
                                     }
                                }
                                response.success(bestResults);
                                return;
                            }

                            for(var i = 0; i < validPeople.length; i++) {

                                var shouldBeAdded = true;

                                for(var y = 0; y < peopleAlreadySwiped.length; y++) {
                                    console.log("Already swiped: " + peopleAlreadySwiped[y].get("users_name"));
                                    if(peopleAlreadySwiped[y].get("users_facebook_id") == myFBID) {
                                        shouldBeAdded = false;
                                        y = peopleAlreadySwiped.length;
                                    }
                                }

                                //Remove myself from the list
                                if(validPeople[i].get("users_facebook_id") != params.myFBID) {
                                    shouldBeAdded = false;
                                }

                                if(shouldBeAdded) {
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

    query.first({
        success: function(me) {

            //Check to see if the person has too many violations
            var reports = me.relation("reportedBy").query();
            query.find({
                success: function(allReports) {

                    //If more than 10 reports, don't let them login
                    if(allReports.length > 10) {
                        response.success("VIOLATION");
                    }

                    else {
                        response.success("YES");
                    }
                    return;
                }, error: function(error) {
                    console.log(error);
                    response.success("YES");
                }
            });
        }, error: function(error) {
            response.success("NO");
        }
    });
});

Parse.Cloud.define("addUser", function(request, response) {

    var UserClass = Parse.Object.extend("PromMeUser");
    var user = new UserClass();

    user.set("userName", request.params.userName);
    user.set("facebookID", request.params.fbID);
    user.set("userID", request.params.userID);

    user.save(null, {
        success: function(result) {
            response.success("YES");
        }, error: function(error) {
            console.log(error);
            response.error(error);
        }
    });
});

Parse.Cloud.define("userExists", function(request, response) {

    var query = new Parse.Query("PromMeUser");
    query.equalTo("facebookID", request.params.facebookID);

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

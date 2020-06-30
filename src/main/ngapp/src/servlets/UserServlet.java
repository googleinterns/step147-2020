package com.google.sps.servlets;

import javax.servlet.http.HttpServlet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;

/** Servlet that holds the users on this WebApp */
@WebServlet("/user")

public class UserServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }

        String userID = decodedToken.getUid();

        Query<Entity> query = Query.newEntityQueryBuilder()
            .setKind("user")
            .setFilter(PropertyFilter.eq(userID))
            .build();
        
        // this should be one user in the query since I specifically
        // specified by the userID which is unique
        PreparedQuery user = database.prepare(query);

        response.setContentType("application/json");
        response.getWriter.println(convertToJsonUsingGson(user));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            String userID = decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }
        
        String jsonString = IOUtils.toString(request.getInputStream());
        User userInput = new Gson().fromJson(jsonString, User.class);

        Entity newUser = new Entity("user");
        newUser.setProperty("user-id", userInput.userID);
        newUser.setProperty("name", userInput.name);
        newUser.setProperty("email", userInput.email);
        newUser.setProperty("preferred-language", userInput.preferredLanguage);

        database.put(convertToJsonUsingGson(newUser));
    }

    private String convertToJsonUsingGson(Object list) {
        Gson gson = new Gson();
        String json = gson.toJson(list);
        return json;
    }
}
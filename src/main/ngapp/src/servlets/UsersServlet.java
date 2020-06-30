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
@WebServlet("/users")

public class UsersServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            String userID = decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }
        
        Query query = new Query("user").addSort("user-id", SortDirection.ASCENDING);
        PreparedQuery results = datastore.prepare(query);

        ArrayList<String> users = new ArrayList<String>();
        for (Entity user : results.asIterable()) {
            users.add(user);
        }

        response.setContentType("application.json");
        response.getWriter().println(users);
}
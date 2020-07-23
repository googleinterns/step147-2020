// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseToken;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.FileInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.util.List;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.auth.FirebaseAuthException;
import java.io.*;

/* Servlet that takes an idToken, and then calls firebase to decode it and provide a uid if the token is valid. */
@WebServlet("/idTokenVerification")
public class FirebaseAuthVerification extends HttpServlet {

    FirebaseToken decodedToken;
    FirebaseToken decodedUseridToken;   
    
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException  {

        InputStream serviceAccount = FirebaseAuthVerification.class.getResourceAsStream("/firebaseServiceAccount.json");

        FirebaseOptions options = new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .setDatabaseUrl("https://team147-step2020.firebaseio.com")
            .build();

        // Instantiate an instance of the firenase a
        FirebaseApp firebaseApp = null;
        List<FirebaseApp> firebaseApps = FirebaseApp.getApps();
        if(firebaseApps!=null && !firebaseApps.isEmpty()){
            for(FirebaseApp app : firebaseApps){
                if(app.getName().equals(FirebaseApp.DEFAULT_APP_NAME))
                    firebaseApp = app;
                }
            }
        else {
            firebaseApp = FirebaseApp.initializeApp(options);   
        }

        System.out.println("\n\n\n\n\n" + firebaseApp + "\n\n\n\n");
       
        // idToken comes from the Frontend.
        String idToken = request.getHeader("X-token");
        
        System.out.println("\n\n\n\n\n" + idToken + "\n\n\n\n");

        try {
            decodedUseridToken = verifyIdTokenCheckRevoked(idToken, request);
        } catch (FirebaseAuthException e) {
            System.out.println(e.getMessage());
        }

        String uid = decodedUseridToken.getUid();
        Gson gson = new Gson();

        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(uid));

    }

  public FirebaseToken verifyIdTokenCheckRevoked(String idToken, HttpServletRequest request) throws FirebaseAuthException {
    try {
        decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
    } catch (FirebaseAuthException e) {
        System.out.println(e);
    }
    return decodedToken;
  }

}
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

import com.google.sps.servlets.FirebaseAppInit;

/* Servlet that takes an idToken, and then calls firebase to decode it and provide a uid if the token is valid. */
@WebServlet("/idTokenVerification")
public class FirebaseAuthVerification extends HttpServlet {

    FirebaseToken decodedUseridToken;   
    
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException  {

        FirebaseAppInit firebaseAppInit = new FirebaseAppInit();
        FirebaseApp firebaseApp = firebaseAppInit.initializeFirebaseApp();

        System.out.println("fbapp instance in FirebaseAuthVerif\n\n\n\n\n" + firebaseApp + "\n\n\n\n");
       
        // idToken comes from the Frontend.
        String idToken = request.getHeader("X-token");
        
        System.out.println("\n\n\n idToken in fbauthverification" + idToken + "\n\n\n");

        //FirebaseToken decodedUseridToken = null;   
        try {
            decodedUseridToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            System.out.println(e.getMessage());
        }

        String uid = decodedUseridToken.getUid();
        Gson gson = new Gson();

        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(uid));

    }
}
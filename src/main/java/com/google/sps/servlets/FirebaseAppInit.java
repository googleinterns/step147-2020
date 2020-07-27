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

public class FirebaseAppInit {

    private String jsonFilePath = "/firebaseServiceAccount.json";

    public FirebaseApp initializeFirebaseApp() throws IOException {

        InputStream serviceAccount = FirebaseAppInit.class.getResourceAsStream(jsonFilePath);

        System.out.println("\n\n\n service account: " + serviceAccount + "\n\n\n");

        FirebaseOptions options = new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .setDatabaseUrl("https://team147-step2020.firebaseio.com")
            .build();

        // Instantiate an instance of the firebase app.
        FirebaseApp firebaseApp = null;
        List<FirebaseApp> firebaseApps = FirebaseApp.getApps();
        if(firebaseApps!=null && !firebaseApps.isEmpty()){
            for(FirebaseApp app : firebaseApps)
                if(app.getName().equals(FirebaseApp.DEFAULT_APP_NAME)) firebaseApp = app;       
            }
        else {
            firebaseApp = FirebaseApp.initializeApp(options);   
        }

        return firebaseApp;
    }
}
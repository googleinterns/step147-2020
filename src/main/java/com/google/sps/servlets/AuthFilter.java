// Copyright 2017 Google Inc.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//    http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import javax.servlet.FilterChain;
import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.ServletException;
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
import com.google.sps.servlets.MutableHttpServletRequest;
import com.google.sps.servlets.FirebaseAppInit;


@WebFilter(urlPatterns= {"/chatrooms", "/user", "/users", "/getChatroom", "/messages"})
public class AuthFilter implements Filter {

    public void init(FilterConfig config) {}

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        
        FirebaseAppInit firebaseAppInit = new FirebaseAppInit();
        FirebaseApp firebaseApp = firebaseAppInit.initializeFirebaseApp();

        HttpServletRequest req = (HttpServletRequest) request;

        System.out.println("\n\n\n fbapp instance in authfilter: " + firebaseApp + "\n\n\n");

        // idToken comes from the Frontend as a parameter.
        String idToken = req.getHeader("X-token");

        System.out.println("\n\n\n this is idtoken: " + idToken + "\n\n\n");

        FirebaseToken decodedUseridToken = null;
        try {
            decodedUseridToken = FirebaseAuth.getInstance().verifyIdToken(idToken);;
        } catch (FirebaseAuthException e) {
            System.out.println(e.getMessage());
        }

        String uid = decodedUseridToken.getUid();

        MutableHttpServletRequest mutableRequest = new MutableHttpServletRequest(req);

        mutableRequest.putHeader("userId", uid);
        chain.doFilter(mutableRequest, response);
        System.out.println("\n\n\n we reached here in AuthFilter\n\n\n");
        System.out.println("\n\n\n uid from authfilter" + uid + "\n\n\n");
    }
}
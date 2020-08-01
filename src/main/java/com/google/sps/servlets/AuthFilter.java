// Copyright 2019 Google Inc.

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
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.gson.Gson;
import com.google.sps.servlets.MutableHttpServletRequest;
import com.google.sps.servlets.FirebaseAppInit;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;
import javax.servlet.FilterChain;
import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;

@WebFilter(urlPatterns= {"/chatrooms", "/user", "/users", "/getChatroom", "/messages"})
public class AuthFilter implements Filter {
    private FirebaseAppInit firebaseAppInit;
    private FirebaseApp firebaseApp;

    // Create an instance of FirebaseApp.
    public AuthFilter() throws IOException {
        firebaseAppInit = new FirebaseAppInit();
        firebaseApp = firebaseAppInit.initializeFirebaseApp();
    }

    public void init(FilterConfig config) throws ServletException {}

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {  
        HttpServletRequest servletRequest = (HttpServletRequest) request;
        HttpServletResponse servletResponse = (HttpServletResponse) response;
        MutableHttpServletRequest mutableRequest = new MutableHttpServletRequest(servletRequest);

        // idToken comes from the Frontend as a parameter.
        String idToken = servletRequest.getHeader("x-token");
        FirebaseToken decodedUseridToken = null;
        try {
            decodedUseridToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            System.out.println(e.getMessage());
        }

        // Attach uid to header if it is not null, else send 401 error message to user.
        String uid = decodedUseridToken.getUid();
        if(uid != null) {
            mutableRequest.putHeader("userId", uid);
            chain.doFilter(mutableRequest, response);
        } else {
            servletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "invalid authenitication credentials");
        }
    }
}
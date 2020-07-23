import javax.servlet.FilterChain;
import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.ServletException;
import java.io.IOException;
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

@WebFilter(urlPatterns= {"/user", "/users", "/getChatroom", "messages"})
public class AuthFilter implements Filter {

    private FirebaseToken decodedToken;
    private FirebaseToken decodedUseridToken;

    public void init(FilterConfig config) {}

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        
        FileInputStream serviceAccount = new FileInputStream("/home/dez/step/step147-2020/src/main/webapp/WEB-INF/node.json");

        FirebaseOptions options = new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .setDatabaseUrl("https://team147-step2020.firebaseio.com")
            .build();

        // Instantiate an instance of the firebase
        FirebaseApp firebaseApp = null;
        List<FirebaseApp> firebaseApps = FirebaseApp.getApps();
        if (firebaseApps != null && !(firebaseApps.isEmpty())) {
            for (FirebaseApp app : firebaseApps) {
                if (app.getName().equals(FirebaseApp.DEFAULT_APP_NAME)) {
                    firebaseApp = app;
                }
            }
        } else {
            firebaseApp = FirebaseApp.initializeApp(options);   
        }

        System.out.println("\n\n\n\n\n" + firebaseApp + "\n\n\n\n");

        // idToken comes from the Frontend as a parameter.
        String idToken = request.getParameter("auth-token");

        System.out.println("\n\n\n\n\n" + idToken + "\n\n\n\n");

        try {
            decodedUseridToken = FirebaseAuth.getInstance().verifyIdToken(idToken);;
        } catch (FirebaseAuthException e) {
            System.out.println(e.getMessage());
        }

        String uid = decodedUseridToken.getUid();
        Gson gson = new Gson();

        HttpServletRequest req = (HttpServletRequest) request;
        MutableHttpServletRequest mutableRequest = new MutableHttpServletRequest(req);

        mutableRequest.putHeader("userId", uid);
        chain.doFilter(mutableRequest, response);

        System.out.println(uid);
    }
}
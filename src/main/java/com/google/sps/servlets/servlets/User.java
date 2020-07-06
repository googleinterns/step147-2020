public class User {
    String userId;
    String name;
    String email;
    String language;

    public User(String userID, String name, String email, String preferredLanguage) {
        this.userId = userID;
        this.name = name;
        this.email = email;
        this.langauge = preferredLanguage;
    }

    public String userID() {
        return userId;
    }

    public String name() {
        return name;
    }

    public String email() {
        return email;
    }

    public String preferredLanguage() {
        return preferredLanguage;
    }
}
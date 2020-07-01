public class User {
    private userID;
    private name;
    private email;
    private preferredLanguage;

    public User(String userID, String name, String email, String preferredLanguage) {
        this.userID = userID;
        this.name = name;
        this.email = email;
        this.preferredLanguage = preferredLanguage;
    }

    public String userID() {
        return userID;
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
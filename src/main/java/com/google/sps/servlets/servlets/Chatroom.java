public class Chatroom{
    String chatroomId;
    String[] users;

    public Chatroom(String newChatroomId, String user1, String User2){
        this.chatroomId = newChatroomId;
        this.users.push(user1);
        this.users.push(user2);
    }
}
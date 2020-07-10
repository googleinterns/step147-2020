export interface Message{
    messageId: string;
    chatroomId: string;
    text: string;
    translatedText: string;
    senderId: string;
    recipientId: string;
    timestamp: number;
}
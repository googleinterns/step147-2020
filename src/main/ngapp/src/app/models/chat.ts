import { Message } from './message';

export interface Chat {
    userId: string,
    name: string,
    chatroomId: string,
    messages: Message[],
    unread: number
}
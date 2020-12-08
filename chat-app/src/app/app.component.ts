import { Component } from '@angular/core';
// import { StreamChat, ChannelData, Message, User } from 'stream-chat';
// import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-chat';
  channel: any;
  email = '';
  messages: any[] = [];
  newMessage = '';
  channelList: any[] = [];
  chatClient: any;
  currentUser: any = {};

  sendMessage() { }
  joinChat() { }
}

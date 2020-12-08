import { Component, OnInit, OnDestroy, QueryList, ElementRef, ViewChild, ViewChildren, AfterContentInit, AfterViewInit } from '@angular/core';
import { UserService } from '../user.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  channelList: any[] = [];
  chatClient: any;
  currentUser: any = {};
  moment = moment;
  apiUrl = environment.API;
  private subscriptions: Subscription[] = [];
  private itemContainer: any;
  private scrollContainer: any;
  private isNearBottom = true;
  @ViewChild('scrollframe', { static: false }) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getLoggedInUser();
    this.userService.setupSocket();

    const channelSubscriptions = this.userService.channels$.subscribe(data => {
      this.channelList = data.filter(user => user._id !== this.currentUser._id);
      if (!this.chatClient) {
        this.chatClient = this.channelList[0];
        this.chatHistory();
      }
      this.setIsOnline();

    });
    this.subscriptions.push(channelSubscriptions);
    const typeSubscriptions = this.userService.typing$.subscribe(data => {
      this.setTyping(data.senderId, true);
      setTimeout(() => {
        this.setTyping(data.senderId, false);
      }, 10000);
    });
    this.subscriptions.push(typeSubscriptions);

    const historySubscriptions = this.userService.history$.subscribe(data => {
      this.messages = data;
    });
    this.subscriptions.push(historySubscriptions);

    const messageSubscriptions = this.userService.message$.subscribe(data => {
      this.messages.push(data);
    });
    this.subscriptions.push(messageSubscriptions);
    this.userService.sendOnline();
  }
  ngAfterViewInit() {
    this.scrollContainer = this.scrollFrame.nativeElement;
    this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
  }
  private setTyping(senderId, status) {
    let j = 0;
    while (j < this.channelList.length) {
      if (this.chatClient._id === senderId) {
        this.chatClient.isTyping = status;
      }
      if (this.channelList[j]._id === senderId) {
        this.channelList[j].isTyping = status;
        break;
      }
      j++;
    }
  }
  private setIsOnline() {
    let j = 0;
    while (j < this.channelList.length) {
      if (this.chatClient._id === this.channelList[j]._id) {
        this.chatClient.isOnline = this.channelList[j].isOnline;
        break;
      }
      j++;
    }
  }
  chatHistory() {
    const data = { senderId: this.currentUser._id, receiverId: this.chatClient._id };
    this.userService.chatHistory(data);
  }
  sendMessage(form) {
    if (form.valid) {
      const message = {
        senderId: this.currentUser._id,
        receiverId: this.chatClient._id,
        message: this.newMessage
      };
      this.messages.push(message);
      this.userService.sendMessage(message);
      this.newMessage = '';
    }
  }
  chooseUser(channel) {
    this.chatClient = channel;
    this.chatHistory();
    this.newMessage = '';

  }
  logout() {
    localStorage.clear();
    this.userService.disconnect();
    this.router.navigate(['/login']);
  }
  typing() {
    setTimeout(() => {
      const name = `${this.currentUser.firstname} ${this.currentUser.lastname}`;
      const data = { typingUser: name, toId: this.chatClient._id, senderId: this.currentUser._id };
      this.userService.sendTyping(data);
    }, 3000);
  }
  private onItemElementsChanged(): void {
    if (this.isNearBottom) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  private isUserNearBottom(): boolean {
    const threshold = 150;
    const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;
    return position > height - threshold;
  }

  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.userService.disconnect();
  }
}

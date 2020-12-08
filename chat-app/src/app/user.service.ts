import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Subject, Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  private socketClient;
  public message$ = new Subject<any>();
  public channels$ = new Subject<any>();
  public typing$ = new Subject<any>();
  public history$ = new Subject<any>();

  constructor(private http: HttpClient) { }
  // tslint:disable-next-line: contextual-lifecycle
  ngOnInit(): void {

  }
  register(data) {
    const fd = new FormData();
    Object.keys(data).forEach(key => {
      fd.append(key, data[key]);
    });
    return this.http.post(`${environment.API}/register`, fd, {
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError((e) => {
      const message = e.error ? e.error.message : e.statusText;
      alert(message);
      return throwError(e);
    }));
  }
  login(data) {
    return this.http.post(`${environment.API}/login`, data).pipe(catchError((e) => {
      const message = e.error ? e.error.message : e.statusText;
      alert(message);
      return throwError(e);
    }));
  }
  setupSocket() {
    this.socketClient = io(environment.API);
    this.socketClient.on('online', (data) => {
      this.channels$.next(data);
    });
    this.socketClient.on('offline', (data) => {
      this.channels$.next(data);
    });
    this.socketClient.on('chat-history', (data) => {
      this.history$.next(data);
    });
    this.socketClient.on('private-typing', (data) => {
      this.typing$.next(data);
    });
    this.socketClient.on('private-message', (data) => {
      this.message$.next(data);
    });
    this.socketClient.on('chat-history', (data) => {
      this.history$.next(data);
    });
  }
  getLoggedInUser() {
    const user = localStorage.getItem('session');
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }
  sendOnline() {
    this.socketClient.emit('online', { userId: this.getLoggedInUser()._id });
  }
  sendTyping(data) {
    this.socketClient.emit('private-typing', data);

  }
  sendMessage(message) {
    this.socketClient.emit('private-message', message);
  }
  chatHistory(data) {
    this.socketClient.emit('chat-history', data);
  }
  disconnect() {
    this.socketClient.disconnect();
  }
}

import { Injectable } from '@angular/core';
import { CreateGameResponse, GetGameResponse, JoinGameResponse } from '../models/game.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class GamesServices {
  private http = inject(HttpClient);
  private gameId = localStorage.getItem('gameId') || '';
  private socket: Socket | null = null;

  createGame(): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${environment.apiUrl}games`, {});
  }

  getGame(gameId?: string): Observable<GetGameResponse> {
    return this.http.get<GetGameResponse>(`${environment.apiUrl}games/${gameId || this.gameId}`);
  }

  joinGame(joinCode: string): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(`${environment.apiUrl}games/join/${joinCode}`, {});
  }

  startGame(gameId?: string): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${environment.apiUrl}games/start/${gameId || this.gameId}`, {});
  }

  leaveGame(gameId?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}games/leave/${gameId || this.gameId}`, {});
  }

  connectWebSocket(gameId?: string): Observable<any> {
    if (!this.socket) {
      this.socket = io(`${environment.wsUrl}`);
      this.socket.emit('join', gameId || this.gameId);
    }
    return new Observable(observer => {
      this.socket!.on('gameNotify', (data: any) => {
        observer.next(data);
      });

      return () => this.socket!.disconnect();
    });
  }
  disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
  
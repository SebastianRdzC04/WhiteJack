import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetGameResponse } from '../../models/game.model';
import { inject } from '@angular/core';
import { IPlayerDeckWithPlayer } from '../../models/playerDeck.model';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PlayerDeck } from '../../components/player-deck/player-deck';
import { PlayerDeckServices } from '../../services/player-deck.service';
import { GamesServices } from '../../services/game.service';

@Component({
  selector: 'app-game',
  imports: [CommonModule, PlayerDeck],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class Game {

  private gameService = inject(GamesServices);

  minNumberOfPlayers = 2;
  maxNumberOfPlayers = 4;

  gameId = signal<string | null>(null);

  route = inject(ActivatedRoute);

  private playerDeckService = inject(PlayerDeckServices);

  private router = inject(Router);

  user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  game = signal<GetGameResponse | null>(null);

  playerDecks = signal<IPlayerDeckWithPlayer[]>([]);

  gameIsActive = computed(() => {
    return this.game() && this.game()?.data.game.is_active || false;
  })

  readyToRestart = computed(() => {
    return this.game() && this.game()?.data.game.winner !== null || false;
  })

  playerDeck = computed(() => {
    if (!this.user || !this.playerDecks()) return null;
    return this.playerDecks().find(deck => deck.playerId === this.user.id) || null;
  });

  isOwner = computed(() => {
    return this.game()?.data.isOwner || false;
  });

  isYourTurn = computed(() => {
    return this.game()?.data.isYourTurn || false;
  });

  winner = computed(() => {
    return this.game()?.data.game.winner || null;
  })

  allplayersReady = computed(() => {
    return this.playerDecks().every(deck => deck.isReady) || false;
  });

  joinCode = computed(() => {
    return this.game()?.data.game.joinCode || '';
  });

  numberOfPlayers = computed(() => {
    return this.game()?.data.game.playersCount || 0;
  });

  numberTurn = computed(() => {
    return this.game()?.data.game.turn || -1;
  });

  timeToBlackJack = computed(() => {
    return this.game()?.data.timeToBlackJack || false;
  });

  totalValue = computed(() => {
    return this.playerDeck()?.totalValue || 0;
  });

  isFinished = computed(() => {
    return this.game()?.data.game.isFinished || false;
  });

  turnPlayer = computed(() => {
    console.log('Turn player:', this.game()?.data.turnPlayer);
    return this.game()?.data.turnPlayer || null;
  });



  constructor() {
    this.gameId.set(this.route.snapshot.paramMap.get('gameId'));
    effect(() => {
      this.gameService.getGame(this.gameId()!).subscribe((game) => {
        this.game.set(game);
        this.playerDecks.set(game.data.playersDecks);
        this.isGameFinished();
      });
    });

    this.gameService.connectWebSocket(this.gameId()!).subscribe({
      next: (data) => {
        this.gameService.getGame(this.gameId()!).subscribe((game) => {
          this.game.set(game);
          this.playerDecks.set(game.data.playersDecks);
          console.log('Game updated from WebSocket:', game);
          console.log('Player decks from WebSocket:', this.playerDecks());
          this.isGameFinished();
        })
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      }
    })
    effect(() => {
    if (this.isYourTurn() && this.playerDeck()?.totalValue! > 22) {
      this.terminarTurno();
    }
    });



  }

  ngOnDestroy() {
    console.log('Game component destroyed, disconnecting WebSocket');
    this.gameService.disconnectWebSocket();
  }

  restartGame() {

    if (!this.game() || !this.isOwner()) {
      return;
    }

    if (!this.readyToRestart()) {
      return;
    }

    this.playerDeckService.restartGame(this.gameId()!).subscribe({
      next: (response) => {
        // Update game state if necessary
      },
      error: (error) => {
        console.error('Error restarting game:', error);
      }
    });
  }


  playerReady() {
    if (!this.game() || !this.playerDeck()) return;

    this.playerDeckService.setPlayerReady(this.gameId()!).subscribe({
      next: (response) => {
        this.playerDecks.set(this.playerDecks().map(deck => 
          deck.playerId === this.user?.id ? {...deck, isReady: true} : deck
        ));
      },
      error: (error) => {
        console.error('Error setting player ready:', error);
      }
    });

  }

  startGame() {
    this.gameService.startGame(this.gameId()!).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Error starting game:', error);
      }
    })
  }

  pedirCarta() {
    if (!this.game() || !this.playerDeck()) return;

    if (!this.isYourTurn()) {
      return;
    }



    this.playerDeckService.pedirCarta(this.gameId()!).subscribe({
      next: (response) => {
        // Update player deck with the new card
      },
      error: (error) => {
        console.error('Error requesting card:', error);
      }
    });
  }

  terminarTurno() {
    if (!this.game() || !this.playerDeck()) return;

    if (!this.isYourTurn()) {
      return;
    }

    this.playerDeckService.terminarTurno(this.gameId()!).subscribe({
      next: (response) => {
        // Update game state if necessary
      },
      error: (error) => {
        console.error('Error ending turn:', error);
      }
    });
  }

  setBlackJack() {
    if (!this.game() || !this.playerDeck()) return;

    if (!this.timeToBlackJack()) {
      return;
    }
    if (this.playerDeck()?.totalValue !== 21) {
      return;
    }

    this.playerDeckService.blackJack(this.gameId()!).subscribe({
      next: (response) => {
        // Update game state if necessary
      },
      error: (error) => {
        console.error('Error declaring BlackJack:', error);
      }
    });
  }

  leaveGame() {
    if (!this.game()) return;

    this.gameService.leaveGame(this.gameId()!).subscribe({
      next: (response) => {
        localStorage.removeItem('gameId');
        this.router.navigate(['/']);  // Redirect to home or another page
        // Optionally, redirect or update state after leaving the game
      },
      error: (error) => {
        console.error('Error leaving game:', error);
      }
    });
  }

  isGameFinished() {
    if (!this.game()) return false;
    if (this.isFinished()) {
      localStorage.removeItem('gameId');
      this.router.navigate(['/']);
      return true;
    }
    return false;
  }



}

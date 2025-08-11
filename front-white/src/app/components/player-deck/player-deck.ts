import { Component, input } from '@angular/core';
import { Deck } from '../deck/deck';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';
import { IUser } from '../../models/user.model';
import { IPlayerDeckWithPlayer } from '../../models/playerDeck.model';
import { ICard } from '../../models/card.model';



@Component({
  selector: 'app-player-deck',
  imports: [CommonModule, Deck],
  templateUrl: './player-deck.html',
  styleUrl: './player-deck.css'
})
export class PlayerDeck {

  // isSelected input se usa para resaltar el nombre del jugador si es true
  isSelected = input<boolean>(false);

  isPlayerDeck = input<boolean>(false);

  playerDeck = input<IPlayerDeckWithPlayer>();
  cards = computed(() => this.playerDeck()?.deck);
  player = computed(() => this.playerDeck()?.player as IUser);

  hasAnonymousCards = computed(() => {
    return this.cards()?.some((card: ICard) => card.value === 0);
  });

  ngOnInit() {
  }


}
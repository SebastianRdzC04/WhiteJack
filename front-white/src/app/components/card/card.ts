import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { ICard } from '../../models/card.model';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {
  card = input<ICard>();

  cardRank = computed(() => this.card()?.rank);

  private suitSymbolMap: Record<string, string> = {
    Hearts: '♥',
    Diamonds: '♦',
    Clubs: '♣',
    Spades: '♠'
  };

  cardSuit = computed(() => {
    const suit = this.card()?.suit;
    return suit ? this.suitSymbolMap[suit] ?? suit : '';
  });

  cardValue = computed(() => this.card()?.value);

  cardColor = computed(() => {
    const symbol = this.cardSuit();
    return symbol === '♥' || symbol === '♦' ? 'red' : 'black';
  });
}
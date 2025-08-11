import { TestBed } from '@angular/core/testing';

import { PlayerDeckService } from './player-deck.service';

describe('PlayerDeckService', () => {
  let service: PlayerDeckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerDeckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

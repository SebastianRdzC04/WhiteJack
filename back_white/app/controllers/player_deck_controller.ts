import type { HttpContext } from '@adonisjs/core/http'
import { Game } from '../models-mongo/game.js';
import { PlayerDeck } from '../models-mongo/player_deck.js';
import { Card } from '../models-mongo/card.js';
import { io } from '#start/socket';

export default class PlayerDecksController {

  async myDeck({auth, response, params}: HttpContext) {
    const user = await auth.use('api').authenticate()
    const playerDeck = await PlayerDeck.findOne({ playerId: user.id, gameId: params.id }).populate('deck');
    if (!playerDeck) {
      return response.notFound({
        message: 'Player deck not found'
      });
    }

    const playerDeckWithData = {
      ...playerDeck.toObject(),
      player: user
    }


    return response.ok({
      message: 'Player deck retrieved successfully',
      data: {
        playerDeck: playerDeckWithData,
      }
    });
  }
  
  async pedirCarta({auth, response, params}: HttpContext) {
    const user = await auth.use('api').authenticate()
    const game = await Game.findById(params.id)
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    const playerDeck = await PlayerDeck.findOne({ playerId: user.id, gameId: game._id });
    if (!playerDeck) {
      return response.notFound({
        message: 'Player deck not found or already ready'
      });
    }
    if (!game.is_active) {
      return response.badRequest({
        message: 'Game is not active'
      });
    }

    if (game.winner !== null) {
      return response.badRequest({
        message: 'Game is already finished'
      });
    }


    const gamePlayers = game.players;
    if (game.turn !== gamePlayers.indexOf(user.id)) {
      return response.badRequest({
        message: 'It is not your turn'
      });
    }
    // hacer un pop de cartas del mazo del juego y agregarlo al jugador
    const card = game.deck.pop();
    if (!card) {
      return response.badRequest({
        message: 'No more cards in the deck'
      });
    }
    playerDeck.deck.push(card);
    playerDeck.count += 1;
    const cardData = await Card.findById(card);
    if (!cardData) {
      return response.notFound({
        message: 'Card not found'
      });
    }
    playerDeck.totalValue += cardData.value ?? 0;
    if (playerDeck.totalValue > 21) {
      playerDeck.totalValue = -1;
      game.turn++;
      if (game.turn > gamePlayers.length - 1) {
        game.turn = 0; // Reset to first player
        const playersDecks = await PlayerDeck.find({ gameId: game._id });
        const totalValues = playersDecks.map(deck => deck.totalValue);
        const maxValue = Math.max(...totalValues);
        game.winner = playersDecks.find(deck => deck.totalValue === maxValue)?.playerId ?? null;
        await playerDeck.save();
        await game.save();
        io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });
        return response.ok({
          message: 'Game finished',
          data: {
            winner: game.winner,
            game: game,
            playerDeck: playerDeck,
          }
        });
      }
    }
    await playerDeck.save();
    await game.save();
    io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });
    return response.ok({
      message: 'Card drawn successfully',
      data: {
        card: cardData,
        totalValue: playerDeck.totalValue,
        count: playerDeck.count
      }
    });
  }

  async estarListo({auth, response, params}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const game = await Game.findById(params.id);
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    if (game.isFinished) {
      return response.badRequest({
        message: 'Game is already finished'
      });
    }
    const playerDeck = await PlayerDeck.findOne({ playerId: user.id, gameId: game._id });
    if (!playerDeck) {
      return response.notFound({
        message: 'Player deck not found'
      });
    }
    if (playerDeck.isReady) {
      return response.badRequest({
        message: 'Player is already ready'
      });
    }
    playerDeck.isReady = true;
    await playerDeck.save();
    io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });
    
    return response.ok({
      message: 'Player is now ready',
      data: {playerDeck: playerDeck}
    });
  }


  async terminarTurno({auth, response, params}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const game = await Game.findById(params.id);
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    if (!game.is_active) {
      return response.badRequest({
        message: 'Game is not active'
      });
    }
    const gamePlayers = game.players;
    if (game.turn !== gamePlayers.indexOf(user.id)) {
      return response.badRequest({
        message: 'It is not your turn'
      });
    }
    
    // Increment the turn
    game.turn++;


    if (game.turn > gamePlayers.length - 1) {
      game.turn = 0; // Reset to first player
      const playersDecks = await PlayerDeck.find({ gameId: game._id });
      const totalValues = playersDecks.map(deck => deck.totalValue);
      const maxValue = Math.max(...totalValues);
      game.winner = playersDecks.find(deck => deck.totalValue === maxValue)?.playerId ?? null;
      await game.save();
      io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });
      return response.ok({
        message: 'Game finished',
        data: {
          winner: game.winner,
          game: game,
          playersDecks: playersDecks.map(deck => ({
            playerId: deck.playerId,
            totalValue: deck.totalValue
          }))
        }
      });
    }


    await game.save();
    io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });
    return response.ok({
      message: 'Turn ended successfully',
      data: {
        game: {
          game: game
        }
      }
    });
  }


  async blackJack({auth, response, params}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const game = await Game.findById(params.id);
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    if (!game.is_active) {
      return response.badRequest({
        message: 'Game is not active'
      });
    }

    const playersDecks = await PlayerDeck.find({ gameId: game._id });

    const allHaveTwoCards = playersDecks.every(deck => deck.deck.length === 2);

    console.log('allHaveTwoCards:', allHaveTwoCards);
    console.log('game.turn:', game.turn);

    if (game.turn !== 0 || allHaveTwoCards === false) {
      return response.badRequest({
        message: 'Only can check the blackjack before the game starts'
      })
    }

    const playerDeck = await PlayerDeck.findOne({ playerId: user.id, gameId: game._id });
    if (!playerDeck) {
      return response.notFound({
        message: 'Player deck not found'
      });
    }

    if (playerDeck.totalValue === 21) {
      game.winner = user.id;
      await game.save();
      io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });
      return response.ok({
        message: 'Blackjack! You win!',
        data: {
          winner: user.id,
          game: game
        }
      });
    }
    return response.badRequest({
      message: 'You do not have a blackjack'
    });
  }
}
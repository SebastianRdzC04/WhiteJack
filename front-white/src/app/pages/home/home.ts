import { Component } from '@angular/core';
import { AuthServices } from '../../services/auth.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesServices } from '../../services/game.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private authService = inject(AuthServices);
  private gameService = inject(GamesServices);
  private router = inject(Router);

  joinCode = new FormControl('');

  showSeguroModal = false;
  seguro: boolean = false;

  showUnirseModal = false;
  codigoPartida: string = '';

  logout() {
    this.authService.logout();
  }

  openSeguroModal() {
    this.showSeguroModal = true;
  }

  closeSeguroModal() {
    this.showSeguroModal = false;
  }

  confirmarSeguro() {
    // Aquí puedes manejar la lógica para iniciar la partida con el seguro seleccionado
    // Por ejemplo: this.partidaService.iniciarPartida({ seguro: this.seguro });
    this.gameService.createGame().subscribe({
      next: (response) => {
        localStorage.setItem('gameId', response.data.game._id);
        this.router.navigate(['/game/' + response.data.game._id]);
      },
      error: (error) => {
        console.error('Error al crear la partida:', error);
        // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje al usuario
      }
    });

    this.closeSeguroModal();
  }

  openUnirseModal() {
    this.showUnirseModal = true;
  }

  closeUnirseModal() {
    this.showUnirseModal = false;
    this.codigoPartida = '';
  }

  confirmarUnirse() {
    
    this.gameService.joinGame(this.codigoPartida).subscribe({
      next: (response) => {
        localStorage.setItem('gameId', response.data.game._id);

        // DEBUG: Obtener el game antes de navegar
        this.gameService.getGame(response.data.game._id).subscribe({
          next: (getGameResponse) => {
            if (getGameResponse.data && getGameResponse.data.game) {
            }
            this.router.navigate(['/game/' + response.data.game._id]);
          },
          error: (err) => {
            console.error('Error al obtener el game tras unirse:', err);
            this.router.navigate(['/game/' + response.data.game._id]);
          }
        });
      }, 
      error: (error) => {
        console.error('Error al unirse a la partida:', error);
        // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje al usuario
      }
    })
    this.closeUnirseModal();
  }

}

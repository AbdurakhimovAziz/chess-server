import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { LobbyManagerService } from './lobby/lobby-manager.service';

@Module({ providers: [GameGateway, LobbyManagerService] })
export class GameModule {}

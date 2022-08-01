import { Module } from '@nestjs/common';
import { GameGateway } from './app.gateway';
import { LobbyManagerService } from './lobby/lobby-manager.service';

@Module({ providers: [GameGateway, LobbyManagerService] })
export class GameModule {}

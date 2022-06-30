import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });
  const PORT: string | number = process.env.PORT || 5000;
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();

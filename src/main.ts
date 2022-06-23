import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT: string | number = process.env.PORT || 5000;
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();

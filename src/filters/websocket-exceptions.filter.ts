import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Events } from 'src/utils/constants';

@Catch()
export class WebsocketExceptionsFilter<T> implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as WebSocket;
    const error = exception.getError();
    const details = error instanceof Object ? { ...error } : { message: error };

    client.send(
      JSON.stringify({
        event: Events.ERROR,
        data: {
          ...details,
        },
      }),
    );
  }
}

import { Context } from "koa";
import winston, { transports, format } from "winston"; 

const logger = () => {
  winston.configure({
    level: process.env.NODE_ENV === 'development' ? "debug" : "info",
    transports: [
      new transports.File({
        filename: 'errors.log',
        level: 'error'
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(), format.simple()
        )
      })
    ]
  });

  return async(ctx: Context, next: () => Promise<any>): Promise<void> => {
    const startTime = new Date().getTime();
    await next();
    const ms = new Date().getTime() - startTime;

    let level:string;

    if(ctx.status >= 500)
      level = 'error';
    else if(ctx.status >= 400)
      level = 'warn';
    else
      level = 'info';
    
    const message = `${ctx.method}: ${ctx.originalUrl} ${ctx.status} ${ms}ms`;

    winston.log(level, message);

  };
};

export { logger };
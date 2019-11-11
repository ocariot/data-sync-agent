import fs from 'fs'
import { injectable } from 'inversify'
import { Default } from './default'
import { createLogger, format, Logger, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

@injectable()
export class CustomLogger implements ILogger {
    private readonly _logger: Logger
    private readonly _logDir = process.env.LOG_DIR || Default.LOG_DIR
    private readonly _moduleName: string
    private _options: any = {}

    constructor() {
        if (!fs.existsSync(this._logDir)) fs.mkdirSync(this._logDir) // create directory if it does not exist
        this.initOptions() // initialize options logger
        this._logger = this.internalCreateLogger()
        this._moduleName = 'ds.app'
    }

    private internalCreateLogger(): Logger {
        return createLogger({
            level: 'silly', // Used by transports that do not have this configuration defined
            silent: false,
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
            transports: [new transports.Console(this._options), this.createTransportDailyRotateFile()],
            exitOnError: false
        })
    }

    private initOptions(): void {
        this._options = {
            handleExceptions: true,
            format: format.combine(
                format.colorize(),
                format.splat(),
                format.timestamp(),
                format.printf(log => `${log.module} @ ${log.timestamp} ${log.level}: ${log.message}`)
            )
        }

        if ((process.env.NODE_ENV || Default.NODE_ENV) === 'test') {
            this._options.level = 'none'
            this._options.silent = true
        } else {
            this._options.level = 'debug'
            this._options.silent = false
        }
    }

    private createTransportDailyRotateFile(): any {
        return new DailyRotateFile({
            handleExceptions: true,
            filename: `${this._logDir}/%DATE%-results.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '15d'
        })
    }

    public addTransport(transport: any): Logger {
        return this._logger.add(transport)
    }

    public error(message: string): void {
        this._logger.error(message, { module: this._moduleName })
    }

    public warn(message: string): void {
        this._logger.warn(message, { module: this._moduleName })
    }

    public info(message: string): void {
        this._logger.info(message, { module: this._moduleName })
    }

    public verbose(message: string): void {
        this._logger.verbose(message, { module: this._moduleName })
    }

    public debug(message: string): void {
        this._logger.debug(message, { module: this._moduleName })
    }

    public silly(message: string): void {
        this._logger.silly(message, { module: this._moduleName })
    }
}

/**
 * Logger interface.
 * logging levels are prioritized from 0 to 5 (highest to lowest):
 *   error: 0,
 *   warn: 1,
 *   info: 2,
 *   verbose: 3,
 *   debug: 4,
 *   silly: 5
 *
 * @see {@link https://github.com/winstonjs/winston#using-logging-levels} for further information.
 */
export interface ILogger {
    error(message: string): void

    warn(message: string): void

    info(message: string): void

    verbose(message: string): void

    debug(message: string): void

    silly(message: string): void

    addTransport(transport: any): Logger
}

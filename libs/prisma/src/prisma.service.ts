import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger(PrismaService.name);

    constructor() {
        const prismaSingleton =
            globalThis.prismaGlobal ??
            new PrismaClient({
                log: ['warn', 'error'],
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL,
                    },
                },
            });

        if (process.env.NODE_ENV !== 'production') {
            globalThis.prismaGlobal = prismaSingleton;
        }

        super({
            log: ['warn', 'error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
        this.logger.log('Prisma connected successfully!');
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        this.logger.log('Prisma disconnected.');
    }
}

declare global {
    var prismaGlobal: PrismaClient | undefined;
}

export default PrismaService;

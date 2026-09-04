import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  type Type,
} from '@nestjs/common';
import { CorrelationMiddleware } from './common/correlation/correlation.middleware';
import { HealthController } from './health/health.controller';
import { COMMIT_SHA } from './health/health.tokens';

/**
 * The root module (P1.08 AC-2).
 *
 * The module layout is declared and empty: one root module and one
 * per-domain-module registration point. A domain module is registered **here
 * and nowhere else** — see `src/modules/README.md`. Keeping registration in a
 * single array is what lets `architecture.md` §4.1 boundaries survive contact
 * with the DI container: a module that could be pulled in from anywhere would
 * make the `allowedDependencies` manifest describe a graph the container does
 * not actually build.
 */

/**
 * Domain modules, in registration order.
 *
 * Empty in wave 1. `architecture.md` §4 lists 23 modules; each arrives with the
 * epic that owns it, and epic P1 NG1 forbids shipping any of them here.
 */
export const DOMAIN_MODULES: Array<Type<unknown> | DynamicModule> = [];

export interface AppModuleOptions {
  /** cicd.md §3 — surfaced by the health route. */
  commitSha: string;
}

@Module({})
export class AppModule implements NestModule {
  static register(options: AppModuleOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [...DOMAIN_MODULES],
      controllers: [HealthController],
      providers: [{ provide: COMMIT_SHA, useValue: options.commitSha }],
    };
  }

  /**
   * The global request pipeline (AC-3). Correlation runs for every route,
   * including ones that will be added by later epics, because it is bound to
   * `*` rather than to a controller.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.1.0',
      commit: process.env.GIT_COMMIT ?? 'unknown',
    };
  }
}

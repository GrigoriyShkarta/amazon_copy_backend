import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Auth } from '../auth/decorators/auth.decorators';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('statistics')
export class StatisticsController {
	constructor(private readonly statisticsService: StatisticsService) {}

	@Get('main')
	@Auth()
	getMainStatistics(@CurrentUser('id') id: number) {
		return this.statisticsService.getMain(id);
	}
}

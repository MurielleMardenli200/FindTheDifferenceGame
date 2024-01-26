import { Test, TestingModule } from '@nestjs/testing';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  let service: HighScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HighScoreService],
    }).compile();

    service = module.get<HighScoreService>(HighScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

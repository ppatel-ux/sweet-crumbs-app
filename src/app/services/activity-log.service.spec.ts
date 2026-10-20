import { TestBed } from '@angular/core/testing';
import { ActivityLogService } from './activity-log.service';

describe('ActivityLogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('returns messages newest first without exposing its internal list', () => {
    const service = TestBed.inject(ActivityLogService);

    service.add('First action');
    service.add('Second action');
    const messages = service.getAll();

    expect(messages).toEqual(['Second action', 'First action']);
    messages.push('External change');
    expect(service.getAll()).toEqual(['Second action', 'First action']);
  });

  it('rejects empty messages', () => {
    const service = TestBed.inject(ActivityLogService);

    expect(() => service.add('  ')).toThrowError('Activity messages cannot be empty.');
  });
});

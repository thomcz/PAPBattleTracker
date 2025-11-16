import { TestBed } from '@angular/core/testing';

import { RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
  let service: RegisterUseCase;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterUseCase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

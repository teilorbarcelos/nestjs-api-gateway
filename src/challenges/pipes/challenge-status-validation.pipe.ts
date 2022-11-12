import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly allowedStatus = [
    ChallengeStatus.ACCEPTED,
    ChallengeStatus.DECLINED,
    ChallengeStatus.CANCELED,
  ];

  transform(value: { status: ChallengeStatus }) {
    const status = value.status.toUpperCase() as ChallengeStatus;

    if (!this.isStatusValid(status)) {
      throw new BadRequestException(`${status} não é um status válido!`);
    }

    return value;
  }

  private isStatusValid(status: ChallengeStatus) {
    const idx = this.allowedStatus.indexOf(status);
    return idx !== -1;
  }
}

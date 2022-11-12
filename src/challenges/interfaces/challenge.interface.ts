import { Player } from 'src/players/interfaces/player.interface';
import { ChallengeStatus } from './challenge-status.enum';

export interface Challenge {
  date: Date;
  status: ChallengeStatus;
  solicitationDate: Date;
  answerDate: Date;
  challenger: Player;
  category: string;
  players: Player[];
  play: string;
}

export interface Play {
  category: string;
  challenge?: string;
  players: Player[];
  def: Player;
  result: Result[];
}

export interface Result {
  set: string;
}

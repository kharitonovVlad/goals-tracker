import { DayStatusEnum } from '../enums/day-status.enum';

export interface Day {
  date: Date;
  state: DayStatusEnum;
}

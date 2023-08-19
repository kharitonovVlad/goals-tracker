import { LocalStorage } from '../local storage/localStorage';
import { Goal } from '../../interfaces/goal.interface';
import * as bootstrap from 'bootstrap';
import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';
import { DayStatusEnum } from '../../enums/day-status.enum';
import * as moment from 'moment';

function isObject(obj: unknown): obj is object {
  return typeof obj === 'object' && obj !== null;
}

function isGoal(goal: unknown): goal is Goal {
  return !!(
    isObject(goal) &&
    'title' in goal &&
    typeof goal.title === 'string' &&
    'days' in goal &&
    Array.isArray(goal.days)
  );
}

const newGoal: Goal = {
  title: '',
  days: [],
};
const createNewGoalButton = document.querySelector(
  '#createNewGoalButton'
) as HTMLButtonElement;
const goalsList = document.querySelector('#goalsList') as HTMLDivElement;
const goalTitleModal = document.querySelector(
  '#goalTitleModal'
) as HTMLDivElement;
const goalStartDayModal = document.querySelector(
  '#goalStartDayModal'
) as HTMLDivElement;
const goalTitleInput = document.querySelector(
  '#goalTitleInput'
) as HTMLInputElement;
const ls = new LocalStorage<Goal>('goals');

goalTitleModal.addEventListener('shown.bs.modal', () => {
  goalTitleInput.focus();
});
let goals: Goal[] = [];
createNewGoalButton.addEventListener('click', createNewGoal);
getAndRenderCurrentGoals();

function getAndRenderCurrentGoals(): void {
  let child = goalsList.lastElementChild;
  while (child) {
    goalsList.removeChild(child);
    child = goalsList.lastElementChild;
  }
  goals = ls.getItems().map((goal) => {
    goal.days = goal.days.map((day) => {
      day.date = new Date(day.date);
      return day;
    });
    return goal;
  });
  if (goals.length && isGoal(goals[0])) {
    goals.forEach((goal) => {
      const goalItem = document.createElement('div');
      const daysItems: { date: string; status: DayStatusEnum }[] = [];
      goal.days.forEach((day) => {
        daysItems.push({
          date: `<div>${moment(day.date).format('DD.MM.YYYY')}</div>`,
          status: day.state,
        });
      });
      let daysItemsIndex: number = 0;
      const daysItemsRows: string[] = [];
      for (let i = 0; i < 6; i++) {
        const daysItemsCells: string[] = [];
        for (let j = 0; j < 5; j++) {
          daysItemsCells.push(
            `<td class='day ${getDayStatusClass(
              daysItems[daysItemsIndex].status
            )}'>${daysItems[daysItemsIndex].date}</td>`
          );
          daysItemsIndex++;
        }
        daysItemsRows.push(
          `<tr class="days-row">${daysItemsCells.join('')}</tr>`
        );
      }
      goalItem.insertAdjacentHTML(
        'afterbegin',
        `
          <div class="card" style='width: 532px;'>
            <h5 class="card-header">${goal.title}</h5>
            <div class="card-body">
              <table>
                <tbody>
                  ${daysItemsRows.join('')}
                </tbody>
              </table>
            </div>
          </div>
        `
      );
      goalsList.appendChild(goalItem);
    });
  }
}

function getDayStatusClass(status: DayStatusEnum): string {
  if (status === DayStatusEnum.Success) {
    return 'success';
  }

  if (status === DayStatusEnum.Reject) {
    return 'reject';
  }

  return '';
}

function createNewGoal(): void {
  const onConfirmClicked = function () {
    showGoalStartDayModal.call(
      this,
      function () {
        titleModal.hide();
      },
      function () {
        titleModal.show();
      }
    );
    goalTitleModalConfirmButton.removeEventListener('click', onConfirmClicked);
  };

  const titleModal = new bootstrap.Modal(goalTitleModal);
  titleModal.show();

  const goalTitleModalConfirmButton = document.querySelector(
    '#goalTitleModalConfirmButton'
  ) as HTMLButtonElement;
  goalTitleInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    newGoal.title = target.value;
    goalTitleModalConfirmButton.disabled = !target.value.length;
  });
  goalTitleModalConfirmButton.addEventListener('click', onConfirmClicked);
}

function showGoalStartDayModal(
  hideTitleModal: () => void,
  showTitleModal: () => void
): void {
  const onConfirmClicked = function () {
    newGoal.days.push({ date: startDay, state: DayStatusEnum.NotCome });
    for (let i = 1; i < 30; i++) {
      const nextDay = new Date(newGoal.days[i - 1].date);
      nextDay.setDate(nextDay.getDate() + 1);
      newGoal.days.push({ date: nextDay, state: DayStatusEnum.NotCome });
    }
    goals.push(newGoal);
    ls.setItems(goals);
    getAndRenderCurrentGoals();
    startDayModal.hide();
    const goalStartDayDatePickerContainer = document.querySelector(
      '#goalStartDayDatePicker'
    ) as HTMLSpanElement;
    goalStartDayDatePickerContainer.innerHTML = '';

    goalCreateButton.removeEventListener('click', onConfirmClicked);
  };

  let startDay = new Date();
  const goalCreateButton = document.querySelector(
    '#goalCreateButton'
  ) as HTMLButtonElement;
  const startDayModal = new bootstrap.Modal(goalStartDayModal);
  const goalStartDayDatePicker = new AirDatepicker<HTMLInputElement>(
    '#goalStartDayDatePicker',
    {
      inline: true,
      selectedDates: [new Date()],
      onSelect: ({ date }) => {
        if (date instanceof Date) {
          startDay = date;
        }
      },
    }
  );
  startDayModal.show();
  hideTitleModal();
  goalStartDayDatePicker.show();
  goalCreateButton.addEventListener('click', onConfirmClicked);
}

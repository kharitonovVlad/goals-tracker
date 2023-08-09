import { LocalStorage } from '../local storage/localStorage';
import { Goal } from '../../interfaces/goal.interface';
import * as bootstrap from 'bootstrap';
import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';
import { DayStatusEnum } from '../../enums/day-status.enum';

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
const goalsList = document.querySelector('#goalsList') as HTMLUListElement;
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
  goals = ls.getItems();
  if (goals.length && isGoal(goals[0])) {
    goals.forEach((goal) => {
      const listItem = document.createElement('li');
      listItem.insertAdjacentHTML(
        'afterbegin',
        `
          <div>
            <span>${goal.title}</span>
          </div>
        `
      );
      goalsList.appendChild(listItem);
    });
  }
}

function createNewGoal(): void {
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
  goalTitleModalConfirmButton.addEventListener(
    'click',
    showGoalStartDayModal.bind(
      this,
      function () {
        titleModal.hide();
      },
      function () {
        titleModal.show();
      }
    )
  );
}

function showGoalStartDayModal(
  hideTitleModal: () => void,
  showTitleModal: () => void
): void {
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
  goalCreateButton.addEventListener('click', () => {
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
  });
}

import './style.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './controllers/main';

window.onload = function () {
  const app = document.querySelector('#app') as HTMLDivElement;
  app.style.display = 'block';
};

import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import '../websocket-request.js';

document.getElementById('theme').addEventListener('change', (e) => {
  // @ts-ignore
  if (e.target.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});
document.getElementById('styled').addEventListener('change', (e) => {
  // @ts-ignore
  if (e.target.checked) {
    document.body.classList.add('styled');
  } else {
    document.body.classList.remove('styled');
  }
});
document.getElementById('narrow').addEventListener('change', (e) => {
  const node = document.querySelector('websocket-request');
  // @ts-ignore
  if (e.target.checked) {
    node.setAttribute('narrow', '');
  } else {
    node.removeAttribute('narrow');
  }
});

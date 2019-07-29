/**
 * Extra Javascript for MS report
 */
function toggleDisplayButton(button) {
  let display = document.createElement('button');
  display.setAttribute('class', 'btn btn-block btn-primary btn-sm');
  display.setAttribute('onclick', 'toggleDisplayButton(this)');
  display.setAttribute('style', 'width: 80px;');
  display.innerText = 'Display';
  let hide = document.createElement('button');
  hide.setAttribute('class', 'btn btn-block btn-warning btn-sm');
  hide.setAttribute('onclick', 'toggleDisplayButton(this)');
  hide.setAttribute('style', 'width: 80px;');
  hide.innerText = 'Hide';

  let parent = button.parentNode;
  parent.removeChild(button);
  if (button.innerText === 'Display') {
    parent.appendChild(hide);
  } else {
    parent.appendChild(display);
  }
}

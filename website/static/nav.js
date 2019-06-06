/**
 * Prepends nav bar to starting of <body> element
 * 
 * Expected HTML structure to work:
 * <body>
 *   <wrapper>
 *     > html inserted here
 *   </wrapper>
 * </body>
 */

const body = document.getElementsByTagName('body')[0].firstElementChild;
const nav =
  '<nav id="sidebar">'
    + '<div class="sidebar-header">'
      + '<h3> Browse</h3>'
    + '</div>'
    + '<ul class="list-unstyled components">'
      + '<li><a href="#">Home</a></li>'
      + '<li><a href="#">Recipe Calorie Counter</a></li>'
      + '<li><a href="#">Daily Goals</a></li>'
      + '<li><a href="#">Graph Generator</a></li>'
      + '<li><a href="#">Settings</a></li>'
      + '<li><a href="#">About</a></li>'
      + '<li><a href="#">Contact</a></li>'
      + '<li><a href="#">Logout</a></li>'
    + '</ul>'
  + '</nav >'

body.insertAdjacentHTML('afterbegin', nav);

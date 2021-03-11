// Find the right method, call on correct element
export function launchIntoFullscreen(element) {
  console.log('requesting fullscreen', element);
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } catch (err) {
    console.error(err);
  }
}

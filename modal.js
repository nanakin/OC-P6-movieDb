export function createModal () {
  // Visible changes to close to modal
  function closeModal () {
    modal.style.display = 'none';
    document.getElementsByTagName('body')[0].style.overflow = 'auto';
  }
  // Get the modal
  const modal = document.getElementById('myModal');
  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName('close')[0];
  // When the user clicks on <span> (x), close the modal
  span.onclick = closeModal;
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === modal) {
      closeModal();
    }
  };
  return modal;
}

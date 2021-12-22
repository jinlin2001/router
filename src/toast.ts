declare var bootstrap: any;
const container = document.querySelector('.toast-container');

function showToast(msg: string) {
  const toast_element = document.createElement('div');
  toast_element.className =
    'toast align-items-center fw-bold text-warning bg-dark m-0 border-0 rounded-0';
  toast_element.innerHTML = `<div class="d-flex"><div class="toast-body text-break">${msg}</div><button type="button" class="btn-close btn-close-white m-auto" data-bs-dismiss="toast"></button>
  </div>`;
  container!.appendChild(toast_element);
  new bootstrap.Toast(toast_element).show();
}

export { showToast };

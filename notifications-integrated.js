export function showToast(type, message) {
    const bg = type === "success" ? "bg-success" : type === "error" ? "bg-danger" : "bg-warning";
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white ${bg} border-0 show position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
  
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
  
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

// const add_task_btn = document.querySelector(".add-task-button");
// const button_close = document.querySelector(".btn-close");
// const storage_key = "todo-list";

// function closeForm() {
//   document.querySelector(".add-task-form-overlay").style.display = "none";
//   document.getElementById("task-form").reset();
//   document.getElementById("task-title-error").textContent = "";
//   document.getElementById("task-form-error").textContent = "";
// }
// function openform() {
//   document.querySelector(".add-task-form-overlay").style.display = "flex";
// }
// function validatetitle() {
//   if (document.getElementById("task-title").value.trim() === "") {
//     document.getElementById("task-title-error").textContent =
//       "Task title is empty.";
//     document.getElementById("task-title-error").style.color = "red";
//     return false;
//   } else {
//     return;
//   }
// }
// button_close.addEventListener("click", () => {
//   closeForm();
// });
// add_task_btn.addEventListener("click", () => {
//   openform();
// });
// document
//   .getElementsByClassName("btn-submit")[0]
//   .addEventListener("click", (e) => {
//     e.preventDefault();
//     validatetitle();
//   });

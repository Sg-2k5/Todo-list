const add_task = document.querySelector("#add-task-btn");
const task_input = document.querySelector("#add-task-text");

let task = [];
let selected_category = "all"; /*default status */
//Function for timestamp
function formatTimestamp(timestamp) {
  //time stamp format
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
}
//displaying tasks that have been added
function displaytask(tasklist, category) {
  const task_main_content = document.getElementsByClassName("task-list")[0];
  let task_html = '<h2 id="task-list-title">My tasks</h2>';

  if (tasklist.length === 0) {
    const empty_message = {
      pending: "No pending tasks",
      completed: "No completed tasks",
      all: "No tasks found",
    }[category];

    task_html += `<p class="empty-message">${empty_message}</p>`;
  }
  //iterating through the array
  for (const item of tasklist) {
    const completed = item.status === "completed";
    const created_at = formatTimestamp(item.createdAt);
    // const edited_at = formatTimestamp(item.editedAt);
    const completed_at = formatTimestamp(item.completedAt);

    task_html += `
      <div class="task-item ${completed ? "completed-task" : ""}" id="${item.id}">
        <div class="task-details">
          <label>
            <input type="checkbox" ${completed ? "checked" : ""}>
            <span class="description">${item.text || ""}</span>
          </label>
          <span class="task-times">
            ${created_at ? `Created: ${created_at}` : ""}
            ${completed_at ? ` | Completed: ${completed_at}` : ""}
          </span>
        </div>
        <div class="task-actions">
          <button class="edit-task" type="button">Edit</button>
          <button class="delete-task" type="button">Delete</button>
        </div>
      </div>
    `;
  }

  task_main_content.innerHTML = task_html;

  task_main_content
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        const task_id = checkbox.closest(".task-item").id;
        const status = checkbox.checked ? "completed" : "pending";

        try {
          const response = await fetch(
            //checkbox (whether the the task is compelted or not)
            `http://localhost:3000/api/tasks/${task_id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            },
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to update task status");
          }

          const updated_tasks = await fetch("http://localhost:3000/api/tasks");
          if (!updated_tasks.ok) {
            throw new Error("Failed to reload tasks");
          }

          task = await updated_tasks.json();
          showtasks(selected_category);
        } catch (error) {
          checkbox.checked = !checkbox.checked;
          console.error(error);
        }
      });
    });

  task_main_content.querySelectorAll(".edit-task").forEach((edit_button) => {
    //edit task
    edit_button.addEventListener("click", () => {
      if (selected_category === "completed") {
        return;
      }
      const task_id = edit_button.closest(".task-item").id;
      const task_item = task.find((item) => String(item.id) === task_id);

      if (!task_item) {
        return;
      }

      const task_row = edit_button.closest(".task-item");
      const description = task_row.querySelector(".description");
      const actions = task_row.querySelector(".task-actions");
      //changing task into an input field
      description.innerHTML = `
        <input class="edit-input" type="text" >
      `;
      description.querySelector(".edit-input").value = task_item.text;
      actions.innerHTML = `
        <button class="save-task" type="button">save</button>
        <button class="cancel-edit" type="button">cancel</button>
      `;

      const edit_input = task_row.querySelector(".edit-input"); //edit input
      edit_input.focus();

      task_row
        .querySelector(".save-task")
        .addEventListener("click", async () => {
          const updated_text = edit_input.value.trim();

          if (updated_text === "") {
            return;
          }

          try {
            const response = await fetch(
              `http://localhost:3000/api/tasks/${task_id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: updated_text }),
              },
            );
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to update task");
            }

            await gettask();
          } catch (error) {
            console.error(error);
            window.alert(error.message);
          }
        });

      task_row.querySelector(".cancel-edit").addEventListener("click", () => {
        showtasks(selected_category); //edit is cancelled
      });
    });
  });

  task_main_content
    .querySelectorAll(".delete-task")
    .forEach((delete_button) => {
      /*delete operation*/
      delete_button.addEventListener("click", async () => {
        const task_id = delete_button.closest(".task-item").id;

        try {
          const response = await fetch(
            `http://localhost:3000/api/tasks/${task_id}`,
            {
              method: "DELETE",
            },
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to delete task");
          }

          await gettask();
        } catch (error) {
          console.error(error);
        }
      });
    });
}

async function addtask() {
  const text = task_input.value.trim();

  if (text === "") {
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add task");
    }

    const tasks_response = await fetch("http://localhost:3000/api/tasks");
    if (!tasks_response.ok) {
      throw new Error("Task was added, but the list could not be refreshed");
    }

    task = await tasks_response.json();
    task_input.value = "";
    selected_category = "pending";
    showtasks(selected_category);
  } catch (error) {
    console.error(error);
  }
}

async function gettask() {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    task = await response.json();
    showtasks(selected_category);
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}

function showtasks(category) {
  /*filter by pending or completed tasks*/
  selected_category = category;

  document.querySelectorAll(".category button").forEach((button) => {
    button.classList.remove("active");
  });
  document.querySelector(`.category-${category}`).classList.add("active");

  if (category === "all") {
    displaytask(task, category);
  } else {
    displaytask(
      task.filter((item) => item.status === category),
      category,
    );
  }
}

add_task.addEventListener(
  "click",
  addtask,
); /*add the task when button is clicked*/

task_input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addtask();
  }
}); /*add task when enter is clicked*/

document.querySelector(".category-all").addEventListener("click", () => {
  showtasks("all");
}); /*Show all the tasks when all is clicked*/

document.querySelector(".category-pending").addEventListener("click", () => {
  showtasks("pending");
}); /*Show the pending tasks */

document.querySelector(".category-completed").addEventListener("click", () => {
  showtasks("completed"); /*Show completed tasks*/
});
gettask();

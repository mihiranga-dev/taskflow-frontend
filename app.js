document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("login-view");
  const registerView = document.getElementById("register-view");
  const taskView = document.getElementById("tasks-view");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  const loginForm = document.getElementById("login-form");
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const registerForm = document.getElementById("register-form");
  const registerUsernameInput = document.getElementById("register-username");
  const registerEmailInput = document.getElementById("register-email");
  const registerPasswordInput = document.getElementById("register-password");
  const taskList = document.getElementById("task-list");
  const addTaskForm = document.getElementById("add-task-form");
  const newTaskTitleInput = document.getElementById("new-task-title");
  const logoutButton = document.getElementById("logout-button");
  // const API_BASE_URL = "http://localhost:8080"; // Local Development
  const API_BASE_URL = "https://mihiranga-dev-taskflow-backend.hf.space";

  function showView(viewId) {
    loginView.classList.add("hidden");
    registerView.classList.add("hidden");
    taskView.classList.add("hidden");

    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
      viewToShow.classList.remove("hidden");
    }
  }

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userData = {
      username: registerUsernameInput.value,
      email: registerEmailInput.value,
      password: registerPasswordInput.value,
    };

    console.log("Attempting to register:", userData);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration Successful:", data);

        alert("Registration successful! Please login.");
        registerForm.reset();

        showView("login-view");
      } else {
        console.error("Server Error:", response.status);
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to the server. Is the backend running?");
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginData = {
      username: loginUsernameInput.value,
      password: loginPasswordInput.value,
    };

    console.log("Attempting to login:", loginData);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login Successful, Token:", data.token);

        localStorage.setItem("token", data.token);

        localStorage.setItem("username", loginData.username);

        loginForm.reset();
        alert("Login Successful!");

        document.getElementById(
          "welcome-message"
        ).textContent = `Welcome, ${loginData.username}!`;

        showView("tasks-view");
        fetchTasks();
      } else {
        console.error("Login Error:", response.status);
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to server.");
    }
  });

  async function fetchTasks() {
    const token = localStorage.getItem("token");

    if (!token) {
      showView("login-view");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const tasks = await response.json();

        console.log("SERVER SENT THIS ARRAY:", tasks);
        renderTaskList(tasks);
      } else {
        console.error("Failed to fetch tasks:", response.status);
        if (response.status === 403) {
          logout();
        }
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  }

  function renderTaskList(tasks) {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      taskList.innerHTML =
        '<div class="empty-state">No tasks yet. Add one above!</div>';
      return;
    }

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";

      li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" class="task-check" 
                       ${task.completed ? "checked" : ""} 
                       onclick="toggleTask(${task.id}, '${
        task.title
      }', ${!task.completed})">
                <div class="task-text">
                    <span class="task-title ${
                      task.completed ? "completed" : ""
                    }">${task.title}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${
              task.id
            })">Delete</button>
      `;

      taskList.appendChild(li);
    });
  }

  addTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const title = newTaskTitleInput.value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: "Added via Frontend",
          completed: false,
        }),
      });

      if (response.ok) {
        newTaskTitleInput.value = "";
        fetchTasks();
      } else {
        alert("Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    alert("Logged out successfully.");
    showView("login-view");
  }

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    logout();
  });

  showRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();

    showView("register-view");
  });

  showLoginLink.addEventListener("click", (event) => {
    event.preventDefault();

    showView("login-view");
  });

  window.deleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTasks();
      } else {
        alert("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  window.toggleTask = async (id, title, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: "Updated via Frontend",
          completed: newStatus,
        }),
      });

      if (response.ok) {
        fetchTasks();
      } else {
        alert("Failed to update task.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  showView("login-view");
});

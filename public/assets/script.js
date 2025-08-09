let token = localStorage.getItem("authToken");

function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        token = data.token;

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("http://localhost:3001/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    token = null;
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
  });
}

function fetchPosts() {
  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("posts");
      

      postsContainer.innerHTML = "";
      posts.forEach((post) => {

        //formats string into multiple lines
        const ingredients = post.ingredients;
        const ingredientsSplit = ingredients.split('*').join('<br>');
        const method = post.method;
        const methodSplit = method.split('*').join('<br><br>');

        const div = document.createElement("div");
        const deleteButton = `<button class="deleteButton" onclick="onClickDeleteButton(this, '${post.id}')">Delete Recipe</button>`;

        div.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <p>Serves: ${post.serves}</p>
            <p>Prep Time: ${post.prep}</p>
            <p>Cook Time:${post.cook}</p>
            <h4>Ingredients</h4>
            <p>${ingredientsSplit}</p>
            <h4>Method</h4>
            <p>${methodSplit}</p>          
            <small>By: ${post.postedBy} on ${new Date(post.createdOn).toLocaleString()}</small>
            ${deleteButton}`;
        postsContainer.appendChild(div);
      });
    });
}

function createPost() {
  const title = document.getElementById("post-title").value;
  const description = document.getElementById("post-description").value;
  const serves = document.getElementById("post-serves").value;
  const prep = document.getElementById("post-prep").value;
  const cook = document.getElementById("post-cook").value;
  const ingredients = document.getElementById("post-ingredients").value;
  const method = document.getElementById("post-method").value;
  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, serves, prep, cook, ingredients, method, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      fetchPosts();
    });
}

// Function to delete recipe
async function onClickDeleteButton(e, recipeId) {
  // Get the parent list element of button
  const div = e.parentElement;

  try {
    // Send delete request
    const response = await fetch(`http://localhost:3001/api/posts/${recipeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      div.remove(); // Remove the recipe element from the DOM
    } else {
      const data = await response.json();
      alert(`Error deleting recipe`);
    }
  } catch (error) {
    console.error("Error deleting recipe:", error);
  }
}

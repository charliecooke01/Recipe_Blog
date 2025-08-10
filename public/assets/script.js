let token = localStorage.getItem("authToken");

function register() {
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameInput.value, email: emailInput.value, password: passwordInput.value }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");

        //clear input fields
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
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
        // Save the username in the local storage
        localStorage.setItem("username", data.userData.username);
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

        // Divs and content for posts
        div.innerHTML = `
          <div class="post">
            <div class="post-header">
              <h3>${post.title}</h3>
              <div class="post-details-container">
                <p class="post-detail">Serves: ${post.serves}</p>
                <p class="post-detail">Prep Time: ${post.prep}</p>
                <p class="post-detail">Cook Time: ${post.cook}</p>
              </div>
              <img class="post-image" src="${post.image}">
              <p>${post.description}</p>
            </div>
            <div class="post-content">
              <h4>Ingredients</h4>
              <p>${ingredientsSplit}</p>
              <h4>Method</h4>
              <p>${methodSplit}</p>   
            </div>
            <div class="post-footer">       
              <small>By: ${post.postedBy} on ${new Date(post.createdOn).toLocaleString()}</small>
            </div>
          </div>
            ${deleteButton}`;
        postsContainer.appendChild(div);
      });
    });
}

function createPost() {
  const titleInput = document.getElementById("post-title");
  const imageInput = document.getElementById("post-image");
  const descriptionInput = document.getElementById("post-description");
  const servesInput = document.getElementById("post-serves");
  const prepInput = document.getElementById("post-prep");
  const cookInput = document.getElementById("post-cook");
  const ingredientsInput = document.getElementById("post-ingredients");
  const methodInput = document.getElementById("post-method");

  // get the username from local storage
  const postedBy = localStorage.getItem("username");

  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
      body: JSON.stringify({
      title: titleInput.value,
      image: imageInput.value,
      description: descriptionInput.value,
      serves: servesInput.value,
      prep: prepInput.value,
      cook: cookInput.value,
      ingredients: ingredientsInput.value,
      method: methodInput.value,
      postedBy
    }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      fetchPosts();

      //Clears input fields
      titleInput.value = "";
      imageInput.value = "";
      descriptionInput.value = "";
      servesInput.value = "";
      prepInput.value = "";
      cookInput.value = "";
      ingredientsInput.value = "";
      methodInput.value = "";
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

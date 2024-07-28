import {
  authModule,
  auth,
  firestoreModule,
  firestore,
  storage,
  storageModule,
} from "./firebase.js";

// Referencias a elementos del DOM
const postsContainer = document.getElementById("posts-container");
const newPostForm = document.getElementById("new-post-form");
const createPostBtn = document.getElementById("create-post-btn");
const createPostForm = document.getElementById("create-post-form");
const logoutBtn = document.getElementById("logout-btn");

// Verificar si el usuario está logueado, para mostrar/ocultar opciones de crear posts y logout
authModule.onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario logueado
    console.log("Usuario logueado:", user);
    newPostForm.style.display = "block";
    logoutBtn.style.display = "block"; // Mostrar el botón de cerrar sesión
  } else {
    // Usuario no logueado
    console.log("Usuario no logueado");
    newPostForm.style.display = "none";
    logoutBtn.style.display = "none"; // Ocultar el botón de cerrar sesión
  }
});

// Cargar los posts de Firestore
const loadPosts = () => {
  firestoreModule
    .getDocs(firestoreModule.collection(firestore, "posts"))
    .then((querySnapshot) => {
      postsContainer.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postElement = createPostElement(postData);
        postsContainer.appendChild(postElement);
      });
    });
};

// Cargar los posts de Firestore al inicio, sin importar si el usuario está logueado
loadPosts();

// Crear un elemento HTML para un post
const createPostElement = (postData) => {
  const postDiv = document.createElement("div");
  postDiv.classList.add("card", "mb-4");

  const postHeader = document.createElement("div");
  postHeader.classList.add("card-header");
  postHeader.textContent =
    postData.author + " - " + tmpToDate(postData.timestamp);
  postDiv.appendChild(postHeader);

  const postBody = document.createElement("div");
  postBody.classList.add("card-body");

  const postText = document.createElement("p");
  postText.textContent = postData.text;
  postBody.appendChild(postText);

  // Mostrar imágenes si las hay
  if (postData.images) {
    const imagesDiv = document.createElement("div");
    postData.images.forEach((imageUrl) => {
      const imageElement = document.createElement("img");
      imageElement.src = imageUrl;
      imageElement.classList.add("img-fluid", "mb-2");
      imagesDiv.appendChild(imageElement);
    });
    postBody.appendChild(imagesDiv);
  }

  // Sección de comentarios
  const commentsDiv = document.createElement("div");
  commentsDiv.classList.add("mt-3");
  commentsDiv.innerHTML = "<h4>Comentarios:</h4>";
  postData.comments.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    commentsDiv.appendChild(commentElement);
  });

  postBody.appendChild(commentsDiv);

  // Formulario para agregar un nuevo comentario
  if (auth.currentUser) {
    const newCommentForm = document.createElement("form");
    newCommentForm.classList.add("mt-3");
    newCommentForm.innerHTML = `
      <div class="mb-3">
        <label for="comment-text-${postData.id}" class="form-label">Agregar un comentario:</label>
        <textarea class="form-control" id="comment-text-${postData.id}" rows="2" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Comentar</button>
    `;
    newCommentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const commentText = document.getElementById(
        `comment-text-${postData.id}`,
      ).value;
      addComment(postData.id, commentText);
    });
    postBody.appendChild(newCommentForm);
  }

  postDiv.appendChild(postBody);
  return postDiv;
};

// Crear un elemento HTML para un comentario
const createCommentElement = (comment) => {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("card", "mb-2");
  commentDiv.innerHTML = `
    <div class="card-header">
      ${comment.author} - ${tmpToDate(comment.timestamp)}
    </div>
    <div class="card-body">
      <p class="card-text">${comment.text}</p>
    </div>
  `;
  return commentDiv;
};

// Mostrar/ocultar el formulario para crear un nuevo post
createPostBtn.addEventListener("click", () => {
  newPostForm.style.display =
    newPostForm.style.display === "none" ? "block" : "none";
});

// Manejar la creación de un nuevo post
createPostForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (auth.currentUser) {
    const text = document.getElementById("post-text").value;
    const imageFiles = document.getElementById("post-images").files;

    const imagePromises = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      if (imageFile.size > 5 * 1024 * 1024) {
        alert(`La imagen ${imageFile.name} es demasiado grande (máximo 5MB).`);
        return;
      }
      imagePromises.push(uploadImage(imageFile));
    }

    Promise.all(imagePromises).then((imageUrls) => {
      const newPostRef = firestoreModule.doc(
        firestoreModule.collection(firestore, "posts"),
      );

      const newPost = {
        id: newPostRef.id,
        author: auth.currentUser.email,
        text: text,
        images: imageUrls,
        comments: [],
        timestamp: firestoreModule.Timestamp.now(),
      };

      firestoreModule.setDoc(newPostRef, newPost).then(() => {
        console.log("Reclamo publicado correctamente");
        loadPosts();
        createPostForm.reset();
        newPostForm.style.display = "none";
      });
    });
  } else {
    alert("Debes iniciar sesión para crear un nuevo reclamo.");
    window.location.href = "login.html";
  }
});

// Subir una imagen a Firebase Storage
const uploadImage = (imageFile) => {
  const storageRef = storageModule.ref(storage, `images/${imageFile.name}`);

  return storageModule.uploadBytes(storageRef, imageFile).then((snapshot) => {
    return storageModule.getDownloadURL(snapshot.ref);
  });
};

// Agregar un nuevo comentario a un post
const addComment = (postId, commentText) => {
  const newComment = {
    author: auth.currentUser.email,
    text: commentText,
    timestamp: firestoreModule.Timestamp.now(),
  };
  const postRef = firestoreModule.doc(firestore, "posts", postId);
  firestoreModule
    .updateDoc(postRef, {
      comments: firestoreModule.arrayUnion(newComment),
    })
    .then(() => {
      console.log("Comentario agregado correctamente");
      loadPosts();
    });
};

// Cerrar sesión
logoutBtn.addEventListener("click", () => {
  authModule.signOut(auth).then(() => {
    console.log("Sesión cerrada correctamente");
    window.location.href = "login.html";
  });
});

const tmpToDate = (tmp) => new Date(tmp.toDate()).toLocaleString();

const express = require("express");
const flash = require("connect-flash");
var csrf = require("tiny-csrf");
const app = express();
const bodyParser = require("body-parser");
var cookieparser = require("cookie-parser");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');

const bcrypt = require('bcrypt');
const saltRounds= 10;

app.use(bodyParser.json());

const { Todo, User} = require("./models");
const todo = require("./models/todo");
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long",["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.use(session({
  secret: "my-super-secret-key-21728172615261562",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (username, password, done) => {
  User.findOne({ where: { email: username }})
    .then( async (user) => {
      const result = await bcrypt.compare(password, user.password)
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid password" });
      }
    }).catch((error) => {
      return done(error);
    })
}));

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done(null, user)
    })
    .catch(error => {
      done(error, null)
    })
});

app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    response.redirect("/todos");
  } else {
    response.render("index", {
      csrfToken: request.csrfToken(),
    });
  }
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const loggedUser = request.user.id;
  const allTodos = await Todo.getTodos(loggedUser);
  const overdue = await Todo.overdue(loggedUser);
  const dueToday = await Todo.dueToday(loggedUser);
  const dueLater = await Todo.dueLater(loggedUser);
  const completed = await Todo.completed(loggedUser);
  if( request.accepts("html")) {
    response.render("todos", {
      title: "My To-do manager",
      allTodos,
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      allTodos,
      overdue,
      dueToday,
      dueLater,
      completed
    })
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds)
  if (request.body.firstName.length == 0) {
    request.flash("error", "Your First name can not be empty!");
    return response.redirect("/signup");
  } else if (request.body.email.length == 0) {
    request.flash("error", "Your E-mail can not be empty!");
    return response.redirect("/signup");
  } else if (request.body.password.trim().length == 0) {
    request.flash("error", "Your Password can not be empty!");
    return response.redirect("/signup");
  }
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd
    });
    request.login(user, (error) => {
      if (error) {
        console.log(err)
      }
    response.redirect("/todos");
    })
  } catch(err) {
    console.log(err);
    request.flash("error", "E-mail provided is already in use!");
    response.redirect("/signup");
   }
});

/*app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async function (_request, response) {
  console.log("Processing list of all Todos ...");
  const allTodos = await Todo.getTodos();
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completed = await Todo.completed();
  if( request.accepts("html")) {
    response.render("todos", {
      allTodos,
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      allTodos,
      overdue,
      dueToday,
      dueLater,
      completed
    })
  }
  // FILL IN YOUR CODE HERE
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
  // response.send(todos)
});*/

//app.get("/")

app.get("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });

})

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err){return next(err); }
    response.redirect("/");
  })
})

app.post("/session", passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
}), (request, response) => {
  console.log(request.user);
  response.redirect("/todos");
});

app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Creating a todo", request.body);
  if (!request.body.title) {
    request.flash("error", "Title of your todo cannot be empty!");
    return response.redirect("/todos");
  }
  if (!request.body.dueDate) {
    request.flash("error", "Your todo must contain a due date!");
    return response.redirect("/todos");
  }
  if (request.body.title.length < 5) {
    request.flash("error", "Todo title's length should be more!");
    return response.redirect("/todos");
  }
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.user.id,
    });
    return response.redirect("/todos");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE
  try {
    await Todo.remove(request.params.id, request.user.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
  /*try {
    // Query the database to delete a Todo by ID
    const deletedTodo = await Todo.destroy({
      where: {
        id: request.params.id,
      },
    });
    // Respond with true if the Todo was deleted, false otherwise
    return response.json({ success: deletedTodo > 0 });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)*/
});

module.exports = app;

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const setupDB = require(__dirname + "/utility.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//
//---------- DATABASE -----------
//
const optionsDB = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const dbName = "todolistDB";

mongoose.connect("mongodb+srv://admin-QS:quantumspark123@cluster0-4flhb.gcp.mongodb.net/" +dbName, optionsDB);

//Schemas
const itemsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// Scema pour Custom List
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//Collection / model

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

//
//------- ROUTES --------
//

//Home Route
app.get("/", function(req, res) {
  //Recupere la list des todo depuis la database
  Item.find({}, (err, todos) => {
    if (err) {
      console.log(err);
    } else {
      //Insert default items si DB est vide
      if (todos.length === 0) {
        setupDB(() => res.redirect("/"));
      } else {
        // Render the list of todos
        res.render("list", { listTitle: "Today", newListItems: todos });
      }
    }
  });


});
// End of Home Route

//Custom Route = Custom Todo List
app.get("/:customListName", (req, res) => {
  //Get the name de la List entré dans l'url par le user
  let listName = req.params.customListName;

  //Search la DTB pour la list
  List.findOne({ name: listName }, (err, foundList) => {
    if (!err) {
      // Check no error
      if (!foundList) {
        // if List pas trouvée
        //Create new list
        const list = new List({
          name: listName,
          items: []
        });
        //Save new list dans DTB
        list.save();
        console.log("New list created: " + list.name);
        res.redirect("/" + listName);
      } else {
        // If List trouvée
        // Render / pass variables a la view
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    } else {
      // If error
      console.log(err);
    }
  });
});
// End of Custom Route

//
//------- POST --------
//

//Add new Todo à la List
app.post("/", function(req, res) {
  //Get item & list name avec la request
  const itemName = req.body.newItem;
  const listName = req.body.list;

  //Create new item
  const item = new Item({
    name: itemName
  });

  //Check si Home list ou Custom list
  if (listName === "Today") {
    // If "/"
    item.save();
    res.redirect("/");
  } else {
    // If CustomRoute
    //Search pour la list
    List.findOne({ name: listName }, (err, foundList) => {
      //Push new todo dans le tableau des items
      foundList.items.push(item);
      //Replace list avec la list updated
      foundList.save();
      //Redirect vers la custom route
      res.redirect("/" + listName);
    });
  }
});
// End of Add Todo

//Delete a todo
app.post("/delete", (req, res) => {
  //Parse la string value de checkbox to object
  let infos = JSON.parse(req.body.checkbox);
  //Get les Infos
  let id = infos.id;
  let listName = infos.title;
  
  //Check le nom de la list
  if (listName === "Today") {
    //Delete l'item et redirect vers la route
    Item.findByIdAndRemove(id, { useFindAndModify: false }, () => {
      res.redirect("/");
    });
  } else {
    //Trouve la custom list grace au listName
    List.findOne({ name: listName }, (err, foundList) => {
      if (err) {
        //Check et log si error
        console.log(err);
      } else {
        //Pour chaque item de la List
        foundList.items.forEach((item, index) => {
          //Check ID
          if (item._id == id) {
            //Sort l'item du tableau
            foundList.items.splice(index, 1);
            //Save la nouvelle list
            foundList.save();
            //Redirect vers la Custom Route
            res.redirect("/" + listName);
          }
        });
      }
    });
  }
});

//Page about
app.get("/about", function(req, res) {
  res.render("about");
});


//Server port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port :"+port);
});

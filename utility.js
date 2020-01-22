exports.setupDB = (callback) => {
  const item1 = new Item({
    name: "Welcome to your TODO List!"
  });
  const item2 = new Item({
    name: "Hit the + button to add some Todos!"
  });
  const item3 = new Item({
    name: "<-- Hit this checkbox to delete the Todo!"
  });

  const defaultItems = [item1, item2, item3];

  Item.insertMany(defaultItems, err => {
    if (err) {
      console.log(err);
    } else {
      //console.log("Successfully loaded default TODOS");
      callback();
    }
  });
}

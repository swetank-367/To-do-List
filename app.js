//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose") ;  
const _ = require("lodash") ;


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-swetank:test123@cluster0.nvwp7.mongodb.net/todolistDB",{useNewUrlParser: true}) ; //connect to database

const itemsSchema = {
  name: String
} ; 

const Item = mongoose.model("Item",itemsSchema) ;  //creates a collection/mongoose model called Items

const item1 = new Item({
  name: "Welcome to your todolist!"
})//created new item

const item2 = new Item({
  name: "Hit the + button to aff a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})



//to insert all items in one go to your item collection

const defaultItem = [item1,item2,item3] ;
  
// Item.insertMany(defaultItem,function(err){
//   if(err){
//     console.log(err) ;  
//   }
//   else{
//     console.log("Successfully saved defaul items to DB.") ;  
//   }
// }) ;  

//for dynamic route
const listSchema = {
  name: String,
  items: [itemsSchema]
} ; 

const List = mongoose.model("List",listSchema) ; 

app.get("/", function(req, res) {
  
  //to access elements of db from app.js
  Item.find({},function(err,foundItems){
    //to add the default list only once
    if(foundItems.length === 0){
      Item.insertMany(defaultItem,function(err){
      if(err){
        console.log(err) ;  
       }
        else{
          console.log("Successfully saved defaul items to DB.") ;  
        }
      }) ; 
      res.redirect("/") ; 
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems}); 
    }
    
  }) ;    

});

//creating a dynamic route
app.get("/:customListName",function(req,res){
  
  //use lodash for giving names a standard form
  const customListName = _.capitalize(req.params.customListName)  ;


  //check if the route already exists

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        
        const list = new List({
          name: customListName,
          items: defaultItem
        })

        list.save() ; 
        res.redirect("/"+ customListName) ; 
      }
      else{
        //show a existing list
   
        res.render("list",{listTitle: foundList.name,newListItems: foundList.items}) ;  

      }
    }
  })
  

})


app.post("/", function(req, res){ 

  //add new elements to your list
  const itemName = req.body.newItem;
  const listName = req.body.list ; 

  const item = new Item({
    name: itemName 
  }) ;  

  if(itemName !== ""){
    if(listName === "Today"){
      item.save() ; 
  
      res.redirect("/") ; 
    }
    else{
      //search the list and add the item to that list
      List.findOne({name: listName},function(err,foundList){
        foundList.items.push(item) ;  
        foundList.save() ; 
        res.redirect("/" + listName) ; 
      })
    }
  }
  

  
  
});

app.post("/delete",function(req,res){
  //to delete the item which is checked
  const checkedItemId = req.body.checkbox ; 
  const listName = req.body.listName ; 

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("succesfully deleted.") ;  
        res.redirect("/") ; 
      }
      
    })
  }
  else{
    //for deleting from the current list
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName) ; 
      }
    })
  }

  
})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT ; 
if(port == null || port == ""){
  port = 3000 ;  
}

app.listen(port, function() {
  console.log("Server started ");
});

const express = require("express") ; 
const bodyParser = require("body-parser") ; 
const date = require(__dirname + "/date.js") ;

const app = express() ; 
app.use(bodyParser.urlencoded({extended:true})) ; 
app.use(express.static("public")) ; 

app.set('view engine','ejs') ; 

let items = [ "Buy Food","Cook Food","Eat Food"] ; 
let workItems = []  ; 

app.get("/",function(req,res){
    
    let day = date.getDate() ; 
    res.render("list",{ListTitle: day,newListItem: items}) ;
}) ;

app.post("/",function(req,res){
    let item = req.body.newItem ; 

    if(req.body.list === "Work"){
        workItems.push(item) ; 
        res.redirect("/Work") ; 
    }
    else{
        items.push(item) ; 
        res.redirect("/")  ; 
    }
}) ; 

app.get("/Work",function(req,res){
    res.render("list",{ListTitle: "Work List",newListItem: workItems}) ; 
}) ; 

app.listen(3000,function(){
    console.log("Server is running on 3000.") ; 
}) ; 
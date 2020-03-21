const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });
const mySchema = new mongoose.Schema({ stuff: String });
const Model = mongoose.model('model', mySchema);
mongoose.Promise = global.Promise;
const _= require("lodash");

//test?retryWrites=true&w=majority/

mongoose.connect("mongodb+srv://admin-yaz_87:Yaz123@cluster0-kzi8e.mongodb.net/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open',function () {
    console.log('Connected');
}).on('error',function (error) {
    console.log('CONNECTION ERROR:',error);
});

//whenver call this module it gets bound to this const which is called date. 
// everything in regards to the date has been removed to simplify the code
// const date = require(__dirname + "/date.js");


// We will replace the items and workItems arrays with mongoose. 

//we got this from https://github.com/mde/ejs/wiki/Using-EJS-with-Express and it has to be after the const app = express() otherwise it won't work

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// step1: we create the schema

const itemsSchema ={

    name: String

};

// step 2: we create the model


const Item= mongoose.model("Item", itemsSchema); 

//step 3: create the items
const item1= new Item({

    name: "Welcome To Your ToDoList"
})

const item2= new Item({

    name: "Hit the plus button to add a new item"
});

const item3= new Item({

    name: "<-- Hit this button to delete an item"
});

const defaultItems= [item1, item2, item3]; 

const listSchema= {
    name: String, 
    items: [itemsSchema]
};


const List= mongoose.model("List", listSchema)


app.get("/", function(req, res) {

    //with the find is empty it will basically find all. 
    Item.find({}, function(err, foundItems){

        if(foundItems.length===0){

            Item.insertMany(defaultItems,function(err){

    if(err){

        console.log(err)
    }else{

        console.log("Successfully saved the items");
    }
});
res.redirect("/");

        }else{
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        
        }

    //the render method uses the view engine we set up there to render a particular page.
    //everytime we render list we have to add the two varibles as in kindOfDay and newListItem. 

    });

   // const day = date.getDate();
});


//that's how we create a dynamic router
app.get("/:customListName", function(req,res){

    const customListName = _.capitalize(req.params.customListName);

    // we will create a new list that's based on the list model

    List.findOne({name: customListName}, function (err, existingList) {


        if(!err){

            if(!existingList){
             //create a new list

             
        const list= new List({

            

            name: customListName, 
            items: defaultItems
        }); 
        
        list.save();
        res.redirect("/" + customListName);
            }
            else{
          //show an existing list 

          res.render("list", {
            listTitle: existingList.name,
            newListItems: existingList.items 
        });

            }

    }

    });   

});


//so what this does is when a post request is triggered on our home route will save the value of our item inside that text to a varribale
//called newItem and then it will redirect to the home route and will triger the app.get home route then will res.render the two variables.
app.post("/", function(req, res) {

    //the newItem has to match up with the name of the input in the form 
    const itemName = req.body.newItem;
    const listName= req.body.list; 

    const item= new Item({

        name: itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    
    }else{
        //we will need to search for the items in our existing list of items
        List.findOne({name: listName}, function(err, existingList) {

            // if(err){
            //     console.log(err);
            // }
            // else{
            // console.log(foundList.items.item);
            
            existingList.items.push(item); 
            existingList.save(); 
            res.redirect("/" + listName); 
        
        });
    }
});

    app.post("/delete", function(req, res) {
    
   const checkedItemId =req.body.checkbox;
   const listName= req.body.listName;

   if(listName==="Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){

        if(err){
            console.log(err)
        } else{
    
            console.log("Successfully removed the item");
    
            res.redirect("/")
            
        }
          });
   }else{
       //we have to specify three things; first one is the condition, 2nd thing is the update
    List.findOneAndUpdate({ name: listName},{$pull: {items: {_id: checkedItemId} }},function(err, foundList){

        if(!err){
        res.redirect("/" + listName);
        
        }  
    // else{

    //     console.log("Successfully removed the item and updated the document."); 
    // }
});

   }

});


    // console.log(req.body);
    // 
    // workItems.push(item);
    // res.redirect("/work");



// app.get("/work", function(req, res) {

//     res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function(req, res) {


    res.render("about");
})

var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("Express is working on port " + port);
  });
//importing packages
const {faker} =require("@faker-js/faker");
const mysql=require("mysql2");
const express=require("express");
const app=express();
const port=8080;
//for MethodOverRide which is used for conver post req to patch/delete etc...
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
const path=require("path");

app.use(express.static(path.join(__dirname,"/public/js")));
app.use(express.static(path.join(__dirname,"/public/css")));



//for ejs views
const { SourceTextModule } = require("vm");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));



//starting server
app.listen(port,()=>{
    console.log("Server is Listening..");
});

//sql connection
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"node_sql",
    password:"Saivishnu@123",
});

//for random user creating
let getRandomUser=()=>{
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

//routes
//          1)Home route
app.get("/",(req,res)=>{
    try{
        let q="select count(*) from user";
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let count=result[0]["count(*)"];
            // res.send(`the count of users in table is ${result[0]["count(*)"]}`);
            res.render("home.ejs",{count});
        });
    }catch(err){
        console.log(err);
        res.send("Some error in DB");
    }
});

//      2)Show Route
app.get("/user",(req,res)=>{
    try{
        let q="select * from user";
        connection.query(q,(err,result)=>{
            res.render("showUsers.ejs",{result});
        });
    }catch(err){
        console.log(err);
        res.send("Some error in DB");
    }
});

//    3)Edit form Showing

app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    try{
        let q=`select * from user where id='${id}'`;
        // console.log(q);
        connection.query(q,(err,result)=>{
            let user=result[0];
            res.render("edit.ejs",{user});
        });
    }catch(err){
        console.log(err);
        res.send("Some Error in DB");
    }
});

// After Filling Edit form User will enter here via patch request " Update route "

app.patch("/user/:id",(req,res)=>{
    let id=req.params.id;
    let EnteredPwd=req.body.pwd;
    try{
        let q=`select * from user where id='${id}'`;
        connection.query(q,(err,result)=>{
            if(err) throw err;
            if(result[0].password===EnteredPwd){
                q=`update user set username='${req.body.username}' where id='${id}'`;
                try{
                    connection.query(q,(err,result)=>{
                        if(err) throw err;
                        res.redirect("/user");

                    });
                }catch(err){
                    console.log("Error in update: ",err);
                }
            }
            else{
                let user=result[0];
                user.msg="Wrong Password Entered TRY again !";
                console.log(user);
                res.render("edit.ejs",{user});
            }
        });
    }catch(err){
        console.log(err);
        res.send("DB error occured!");
    }
});

//delete user destroy route
app.delete("/user/:id",(req,res)=>{
    try{
        let q=`delete from user where id='${req.params.id}'`;
        // console.log(q);
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
        });
    }catch(err){
        console.log(err);
        res.send("Faced delete DB error...");
    }
});

//add user
app.get("/new/user",(req,res)=>{
    res.render("register.ejs");
});
app.post("/new/user",(req,res)=>{
    let data=req.body;

    try{
        let q="insert into user values(?,?,?,?)"
        let d = [faker.string.uuid(), data.username, data.email, data.password];
        connection.query(q,d,(err,result)=>{
            // if(err) throw err;
            // res.redirect("/user");
            console.log(q);
            console.log(d);
        });
    }catch(err){
        res.send("Data Base Error "+err);
    }


    res.render("Timer.ejs"); //after rendering it wil auto redirect after 5 seconds
});
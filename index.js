
const express = require("express");
const cors = require("cors");


const app = express()

app.use(cors({
    origin:"*"
}))

app.use(express.json())

const PORT = process.env.PORT || 3000

// test route
app.get("/", (req,res)=>{
    res.send("API is running🚀");
});


app.get("/api/classify", async (req,res)=>{
    try{
        const name = req.query.name;

    // missing or empty name 400
    if(!name || name.trim() === ""){
        return res.status(400).json({
            status:"error",
            message:"Name query parameter is required"
        })
    }

    // not a string 422
    if(typeof name !== "string"){
        return res.status(422).json({
            status:"error",
            message:"Name must be a string"
        })
    }

    // call external API
    const response = await fetch(`https://api.genderize.io?name=${name}`)
    const data = await response.json()

    // if valid
    // res.json({
    //     status:"success",
    //     data:data
    // });

    const {gender, probability, count} = data

    // edge case
    if(!gender || count === 0){
        return res.status(422).json({
            status:"error",
            message:"No prediction available for the provided name"
        })
    }
    // rename
    const sample_size = count

    // confidence logic
    const is_confident = probability >= 0.7 && sample_size >=100

    // timestamp
    const processed_at = new Date().toISOString()

    // final response
    res.json({
        status:"success",
        data:{
            name:name.toLowerCase(),
            gender,
            probability,
        sample_size,
        is_confident,
        processed_at
        }
    })

    }catch(error){
        console.log(error);
        
        res.status(500).json({
            status:"error",
            message:"Something went wrong"
        })
    }
});

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
    
})
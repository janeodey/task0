const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { v7: uuidv7 } = require("uuid");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Simple in-memory storage
let profiles = [];

// Test route
app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

// POST /api/profiles
app.post("/api/profiles", async (req, res) => {
    try {
        const name = req.body?.name;

        // Validation
        if (!name || name.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "Name is required"
            });
        }

        if (typeof name !== "string") {
            return res.status(422).json({
                status: "error",
                message: "Name must be a string"
            });
        }

        // 🔁 Idempotency check
        const existingProfile = profiles.find(
            p => p.name.toLowerCase() === name.toLowerCase()
        );

        if (existingProfile) {
            return res.status(200).json({
                status: "success",
                message: "Profile already exists",
                data: existingProfile
            });
        }

        // Call all APIs
        const [genderRes, ageRes, countryRes] = await Promise.all([
            axios.get(`https://api.genderize.io?name=${encodeURIComponent(name)}`),
            axios.get(`https://api.agify.io?name=${encodeURIComponent(name)}`),
            axios.get(`https://api.nationalize.io?name=${encodeURIComponent(name)}`)
        ]);

        // Extract data
        const { gender, probability, count } = genderRes.data;
        const { age } = ageRes.data;
        const countries = countryRes.data.country;

        // Edge cases
        if (!gender || count === 0) {
            return res.status(502).json({
                status: "error",
                message:  "${externalApi} returned an invalid response"
            });
        }

        if (age === null || age === undefined){
            return res.status(502).json({
                status: "error",
                message: "Agify returned an invalid response"
            });
        }

        if (!countries || countries.length === 0) {
            return res.status(502).json({
                status: "error",
                message: "Nationalize returned an invalid response"
            });
        }

        // Transform data
        const sample_size = count;
        const gender_probability = probability;

        // Age group logic
        let age_group;
        if (age <= 12) age_group = "child";
        else if (age <= 19) age_group = "teenager";
        else if (age <= 59) age_group = "adult";
        else age_group = "senior";

        // Best country
        const bestCountry = countries.reduce((prev, curr) =>
            curr.probability > prev.probability ? curr : prev
        );

        // Timestamp
        const created_at = new Date().toISOString();

        // Create profile
        const newProfile = {
            id: uuidv7(),
            name: name.toLowerCase(),
            gender,
            gender_probability,
            sample_size,
            age,
            age_group,
            country_id: bestCountry.country_id,
            country_probability: bestCountry.probability,
            created_at
        };

        // Store
        profiles.push(newProfile);

        // Return
        return res.status(201).json({
            status: "success",
            data: newProfile
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: "error",
            message: "Something went wrong"
        });
    }
});

// get all profiles
app.get("/api/profiles", (req, res) => {
    let result = profiles;

    const { gender, country_id, age_group } = req.query;

    // 🔍 Filters (case-insensitive)
    if (gender) {
        result = result.filter(p =>
            p.gender.toLowerCase() === gender.toLowerCase()
        );
    }

    if (country_id) {
        result = result.filter(p =>
            p.country_id.toLowerCase() === country_id.toLowerCase()
        );
    }

    if (age_group) {
        result = result.filter(p =>
            p.age_group.toLowerCase() === age_group.toLowerCase()
        );
    }

    return res.status(200).json({
        status: "success",
        count: result.length,
        data: result.map(p => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            age: p.age,
            age_group: p.age_group,
            country_id: p.country_id
        }))
    });
});

// get single profile
app.get("/api/profiles/:id", (req, res) => {
    const { id } = req.params;

    const profile = profiles.find(p => p.id === id);

    if (!profile) {
        return res.status(404).json({
            status: "error",
            message: "Profile not found"
        });
    }

    return res.status(200).json({
        status: "success",
        data: profile
    });
});

// delete profile
app.delete("/api/profiles/:id", (req, res) => {
    const { id } = req.params;

    const index = profiles.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            status: "error",
            message: "Profile not found"
        });
    }

    profiles.splice(index, 1);

    return res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
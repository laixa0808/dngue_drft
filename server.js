const express = require("express");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();
const PORT = 3008;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public")); 
app.use(express.json());


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/signup_success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup_success.html"));
});

app.get("/signup_success.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup_success.html"));
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.redirect(`/error.html?msg=${encodeURIComponent(error.message)}`);
  res.redirect("/signup_success.html");
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.redirect(`/error.html?msg=${encodeURIComponent(error.message)}`);

  res.cookie("access_token", data.session.access_token, { httpOnly: true });
  res.redirect("/admin");
});


app.get("/private", async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.redirect("/");

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.redirect("/");

   const filePath = path.join(__dirname, "public", "admin.html");

   fs.readFile(filePath, "utf8", (err, html) => {
      if (err) {
        console.error("Error: admin.html could not be loaded!", err);
        return res.status(500).send("Server error: admin.html not found.");
      }
    
    res.send(html);
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    // Check if user email is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      return res.status(401).json({ 
        success: false, 
        requiresConfirmation: true,
        message: "Please confirm your email address before logging in. Check your inbox for a confirmation email." 
      });
    }

    // Check if user has admin role (you can customize this based on your user metadata)
    const userRole = data.user?.user_metadata?.role;
    if (userRole && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      });
    }

    // Login successful
    res.json({ 
      success: true, 
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { email, password, role } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role, // Add role to user metadata
      },
    },
  });

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(200).json({ success: true });
});

// Endpoint to check email confirmation status
app.get("/api/check-confirmation/:email", async (req, res) => {
  const { email } = req.params;
  
  try {
    // Query the user to check confirmation status
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      return res.status(500).json({ success: false, message: "Error checking confirmation status" });
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      confirmed: !!user.email_confirmed_at,
      confirmedAt: user.email_confirmed_at
    });
  } catch (error) {
    console.error('Confirmation check error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to handle email confirmation callback
app.get("/api/confirm-email", async (req, res) => {
  const { token, type } = req.query;
  
  try {
    if (type === 'signup') {
      // For Supabase, the confirmation is usually handled automatically
      // We'll redirect to a success page instead
      res.redirect('/signup_success.html?confirmed=true');
    } else {
      res.status(400).json({ success: false, message: "Invalid confirmation type" });
    }
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to manually confirm email (for testing purposes)
app.post("/api/confirm-email", async (req, res) => {
  const { email } = req.body;
  
  try {
    // In a real implementation, you would verify the confirmation token
    // For now, we'll simulate a successful confirmation
    res.json({ success: true, message: "Email confirmed successfully" });
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to verify authentication token
app.post("/api/verify-auth", async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    
    // Check if user has admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API endpoints for real data
app.get("/api/stats", async (req, res) => {
  try {
    // TODO: Replace with real database queries
    // For now, return placeholder data
    res.json({
      currentCases: 0,
      highRiskZones: 0,
      trendChange: "0%"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

app.get("/api/barangays", async (req, res) => {
  try {
    // TODO: Replace with real database query to get barangays
    // For now, return empty array
    res.json({
      barangays: []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load barangays" });
  }
});

app.get("/api/charts/yearly", async (req, res) => {
  try {
    // TODO: Replace with real database query for yearly data
    res.json({
      labels: [],
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load yearly chart data" });
  }
});

app.get("/api/charts/monthly", async (req, res) => {
  try {
    // TODO: Replace with real database query for monthly data
    res.json({
      labels: [],
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load monthly chart data" });
  }
});

app.get("/api/charts/gender", async (req, res) => {
  try {
    // TODO: Replace with real database query for gender data
    res.json({
      labels: [],
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load gender chart data" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
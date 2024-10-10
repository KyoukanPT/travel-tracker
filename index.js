import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "YOUR USE NAME",
  host: "localhost",
  database: "YOUR DATABASE NAME",
  password: "YOUR PASSWORD",
  port: YOUR PORT
});

db.connect();

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let countriesArray = [];

app.get("/", async (req, res) => {

  try {

    const result = await db.query("SELECT * FROM visited_countries;");

    let countries = result.rows;

    countries.forEach((country) => {
      countriesArray.push(country.country_code);
    });
    
    res.render("index.ejs", {
      countries: countriesArray,
      total: countriesArray.length
    });

  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async (req, res) => {

  function capitalizeWords(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  try {
    const addedCountry = capitalizeWords(req.body.country);
    const checkDatabase = await db.query("SELECT * FROM countries WHERE country_name like'" + '%' + addedCountry + '%' + "'");
    let countries = checkDatabase.rows;

    await db.query("INSERT INTO visited_countries (country_code) VALUES('" + countries[0].country_code +"')")

    res.redirect("/");

  } catch (error) {
    console.log(error);
      
      if (error.code === '23505') {
        const errorMessage = "Country has already been added, try again";

        res.render("index.ejs", {
          error : errorMessage,
          countries: countriesArray,
          total : countriesArray.length
        });
      }
      else {

        const errorMessage = "Country does not exist, try again";

        res.render("index.ejs", {
          error : errorMessage,
          countries: countriesArray,
          total : countriesArray.length
        });
      }
      
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

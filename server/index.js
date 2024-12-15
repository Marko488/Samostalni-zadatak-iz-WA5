import express from "express";
import cors from "cors";
import { connecttToDatabase } from "./db.js";

const app = express();

let db = await connecttToDatabase();

app.use(express.json());
app.use(cors());
const PORT = 2001;

app.get("/pizze", async (req, res) => {
  let pizza_collection = db.collection("pizze");

  try {
    let pizze = await pizza_collection.find().toArray();

    if (pizze.length === 0) {
      return res.status(404).json({
        message: "Trenutno ne postoji ni jedna dostupna pizza na meniju!",
      });
    }
    res.status(200).json(pizze);
  } catch (e) {
    console.error(e.errorResponse);
    res.status(400).json({ error: e.errorResponse });
  }
});

app.post("/pizze", async (req, res) => {
  let pizza_collection = db.collection("pizze");
  let nova_pizza = req.body;
  let obavezni_kljucevi = ["naziv", "cijena", "sastojci", "slika"];

  if (!obavezni_kljucevi.every((kljuc) => kljuc in nova_pizza)) {
    return res.status(400).json({ error: "Poslali ste nepotpune podatke!" });
  }

  if (!Number.isInteger(nova_pizza.cijena)) {
    return res.status(400).json({ error: "Cijena mora biti broj!" });
  }

  if (!Array.isArray(nova_pizza.sastojci)) {
    return res.status(400).json({ error: "Sastojci moraju biti polje!" });
  }

  for (let sastojak of nova_pizza.sastojci) {
    if (typeof sastojak !== "string") {
      res
        .status(400)
        .json({ error: "Elementi u polju sastojaka moraju biti stringovi!" });
    }
  }

  try {
    let result = await pizza_collection.insertOne(nova_pizza);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) {
    res.status(400).json({ error: e.errorResponse });
  }
});

app.post("/narudzba", async (req, res) => {
  let narudzba_collection = db.collection("pizza_narudzbe");
  let pizze_kolekcije = db.collection("pizze");
  let dostupne_pizze = await pizze_kolekcije.find().toArray();
  let nova_narudzba = req.body;
  let obavezni_kljucevi = ["ime", "adresa", "telefon", "pizza_stavke"];
  let ukupna_cijena = 0;

  let obavezni_kljucevi_stavke = ["naziv", "kolicina", "velicina"];
  if (!obavezni_kljucevi.every((kljuc) => kljuc in nova_narudzba)) {
    return res
      .status(400)
      .json({ message: "Niste unijeli sve potrebne podatke!" });
  }

  for (let stavka of nova_narudzba.pizza_stavke) {
    if (!obavezni_kljucevi_stavke.every((kljuc) => kljuc in stavka)) {
      return res.status(400).json({
        message: `Nemate sve kljuceve (potrebne podatke) u stavci ${stavka}`,
      });
    }

    if (
      !stavka.kolicina > 0 &&
      Number.isInteger(stavka.kolicina) &&
      ["mala", "srednja", "velika"].includes(stavka.velicina) &&
      (typeof stavka.telefon == "string" || typeof stavka.telefon == "number")
    ) {
      return res
        .status(400)
        .json({ message: "Neispravni podaci u stavci narudzbe!" });
    }

    if (!dostupne_pizze.some((pizza) => pizza.naziv === stavka.naziv)) {
      return res.status(400).json({
        message: `Zelite narucit pizzu ${stavka.naziv} koju nemamo u ponudi!`,
      });
    }

    let pizza_trazena = dostupne_pizze.find(
      (pizza) => pizza.naziv === stavka.naziv
    );

    ukupna_cijena += pizza_trazena.cijena * stavka.kolicina;
  }

  nova_narudzba.ukupna_cijena = ukupna_cijena;

  try {
    let rez = await narudzba_collection.insertOne(nova_narudzba);
    res.status(201).json({ insertedId: rez.insertedId });
  } catch (e) {
    console.log(e.errorResponse);
    res.status(400).json({ error: e.errorResponse });
  }
});

app.listen(2001, (e) => {
  if (e) {
    console.log("Doslo je do greske prilikom pokretanja posluzitelja!");
  } else {
    console.log("Server je uspjesno pokrenut i ceka na dolazne zahtjeve!");
  }
});

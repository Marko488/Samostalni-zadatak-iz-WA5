<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold text-center mb-6">
      Pizzeria - Naše pizze u ponudi:
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <div
        v-for="pizza in pizze"
        :key="pizza._id"
        class="p-4 border rounded-lg shadow-md bg-white"
      >
        <img
          :src="pizza.slika"
          alt="Pizza slika"
          class="w-full h-40 object-cover mb-4 rounded"
        />
        <h2 class="text-xl font-semibold mb-2">{{ pizza.naziv }}</h2>
        <p class="text-gray-700 mb-2">Cijena: {{ pizza.cijena }} €</p>
        <p class="text-gray-700 mb-2">
          Sastojci:
          <span class="text-gray-900 font-medium">
            {{ pizza.sastojci.join(", ") }}
          </span>
        </p>
      </div>
    </div>

    <div class="border p-4 rounded-lg shadow-md bg-white">
      <h2 class="text-2xl font-bold mb-4">Naruči pizze</h2>
      <form @submit.prevent="Posalji_narudzbu">
        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2" for="ime"
            >Ime</label
          >
          <input
            v-model="order.ime"
            type="text"
            id="ime"
            class="w-full border rounded p-2"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2" for="adresa"
            >Adresa</label
          >
          <input
            v-model="order.adresa"
            type="text"
            id="adresa"
            class="w-full border rounded p-2"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2" for="telefon"
            >Telefon</label
          >
          <input
            v-model="order.telefon"
            type="text"
            id="telefon"
            class="w-full border rounded p-2"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2"
            >Pizza Stavke</label
          >
          <div
            v-for="(stavka, index) in order.pizza_stavke"
            :key="index"
            class="mb-4 border p-2 rounded"
          >
            <input
              v-model="stavka.naziv"
              placeholder="Naziv pizze"
              class="w-full border rounded p-2 mb-2"
              required
            />
            <input
              v-model="stavka.kolicina"
              type="number"
              placeholder="Količina"
              class="w-full border rounded p-2 mb-2"
              required
            />
            <select
              v-model="stavka.velicina"
              class="w-full border rounded p-2"
              required
            >
              <option value="" disabled>Odaberi veličinu</option>
              <option value="mala">Mala</option>
              <option value="srednja">Srednja</option>
              <option value="velika">Velika</option>
            </select>
          </div>

          <button
            type="button"
            class="bg-blue-500 text-white px-4 py-2 rounded"
            @click="dodaj_pizza_stavku"
          >
            Dodaj stavku
          </button>
        </div>

        <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded">
          Pošalji narudžbu
        </button>
      </form>

      <div v-if="errorMessage" class="text-red-500 mt-4">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const pizze = ref([]);
const order = ref({
  ime: "",
  adresa: "",
  telefon: "",
  pizza_stavke: [],
});
const errorMessage = ref("");

const fetchPizze = async () => {
  try {
    const response = await axios.get("http://localhost:2001/pizze");
    pizze.value = response.data;
  } catch (error) {
    console.error("Greška pri dohvaćanju pizza:", error);
  }
};

const dodaj_pizza_stavku = () => {
  order.value.pizza_stavke.push({
    naziv: "",
    kolicina: 1,
    velicina: "",
  });
};

const Posalji_narudzbu = async () => {
  try {
    const response = await axios.post(
      "http://localhost:2001/narudzba",
      order.value
    );
    order.value = { ime: "", adresa: "", telefon: "", pizza_stavke: [] };
    errorMessage.value = "";
    alert("Narudžbu ste uspješno poslali!");
  } catch (error) {
    console.error("Greška pri slanju narudžbe:", error);
    errorMessage.value = error.response?.data?.message || "Došlo je do greške.";
  }
};

onMounted(fetchPizze);
</script>

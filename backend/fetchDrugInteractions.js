const fetch = require("node-fetch");

async function fetchDrugInteractions() {
  const response = await fetch("https://data.mfds.go.kr/api/drug-interaction");
  const data = await response.json();
  console.log(data);
}

fetchDrugInteractions();

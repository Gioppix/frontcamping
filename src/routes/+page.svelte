<script lang="ts">
  import Map from "$lib/Map.svelte";
  import {
    camping,
    distance,
    map,
    set_current_pos,
    set_high_route,
  } from "$lib/render";
  import type { Coordinate, StreetNode } from "$lib/storage";
  import Suggestion from "./Suggestion.svelte";

  //   set_high_route([9985]);
  //   function dijkstra(camp: Camping, startNodeId: number, endNodeId: number) {
  //     let graph = camp.streets;
  //     // Inizializzazione
  //     const distances = {};
  //     const previousNodes = {};
  //     const queue = [];

  //     for (const node of graph) {
  //       distances[node.id] = Infinity;
  //       previousNodes[node.id] = null;
  //       queue.push(node.id);
  //     }

  //     distances[startNodeId] = 0;

  //     while (queue.length > 0) {
  //       // Trova il nodo con la distanza minima
  //       const current = queue.reduce((minNodeId, nodeId) =>
  //         distances[nodeId] < distances[minNodeId] ? nodeId : minNodeId
  //       );

  //       // Rimuovi il nodo corrente dalla coda
  //       queue.splice(queue.indexOf(current), 1);

  //       // Per ogni nodo collegato
  //       for (const connectedNodeId of graph.find((node) => node.id === current)
  //         .connects) {
  //         const connectedNode = graph.find((node) => node.id === connectedNodeId);

  //         // Calcola la distanza euclidea tra i nodi
  //         console.log("NODE: ", connectedNode);
  //         const distance = Math.sqrt(
  //           Math.pow(
  //             connectedNode.lat - graph.find((node) => node.id === current).lat,
  //             2
  //           ) +
  //             Math.pow(
  //               connectedNode.lng - graph.find((node) => node.id === current).lng,
  //               2
  //             )
  //         );

  //         const alt = distances[current] + distance;

  //         // Se la nuova distanza è più breve, aggiorna le strutture dati
  //         if (alt < distances[connectedNodeId]) {
  //           distances[connectedNodeId] = alt;
  //           previousNodes[connectedNodeId] = current;
  //         }
  //       }
  //     }

  //     // Costruisci il percorso risultante
  //     const path = [];
  //     let current = endNodeId;

  //     while (current !== null) {
  //       path.unshift(current);
  //       current = previousNodes[current];
  //     }

  //     return {
  //       distance: distances[endNodeId],
  //       path: path,
  //     };
  //   }

  //   // Esempio di utilizzo:
  //   const startNodeId = 2135;
  //   const endNodeId = 2387;

  //   const result = dijkstra(camping, startNodeId, endNodeId);
  //   console.log("Distanza totale:", result.distance * 110000);
  //   console.log("Percorso:", result.path);

  const options = {
    // enableHighAccuracy: true,
    timeout: 35000,
    maximumAge: 0,
  };
  export async function getCoordinates(): Promise<Coordinate> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const coordinatesString = `${latitude},${longitude}`;
          resolve({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error("Error getting current position: " + error.message);
          reject("Error");
        },
        options
      );
    });
  }
  set_high_route([[2654, 9769]]);
  function start_updating() {
    console.log("UPDATING");
    getCoordinates().then((c) => {
      console.log("UPDATED");
      set_current_pos(c);
      const id = get_closest().id;
      console.log(id);
      map.setCenter({ lat: c.lat, lng: c.lon });
      //   set_high_route([id]);
      start_updating();
    });
  }

  function get_closest(): StreetNode {
    let closest: StreetNode = camping.streets[0];
    let min_dist = Infinity;
    camping.streets.forEach((s_n) => {
      const cur_dist = distance(
        s_n.position.lon,
        closest.position.lon,
        s_n.position.lat,
        closest.position.lat
      );
      if (cur_dist < min_dist) {
        min_dist = cur_dist;
        closest = s_n;
      }
    });
    return closest;
  }
</script>

<button class="btn" on:click={start_updating}>AGGIORNA POS</button>
<div class="flex flex-col h-[50vh]">
  <div class="flex-grow"><Map admin={false} /></div>
</div>
<div class="flex gap-8 p-8">
  <div class="flex flex-col gap-8">
    <Suggestion />
    <Suggestion />
  </div>
  <div class="flex flex-col gap-8">
    <Suggestion />
    <Suggestion />
  </div>
</div>

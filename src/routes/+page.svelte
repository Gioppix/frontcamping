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

  const options = {
    enableHighAccuracy: true,
    timeout: 35000,
    maximumAge: 0,
  };
  function go_to(id: number) {
    console.log("going to " + id);
  }
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
<div class="flex gap-8 p-8 align-middle justify-center">
  <div class="flex flex-col gap-8">
    <Suggestion onclick={go_to} />
    <Suggestion onclick={go_to} />
  </div>
</div>

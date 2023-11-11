<script lang="ts">
  import Map from "$lib/Map.svelte";
  import {
    camping,
    current_pos,
    distance,
    get_average,
    init,
    map,
    set_current_pos,
    set_high_route,
  } from "$lib/render";
  import {
    PlaceKind,
    type Camping,
    type Coordinate,
    type StreetNode,
    dijkstra,
    get_closest,
    wrapper,
  } from "$lib/storage";
  import { onMount } from "svelte";

  //   set_high_route([9985]);
  let search: string;
  let found_id: number | undefined;
  let remaining_distance = 0;
  let remaining_time: string;

  set_current_pos({ lat: 46.4782905, lon: 11.3319517 });

  $: {
    remaining_distance;
    remaining_time = Math.round((remaining_distance * 1.38) / 60) + " minutes";
  }

  setInterval(() => {
    search += "1";
    search.substring(0, search.length - 1);
  }, 10);

  $: {
    console.log("searching");
    found_id = undefined;
    remaining_distance = 0;
    set_high_route([]);
    compass = "v3 " + current_pos.lat + " " + current_pos.lon;
    if (camping) {
      const place = camping.places.find((p) => p.name == search);
      if (place) {
        const position = get_average(place.positions);
        found_id = get_closest(position).id;

        const { distance, path } = wrapper(
          get_closest(current_pos).id,
          found_id
        );
        set_high_route(path);
      }
    }
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 40000,
    maximumAge: 0,
  };

  //   export async function getCoordinates(): Promise<Coordinate> {

  //     return new Promise((resolve, reject) => {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           const latitude = position.coords.latitude;
  //           const longitude = position.coords.longitude;
  //           const coordinatesString = `${latitude},${longitude}`;
  //           resolve({ lat: latitude, lon: longitude });
  //         },
  //         (error) => {
  //           console.error("Error getting current position: " + error.message);
  //           reject("Error");
  //         },
  //         options
  //       );
  //     });
  //   }

  function start_updating() {
    const watchID = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        set_current_pos({ lat, lon });
        map.setCenter({ lat, lng: lon });
        search = search.toUpperCase();
        console.log(`Latitude: ${lat}, Longitude: ${lon}`);
        // You can update the position on your app's UI here
      },
      (error) => {
        console.warn(`ERROR(${error.code}): ${error.message}`);
      },
      options
    );
    // console.log("UPDATING");
    // getCoordinates().then((c) => {
    //   set_current_pos(c);
    //   //   console.log("UPDATED");
    //   set_current_pos(c);
    //   const id = get_closest(c).id;
    //   //   console.log(c);
    //   map.setCenter({ lat: c.lat, lng: c.lon });
    //   //   set_high_route([id]);
    //   start_updating();
    // });
  }

  let compass: string;
  onMount(() => {
    start_updating();
    // DeviceOrientationEvent.webkitCompassHeading();
    // init();
  });
  function handleOrientation(event) {
    if ("webkitCompassHeading" in event) {
      const compassHeading = event.webkitCompassHeading;
      compass = compassHeading;
    } else {
      console.log("Compass heading not supported");
    }
  }

  let kinds = Object.keys(PlaceKind)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => [Number(key), PlaceKind[key as any]]);

  function clikkkk(kind: number) {
    let min_dist = Infinity;
    let min_name;
    for (let place of camping.places.filter((p) => p.kind == kind)) {
      const { path, distance } = wrapper(
        get_closest(current_pos).id,
        get_closest(get_average(place.positions)).id
      );

      if (distance < min_dist) {
        min_dist = distance;
        min_name = place.name;
      }
    }
    search = min_name;
    // const { path, distance } = wrapper(get_closest(current_pos).id, min_id);
    // set_high_route(path);
    // console.log(id);
  }
</script>

{compass}
<!-- <button
  class="btn"
  on:click={() => {
    // console.log(wrapper(6396));
  }}>AGGIORNA POS</button
> -->
<button
  class="btn"
  on:click={() => {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", (eventData) => {
            compass = eventData.webkitCompassHeading;
            map.setHeading(compass);
          });
        }
      })
      .catch((e) => {
        alert(e);
      });
  }}
>
  CONSENT
</button>
<input
  type="text"
  placeholder="CERCA"
  class="input input-bordered w-full max-w-xs"
  bind:value={search}
/>
<div class="flex flex-col h-[50vh]">
  <div class="flex-grow"><Map admin={false} /></div>
</div>
{#if remaining_distance > 0}
  <p>
    Remaining distance: {Math.ceil(remaining_distance) + " meters"} Remaining time:
    {remaining_time}
  </p>
{/if}
<div class="flex gap-8 p-8 align-middle justify-center">
  <div class="flex flex-row gap-8 flex-wrap">
    {#each kinds as kind}
      <button
        class="btn btn-primary"
        on:click={() => {
          clikkkk(kind[0]);
        }}>GO TO {kind[1]}</button
      >
    {/each}
  </div>
</div>

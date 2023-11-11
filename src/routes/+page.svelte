<script lang="ts">
  import Map from "$lib/Map.svelte";
  import {
    camping,
    distance,
    get_average,
    init,
    map,
    set_current_pos,
    set_high_route,
  } from "$lib/render";
  import type { Camping, Coordinate, StreetNode } from "$lib/storage";
  import { onMount } from "svelte";
  import Suggestion from "./Suggestion.svelte";

  //   set_high_route([9985]);
  let search: string;
  let found_id: number | undefined;
  $: {
    found_id = undefined;
    if (camping) {
      const place = camping.places.find((p) => p.name == search);
      if (place) {
        const position = get_average(place.positions);
        found_id = get_closest(position).id;

        wrapper(found_id);
      }
    }
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 35000,
    maximumAge: 0,
  };
  function go_to(id: number) {
    console.log("going to " + id);
  }
  function distance_2(pos1: Coordinate, pos2: Coordinate): number {
    // Use an appropriate distance formula; for simplicity, Euclidean distance is used here
    return Math.sqrt(
      Math.pow(pos1.lat - pos2.lat, 2) + Math.pow(pos1.lon - pos2.lon, 2)
    );
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
  function dijkstra(
    camp: Camping,
    startNodeId: number,
    endNodeId: number
  ): number[] {
    const distances: { [nodeId: number]: number } = {};
    const prev: { [nodeId: number]: number | null } = {};
    const queue: number[] = [];

    // Initialize distances and previous nodes
    for (const node of camp.streets) {
      distances[node.id] = node.id === startNodeId ? 0 : Infinity;
      prev[node.id] = null;
      queue.push(node.id);
    }

    while (queue.length > 0) {
      // Find the node with the smallest distance
      queue.sort((a, b) => distances[a] - distances[b]);
      const current = queue.shift()!;

      // Stop if we reach the end node
      if (current === endNodeId) break;

      // Update distance to each neighbor
      const currentNode = camp.streets.find((node) => node.id === current)!;
      for (const neighborId of currentNode.connects) {
        const neighborNode = camp.streets.find(
          (node) => node.id === neighborId
        )!;
        const alt =
          distances[current] +
          distance_2(currentNode.position, neighborNode.position);

        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          prev[neighborId] = current;
        }
      }
    }

    // Reconstruct the path
    const path = [];
    let current: number | null = endNodeId;

    while (current !== null) {
      path.unshift(current);
      current = prev[current];
    }

    // Return an empty array if no path found
    if (path[0] !== startNodeId) return [];

    return path;
  }

  const default_point: Coordinate = { lat: 46.4782905, lon: 11.3319517 };
  function start_updating() {
    // console.log("UPDATING");
    // getCoordinates().then((c) => {
    //   console.log("UPDATED");
    //   set_current_pos(c);
    //   const id = get_closest().id;
    //   console.log(c);
    //   map.setCenter({ lat: c.lat, lng: c.lon });
    //   //   set_high_route([id]);
    //   start_updating();
    // });
  }

  function get_closest(c: Coordinate): StreetNode {
    let closest: StreetNode = camping.streets[0];
    let min_dist = Infinity;
    camping.streets.forEach((s_n) => {
      const cur_dist = distance(
        s_n.position.lon,
        c.lon,
        s_n.position.lat,
        c.lat
      );
      if (cur_dist < min_dist) {
        min_dist = cur_dist;
        closest = s_n;
      }
    });
    return closest;
  }
  //   console.log(dijkstra(camping, 4481, 6396));
  function wrapper(endNodeId: number) {
    const nodes = dijkstra(camping, get_closest(default_point).id, endNodeId);
    const paths: [number, number][] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      paths.push([nodes[i], nodes[i + 1]]);
    }
    set_high_route(paths);
  }

  //   const isIOS =
  //     navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  //     navigator.userAgent.match(/AppleWebKit/);

  //   function init() {
  //     const selectedLatitude = 40.7128; // New York City
  //     const selectedLongitude = -74.006; // New York City

  //     //startBtn.addEventListener("click", startCompass);
  //     navigator.geolocation.getCurrentPosition(locationHandler);

  //     if (!isIOS) {
  //       window.addEventListener("deviceorientationabsolute", handler, true);
  //     }
  //   }
  //   function locationHandler(position: number) {
  //     const { latitude, longitude } = position.coords;
  //     pointDegree = calcDegreeToPoint(latitude, longitude);

  //     if (pointDegree < 0) {
  //       pointDegree = pointDegree + 360;
  //     }
  //   }
  let compass: number;
  onMount(() => {
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
</script>

{compass}
<button
  class="btn"
  on:click={() => {
    // console.log(wrapper(6396));
  }}>AGGIORNA POS</button
>
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
  }}>CONSENT</button
>
<input
  type="text"
  placeholder="CERCA"
  class="input input-bordered w-full max-w-xs"
  bind:value={search}
/>
<div class="flex flex-col h-[50vh]">
  <div class="flex-grow"><Map admin={false} /></div>
</div>
<div class="flex gap-8 p-8 align-middle justify-center">
  <div class="flex flex-col gap-8">
    <Suggestion onclick={go_to} />
    <Suggestion onclick={go_to} />
  </div>
</div>

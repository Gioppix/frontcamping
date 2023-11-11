<script lang="ts">
  import { onMount } from "svelte";
  import {
    Mode,
    camping,
    drawcamping,
    handleClick,
    init,
    setKind,
    setMode,
    set_bounds,
    set_editable,
    set_high_route,
    setclosing,
    sethour,
    setname,
    setopening,
  } from "$lib/render";
  import { PlaceKind, wrapper } from "./storage";
  import { Loader } from "@googlemaps/js-api-loader";
  const loader = new Loader({
    apiKey: "AIzaSyAMwixKdkqNqZn7nq8II64P5uoxvTTfzQU",
    version: "weekly",
  });

  let canvas: HTMLCanvasElement;
  let mounted = false;
  //   let ready = false;
  let kind: PlaceKind;
  let mode: string;
  let name: string;
  let hour: boolean;
  let opening: number;
  let closing: number;
  export let admin: boolean;
  let editable = false;
  $: {
    set_editable(editable);
  }

  let container: HTMLDivElement;
  let map: google.maps.Map;
  //45.13785978577548, 10.288059671713954

  onMount(async () => {
    loader.importLibrary("maps").then(async () => {
      map = new google.maps.Map(container, {
        zoom: 19,
        mapTypeId: "satellite",
        //styles: mapStyles, // optional
      });

      map.setZoom(19);
      console.log(map.getZoom());
      await init(canvas, map);
      mounted = true;
      map.addListener("click", (mapsMouseEvent) => {
        // console.log(JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2));
        handleClick(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
        if (editable) {
          set_high_route([]);
          const paths: [number, number][] = [];
          for (let node of camping.streets) {
            const { distance, path } = wrapper(camping.streets[0].id, node.id);
            paths.push(...path);
          }
          //   console.log(paths);
          set_high_route(paths);
        }
        drawcamping();
      });

      map.addListener("zoom_changed", () => {
        console.log(map.getZoom());
      });
      requestAnimationFrame(animate);
    });

    // map.getBounds();
  });
  $: {
    setKind(kind);
  }
  $: {
    setMode(mode);
  }

  $: {
    sethour(hour);
  }
  $: {
    setname(name);
  }
  $: {
    setopening(opening);
  }
  $: {
    setclosing(closing);
  }

  function animate() {
    if (map) {
      const temp = map.getBounds();
      if (temp) {
        set_bounds(temp);
        drawcamping();
      }
    }

    requestAnimationFrame(animate); // Request the next frame
  }
  console.log("QUI");
  // Start the animation loop
  let kinds = Object.keys(PlaceKind)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => [Number(key), PlaceKind[key as any]]);
</script>

{#if admin}
  <div class="flex gap-8">
    <div class="flex">
      <span> EDIT </span>
      <input type="checkbox" class="toggle" bind:checked={editable} />
    </div>
    <div class="flex">
      <span>MODE</span>
      <select bind:value={mode}>
        {#each Object.values(Mode).filter((value) => typeof value === "string") as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>
    <div class="flex">
      <span>KIND</span>
      <select bind:value={kind}>
        {#each kinds as option}
          <option value={option[0]}>{option[1]}</option>
        {/each}
      </select>
    </div>
    <div class="flex">
      <span>NAME</span>
      <input class="input input-bordered w-full max-w-xs" bind:value={name} />
    </div>
    <div class="flex">
      <span>HOUR</span>
      <input type="checkbox" class="toggle" bind:checked={hour} />
      {#if hour}
        <span>OPENING</span>
        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={opening}
        />
        <span>CLOSING</span>
        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={closing}
        />
      {/if}
    </div>
  </div>
{/if}

<div class="w-screen h-full relative">
  <canvas
    bind:this={canvas}
    class="w-full h-full absolute"
    style={`z-index: -10;`}
  />
  <div
    id="map"
    bind:this={container}
    class="w-full h-full top-0 bottom-0 opacity-40 absolute"
  />
</div>
<!-- {#if ready} -->
<!-- {/if} -->

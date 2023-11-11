<script lang="ts">
  import { onMount } from "svelte";
  import {
    Mode,
    drawcamping,
    handleClick,
    init,
    setKind,
    setMode,
    set_bounds,
    set_editable,
    setclosing,
    sethour,
    setname,
    setopening,
  } from "$lib/render";
  import { PlaceKind } from "./storage";

  let canvas: HTMLCanvasElement;
  let mounted = false;
  let ready = false;
  let kind: PlaceKind;
  let mode: string;
  let name: string;
  let hour: boolean;
  let opening: number;
  let closing: number;

  onMount(() => {});
  export let admin: boolean;
  let editable = false;
  $: {
    set_editable(editable);
    if (mounted) {
      drawcamping();
    }
  }

  let container: HTMLDivElement;
  let map: google.maps.Map;
  //45.13785978577548, 10.288059671713954

  onMount(async () => {
    // @ts-ignore
    window.initMap = () => {
      console.log("ciao");
      ready = true;
      //let container = document.getElementById("map");
      map = new google.maps.Map(container, {
        zoom: 19,
        mapTypeId: "satellite",
        //styles: mapStyles, // optional
      });
      map.setZoom(19);
      console.log(map.getZoom());
      init(canvas, map);
      mounted = true;
      map.addListener("click", (mapsMouseEvent) => {
        // console.log(JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2));
        handleClick(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
        drawcamping();
      });

      map.addListener("zoom_changed", () => {
        console.log(map.getZoom());
      });
    };
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
    let i = 0;
    if (map) {
      const temp = map.getBounds();
      if (temp) {
        set_bounds(temp);
        i++;
        drawcamping();
      }
    }

    requestAnimationFrame(animate); // Request the next frame
  }
  console.log("QUI");
  requestAnimationFrame(animate); // Start the animation loop
  let kinds = Object.keys(PlaceKind)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => [Number(key), PlaceKind[key as any]]);
</script>

<svelte:head>
  <script>
  </script>
  <script
    defer
    async
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCN0Gg6iTToqiqeeOAZPeKxeulGjnQMCt8&callback=initMap&v=weekly"
  >
  </script>
</svelte:head>
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

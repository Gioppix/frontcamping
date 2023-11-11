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
  let editable = true;
  $: {
    set_editable(editable);
    if (mounted) {
      drawcamping();
    }
  }

  let container: HTMLDivElement;
  let map: google.maps.Map;
  let zoom = 19;
  //45.13785978577548, 10.288059671713954
  let center = { lat: 45.13785978577548, lng: 10.288059671713954 };

  onMount(async () => {
    console.log("mount");
    // @ts-ignore
    window.initMap = () => {
      console.log("ciao");
      ready = true;
      //let container = document.getElementById("map");
      map = new google.maps.Map(container, {
        zoom,
        center,
        mapTypeId: "satellite",
        //styles: mapStyles, // optional
      });
      init(canvas, map);
      drawcamping();
      mounted = true;
      drawcamping();
      map.addListener("click", (mapsMouseEvent) => {
        // console.log(JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2));
        handleClick(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
        drawcamping();
      });
      map.addListener("drag", () => {
        const temp = map.getBounds();
        if (temp) {
          set_bounds(temp);
        }
        drawcamping();
        //console.log(map.getBounds());
      });
      map.addListener("zoom_changed", () => {
        drawcamping();
      });
      map.addListener("mousemove", () => {
        drawcamping();
      });
      map.addListener("bounds_changed", () => {
        drawcamping();
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
<div class="w-screen h-[70vh] relative">
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

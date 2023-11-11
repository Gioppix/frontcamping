<script lang="ts">
  console.log("lol");

  import Map from "$lib/Map.svelte";
  import {
    camping,
    distance,
    map,
    set_current_pos,
    set_high_route,
  } from "$lib/render";
  import type { Coordinate, StreetNode } from "$lib/storage";
</script>

<div class="flex flex-col h-[50vh]">
  <div class="flex-grow"><Map admin={true} /></div>
</div>

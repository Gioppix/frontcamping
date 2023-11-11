<script lang="ts">
  import { camping, current_pos } from "$lib/render";
  import {
    PlaceKind,
    type Camping,
    type Coordinate,
    type Place,
  } from "$lib/storage";

  function get_suggestion(
    c: Camping,
    p: Coordinate,
    h: number
  ): { text: string; place: number } {
    function getRandomIndex(arrayLength: number): number {
      return Math.floor(Math.random() * arrayLength);
    }

    let valid_places: Place[] = [];
    c.places.forEach((p) => {
      if (!p.hours) {
        valid_places.push(p);
      } else {
        if (p.hours.opening < h && h < p.hours.closing) {
          valid_places.push(p);
        }
      }
    });

    let random_place = valid_places[getRandomIndex(valid_places.length)];
    // console.log(random_place.id, suggest(random_place));

    // console.log(valid_places);
    // getOccupatoRecenteByPosto("Piazzola");
    return { place: random_place.id, text: suggest(random_place) };
  }

  //   get_suggestion(camping, { lat: 1, lon: 2 }, 60 * 7);

  function suggest(place: Place) {
    switch (place.kind) {
      case PlaceKind.BAGNI:
        return "Maybe you should go to the bathroom?";
      case PlaceKind.MARKET:
        return "Need some water? The Market is open! Feel free to have a look.";
      case PlaceKind.PARKING:
        return "Need to park your car? Here's the nearest parking lot.";
      case PlaceKind.PIAZZOLA:
        return "Feeling nostalgic? Here's the way home.";
      case PlaceKind.RESTAURANT_BAR:
        return "Feeling hungry? Go grab a snack!";
      case PlaceKind.SPIAGGIA:
        return "Vamos a la playa? The beach is near!";
      default:
        return "Have a look at the map to see what's open!";
    }
  }
  function getTimeOfDayInMinutes() {
    const now = new Date(); // Current date and time
    const hours = now.getHours(); // Get current hours (0-23)
    const minutes = now.getMinutes(); // Get current minutes (0-59)

    return hours * 60 + minutes; // Convert hours to minutes and add the current minutes
  }

  let current_suggestion: { place: number; text: string } | undefined =
    undefined;
  setInterval(() => {
    if (current_pos && camping) {
      current_suggestion = get_suggestion(
        camping,
        current_pos,
        getTimeOfDayInMinutes()
      );
      //   console.log(current_suggestion);
    }
  }, 1 * 1000);

  export let onclick: (id: number) => void;
</script>

{#if current_pos && current_suggestion && camping}
  <div class="card w-72 bg-base-300 shadow-xl">
    <div class="card-body">
      <p>{current_suggestion.text}</p>
      <div class="card-actions justify-end">
        <button
          class="btn btn-primary"
          on:click={() => {
            onclick(current_suggestion.place);
          }}
          >GO TO {camping.places.find((p) => p.id == current_suggestion.place)
            ?.name}</button
        >
      </div>
    </div>
  </div>
{/if}

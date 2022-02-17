<script lang="ts">
  import Navbar from "./Navbar.svelte";
  const channels = ["react", "vue", "angular", "svelte"];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  window.addEventListener("load", (e) => {
    console.log(
      "%cJoined Channel: " + channel,
      "font-size: 1.2em; color: aqua"
    );
  });
</script>

<main>
  <Navbar {channel} />
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>

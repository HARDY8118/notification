<script lang="ts">
  import Navbar from "./Navbar.svelte";
  const channels = ["react", "vue", "angular", "svelte"];

  window.addEventListener("load", (e) => {
    const channel = channels[Math.floor(Math.random() * channels.length)];
    console.log("%cChannel: " + channel, "font-size: 1.2em; color: aqua");
    document.cookie = "uid=" + channel + "; Max-Age=" + 3600 * 2; //Expire after 2 minutes
  });
</script>

<main>
  <Navbar />
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>

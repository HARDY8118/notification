<script lang="ts">
  import Navbar from "./Navbar.svelte";
  const channels = ["react", "vue", "angular", "svelte"];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  window.addEventListener("load", (e) => {
    console.log("%cChannel: " + channel, "font-size: 1.2em; color: aqua");
    document.cookie =
      "uid=" + channel + "; Max-Age=" + 3600 * 2 + "; SameSite=None"; //Expire after 2 minutes
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

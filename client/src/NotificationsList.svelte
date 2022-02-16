<script>
  import Notification from "./Notification.svelte";
  export let list;
</script>

<ul>
  {#if list.length}
    {#each list as { text, time }}
      <Notification {text} {time} />
    {/each}
  {:else}
    <Notification text="No notifications" time={Date.now()} />
  {/if}
</ul>

<style>
  ul {
    position: absolute;
    top: 4em;
    right: 0.5em;
    width: 20vw;
    height: auto;
  }
</style>

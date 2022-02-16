<script lang="ts">
  import NotificationsList from "./NotificationsList.svelte";

  let unread = 0;
  let listOpen = false;
  let list = [
    // { text: "lorem", time: "123" },
    // { text: "ipsum", time: "194" },
  ];

  //   onMount(() => {
  const eventSrc = new EventSource("http://localhost:3000/subscribe");

  const notificationsHandler = (e) => {
    console.log(`New ${e.type}: ${e.data} at ${e.timeStamp}`);
    list.unshift({ text: e.data, time: e.lastEventId });
    !listOpen && unread++;
  };

  eventSrc.addEventListener("open", (e) => {
    console.log("Event source opened /subscribe");
  });

  eventSrc.addEventListener("error", (e) => {
    console.error("An error occured");
    // console.error(e);
    console.info("Closing event source");
    eventSrc.close();
  });

  eventSrc.addEventListener("notification", notificationsHandler);

  eventSrc.addEventListener("message", (e) => {
    console.log("message", e);
  });

  window.addEventListener("beforeunload", (e) => {
    eventSrc.removeEventListener("notification", notificationsHandler);
    console.info("Closing event source");
    eventSrc.close();
  });

  function clearNotifications(e) {
    if (unread > 0) {
      unread = 0;
    }
    listOpen = !listOpen;
  }
  //   });
</script>

<nav>
  <span class="left" />
  <span class="right">
    {#if unread > 0}
      <i
        class="fa fa-bell"
        id="notification-full"
        on:click={clearNotifications}
      />
      <span id="count">{unread}</span>
    {:else}
      <i
        class="fa fa-bell-o"
        id="notification-empty"
        on:click={clearNotifications}
      />
    {/if}
  </span>
</nav>

{#if listOpen}
  <NotificationsList bind:list />
{/if}

<style>
  nav {
    display: flex;
    position: sticky;
    top: 0;
    left: 0;
    width: 100vw;
    height: 4em;
    background-color: red;
    justify-content: space-evenly;
  }

  span.left {
    flex: 4;
  }

  span.right {
    flex: 1;
    display: flex;
    align-content: center;
    justify-content: center;
    margin: auto;
  }

  i.fa-bell,
  i.fa-bell-o {
    font-size: 2em;
    cursor: pointer;
  }

  #count {
    height: 1em;
    widows: 1em;
    font-size: 1em;
    line-height: 1em;
    font-weight: bold;
    color: white;
  }
</style>

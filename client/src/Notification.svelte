<script>
  export let text;
  export let time;
</script>

<div>
  <h3>{text}</h3>
  <span>{new Date(parseInt(time)).toDateString()}</span>
</div>

<style>
  div {
    display: flex;
    flex-direction: row;
    height: 1.4em;
    border: solid 1px black;
    margin: 0.3em;
    padding: 0.4em;
    cursor: pointer;
  }

  h3 {
    margin: 0;
    flex: 3;
  }

  span {
    flex: 1;
    margin-top: 1em;
    font-size: 0.6em;
    text-align: right;
  }
</style>

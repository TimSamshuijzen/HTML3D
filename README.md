# HTML3D
HTML3D is a JavaScript library for creating 3D scenes with HTML and CSS 3D transforms.

HTML3D website:<br />
https://html3d.com

![HTML3D demo](./html3d_demo.png?raw=true "HTML3D demo")

**src/index.html**<br />
This html file is the homepage of html3d.com. It is a demo of HTML3D's capabilities, showcasing a recursive game-within-a-game.
All the code is in the html file. You can use this file as a starting point for creating your own 3D scenes.

**src/HTML3D.js**<br>
HTML3D JavaScript module.<br />
Usage example:<br />
```
<script type="module">
  import HTML3D from "./HTML3D.js";
  ...
  const container = document.getElementById('container');
  const scene = {...};
  const html3d = new HTML3D(container, scene);
  ...
</script>
```

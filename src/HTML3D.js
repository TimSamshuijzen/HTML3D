
class HTML3D {
  constructor(container, scene) {
    this.camera = {
      x: ((typeof scene?.camera?.x === 'number') ? scene.camera.x : 0),
      y: ((typeof scene?.camera?.y === 'number') ? scene.camera.y : 0),
      z: ((typeof scene?.camera?.z === 'number') ? scene.camera.z : 0),
      rotationX: ((typeof scene?.camera?.rotationX === 'number') ? scene.camera.rotationX : 0),
      rotationY: ((typeof scene?.camera?.rotationY === 'number') ? scene.camera.rotationY : 0),
      collisionWidth: ((typeof scene?.camera?.collisionWidth === 'number') ? scene.camera.collisionWidth : 300),
      collisionHeight: ((typeof scene?.camera?.collisionHeight === 'number') ? scene.camera.collisionHeight : 600),
      fov: ((typeof scene?.camera?.fov === 'number') ? scene.camera.fov : 70),
      worldMatrix: new HTML3D.Matrix4(),
      viewMatrix: new HTML3D.Matrix4(),
      updateWorldMatrix() {
        this.worldMatrix.setTranslate(this.x, this.y, this.z);
        this.worldMatrix.multiply(new HTML3D.Matrix4().setRotateY(this.rotationY));
        this.worldMatrix.multiply(new HTML3D.Matrix4().setRotateX(this.rotationX));
      },
      userData: ((typeof scene?.camera?.userData === 'object') ? scene.camera.userData : null),
      init: null,
      animate: null
    };
    if (typeof scene?.camera?.init === 'function') {
      this.camera.init = scene.camera.init;
    } else if (typeof scene?.camera?.initString === 'string') {
      try {
        this.camera.init = new Function('html3d', 'camera', scene.camera.initString);
      } catch (e) {
        this.camera.init = null;
        console.error(e);
      }
    } else {
      this.camera.init = null;
    }
    if (this.camera.init !== null) {
      this.camera.init(this, this.camera);
    }
    this.camera.updateWorldMatrix();
    this.camera.animate = null;
    if (typeof scene?.camera?.animate === 'function') {
      this.camera.animate = scene.camera.animate;
    } else if (typeof scene?.camera?.animateString === 'string') {
      try {
        this.camera.animate = new Function('html3d', 'camera', scene.camera.animateString);
      } catch (e) {
        this.camera.animate = null;
        console.error(e);
      }
    }
    this.container = container;
    this.cameraContainer = document.createElement('div');
    Object.assign(this.cameraContainer.style, {
      position: 'absolute',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });
    this.container.appendChild(this.cameraContainer);
    this.sceneContainer = document.createElement('div');
    Object.assign(this.sceneContainer.style, {
      position: 'absolute',
      width: '100%',
      height: '100%',
      transformStyle: 'preserve-3d'
    });
    this.cameraContainer.appendChild(this.sceneContainer);
    this.panels = [];
    if (Array.isArray(scene?.panels)) {
      for (const scenePanel of scene.panels) {
        const panel = new HTML3D.Panel(this, scenePanel);
        this.panels.push(panel);
      }
    }
    this.requestRender = true;
    for (const panel of this.panels) {
      if (panel.init !== null) {
        panel.init(this, panel);
      }
    }
    window.addEventListener('resize', () => { this.requestRender = true; });
    this._thread();
  }
  export() {
    const result = {
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        z: this.camera.z,
        rotationX: this.camera.rotationX,
        rotationY: this.camera.rotationY,
        collisionWidth: this.camera.collisionWidth,
        collisionHeight: this.camera.collisionHeight,
        fov: this.camera.fov,
        userData: (this.camera.userData !== null) ? {...this.camera.userData} : null
      },
      panels: this.panels.map((panel) => {
        return panel.export();
      })
    };
    if (this.camera.init !== null) {
      result.camera.initString = this.camera.init.toString();
      result.camera.initString = result.camera.initString.substring(result.camera.initString.indexOf('{') + 1, result.camera.initString.lastIndexOf('}')).trim();
    }
    if (this.camera.animate !== null) {
      result.camera.animateString = this.camera.animate.toString();
      result.camera.animateString = result.camera.animateString.substring(result.camera.animateString.indexOf('{') + 1, result.camera.animateString.lastIndexOf('}')).trim();
    }
    return result;
  }
  import(scene) {
    for (const panel of this.panels) {
      panel.element.remove();
    }
    this.panels = [];
    if (scene?.camera) {
      this.camera.x = (scene.camera.x !== undefined) ? scene.camera.x : 0;
      this.camera.y = (scene.camera.y !== undefined) ? scene.camera.y : 0;
      this.camera.z = (scene.camera.z !== undefined) ? scene.camera.z : 0;
      this.camera.rotationX = (scene.camera.rotationX !== undefined) ? scene.camera.rotationX : 0;
      this.camera.rotationY = (scene.camera.rotationY !== undefined) ? scene.camera.rotationY : 0;
      this.camera.collisionWidth = (scene.camera.collisionWidth !== undefined) ? scene.camera.collisionWidth : 300;
      this.camera.collisionHeight = (scene.camera.collisionHeight !== undefined) ? scene.camera.collisionHeight : 700;
      this.camera.fov = (scene.camera.fov !== undefined) ? scene.camera.fov : 70;
      this.camera.updateWorldMatrix();
      this.camera.userData = (typeof scene.camera.userData === 'object') ? scene.camera.userData : null;
      if (typeof scene.camera.init === 'function') {
        this.camera.init = scene.camera.init;
      } else if (typeof scene.camera.initString === 'string') {
        try {
          this.camera.init = new Function('html3d', 'camera', scene.camera.initString);
        } catch (e) {
          this.camera.init = null;
          console.error(e);
        }
      } else {
        this.camera.init = null;
      }
      this.camera.animate = null;
      if (typeof scene.camera.animate === 'function') {
        this.camera.animate = scene.camera.animate;
      } else if (typeof scene.camera.animateString === 'string') {
        try {
          this.camera.animate = new Function('html3d', 'camera', scene.camera.animateString);
        } catch (e) {
          this.camera.animate = null;
          console.error(e);
        }
      }
    }
    if (Array.isArray(scene?.panels)) {
      for (const panelData of scene.panels) {
        this.panels.push(new HTML3D.Panel(this, panelData));
      }
    }
    for (const panel of this.panels) {
      if (panel.init !== null) {
        panel.init(this, panel);
      }
    }
    if (this.camera.init !== null) {
      this.camera.init(this, this.camera);
      this.camera.updateWorldMatrix();
    }
    this.requestRender = true;
  }
  render() {
    const innerWidth = this.container.clientWidth;
    const innerHeight = this.container.clientHeight;
    const focalLength = (0.5 * innerHeight) / Math.tan((this.camera.fov * 0.5 * Math.PI) / 180);
    this.camera.viewMatrix.setMatrix(this.camera.worldMatrix).invert();
    this.sceneContainer.style.transform = `perspective(${focalLength}px) translateZ(${focalLength}px) ${this.camera.viewMatrix.toCSSMatrixString()} translate(${innerWidth / 2}px, ${innerHeight / 2}px)`;
    for (let i = 0, c = this.panels.length; i < c; i++) {
      this.panels[i].render();
    }
  }
  _thread() {
    if (this.camera.animate !== null) {
      this.camera.animate(this, this.camera);
    }
    if (this.requestRender) {
      this.requestRender = false;
      this.render();
    }
    for (let i = 0, c = this.panels.length; i < c; i++) {
      const panel = this.panels[i];
      if (panel.animate !== null) {
        panel.animate(this, panel);
      }
    }
    requestAnimationFrame(() => this._thread());
  }
  checkAABBCollision(moveDirection) {
    const targetPosition = new HTML3D.Vector3(this.camera.x, this.camera.y, this.camera.z);
    targetPosition.add(moveDirection);
    const halfCameraWidth = (this.camera.collisionWidth / 2);
    const cameraBoundingBox = new HTML3D.BoundingBox(
      new HTML3D.Vector3(targetPosition.x - halfCameraWidth, (targetPosition.y - 10), targetPosition.z - halfCameraWidth),
      new HTML3D.Vector3(targetPosition.x + halfCameraWidth, (targetPosition.y + this.camera.collisionHeight), targetPosition.z + halfCameraWidth)
    );
    for (let i = 0, c = this.panels.length; i < c; i++) {
      const panel = this.panels[i];
      if (panel.boundingBox) {
        if (cameraBoundingBox.intersectsBox(panel.boundingBox)) {
          return true;
        }
      }
    }
    return false;
  }
}
{
  HTML3D.Panel = class Panel {
    constructor(html3d, scenePanel) {
      this.html3d = html3d;
      Object.assign(this, {
        id: ((typeof scenePanel.id === 'string') ? scenePanel.id : null),
        relativeToId: ((typeof scenePanel.relativeToId === 'string') ? scenePanel.relativeToId : null),
        title: ((typeof scenePanel.title === 'string') ? scenePanel.title : null),
        width: ((typeof scenePanel.width === 'number') ? scenePanel.width : 100),
        height: ((typeof scenePanel.height === 'number') ? scenePanel.height : 100),
        anchorCenter: ((typeof scenePanel.anchorCenter === 'boolean') ? scenePanel.anchorCenter : false),
        x: ((typeof scenePanel.x === 'number') ? scenePanel.x : 0),
        y: ((typeof scenePanel.y === 'number') ? scenePanel.y : 0),
        z: ((typeof scenePanel.z === 'number') ? scenePanel.z : 0),
        rotationX: ((typeof scenePanel.rotationX === 'number') ? scenePanel.rotationX : 0),
        rotationY: ((typeof scenePanel.rotationY === 'number') ? scenePanel.rotationY : 0),
        backgroundColor: ((typeof scenePanel.backgroundColor === 'string') ? scenePanel.backgroundColor : 'transparent'),
        backgroundImage: ((typeof scenePanel.backgroundImage === 'string') ? scenePanel.backgroundImage : null),
        backgroundTileImage: ((typeof scenePanel.backgroundTileImage === 'string') ? scenePanel.backgroundTileImage : null),
        opacity: ((typeof scenePanel.opacity === 'number') ? scenePanel.opacity : null),
        obstruction: ((typeof scenePanel.obstruction === 'boolean') ? scenePanel.obstruction : false),
        interaction: ((typeof scenePanel.interaction === 'boolean') ? scenePanel.interaction : false),
        innerHTML: ((typeof scenePanel.innerHTML === 'string') ? scenePanel.innerHTML : null),
        iframeSrc: ((typeof scenePanel.iframeSrc === 'string') ? scenePanel.iframeSrc : null),
        iframeHtml: ((typeof scenePanel.iframeHtml === 'string') ? scenePanel.iframeHtml : null),
        userData: ((typeof scenePanel.userData === 'object') ? scenePanel.userData : null),
        init: null,
        click: null,
        animate: null
      });
      if (typeof scenePanel.init === 'function') {
        this.init = scenePanel.init;
      } else if (typeof scenePanel.initString === 'string') {
        try {
          this.init = new Function('html3d', 'panel', scenePanel.initString);
        } catch (e) {
          this.init = null;
        }
      }
      if (typeof scenePanel.click === 'function') {
        this.click = scenePanel.click;
      } else if (typeof scenePanel.clickString === 'string') {
        try {
          this.click = new Function('html3d', 'panel', scenePanel.clickString);
        } catch (e) {
          this.click = null;
          console.error(e);
        }
      }
      if (typeof scenePanel.animate === 'function') {
        this.animate = scenePanel.animate;
      } else if (typeof scenePanel.animateString === 'string') {
        try { 
          this.animate = new Function('html3d', 'panel', scenePanel.animateString);
        } catch (e) {
          this.animate = null;
          console.error(e);
        }
      }
      this.iframe = null;
      this.element = document.createElement('div');
      if (this.id !== null) {
        this.element.id = this.id;
      }
      if (this.title !== null) {
        this.element.title = this.title;
      }
      Object.assign(this.element.style, {
        position: 'absolute',
        width: this.width + 'px',
        height: this.height + 'px',
        backgroundColor: this.backgroundColor,
        pointerEvents: (((this.interaction === true) || (this.obstruction === true)) ? 'auto' : 'none'),
        userSelect: ((this.interaction === true) ? 'auto' : 'none')
      });
      html3d.sceneContainer.appendChild(this.element);
      if (this.innerHTML !== null) {
        this.element.innerHTML = this.innerHTML;
      } else if ((this.iframeSrc !== null) || (this.iframeHtml !== null)) {
        this.element.style.width = (this.width - 10) + 'px';
        this.element.style.height = (this.height - 10) + 'px';
        this.element.style.border = '5px solid ' + this.backgroundColor;
        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        if (this.iframeSrc !== null) {
          this.iframe.src = this.iframeSrc;
        } else if (this.iframeHtml !== null) {
          this.iframe.srcdoc = this.iframeHtml;
        }
        Object.assign(this.iframe.style, {
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: (this.width - 10) + 'px',
          height: (this.height - 10) + 'px',
          border: 'none'
        });
        this.element.appendChild(this.iframe);
      } else if (this.backgroundImage !== null) {
        this.element.style.backgroundImage = this.backgroundImage;
        this.element.style.backgroundSize = 'contain';
        this.element.style.backgroundPosition = 'center';
        this.element.style.backgroundRepeat = 'no-repeat';
      } else if (this.backgroundTileImage !== null) {
        this.element.style.backgroundImage = this.backgroundTileImage;
        this.element.style.backgroundRepeat = 'repeat';
      }
      if (this.opacity !== null) {
        this.element.style.opacity = this.opacity;
      }
      if (this.click !== null) {
        this.element.style.cursor = 'pointer';
        this.element.addEventListener('click', (event) => {
          event.stopPropagation();
          this.click(html3d, this);
        });
      }
      this.worldMatrix = new HTML3D.Matrix4();
      this.boundingBox = null;
      this.updateWorldMatrix();
    }
    export() {
      const panelData = {
        id: (this.id !== null) ? this.id : undefined,
        relativeToId: (this.relativeToId !== null) ? this.relativeToId : undefined,
        title: (this.title !== null) ? this.title : undefined,
        width: this.width,
        height: this.height,
        anchorCenter: (this.anchorCenter === true) ? this.anchorCenter : undefined,
        x: this.x,
        y: this.y,
        z: this.z,
        rotationX: (this.rotationX !== 0) ? this.rotationX : undefined,
        rotationY: (this.rotationY !== 0) ? this.rotationY : undefined,
        backgroundColor: this.backgroundColor,
        backgroundImage: (this.backgroundImage !== null) ? this.backgroundImage : undefined,
        backgroundTileImage: (this.backgroundTileImage !== null) ? this.backgroundTileImage : undefined,
        opacity: (this.opacity !== null) ? this.opacity : undefined,
        obstruction: (this.obstruction !== null) ? this.obstruction : undefined,
        interaction: (this.interaction !== null) ? this.interaction : undefined,
        innerHTML: (this.innerHTML !== null) ? this.innerHTML.trim() : undefined,
        iframeSrc: (this.iframeSrc !== null) ? this.iframeSrc : undefined,
        iframeHtml: (this.iframeHtml !== null) ? this.iframeHtml : undefined
      };
      if ((typeof this.userData === 'object') && (this.userData !== null)) {
        panelData.userData = {...this.userData};
      }
      if (typeof this.init === 'function') {
        panelData.initString = this.init.toString();
        panelData.initString = panelData.initString.substring(panelData.initString.indexOf('{') + 1, panelData.initString.lastIndexOf('}')).trim();
      }
      if (typeof this.click === 'function') {
        panelData.clickString = this.click.toString();
        panelData.clickString = panelData.clickString.substring(panelData.clickString.indexOf('{') + 1, panelData.clickString.lastIndexOf('}')).trim();
      }
      if (typeof this.animate === 'function') {
        panelData.animateString = this.animate.toString();
        panelData.animateString = panelData.animateString.substring(panelData.animateString.indexOf('{') + 1, panelData.animateString.lastIndexOf('}')).trim();
      }
      return panelData;
    }
    updateWorldMatrix() {
      this.worldMatrix.reset();
      if (this.relativeToId !== null) {
        const relativeToPanel = this.html3d.panels.find((panel) => panel.id === this.relativeToId);
        if (relativeToPanel) {
          this.worldMatrix.setMatrix(relativeToPanel.worldMatrix);
        }
      }
      this.worldMatrix.multiply(new HTML3D.Matrix4().setTranslate(this.x, this.y, this.z)).multiply(new HTML3D.Matrix4().setRotateY(this.rotationY)).multiply(new HTML3D.Matrix4().setRotateX(this.rotationX));
      if (this.obstruction === true) {
        const eitherSide = 10;
        if (this.anchorCenter === true) {
          this.boundingBox = new HTML3D.BoundingBox(
            new HTML3D.Vector3(-this.width / 2, -this.height / 2, -eitherSide),
            new HTML3D.Vector3(this.width / 2, this.height / 2, eitherSide)
          );
        } else {
          this.boundingBox = new HTML3D.BoundingBox(
            new HTML3D.Vector3(0, 0, -eitherSide),
            new HTML3D.Vector3(this.width, this.height, eitherSide)
          );
        }
        this.boundingBox.applyMatrix4(this.worldMatrix);
      } else {
        this.boundingBox = null;
      }
      for (const panel of this.html3d.panels) {
        if (panel.relativeToId === this.id) {
          panel.updateWorldMatrix();
        }
      }
    }
    render() {
      this.element.style.transform = `translate(-50%, -50%) ${this.worldMatrix.toCSSMatrixString()}${this.anchorCenter ? '' : ' translate(50%, 50%)'}`;
    }
  }
  HTML3D.Vector3 = class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    clone() {
      return new HTML3D.Vector3(this.x, this.y, this.z);
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    }
    lengthSq() {
      return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    }
    length() {
      return Math.sqrt(this.lengthSq());
    }
    normalize() {
      const l = this.length();
      if (l > 0.00001) {
        this.multiplyScalar(1 / l);
      }
      return this;
    }
    applyMatrix4(m) {
      const x = this.x;
      const y = this.y;
      const z = this.z;
      const e = m.elements;
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
      return this;
    }
    applyMatrix4Rotation(m) {
      const x = this.x;
      const y = this.y;
      const z = this.z;
      const e = m.elements;
      this.x = e[0] * x + e[4] * y + e[8] * z;
      this.y = e[1] * x + e[5] * y + e[9] * z;
      this.z = e[2] * x + e[6] * y + e[10] * z;
      return this.normalize();
    }
    dot(v) {
      return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
    }
  }
  HTML3D.Matrix4 = class Matrix4 {
    constructor() {
      this.reset();
    }
    reset() {
      this.elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      return this;
    }
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      const te = this.elements;
      te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
      te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
      te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
      te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
      return this;
    }
    setMatrix(m) {
      this.elements = [...m.elements];
      return this;
    }
    clone() {
      const newMatrix = new HTML3D.Matrix4();
      newMatrix.elements = [...this.elements];
      return newMatrix;
    }
    setTranslate(x, y, z) {
      return this.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
      );
    }
    setRotateX(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      return this.set(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
      );
    }
    setRotateY(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      return this.set(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
      );
    }
    multiply(m) {
      const me = m.elements;
      const te = this.elements;
      const a11 = te[0], a12 = te[4], a13 = te[8], a14 = te[12];
      const a21 = te[1], a22 = te[5], a23 = te[9], a24 = te[13];
      const a31 = te[2], a32 = te[6], a33 = te[10], a34 = te[14];
      const a41 = te[3], a42 = te[7], a43 = te[11], a44 = te[15];
      const b11 = me[0], b12 = me[4], b13 = me[8], b14 = me[12];
      const b21 = me[1], b22 = me[5], b23 = me[9], b24 = me[13];
      const b31 = me[2], b32 = me[6], b33 = me[10], b34 = me[14];
      const b41 = me[3], b42 = me[7], b43 = me[11], b44 = me[15];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return this;
    }
    invert() {
      const te = this.elements;
      const r11 = te[0], r12 = te[4], r13 = te[8];
      const r21 = te[1], r22 = te[5], r23 = te[9];
      const r31 = te[2], r32 = te[6], r33 = te[10];
      const tx = te[12], ty = te[13], tz = te[14];
      te[0] = r11; te[4] = r21; te[8] = r31;
      te[1] = r12; te[5] = r22; te[9] = r32;
      te[2] = r13; te[6] = r23; te[10] = r33;
      te[12] = -(te[0] * tx + te[4] * ty + te[8] * tz);
      te[13] = -(te[1] * tx + te[5] * ty + te[9] * tz);
      te[14] = -(te[2] * tx + te[6] * ty + te[10] * tz);
      return this;
    }
    toCSSMatrixString() {
      const e = this.elements;
      return 'matrix3d(' +
        e[0] + ',' + e[1] + ',' + e[2] + ',' + e[3] + ',' +
        e[4] + ',' + e[5] + ',' + e[6] + ',' + e[7] + ',' +
        e[8] + ',' + e[9] + ',' + e[10] + ',' + e[11] + ',' +
        e[12] + ',' + e[13] + ',' + e[14] + ',' + e[15] +
        ')';
    }
  }
  HTML3D.BoundingBox = class BoundingBox {
    constructor(min = new HTML3D.Vector3(+Infinity, +Infinity, +Infinity), max = new HTML3D.Vector3(-Infinity, -Infinity, -Infinity)) {
      this.min = min;
      this.max = max;
    }
    applyMatrix4(matrix) {
      const points = [
        new HTML3D.Vector3(this.min.x, this.min.y, this.min.z),
        new HTML3D.Vector3(this.min.x, this.min.y, this.max.z),
        new HTML3D.Vector3(this.min.x, this.max.y, this.min.z),
        new HTML3D.Vector3(this.min.x, this.max.y, this.max.z),
        new HTML3D.Vector3(this.max.x, this.min.y, this.min.z),
        new HTML3D.Vector3(this.max.x, this.min.y, this.max.z),
        new HTML3D.Vector3(this.max.x, this.max.y, this.min.z),
        new HTML3D.Vector3(this.max.x, this.max.y, this.max.z),
      ];
      this.min.set(+Infinity, +Infinity, +Infinity);
      this.max.set(-Infinity, -Infinity, -Infinity);
      for (let i = 0; i < 8; i++) {
        points[i].applyMatrix4(matrix);
        this.min.x = Math.min(this.min.x, points[i].x);
        this.min.y = Math.min(this.min.y, points[i].y);
        this.min.z = Math.min(this.min.z, points[i].z);
        this.max.x = Math.max(this.max.x, points[i].x);
        this.max.y = Math.max(this.max.y, points[i].y);
        this.max.z = Math.max(this.max.z, points[i].z);
      }
      return this;
    }
    intersectsBox(box) {
      return (this.max.x >= box.min.x) && (this.min.x <= box.max.x) && 
        (this.max.y >= box.min.y) && (this.min.y <= box.max.y) && 
        (this.max.z >= box.min.z) && (this.min.z <= box.max.z);
    }
  }
}

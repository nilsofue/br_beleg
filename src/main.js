class Main {
  constructor(canvas) {
    this.canvas = canvas; // Get the canvas element
    this.engine = new BABYLON.Engine(this.canvas, true); // Generate the BABYLON 3D engine
    this.scene = this.createScene();
    this.inputMap = {};
    this.shadowGenerator = null;
    this.flashlightSource = null;
    this.flashlight = null;
    this.ball = null;
  }

  init() {
    var that = this;
    //var scene = this.createScene(); //Call the createScene function

    // Register a render loop to repeatedly render the scene
    this.engine.runRenderLoop(function() {
      that.scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function() {
      this.engine.resize();
    });

    this.importFlashLight();
    this.flashlightSource = this.createFlashlightSource();
    this.createShadows();
    this.importBall();
    this.createGround();
    this.createWalls();
    this.initKeyEventRegistration();

    //var localOrigin = this.localAxes(2);
    //localOrigin.parent = this.flashlight;
  }

  createScene() {
    // Create the scene space
    var scene = new BABYLON.Scene(this.engine);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 3,
      2,
      new BABYLON.Vector3(0, 20, 25),
      scene
    );

    // Add lights to the scene
    var light1 = new BABYLON.PointLight(
      "DirectionalLight",
      new BABYLON.Vector3(0, 20, 0),
      scene
    );

    light1.intensity = 0.5;

    return scene;
  }

  importFlashLight() {
    var that = this;
    //BABYLON.OBJFileLoader.SKIP_MATERIALS = true;
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./src/assets/",
      "lampe_neu.obj",
      this.scene,
      flashlight => {
        var scalingFactor = 0.2;
        flashlight[3].scaling = new BABYLON.Vector3(
          scalingFactor,
          scalingFactor,
          scalingFactor
        );
        that.flashlight = flashlight[3];
        flashlight[3].position.z = 7;
        that.scene.onBeforeRenderObservable.add(() => {
          that.controlFlashlight(flashlight[3]);
        });
      }
    );
  }

  importBall() {
    var that = this;
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./src/assets/",
      "ball.obj",
      this.scene,
      ball => {
        var scalingFactor = 0.5;
        for (let b of ball) {
          that.shadowGenerator.getShadowMap().renderList.push(b);

          b.scaling = new BABYLON.Vector3(
            scalingFactor,
            scalingFactor,
            scalingFactor
          );
          that.ball = b;
          b.position.z = 7;
          b.position.y = 0.5;
          that.scene.onBeforeRenderObservable.add(() => {
            that.controlBall(b);
          });
        }
      }
    );
  }

  createGround() {
    var myGround = BABYLON.MeshBuilder.CreateGround(
      "myGround",
      { width: 30, height: 20 },
      this.scene
    );
    myGround.receiveShadows = true;
  }

  createShadows() {
    this.shadowGenerator = new BABYLON.ShadowGenerator(
      1024,
      this.flashlightSource
    );
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.useKernelBlur = true;
    this.shadowGenerator.blurKernel = 64;
  }

  createFlashlightSource() {
    var flashlightSource = new BABYLON.SpotLight(
      "light2",
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, -1),
      Math.PI / 3,
      3,
      this.scene
    );

    flashlightSource.position.z = 5.8;
    flashlightSource.position.y = 0.9;

    return flashlightSource;
  }

  createWalls() {
    var frontWall = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 30, height: 20, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      this.scene
    );
    frontWall.position.z = -10;
    frontWall.position.y = 10;
    frontWall.receiveShadows = true;

    var leftWall = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 20, height: 20, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      this.scene
    );
    leftWall.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
    leftWall.position.y = 10;
    leftWall.position.x = 15;
    leftWall.receiveShadows = true;

    var rightWall = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 20, height: 20, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      this.scene
    );
    rightWall.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
    rightWall.position.y = 10;
    rightWall.position.x = -15;
    rightWall.receiveShadows = true;
  }

  initKeyEventRegistration() {
    var that = this;
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        function(evt) {
          that.inputMap[evt.sourceEvent.key] =
            evt.sourceEvent.type == "keydown";
        }
      )
    );
    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger,
        function(evt) {
          that.inputMap[evt.sourceEvent.key] =
            evt.sourceEvent.type == "keydown";
        }
      )
    );
  }

  // Renderloop flashlight
  controlFlashlight(flashlight) {
    if (this.inputMap["w"]) {
      flashlight.position.z -= 0.1;
      this.flashlightSource.position.z -= 0.1;
    }
    if (this.inputMap["a"]) {
      flashlight.position.x += 0.1;
      this.flashlightSource.position.x += 0.1;
    }
    if (this.inputMap["s"]) {
      flashlight.position.z += 0.1;
      this.flashlightSource.position.z += 0.1;
    }
    if (this.inputMap["d"]) {
      flashlight.position.x -= 0.1;
      this.flashlightSource.position.x -= 0.1;
    }
    if (this.inputMap["q"]) {
      flashlight.rotation.y -= 0.1;
    }
    if (this.inputMap["e"]) {
      flashlight.rotation.y += 0.1;
    }
  }

  // Renderloop ball
  controlBall(ball) {
    if (this.inputMap["ArrowUp"]) {
      ball.position.z -= 0.1;
      ball.rotation.x -= 0.1;
    }
    if (this.inputMap["ArrowLeft"]) {
      ball.rotation.z -= 0.1;
      ball.position.x += 0.1;
    }
    if (this.inputMap["ArrowDown"]) {
      ball.rotation.x += 0.1;
      ball.position.z += 0.1;
    }
    if (this.inputMap["ArrowRight"]) {
      ball.rotation.z += 0.1;
      ball.position.x -= 0.1;
    }
  }

  localAxes(size) {
    var pilot_local_axisX = BABYLON.Mesh.CreateLines(
      "pilot_local_axisX",
      [
        new BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ],
      this.scene
    );
    pilot_local_axisX.color = new BABYLON.Color3(1, 0, 0);

    var pilot_local_axisY = BABYLON.Mesh.CreateLines(
      "pilot_local_axisY",
      [
        new BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
      ],
      this.scene
    );
    pilot_local_axisY.color = new BABYLON.Color3(0, 1, 0);

    var pilot_local_axisZ = BABYLON.Mesh.CreateLines(
      "pilot_local_axisZ",
      [
        new BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
      ],
      this.scene
    );
    pilot_local_axisZ.color = new BABYLON.Color3(0, 0, 1);

    var local_origin = BABYLON.MeshBuilder.CreateBox(
      "local_origin",
      { size: 1 },
      this.scene
    );
    local_origin.isVisible = false;

    pilot_local_axisX.parent = local_origin;
    pilot_local_axisY.parent = local_origin;
    pilot_local_axisZ.parent = local_origin;

    return local_origin;
  }
}

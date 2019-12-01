class Main {
  constructor(canvas) {
    this.canvas = canvas; // Get the canvas element
    this.engine = new BABYLON.Engine(this.canvas, true); // Generate the BABYLON 3D engine
    this.scene = this.createScene();
    this.inputMap = {};
    this.flashlightSource = null;
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
    this.createGround();
    this.createWalls();
    this.initKeyEventRegistration();
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

    camera.attachControl(this.canvas, true);

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
    BABYLON.OBJFileLoader.SKIP_MATERIALS = true;
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./src/assets/",
      "lampe.obj",
      this.scene,
      flashlight => {
        var scalingFactor = 0.2;
        flashlight[1].scaling = new BABYLON.Vector3(
          scalingFactor,
          scalingFactor,
          scalingFactor
        );
        flashlight[1].position.z = 7;
        that.scene.onBeforeRenderObservable.add(() => {
          that.controlFlashlight(flashlight[1]);
        });
      }
    );
  }

  createGround() {
    var myGround = BABYLON.MeshBuilder.CreateGround(
      "myGround",
      { width: 30, height: 20 },
      this.scene
    );
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

    flashlightSource.position.z = 5.5;
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

    var leftWall = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 20, height: 20, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      this.scene
    );
    leftWall.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
    leftWall.position.y = 10;
    leftWall.position.x = 15;

    var rightWall = BABYLON.MeshBuilder.CreatePlane(
      "myPlane",
      { width: 20, height: 20, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      this.scene
    );
    rightWall.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
    rightWall.position.y = 10;
    rightWall.position.x = -15;
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
    if (this.inputMap["w"] || this.inputMap["ArrowUp"]) {
      flashlight.position.z -= 0.1;
      this.flashlightSource.position.z -= 0.1;
    }
    if (this.inputMap["a"] || this.inputMap["ArrowLeft"]) {
      flashlight.position.x += 0.1;
      this.flashlightSource.position.x += 0.1;
    }
    if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
      flashlight.position.z += 0.1;
      this.flashlightSource.position.z += 0.1;
    }
    if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
      flashlight.position.x -= 0.1;
      this.flashlightSource.position.x -= 0.1;
    }
  }
}

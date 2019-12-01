class Main {
  constructor(canvas) {
    this.canvas = canvas; // Get the canvas element
    this.engine = new BABYLON.Engine(this.canvas, true); // Generate the BABYLON 3D engine
    this.scene = this.createScene();
    this.inputMap = {};
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
    this.createGround();
    this.initKeyEventRegistration();
  }

  createScene() {
    // Create the scene space
    var scene = new BABYLON.Scene(this.engine);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      new BABYLON.Vector3(0, 0, 5),
      scene
    );

    camera.attachControl(this.canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    var light2 = new BABYLON.PointLight(
      "light2",
      new BABYLON.Vector3(0, 0, 1),
      scene
    );

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
        that.scene.onBeforeRenderObservable.add(() => {
          that.controlFlashlight(flashlight[1]);
        });
      }
    );
  }

  createGround() {
    var myGround = BABYLON.MeshBuilder.CreateGround(
      "myGround",
      { width: 10, height: 10, subdivisions: 10 },
      this.scene
    );
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
    }
    if (this.inputMap["a"] || this.inputMap["ArrowLeft"]) {
      flashlight.position.x += 0.1;
    }
    if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
      flashlight.position.z += 0.1;
    }
    if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
      flashlight.position.x -= 0.1;
    }
  }
}

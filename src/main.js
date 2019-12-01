class Main {
  constructor(canvas) {
    this.canvas = canvas; // Get the canvas element
    this.engine = new BABYLON.Engine(this.canvas, true); // Generate the BABYLON 3D engine
    this.scene = this.createScene();
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

  controlFlashlight(flashlight) {
    flashlight.position.x += 0.001;
  }
}

class Main {
  constructor(canvas) {
    this.canvas = canvas; // Get the canvas element
    this.engine = new BABYLON.Engine(this.canvas, true); // Generate the BABYLON 3D engine
  }

  init() {
    var scene = this.createScene(); //Call the createScene function

    // Register a render loop to repeatedly render the scene
    this.engine.runRenderLoop(function() {
      scene.render();
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
    BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
    BABYLON.SceneLoader.Append(
      "./src/assets/",
      "lampe.obj",
      this.scene,
      flashlight => {
        console.log("Flashlight Loaded");
        console.log(flashlight);
        flashlight.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
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
}

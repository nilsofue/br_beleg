class Main {
  constructor(canvas, fps) {
    this.canvas = canvas; // Get the canvas element
    this.engine = new BABYLON.Engine(this.canvas, true); // Generate the BABYLON 3D engine
    this.scene = this.createScene();
    this.inputMap = {};
    this.shadowGenerator = null;
    this.flashlightSource = null;
    this.flashlight = null;
    this.ball = null;
    this.fps = fps;
    this.lightOffset = { x: 0, y: 0, z: 0.0 };
    this.randomBallsAmount = 500;
    this.ballIds = [];
    this.ballToggle = false;
  }

  init() {
    var that = this;

    // Register a render loop to repeatedly render the scene
    this.engine.runRenderLoop(function() {
      that.renderLoop();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function() {
      that.engine.resize();
    });

    this.importFlashLight();
    this.flashlightSource = this.createFlashlightSource();
    this.createShadows();
    this.importBall();
    this.createGround();
    this.createWalls();
    this.initKeyEventRegistration();
  }

  renderLoop() {
    this.scene.render();

    this.fps.innerHTML = this.engine.getFps().toFixed() + " fps";
    this.handleSliders();
    this.controlBalls();
  }

  toogleBalls() {
    if (!this.ballToggle) {
      if (!this.ballIds.length) this.createBalls();
      console.log("fbl");
      this.ballToggle = true;
    } else {
      this.removeBalls();
      this.ballToggle = false;
    }
  }

  removeBalls() {
    for (let ballId of this.ballIds) {
      this.scene.getNodeByName(ballId).dispose();
    }
    this.ballIds = [];
  }

  handleSliders() {
    let shadowBlurSliderValue = document.getElementById("shadowBlurSlider")
      .value;

    this.shadowGenerator.blurKernel = shadowBlurSliderValue;
    document.getElementById(
      "shadowBlurSliderParam"
    ).innerHTML = shadowBlurSliderValue;

    let shadowMapSizeSliderValue = document.getElementById(
      "shadowMapSizeSlider"
    ).value;

    document.getElementById(
      "shadowMapSizeSliderParam"
    ).innerHTML = shadowMapSizeSliderValue;

    this.shadowGenerator._mapSize = shadowMapSizeSliderValue;

    let lightIntenseSliderValue = document.getElementById("lightIntenseSlider")
      .value;

    document.getElementById(
      "lightIntenseSliderParam"
    ).innerHTML = lightIntenseSliderValue;

    this.flashlightSource.intensity = lightIntenseSliderValue;

    let powerCheckBox = document.getElementById("powerSwitch");

    this.flashlightSource.setEnabled(powerCheckBox.checked);
    document.getElementById(
      "powerSwitchParam"
    ).innerHTML = powerCheckBox.checked ? "On" : "Off";

    let lightRangeSliderValue = document.getElementById("lightRangeSlider")
      .value;

    this.flashlightSource.range = lightRangeSliderValue;
    document.getElementById(
      "lightRangeSliderParam"
    ).innerHTML = lightRangeSliderValue;

    let lightAngleSliderValue = document.getElementById("lightAngleSlider")
      .value;

    this.flashlightSource.angle = lightAngleSliderValue;
    document.getElementById("lightAngleSliderParam").innerHTML =
      Math.round(lightAngleSliderValue * (180 / Math.PI)) + "°";

    this.shadowGenerator.recreateShadowMap();
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

  createBalls() {
    for (var i = 0; i < this.randomBallsAmount; i++) {
      let size = Math.random();
      let id = this.uuidv4();
      let ball = BABYLON.MeshBuilder.CreateSphere(
        id,
        {
          diameterX: size,
          diameterY: size,
          diameterZ: size
        },
        this.scene
      );
      ball.position.x = Math.floor(Math.random() * Math.floor(31)) - 15;
      ball.position.y = Math.floor(Math.random() * Math.floor(21));
      ball.position.z = Math.floor(Math.random() * Math.floor(21)) - 10;
      ball.directionKey = 1;

      var greenMat = new BABYLON.StandardMaterial("greenMat", this.scene);
      greenMat.diffuseColor = new BABYLON.Color3(
        Math.random(),
        Math.random(),
        Math.random()
      );
      ball.material = greenMat;
      this.ballIds.push(id);

      this.shadowGenerator.getShadowMap().renderList.push(ball);
    }
  }

  controlBalls() {
    for (let ballId of this.ballIds) {
      let ball = this.scene.getMeshByName(ballId);
      let pos = ball.position.y;
      if (ball.directionKey == 1) {
        //up
        if (pos > 21) {
          ball.directionKey = 0;
        }
        ball.position.y = pos + 0.1;
      } else {
        // down
        if (pos < 1) {
          ball.directionKey = 1;
        }
        ball.position.y = pos - 0.1;
      }
    }
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
          b.position.z = 2;
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
    console.log(this.shadowGenerator.getShadowMap());
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

    flashlightSource.position.z = 7 - this.lightOffset.z;
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
      if (this.flashlightSource.position.z < -9.5) {
        this.flashlightSource.position.z = -9.5;
        flashlight.position.z = -9.5 + this.lightOffset.z;
      } else {
        flashlight.position.z -= 0.1;
        this.flashlightSource.position.z -= 0.1;
      }
    }
    if (this.inputMap["a"]) {
      flashlight.position.x += 0.1;
      this.flashlightSource.position.x += 0.1;
      if (this.flashlightSource.position.x > 14) {
        this.flashlightSource.position.x = 14;
        flashlight.position.x = 14;
      }
    }
    if (this.inputMap["s"]) {
      flashlight.position.z += 0.1;
      this.flashlightSource.position.z += 0.1;
      if (this.flashlightSource.position.z > 9.5) {
        this.flashlightSource.position.z = 9.5;
        flashlight.position.z = 9.5 + this.lightOffset.z;
      }
    }
    if (this.inputMap["d"]) {
      flashlight.position.x -= 0.1;
      this.flashlightSource.position.x -= 0.1;
      if (this.flashlightSource.position.x < -14) {
        this.flashlightSource.position.x = -14;
        flashlight.position.x = -14;
      }
    }
    if (this.inputMap["q"]) {
      flashlight.rotation.y -= 0.1;
      this.flashlightSource.direction.x += 0.1;
      if (flashlight.rotation.y < -1.3) flashlight.rotation.y = -1.3;
      if (this.flashlightSource.direction.x > 1.3)
        this.flashlightSource.direction.x = 1.3;
    }
    if (this.inputMap["e"]) {
      flashlight.rotation.y += 0.1;
      this.flashlightSource.direction.x -= 0.1;
      if (flashlight.rotation.y > 1.3) flashlight.rotation.y = 1.3;
      if (this.flashlightSource.direction.x < -1.3)
        this.flashlightSource.direction.x = -1.3;
    }
  }

  // Renderloop ball
  controlBall(ball) {
    if (this.inputMap["ArrowUp"]) {
      ball.position.z -= 0.1;
      if (ball.position.z < -9.5) {
        ball.position.z = -9.5;
      } else {
        ball.rotation.x -= 0.1;
      }
    }
    if (this.inputMap["ArrowLeft"]) {
      ball.position.x += 0.1;
      if (ball.position.x > 14) {
        ball.position.x = 14;
      } else {
        ball.rotation.z -= 0.1;
      }
    }
    if (this.inputMap["ArrowDown"]) {
      ball.position.z += 0.1;
      if (ball.position.z > 9.5) {
        ball.position.z = 9.5;
      } else {
        ball.rotation.x += 0.1;
      }
    }
    if (this.inputMap["ArrowRight"]) {
      ball.position.x -= 0.1;
      if (ball.position.x < -14) {
        ball.position.x = -14;
      } else {
        ball.rotation.z += 0.1;
      }
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

  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

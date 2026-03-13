(() => {
  console.log('📦 png-sequence-animator: Loading...')

  const FRAME_COUNT = 40
  const FPS = 24
  const PREFIX = 'tigerface'
  const FOLDER = 'assets/pngseq/'

  let initialized = false
  let textures = []
  let loadedCount = 0
  let currentFrame = 0
  let elapsed = 0
  let planeMesh = null
  let lastTime = null

  function setupAnimation(scene) {
    const loader = new THREE.TextureLoader()
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const num = String(i).padStart(3, '0')
      const tex = loader.load(`${FOLDER}${PREFIX}${num}.png`, () => { loadedCount++ })
      tex.colorSpace = THREE.SRGBColorSpace
      textures.push(tex)
    }
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        planeMesh = obj
        console.log('✅ Found mesh:', obj.name || obj.uuid)
      }
    })
  }

  function update(timestamp) {
    requestAnimationFrame(update)
    if (!initialized) return
    if (!planeMesh) {
      try {
        const { scene } = XR8.Threejs.xrScene()
        scene.traverse((obj) => { if (obj.isMesh && obj.material) planeMesh = obj })
      } catch (e) {}
      return
    }
    if (loadedCount < FRAME_COUNT) return
    if (lastTime === null) { lastTime = timestamp; return }
    elapsed += timestamp - lastTime
    lastTime = timestamp
    if (elapsed < 1000 / FPS) return
    elapsed = elapsed % (1000 / FPS)
    currentFrame = (currentFrame + 1) % FRAME_COUNT
    if (planeMesh.material) {
      planeMesh.material.map = textures[currentFrame]
      planeMesh.material.transparent = true
      planeMesh.material.needsUpdate = true
    }
  }

  const onxrloaded = () => {
    console.log('✅ XR8 Ready')

    // Configure image target BEFORE starting engine
    XR8.XrController.configure({
      imageTargets: ['my_target'],
      imageTargetData: [
        { name: 'my_target', src: 'assets/my_target.png', loadAutomatically: true }
      ]
    })

    const waitForScene = setInterval(() => {
      try {
        const xrScene = XR8.Threejs.xrScene()
        if (xrScene && xrScene.scene) {
          clearInterval(waitForScene)
          setupAnimation(xrScene.scene)
          initialized = true
          console.log('✅ Animation initialized')
          requestAnimationFrame(update)
        }
      } catch (e) {}
    }, 100)
  }

  window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)

  // Scene config
  const sceneConfig = {"objects":{"47699d9e-18a5-4f88-a4f9-b8be92e8f74a":{"components":{},"geometry":null,"id":"47699d9e-18a5-4f88-a4f9-b8be92e8f74a","light":{"type":"ambient"},"material":null,"name":"Ambient Light","position":[10,5,5],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.4038940050501252},"a608ddd9-9379-464d-966f-5d8d8674c83c":{"camera":{"type":"perspective","xr":{"desktop":"AR","xrCameraType":"image","headset":"disabled","phone":"AR","direction":"back"}},"components":{},"geometry":null,"id":"a608ddd9-9379-464d-966f-5d8d8674c83c","material":null,"name":"Camera","position":[0,0,0],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.0308214152219775},"ac1989e3-3b71-49e2-a05f-e682aeb18c36":{"components":{},"geometry":null,"id":"ac1989e3-3b71-49e2-a05f-e682aeb18c36","light":{"intensity":1,"type":"directional"},"material":null,"name":"Directional Light","position":[20,20,10],"rotation":[0,0,0,1],"scale":[1,1,1],"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.6644431107322474},"3db23022-b7cf-42c8-aa76-514eea60744d":{"id":"3db23022-b7cf-42c8-aa76-514eea60744d","position":[0,0,0],"rotation":[0,0,0,1],"scale":[1,1,1],"geometry":null,"material":null,"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","components":{},"name":"Image Target","imageTarget":{"name":"my_target.png"},"order":2.9164893056959245},"e347af4a-618a-4cbf-b5fd-4b1b86640cba":{"id":"e347af4a-618a-4cbf-b5fd-4b1b86640cba","position":[0,0,0.1957672797860202],"rotation":[-0.1716610298601247,0,0,0.9851560743493192],"scale":[0.573884031905844,0.6687761800618436,1],"geometry":{"type":"plane","width":1,"height":1},"material":{"type":"unlit","color":"#FFFFFF","textureSrc":{"type":"asset","asset":"assets/pngseq/tigerface001.png"},"forceTransparent":true,"side":"double"},"parentId":"3db23022-b7cf-42c8-aa76-514eea60744d","components":{},"name":"Plane","order":1.361236427256126}},"spaces":{"88453035-dc0f-486d-868a-8ff7c2fda864":{"id":"88453035-dc0f-486d-868a-8ff7c2fda864","name":"Default","activeCamera":"a608ddd9-9379-464d-966f-5d8d8674c83c","reflections":{"type":"url","url":"https://cdn.8thwall.com/web/assets/envmap/basic_env_map-m9hqpneh.jpg"}}},"entrySpaceId":"88453035-dc0f-486d-868a-8ff7c2fda864","scripts":["png-sequence-animator.js"],"runtimeVersion":{"type":"version","level":"major","major":2,"minor":0,"patch":0}}
  delete sceneConfig.history
  delete sceneConfig.historyVersion
  window.ecs.application.init(sceneConfig)
})()

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Fractal Generation
 */
const createSierpinskiTetrahedron = (depth, size) => {
    const verticies = []

    // helper function to create one tetrahedron from 4 vertices
    function makeTetrahedron(v1, v2, v3, v4) {
        verticies.push(...v1.toArray(), ...v2.toArray(), ...v3.toArray())
        verticies.push(...v1.toArray(), ...v3.toArray(), ...v4.toArray())
        verticies.push(...v1.toArray(), ...v4.toArray(), ...v2.toArray())
        verticies.push(...v2.toArray(), ...v4.toArray(), ...v3.toArray())
    }

    // Recursive function to generate the fractal
    function generateFractal(v1, v2, v3, v4, level) {
        if (level === 0) {
            makeTetrahedron(v1, v2, v3, v4)
            return
        }

        // Calculate midpoints of the edges
        const mid12 = v1.clone().add(v2).multiplyScalar(0.5)
        const mid13 = v1.clone().add(v3).multiplyScalar(0.5)
        const mid14 = v1.clone().add(v4).multiplyScalar(0.5)
        const mid23 = v2.clone().add(v3).multiplyScalar(0.5)
        const mid24 = v2.clone().add(v4).multiplyScalar(0.5)
        const mid34 = v3.clone().add(v4).multiplyScalar(0.5)

        // Recursively generate the tetrahedrons
        generateFractal(v1, mid12, mid13, mid14, level - 1)
        generateFractal(mid12, v2, mid23, mid24, level - 1)
        generateFractal(mid13, mid23, v3, mid34, level - 1)
        generateFractal(mid14, mid24, mid34, v4, level - 1)
    }

    // Vertices of a regular tetrahedron
    const initialVertices = [
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -1, 1),
        new THREE.Vector3(1, -1, -1),
        new THREE.Vector3(-1, 1, -1)
    ].map(v => v.multiplyScalar(size / 2))

    generateFractal(...initialVertices, depth)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticies, 3))
    geometry.computeVertexNormals()

    return geometry

}

// Create the fractal mesh
const fractalGeometry = createSierpinskiTetrahedron(3, 4)
const fractalMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ffff,
    metalness: 0.7,
    roughness: 0.2
})
const fractalMesh = new THREE.Mesh(fractalGeometry, fractalMaterial)
scene.add(fractalMesh)




/**
 * Lighting
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(5, 5, 5)
pointLight.lookAt(0, 0, 0)
scene.add(pointLight)

const pointLight2 = new THREE.PointLight(0xffffff, 0.5)
pointLight2.position.set(-5, -5, -5)
pointLight2.lookAt(0, 0, 0)
scene.add(pointLight2)


// // Rocket
// const rocket = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(rocket)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 3, 3)
camera.lookAt(0, 0, 0)
scene.add(camera)

// Controls
const controls  = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.5


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
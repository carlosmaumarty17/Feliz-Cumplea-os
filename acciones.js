// helper functions
const PI2 = Math.PI * 2
const random = (min, max) => Math.random() * (max - min + 1) + min | 0
const timestamp = _ => new Date().getTime()

// Función para dibujar una flor
function drawFlower(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    
    // Centro de la flor
    ctx.beginPath();
    ctx.fillStyle = '#FFD700';
    ctx.arc(0, 0, size * 0.2, 0, PI2);
    ctx.fill();
    
    // Pétalos
    const petalColors = ['#FF69B4', '#FF1493', '#FFC0CB', '#FFB6C1', '#FF69B4'];
    const petalCount = 8;
    const petalLength = size * 0.8;
    const petalWidth = size * 0.4;
    
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * PI2;
        const petalColor = petalColors[i % petalColors.length];
        
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        
        // Forma del pétalo
        ctx.ellipse(0, -petalLength/2, petalWidth/2, petalLength, 0, 0, PI2);
        
        // Relleno con gradiente para dar profundidad
        const gradient = ctx.createRadialGradient(0, -petalLength/2, 0, 0, -petalLength/2, petalLength);
        gradient.addColorStop(0, petalColor);
        gradient.addColorStop(1, color || '#FF1493');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }
    
    ctx.restore();
}

// container
class Birthday {
  constructor() {
    this.resize()

    // create a lovely place to store the firework
    this.fireworks = []
    this.counter = 0

  }
  
  resize() {
    this.width = canvas.width = window.innerWidth
    let center = this.width / 2 | 0
    this.spawnA = center - center / 4 | 0
    this.spawnB = center + center / 4 | 0
    
    this.height = canvas.height = window.innerHeight
    this.spawnC = this.height * .1
    this.spawnD = this.height * .5
    
  }
  
  onClick(evt) {
     let x = evt.clientX || evt.touches && evt.touches[0].pageX
     let y = evt.clientY || evt.touches && evt.touches[0].pageY
     
     let count = random(3,5)
     for(let i = 0; i < count; i++) this.fireworks.push(new Firework(
        random(this.spawnA, this.spawnB),
        this.height,
        x,
        y,
        random(0, 260),
        random(30, 110)))
          
     this.counter = -1
     
  }
  
  update(delta) {
    ctx.globalCompositeOperation = 'hard-light'
    ctx.fillStyle = `rgba(20,20,20,${ 7 * delta })`
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.globalCompositeOperation = 'lighter'
    for (let firework of this.fireworks) firework.update(delta)

    // if enough time passed... create new new firework
    this.counter += delta * 3 // each second
    if (this.counter >= 1) {
      this.fireworks.push(new Firework(
        random(this.spawnA, this.spawnB),
        this.height,
        random(0, this.width),
        random(this.spawnC, this.spawnD),
        random(0, 360),
        random(30, 110)))
      this.counter = 0
    }

    // remove the dead fireworks
    if (this.fireworks.length > 1000) this.fireworks = this.fireworks.filter(firework => !firework.dead)

  }
}

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings) {
    this.dead = false
    this.offsprings = offsprings

    this.x = x
    this.y = y
    this.targetX = targetX
    this.targetY = targetY

    this.shade = shade
    this.history = []
  }
  update(delta) {
    if (this.dead) return

    let xDiff = this.targetX - this.x
    let yDiff = this.targetY - this.y
    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) { // is still moving
      this.x += xDiff * 2 * delta
      this.y += yDiff * 2 * delta

      this.history.push({
        x: this.x,
        y: this.y
      })

      if (this.history.length > 20) this.history.shift()

    } else {
      if (this.offsprings && !this.madeChilds) {
        
        let babies = this.offsprings / 2
        for (let i = 0; i < babies; i++) {
          let targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies) | 0
          let targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies) | 0

          birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0))
        }
        
        // Crear flores en lugar de partículas cuando explota
        const flowerCount = 5;
        for (let i = 0; i < flowerCount; i++) {
          const angle = Math.random() * PI2;
          const distance = 50 + Math.random() * 100;
          const size = 10 + Math.random() * 20;
          
          // Crear una flor que caerá
          const flower = {
            x: this.x,
            y: this.y,
            targetY: this.y + 100 + Math.random() * 200,
            size: size,
            speed: 0.5 + Math.random(),
            rotation: Math.random() * PI2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            color: `hsl(${Math.random() * 360}, 100%, 60%)`,
            update: function() {
              this.y += this.speed;
              this.rotation += this.rotationSpeed;
              
              // Dibujar la flor
              ctx.save();
              ctx.translate(this.x, this.y);
              ctx.rotate(this.rotation);
              drawFlower(ctx, 0, 0, this.size, this.color);
              ctx.restore();
              
              return this.y < this.targetY;
            }
          };
          
          // Agregar la flor al array de partículas
          if (!this.flowers) this.flowers = [];
          this.flowers.push(flower);
        }
      }
      this.madeChilds = true
      this.history.shift()
    }
    
    // Actualizar flores si existen
    if (this.flowers) {
      this.flowers = this.flowers.filter(flower => flower.update());
    }
    
    if (this.history.length === 0 && (!this.flowers || this.flowers.length === 0)) {
      this.dead = true;
    } else if (this.offsprings) { 
        for (let i = 0; this.history.length > i; i++) {
          let point = this.history[i]
          // Dibujar una flor pequeña en la estela
          if (Math.random() < 0.3) { // Solo dibujar algunas flores para mejor rendimiento
            const size = 3 + Math.random() * 5;
            const color = `hsl(${this.shade}, 100%, ${50 + i}%)`;
            drawFlower(ctx, point.x, point.y, size, color);
          }
        } 
      } else {
      // Dibujar una flor en lugar de un punto
      const size = 5 + Math.random() * 10;
      const color = `hsl(${this.shade}, 100%, 50%)`;
      drawFlower(ctx, this.x, this.y, size, color);
    }

  }
}

let canvas = document.getElementById('birthday')
let ctx = canvas.getContext('2d')

let then = timestamp()

let birthday = new Birthday
window.onresize = () => birthday.resize()
document.onclick = evt => birthday.onClick(evt)
document.ontouchstart = evt => birthday.onClick(evt)

  ;(function loop(){
  	requestAnimationFrame(loop)

  	let now = timestamp()
  	let delta = now - then

    then = now
    birthday.update(delta / 1000)
  	

  })()